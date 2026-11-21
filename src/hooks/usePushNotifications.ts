import {useCallback, useEffect, useState} from 'react';
import {
  getPrayerArrivalCopy,
  type PrayerName,
  type PrayerSettings,
} from '../../shared/prayerEngine';

export type PushSupportState =
  | 'supported'
  | 'ios-needs-install'
  | 'unsupported';

export interface PushStatus {
  support: PushSupportState;
  permission: NotificationPermission | 'unsupported';
  isSubscribed: boolean;
  isBusy: boolean;
  error: string | null;
  testMessage: string | null;
  enableAndSubscribe: (settings: PrayerSettings) => Promise<boolean>;
  syncSettingsToServer: (settings: PrayerSettings) => Promise<void>;
  disableAndUnsubscribe: () => Promise<void>;
  sendTestPush: (settings: PrayerSettings) => Promise<void>;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function getReadyRegistration(
  timeoutMs = 5000
): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const existing = await navigator.serviceWorker.getRegistration();
    if (existing?.active) return existing;

    const ready = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) =>
        window.setTimeout(() => resolve(null), timeoutMs)
      ),
    ]);
    return ready || existing || null;
  } catch {
    return null;
  }
}

async function fetchJsonSafely<T>(
  input: string,
  init?: RequestInit
): Promise<{ok: boolean; status: number; data: T | null}> {
  try {
    const res = await fetch(input, {
      cache: 'no-store',
      credentials: 'same-origin',
      ...init,
    });
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      return {ok: false, status: res.status, data: null};
    }
    const data = (await res.json()) as T;
    return {ok: res.ok, status: res.status, data};
  } catch {
    return {ok: false, status: 0, data: null};
  }
}

async function resolveVapidPublicKey(): Promise<string> {
  const res = await fetchJsonSafely<{publicKey?: string}>(
    '/api/push/vapid-public-key'
  );
  if (res.ok && res.data?.publicKey) {
    return res.data.publicKey;
  }
  const bakedKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (typeof bakedKey === 'string' && bakedKey.length > 0) {
    return bakedKey;
  }
  throw new Error('Could not reach notification server.');
}

function buildSubscribePayload(
  sub: PushSubscription,
  settings: PrayerSettings,
  enabledOverride?: boolean
) {
  const json = sub.toJSON();
  return {
    endpoint: json.endpoint,
    keys: json.keys,
    location: settings.location,
    method: settings.method,
    asrMethod: settings.asrMethod,
    highLatitudeRule: settings.highLatitudeRule,
    adjustments: settings.adjustments,
    timeFormat: settings.timeFormat,
    language: settings.language,
    enabled:
      typeof enabledOverride === 'boolean'
        ? enabledOverride
        : settings.notifications.enabled,
    prayers: settings.notifications.prayers,
    silent: settings.notifications.sound === 'off',
  };
}

export async function showDeviceNotification(
  settings: PrayerSettings,
  prayer: PrayerName,
  tag: string,
  registration?: ServiceWorkerRegistration | null
): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission !== 'granted') {
    return false;
  }

  const body = getPrayerArrivalCopy(prayer, settings.language);
  const silent = settings.notifications.sound === 'off';
  const reg = registration ?? (await getReadyRegistration(2500));

  if (reg && typeof reg.showNotification === 'function') {
    try {
      await reg.showNotification('Nwezh', {
        body,
        icon: '/pwa-192x192.png',
        badge: '/favicon-32x32.png',
        tag,
        silent,
        data: {url: '/', prayer},
      });
      return true;
    } catch {
      // Fall through to standard Notification API
    }
  }

  try {
    new Notification('Nwezh', {
      body,
      icon: '/pwa-192x192.png',
      tag,
      silent,
    });
    return true;
  } catch {
    return false;
  }
}

export function usePushNotifications(
  isStandalone: boolean,
  isIOS: boolean
): PushStatus {
  const [support, setSupport] = useState<PushSupportState>('unsupported');
  const [permission, setPermission] = useState<
    NotificationPermission | 'unsupported'
  >('unsupported');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState<string | null>(null);

  const checkCurrentSubscription = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const hasNotification = 'Notification' in window;
    const hasSW = 'serviceWorker' in navigator;

    if (isIOS && !isStandalone) {
      setSupport('ios-needs-install');
      setPermission(hasNotification ? Notification.permission : 'default');
      setIsSubscribed(false);
      return;
    }

    if (!hasNotification) {
      setSupport('unsupported');
      setPermission('unsupported');
      setIsSubscribed(false);
      return;
    }

    setSupport('supported');
    setPermission(Notification.permission);

    if (!hasSW || !('PushManager' in window)) {
      setIsSubscribed(false);
      return;
    }

    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        setIsSubscribed(false);
        return;
      }
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(Boolean(sub));
    } catch {
      setIsSubscribed(false);
    }
  }, [isIOS, isStandalone]);

  useEffect(() => {
    void checkCurrentSubscription();
  }, [checkCurrentSubscription]);

  const syncSettingsToServer = useCallback(
    async (settings: PrayerSettings) => {
      if (support !== 'supported' || !('serviceWorker' in navigator)) return;
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = reg ? await reg.pushManager.getSubscription() : null;
        if (!sub) return;
        const json = sub.toJSON();
        if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return;

        await fetchJsonSafely('/api/push/subscribe', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(buildSubscribePayload(sub, settings)),
        });
      } catch {
        // Offline sync will retry when online
      }
    },
    [support]
  );

  const subscribeWithServer = useCallback(
    async (
      settings: PrayerSettings,
      forceResubscribe = false
    ): Promise<{
      registration: ServiceWorkerRegistration | null;
      sub: PushSubscription | null;
      savedToServer: boolean;
    }> => {
      const registration = await getReadyRegistration(5000);
      if (!registration || !('pushManager' in registration)) {
        return {registration, sub: null, savedToServer: false};
      }

      let sub = await registration.pushManager.getSubscription();
      if (forceResubscribe && sub) {
        await sub.unsubscribe().catch(() => {});
        sub = null;
      }

      if (!sub) {
        const publicKey = await resolveVapidPublicKey();
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      const saveRes = await fetchJsonSafely<{ok?: boolean}>(
        '/api/push/subscribe',
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(buildSubscribePayload(sub, settings, true)),
        }
      );

      return {
        registration,
        sub,
        savedToServer: Boolean(saveRes.ok && saveRes.data?.ok),
      };
    },
    []
  );

  const enableAndSubscribe = useCallback(
    async (settings: PrayerSettings): Promise<boolean> => {
      setError(null);
      setTestMessage(null);

      if (support === 'ios-needs-install') {
        setError(
          'On iPhone and iPad, add Nwezh to your Home Screen first to enable prayer notifications.'
        );
        return false;
      }

      if (support !== 'supported') {
        setError('This browser does not support notifications.');
        return false;
      }

      setIsBusy(true);
      try {
        const perm =
          Notification.permission === 'granted'
            ? 'granted'
            : await Notification.requestPermission();
        setPermission(perm);
        if (perm !== 'granted') {
          setError(
            'Notification permission was not granted. You can enable it in your browser or device Settings.'
          );
          return false;
        }

        try {
          const {sub, savedToServer} = await subscribeWithServer(settings);
          setIsSubscribed(Boolean(sub && savedToServer));
        } catch {
          // Local on-device notifications remain available while permission is granted
          setIsSubscribed(false);
        }

        return true;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to activate notifications right now.'
        );
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [subscribeWithServer, support]
  );

  const disableAndUnsubscribe = useCallback(async () => {
    setIsBusy(true);
    setError(null);
    setTestMessage(null);
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = reg ? await reg.pushManager.getSubscription() : null;
        if (sub) {
          await fetchJsonSafely('/api/push/unsubscribe', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({endpoint: sub.endpoint}),
          });
          await sub.unsubscribe().catch(() => {});
        }
      }
      setIsSubscribed(false);
    } finally {
      setIsBusy(false);
    }
  }, []);

  const sendTestPush = useCallback(
    async (settings: PrayerSettings) => {
      setError(null);
      setTestMessage(null);

      if (support === 'ios-needs-install') {
        setError(
          'On iPhone and iPad, add Nwezh to your Home Screen first to enable prayer notifications.'
        );
        return;
      }

      if (support !== 'supported') {
        setError('This browser does not support notifications.');
        return;
      }

      setIsBusy(true);
      try {
        const perm =
          Notification.permission === 'granted'
            ? 'granted'
            : await Notification.requestPermission();
        setPermission(perm);

        if (perm !== 'granted') {
          setError(
            'Notification permission was not granted. Please allow notifications in your browser or device Settings.'
          );
          return;
        }

        let registration: ServiceWorkerRegistration | null = null;

        // 1. Try true background Web Push end-to-end
        try {
          const subscribed = await subscribeWithServer(settings);
          registration = subscribed.registration;

          if (subscribed.sub && subscribed.savedToServer) {
            const json = subscribed.sub.toJSON();
            let pushRes = await fetchJsonSafely<{ok?: boolean; error?: string}>(
              '/api/push/test',
              {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                  endpoint: json.endpoint,
                  keys: json.keys,
                  silent: settings.notifications.sound === 'off',
                  language: settings.language,
                }),
              }
            );

            // Retry once with a fresh push subscription if the push token expired (404/410/502)
            if (!pushRes.ok && (pushRes.status === 404 || pushRes.status === 502)) {
              const refreshed = await subscribeWithServer(settings, true);
              registration = refreshed.registration;
              if (refreshed.sub && refreshed.savedToServer) {
                const refreshedJson = refreshed.sub.toJSON();
                pushRes = await fetchJsonSafely<{ok?: boolean; error?: string}>(
                  '/api/push/test',
                  {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                      endpoint: refreshedJson.endpoint,
                      keys: refreshedJson.keys,
                      silent: settings.notifications.sound === 'off',
                      language: settings.language,
                    }),
                  }
                );
              }
            }

            if (pushRes.ok && pushRes.data?.ok) {
              setIsSubscribed(true);
              setTestMessage('Test push notification sent.');
              return;
            }
          }
        } catch {
          // Fall through to on-device Service Worker notification
        }

        // 2. Fallback: deliver a real OS notification via Service Worker / Notification API
        const shownLocally = await showDeviceNotification(
          settings,
          'asr',
          `nwezh-test-${Date.now()}`,
          registration
        );

        if (shownLocally) {
          setTestMessage('Test notification delivered on this device.');
        } else {
          setError(
            'Your browser blocked showing notifications in this view. Open Nwezh directly in Safari or Chrome, or install it to your Home Screen.'
          );
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Could not send test notification.'
        );
      } finally {
        setIsBusy(false);
      }
    },
    [subscribeWithServer, support]
  );

  return {
    support,
    permission,
    isSubscribed,
    isBusy,
    error,
    testMessage,
    enableAndSubscribe,
    syncSettingsToServer,
    disableAndUnsubscribe,
    sendTestPush,
  };
}
