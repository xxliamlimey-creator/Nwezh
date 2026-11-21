/// <reference lib="webworker" />
import {clientsClaim} from 'workbox-core';
import {ExpirationPlugin} from 'workbox-expiration';
import {cleanupOutdatedCaches, precacheAndRoute} from 'workbox-precaching';
import {registerRoute} from 'workbox-routing';
import {CacheFirst, NetworkFirst} from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<string | {url: string; revision: string | null}>;
};

self.skipWaiting();
clientsClaim();

cleanupOutdatedCaches();
// Filter out dev-mode unrevisioned entries so Workbox does not throw in dev
const manifestEntries = (self.__WB_MANIFEST || []).filter(
  (entry) => typeof entry === 'string' || Boolean(entry.revision)
);
if (manifestEntries.length > 0) {
  precacheAndRoute(manifestEntries);
}

// Offline-capable navigation fallback
registerRoute(
  ({request}) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'nwezh-pages',
    networkTimeoutSeconds: 3,
  })
);

// Cache downloaded Adhan MP3 files offline after first play/select
registerRoute(
  ({url}) => url.pathname.startsWith('/sounds/') && url.pathname.endsWith('.mp3'),
  new CacheFirst({
    cacheName: 'nwezh-adhan-audio',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 12,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  })
);

// Cache Google Fonts stylesheets & font files for offline typography
registerRoute(
  ({url}) => url.origin === 'https://fonts.googleapis.com',
  new CacheFirst({
    cacheName: 'google-fonts-stylesheets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  })
);

registerRoute(
  ({url}) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 24,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  })
);

interface PushPayload {
  title?: string;
  body?: string;
  tag?: string;
  prayer?: string;
  url?: string;
  silent?: boolean;
}

self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  let payload: PushPayload = {};
  try {
    payload = event.data.json() as PushPayload;
  } catch {
    payload = {title: 'Nwezh', body: event.data.text()};
  }

  const title = payload.title || 'Nwezh';
  const body = payload.body || 'Prayer time has arrived.';
  const tag = payload.tag || 'nwezh-prayer';

  const options: NotificationOptions = {
    body,
    icon: '/pwa-192x192.png',
    badge: '/favicon-32x32.png',
    tag,
    silent: Boolean(payload.silent),
    data: {
      url: payload.url || '/',
      prayer: payload.prayer || '',
    },
  };

  const isTestPush = tag.startsWith('nwezh-test');
  const notifyClients =
    !payload.silent && !isTestPush
      ? self.clients
          .matchAll({type: 'window', includeUncontrolled: true})
          .then((clientList) => {
            for (const client of clientList) {
              client.postMessage({
                type: 'NWEZH_PUSH_RECEIVED',
                prayer: payload.prayer || '',
                tag,
              });
            }
          })
      : Promise.resolve();

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      notifyClients,
    ])
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const targetUrl =
    (event.notification.data && typeof event.notification.data.url === 'string'
      ? event.notification.data.url
      : '/') || '/';

  event.waitUntil(
    self.clients.matchAll({type: 'window', includeUncontrolled: true}).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
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
