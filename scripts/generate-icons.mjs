import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const OUT_DIR = path.join(process.cwd(), "public", "icons");

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
}

const CRC_TABLE = makeCrcTable();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.concat([typeBytes, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBuf), 0);
  return Buffer.concat([len, typeBytes, data, crc]);
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0; // filter none
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function distToSegment(px, py, ax, ay, bx, by) {
  const vx = bx - ax;
  const vy = by - ay;
  const wx = px - ax;
  const wy = py - ay;
  const lenSq = vx * vx + vy * vy;
  const t = lenSq === 0 ? 0 : clamp((wx * vx + wy * vy) / lenSq, 0, 1);
  const cx = ax + t * vx;
  const cy = ay + t * vy;
  return Math.hypot(px - cx, py - cy);
}

function roundedRectSdf(px, py, cx, cy, halfW, halfH, r) {
  const dx = Math.abs(px - cx) - (halfW - r);
  const dy = Math.abs(py - cy) - (halfH - r);
  const outDist = Math.hypot(Math.max(dx, 0), Math.max(dy, 0));
  const inDist = Math.min(Math.max(dx, dy), 0);
  return outDist + inDist - r;
}

function blendPixel(buf, idx, r, g, b, alpha) {
  if (alpha <= 0) return;
  const a = clamp(alpha, 0, 1);
  const inv = 1 - a;
  buf[idx] = Math.round(r * a + buf[idx] * inv);
  buf[idx + 1] = Math.round(g * a + buf[idx + 1] * inv);
  buf[idx + 2] = Math.round(b * a + buf[idx + 2] * inv);
  buf[idx + 3] = Math.round(Math.min(255, buf[idx + 3] + a * 255 * (1 - buf[idx + 3] / 255)));
}

function renderIcon(size, { maskable = false } = {}) {
  const buf = Buffer.alloc(size * size * 4);
  const scale = maskable ? 0.72 : 0.88;
  const cx = size / 2;
  const cy = size / 2;
  const half = size * 0.5;
  const cornerRadius = maskable ? 0 : size * 0.22;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const px = x + 0.5;
      const py = y + 0.5;

      // Background rounded rect (or full bleed if maskable)
      let bgAlpha = 1;
      if (!maskable) {
        const d = roundedRectSdf(px, py, cx, cy, half, half, cornerRadius);
        bgAlpha = 1 - smoothstep(-0.75, 0.75, d);
      }

      if (bgAlpha <= 0) {
        buf[idx] = 0;
        buf[idx + 1] = 0;
        buf[idx + 2] = 0;
        buf[idx + 3] = 0;
        continue;
      }

      // Rich royal cobalt-blue gradient matching YOUMEE dashboard
      const gx = x / size;
      const gy = y / size;
      const t = clamp(0.55 * gy + 0.45 * gx, 0, 1);
      const bgR = Math.round(59 * (1 - t) + 29 * t);
      const bgG = Math.round(102 * (1 - t) + 78 * t);
      const bgB = Math.round(245 * (1 - t) + 216 * t);

      buf[idx] = bgR;
      buf[idx + 1] = bgG;
      buf[idx + 2] = bgB;
      buf[idx + 3] = Math.round(bgAlpha * 255);

      // Subtle inner radial glow
      const distCenter = Math.hypot(px - cx, py - cy) / (size * 0.65);
      if (distCenter < 1) {
        const glow = (1 - distCenter) * 0.18;
        blendPixel(buf, idx, 147, 197, 253, glow * bgAlpha);
      }

      // Outer emblem ring (soft ice-blue accent)
      const ringRadius = size * 0.34 * (scale / 0.88);
      const ringThickness = Math.max(2, size * 0.036 * (scale / 0.88));
      const dRing = Math.abs(Math.hypot(px - cx, py - cy) - ringRadius) - ringThickness * 0.5;
      const ringAlpha = (1 - smoothstep(-0.8, 0.8, dRing)) * bgAlpha;
      blendPixel(buf, idx, 219, 234, 254, ringAlpha * 0.92);

      // Crescent moon accent at top-right of inner ring
      const moonCx = cx + size * 0.21 * (scale / 0.88);
      const moonCy = cy - size * 0.21 * (scale / 0.88);
      const moonR = size * 0.068 * (scale / 0.88);
      const dOuterMoon = Math.hypot(px - moonCx, py - moonCy) - moonR;
      const dCutMoon =
        Math.hypot(px - (moonCx + moonR * 0.45), py - (moonCy - moonR * 0.22)) - moonR * 0.86;
      const moonAlpha =
        (1 - smoothstep(-0.7, 0.7, dOuterMoon)) * smoothstep(-0.7, 0.7, dCutMoon) * bgAlpha;
      blendPixel(buf, idx, 251, 191, 36, moonAlpha);

      // Crisp checkmark in center
      const p1x = cx - size * 0.145 * (scale / 0.88);
      const p1y = cy + size * 0.01 * (scale / 0.88);
      const p2x = cx - size * 0.035 * (scale / 0.88);
      const p2y = cy + size * 0.12 * (scale / 0.88);
      const p3x = cx + size * 0.16 * (scale / 0.88);
      const p3y = cy - size * 0.11 * (scale / 0.88);

      const stroke = Math.max(2.5, size * 0.044 * (scale / 0.88));
      const d1 = distToSegment(px, py, p1x, p1y, p2x, p2y) - stroke;
      const d2 = distToSegment(px, py, p2x, p2y, p3x, p3y) - stroke;
      const dCheck = Math.min(d1, d2);
      const checkAlpha = (1 - smoothstep(-0.8, 0.8, dCheck)) * bgAlpha;
      blendPixel(buf, idx, 248, 250, 252, checkAlpha);
    }
  }

  return encodePng(size, size, buf);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const targets = [
  { file: "icon-192x192.png", size: 192, maskable: false },
  { file: "icon-512x512.png", size: 512, maskable: false },
  { file: "icon-maskable-512x512.png", size: 512, maskable: true },
  { file: "apple-touch-icon.png", size: 180, maskable: true },
];

for (const t of targets) {
  const png = renderIcon(t.size, { maskable: t.maskable });
  const dest = path.join(OUT_DIR, t.file);
  fs.writeFileSync(dest, png);
  console.log(`Generated ${dest} (${png.length} bytes)`);
}
