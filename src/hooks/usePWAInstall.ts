import {useEffect, useState} from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{outcome: 'accepted' | 'dismissed'; platform: string}>;
}

export interface PWAInstallState {
  isStandalone: boolean;
  canNativeInstall: boolean;
  isIOS: boolean;
  isIOSSafari: boolean;
  isMacSafari: boolean;
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
}

function checkStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as {standalone?: boolean}).standalone === true
  );
}

export function usePWAInstall(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(checkStandalone);
  const [isIOS, setIsIOS] = useState(false);
  const [isIOSSafari, setIsIOSSafari] = useState(false);
  const [isMacSafari, setIsMacSafari] = useState(false);

  useEffect(() => {
    setIsStandalone(checkStandalone());

    const ua = window.navigator.userAgent;
    const uaLower = ua.toLowerCase();
    const isTouchMac =
      navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    const iosDevice = /iphone|ipad|ipod/.test(uaLower) || isTouchMac;
    const isWebKit = /webkit/i.test(ua);
    const isCriOSOrFxiOS = /crios|fxios|edgios|opios/i.test(ua);
    const isSafariBrowser =
      isWebKit && !/chrome|chromium|android|edg|opr/i.test(uaLower);

    setIsIOS(iosDevice);
    setIsIOSSafari(iosDevice && isWebKit && !isCriOSOrFxiOS);
    setIsMacSafari(!iosDevice && isSafariBrowser);

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsStandalone(true);
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    };

    mediaQuery.addEventListener('change', handleDisplayModeChange);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable';
    await deferredPrompt.prompt();
    const {outcome} = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsStandalone(true);
      setDeferredPrompt(null);
    }
    return outcome;
  };

  return {
    isStandalone,
    canNativeInstall: Boolean(deferredPrompt),
    isIOS,
    isIOSSafari,
    isMacSafari,
    promptInstall,
  };
}
