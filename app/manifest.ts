import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "YOUMEE Daily — Task Tracker",
    short_name: "YOUMEE",
    description:
      "Mobile-first daily task and worship tracker with scheduled times, local persistence, and push reminders.",
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#eef2fb",
    theme_color: "#2f5cf0",
    categories: ["productivity", "lifestyle"],
    icons: [
      {
        src: `${basePath}/icons/icon-192x192.png`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: `${basePath}/icons/icon-512x512.png`,
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: `${basePath}/icons/icon-maskable-512x512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
