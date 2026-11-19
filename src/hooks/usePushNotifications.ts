import {useCallback, useEffect, useState} from 'react';
import type {PrayerSettings} from '../../shared/prayerEngine';

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

async function getReadyRegistrationWithTimeout(
  timeoutMs = 4500
): Promise<ServiceWorkerRegistration> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker is not supported in this browser.');
  }

  const existing = await navigator.serviceWorker.getRegistration();
  if (existing?.active) return existing;

  return await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) =>
      window.setTimeout(
        () =>
          reject(
            new Error(
              'Service Worker is not active in this view. Try opening Nwezh directly in Safari or Chrome.'
            )
          ),
        timeoutMs
      )
    ),
  ]);
}

export function usePushNotifications(
  isStandalone: boolean,
  isIOS: boolean
): PushStatus {
  const [support, setSupport] = useState<PushSupportState>('unsupported');
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    'unsupported'
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState<string | null>(null);

  const checkCurrentSubscription = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const hasNotification = 'Notification' in window;
    const hasSW = 'serviceWorker' in navigator;
    const hasPush = 'PushManager' in window;

    if (isIOS && !isStandalone) {
      setSupport('ios-needs-install');
      setPermission(hasNotification ? Notification.permission : 'default');
      setIsSubscribed(false);
      return;
    }

    if (!hasNotification || !hasSW || !hasPush) {
      setSupport('unsupported');
      setPermission('unsupported');
      setIsSubscribed(false);
      return;
    }

    setSupport('supported');
    setPermission(Notification.permission);

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

        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            endpoint: json.endpoint,
            keys: json.keys,
            location: settings.location,
            method: settings.method,
            asrMethod: settings.asrMethod,
            highLatitudeRule: settings.highLatitudeRule,
            adjustments: settings.adjustments,
            timeFormat: settings.timeFormat,
            language: settings.language,
            enabled: settings.notifications.enabled,
            prayers: settings.notifications.prayers,
            silent: settings.notifications.sound === 'off',
          }),
        });
      } catch {
        // Offline sync will retry when online
      }
    },
    [support]
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
        setError('This browser does not support Web Push notifications.');
        return false;
      }

      setIsBusy(true);
      try {
        const perm = await Notification.requestPermission();
        setPermission(perm);
        if (perm !== 'granted') {
          setError(
            'Notification permission was not granted. You can enable it in your browser or device Settings.'
          );
          return false;
        }

        const registration = await getReadyRegistrationWithTimeout(4500);
        let sub = await registration.pushManager.getSubscription();

        if (!sub) {
          const keyRes = await fetch('/api/push/vapid-public-key');
          if (!keyRes.ok) {
            throw new Error('Could not reach notification server.');
          }
          const {publicKey} = (await keyRes.json()) as {publicKey: string};
          sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
          });
        }

        const json = sub.toJSON();
        const saveRes = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            endpoint: json.endpoint,
            keys: json.keys,
            location: settings.location,
            method: settings.method,
            asrMethod: settings.asrMethod,
            highLatitudeRule: settings.highLatitudeRule,
            adjustments: settings.adjustments,
            timeFormat: settings.timeFormat,
            language: settings.language,
            enabled: true,
            prayers: settings.notifications.prayers,
            silent: settings.notifications.sound === 'off',
          }),
        });

        if (!saveRes.ok) {
          throw new Error('Failed to save push preferences.');
        }

        setIsSubscribed(true);
        return true;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to activate push notifications right now.'
        );
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [support]
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
          await fetch('/api/push/unsubscribe', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({endpoint: sub.endpoint}),
          }).catch(() => {});
          await sub.unsubscribe();
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
      setIsBusy(true);
      try {
        if (support !== 'supported') {
          setError('Push notifications require an installed PWA or supported browser.');
          return;
        }
        const registration = await getReadyRegistrationWithTimeout(4500);
        let sub = await registration.pushManager.getSubscription();
        if (!sub) {
          const ok = await enableAndSubscribe(settings);
          if (!ok) return;
          sub = await registration.pushManager.getSubscription();
        }
        if (!sub) return;
        const json = sub.toJSON();
        const res = await fetch('/api/push/test', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            endpoint: json.endpoint,
            keys: json.keys,
            silent: settings.notifications.sound === 'off',
            language: settings.language,
          }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {error?: string};
          throw new Error(data.error || 'Could not deliver test notification.');
        }
        setTestMessage('Test reminder sent.');
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Could not send test notification.'
        );
      } finally {
        setIsBusy(false);
      }
    },
    [enableAndSubscribe, support]
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
