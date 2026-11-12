const CACHE_NAME = "youmee-daily-v2";

function getBasePath() {
  try {
    const scopeUrl = new URL(self.registration.scope);
    return scopeUrl.pathname.replace(/\/$/, "");
  } catch {
    return "";
  }
}

function withBase(path) {
  return `${getBasePath()}${path}`;
}

self.addEventListener("install", (event) => {
  const coreAssets = [
    withBase("/"),
    withBase("/manifest.webmanifest"),
    withBase("/icons/icon-192x192.png"),
    withBase("/icons/icon-512x512.png"),
    withBase("/icons/apple-touch-icon.png"),
  ];

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(coreAssets))
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match(withBase("/")) || Response.error();
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});

self.addEventListener("push", (event) => {
  const iconUrl = withBase("/icons/icon-192x192.png");
  let payload = {
    title: "YOUMEE Daily",
    body: "You have a scheduled task reminder.",
    url: withBase("/"),
    tag: "youmee-reminder",
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = {
        ...payload,
        ...parsed,
      };
    } catch {
      payload.body = event.data.text() || payload.body;
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: iconUrl,
      badge: iconUrl,
      tag: payload.tag || "youmee-reminder",
      renotify: true,
      vibrate: [120, 60, 120],
      data: { url: payload.url || withBase("/") },
    })
  );
});

self.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "SHOW_LOCAL_NOTIFICATION") return;
  const iconUrl = withBase("/icons/icon-192x192.png");
  const { title, body, tag, url } = event.data.payload || {};
  event.waitUntil(
    self.registration.showNotification(title || "YOUMEE Daily", {
      body: body || "Scheduled task reminder",
      icon: iconUrl,
      badge: iconUrl,
      tag: tag || "youmee-local-reminder",
      renotify: true,
      vibrate: [120, 60, 120],
      data: { url: url || withBase("/") },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl =
    (event.notification.data && event.notification.data.url) || withBase("/");

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
        return undefined;
      })
  );
});
