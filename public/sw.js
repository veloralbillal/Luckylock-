// Lottery Winner Service Worker — Native Mobile Notification Bar Support

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if (typeof caches !== "undefined") {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
      await self.clients.claim();
    })()
  );
});

// Handle direct notification dispatch messages from the client page
self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "SHOW_LOTTERY_NOTIFICATION") return;

  const title = typeof data.title === "string" && data.title.trim()
    ? data.title.trim()
    : "Lottery Ending in 1 Minute!";
  const options = {
    body: typeof data.body === "string" ? data.body : "Last 1 minute left before the draw closes.",
    icon: data.icon || "/pwa-192x192.png",
    badge: data.badge || "/pwa-192x192.png",
    tag: data.tag || "lottery-1min-alert",
    renotify: true,
    requireInteraction: Boolean(data.requireInteraction !== false),
    vibrate: Array.isArray(data.vibrate) ? data.vibrate : [240, 100, 240, 100, 320],
    timestamp: Date.now(),
    data: {
      url: typeof data.url === "string" ? data.url : "/",
      lotterySlug: data.lotterySlug || null,
    },
    actions: [
      { action: "open_draw", title: "Open Lottery" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle Web Push payloads if push subscription is ever enabled
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "Lottery draw alert!" };
  }

  const title = payload.title || "Lottery Winner — 1 Minute Left!";
  const options = {
    body: payload.body || "Your lottery draw closes in 1 minute. Tap to check now.",
    icon: payload.icon || "/pwa-192x192.png",
    badge: payload.badge || "/pwa-192x192.png",
    tag: payload.tag || "lottery-push-alert",
    renotify: true,
    requireInteraction: true,
    vibrate: [240, 100, 240, 100, 320],
    data: { url: payload.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Tap on mobile notification bar -> focus existing window or open lottery URL
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  const targetUrl =
    (event.notification && event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ("focus" in client) {
          client.focus();
          client.postMessage({
            type: "LOTTERY_NOTIFICATION_CLICKED",
            url: targetUrl,
            lotterySlug:
              event.notification && event.notification.data
                ? event.notification.data.lotterySlug || null
                : null,
          });
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
