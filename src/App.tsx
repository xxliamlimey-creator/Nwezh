/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import {useEffect, useMemo, useRef, useState} from 'react';
import {Clock, Settings as SettingsIcon, VolumeX, WifiOff} from 'lucide-react';
import {
  computeDaySchedule,
  getDateKeyInZone,
  getPrayerArrivalCopy,
  getTimePartsInZone,
  PRAYER_ORDER,
  type AppLanguage,
  type CalculationMethodId,
  type PrayerLocation,
  type PrayerName,
  type PrayerSettings,
} from '../shared/prayerEngine';
import {CityPickerModal} from './components/CityPickerModal';
import {HomeScreen} from './components/HomeScreen';
import {InstallGuideModal} from './components/InstallGuideModal';
import {LandingPage} from './components/LandingPage';
import {NwezhMark} from './components/NwezhMark';
import {OnboardingFlow} from './components/OnboardingFlow';
import {SettingsScreen} from './components/SettingsScreen';
import {useOnlineStatus} from './hooks/useOnlineStatus';
import {usePWAInstall} from './hooks/usePWAInstall';
import {usePushNotifications} from './hooks/usePushNotifications';
import {getLanguageMeta, getTranslations} from './i18n/translations';
import {
  playPrayerCue,
  stopPrayerCue,
  subscribeAudioState,
} from './utils/audioCue';
import {
  hasCompletedOnboarding,
  hasEnteredWebApp,
  loadSettings,
  refreshOfflineScheduleCache,
  saveSettings,
  setEnteredWebApp,
  setOnboardingComplete,
} from './utils/storage';

type AppTab = 'today' | 'settings';

export default function App() {
  const installState = usePWAInstall();
  const isOnline = useOnlineStatus();
  const pushStatus = usePushNotifications(
    installState.isStandalone,
    installState.isIOS
  );

  const [enteredWeb, setEnteredWeb] = useState<boolean>(() => hasEnteredWebApp());
  const [onboarded, setOnboarded] = useState<boolean>(() =>
    hasCompletedOnboarding()
  );
  const [settings, setSettings] = useState<PrayerSettings>(() => loadSettings());
  const [activeTab, setActiveTab] = useState<AppTab>('today');
  const [now, setNow] = useState<Date>(() => new Date());

  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [foregroundBanner, setForegroundBanner] = useState<string | null>(null);
  const [isAudioActive, setIsAudioActive] = useState(false);

  const triggeredForegroundRef = useRef<Record<string, string>>({});

  const t = useMemo(() => getTranslations(settings.language), [settings.language]);
  const langMeta = useMemo(
    () => getLanguageMeta(settings.language),
    [settings.language]
  );

  // Sync HTML dir & lang for RTL (Sorani Kurdish, Arabic, Urdu) vs LTR
  useEffect(() => {
    document.documentElement.dir = langMeta.dir;
    document.documentElement.lang = langMeta.localeTag;
  }, [langMeta]);

  useEffect(() => {
    return subscribeAudioState((id) => setIsAudioActive(id !== null));
  }, []);

  // Live clock tick (1s) for countdown & automatic midnight rollover
  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Theme application (Light / Dark / System)
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark =
        settings.theme === 'dark' ||
        (settings.theme === 'system' && media.matches);
      document.documentElement.classList.toggle('dark', isDark);
    };

    applyTheme();
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [settings.theme]);

  // Automatic timezone change detection when using automatic location
  useEffect(() => {
    if (settings.location.source !== 'auto') return;
    const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (currentTz && currentTz !== settings.location.timezone) {
      setSettings((prev) => ({
        ...prev,
        location: {...prev.location, timezone: currentTz},
      }));
    }
  }, [now, settings.location.source, settings.location.timezone]);

  // Persist settings, rebuild 30-day offline schedule cache, and sync Web Push
  useEffect(() => {
    saveSettings(settings);
    refreshOfflineScheduleCache(settings);
    if (pushStatus.isSubscribed) {
      void pushStatus.syncSettingsToServer(settings);
    }
  }, [settings, pushStatus.isSubscribed, pushStatus.syncSettingsToServer]);

  // Foreground Adhan/chime & banner when an enabled prayer minute arrives
  useEffect(() => {
    if (!onboarded || !settings.notifications.enabled) return;

    const tz = settings.location.timezone;
    const nowParts = getTimePartsInZone(now, tz);
    const dateKey = getDateKeyInZone(now, tz);
    const schedule = computeDaySchedule(now, settings);

    for (const prayer of PRAYER_ORDER) {
      if (!settings.notifications.prayers[prayer]) continue;
      if (triggeredForegroundRef.current[prayer] === dateKey) continue;

      const pParts = getTimePartsInZone(schedule.timesMap[prayer], tz);
      if (nowParts.hour === pParts.hour && nowParts.minute === pParts.minute) {
        triggeredForegroundRef.current[prayer] = dateKey;
        if (settings.notifications.sound !== 'off') {
          void playPrayerCue(settings.notifications.sound);
        }
        const message = getPrayerArrivalCopy(prayer, settings.language);
        setForegroundBanner(message);
        window.setTimeout(() => {
          setForegroundBanner((prev) => (prev === message ? null : prev));
        }, 12000);
      }
    }
  }, [now, onboarded, settings]);

  const handleEnterWebApp = () => {
    setEnteredWebApp(true);
    setEnteredWeb(true);
  };

  const handleCompleteOnboarding = (finalSettings: PrayerSettings) => {
    setSettings(finalSettings);
    setOnboardingComplete(true);
    setOnboarded(true);
  };

  const handleSelectLocation = (
    location: PrayerLocation,
    suggestedMethod?: CalculationMethodId
  ) => {
    setSettings((prev) => ({
      ...prev,
      location,
      method: suggestedMethod || prev.method,
    }));
  };

  const handleLanguageChange = (language: AppLanguage) => {
    setSettings((prev) => ({...prev, language}));
  };

  const handleTogglePrayerNotification = async (prayer: PrayerName) => {
    if (!settings.notifications.enabled) {
      if (pushStatus.support === 'ios-needs-install') {
        setShowInstallGuide(true);
      }
      if (pushStatus.support === 'supported') {
        const nextCandidate: PrayerSettings = {
          ...settings,
          notifications: {
            ...settings.notifications,
            enabled: true,
            prayers: {
              ...settings.notifications.prayers,
              [prayer]: true,
            },
          },
        };
        await pushStatus.enableAndSubscribe(nextCandidate);
        setSettings(nextCandidate);
        return;
      }
      // On browsers without Web Push, still allow local foreground audio/banner reminders
      setSettings((prev) => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          enabled: true,
          prayers: {
            ...prev.notifications.prayers,
            [prayer]: true,
          },
        },
      }));
      return;
    }

    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        prayers: {
          ...prev.notifications.prayers,
          [prayer]: !prev.notifications.prayers[prayer],
        },
      },
    }));
  };

  const handleDesktopInstall = async () => {
    if (installState.canNativeInstall) {
      await installState.promptInstall();
      return;
    }
    setShowInstallGuide(true);
  };

  const showLanding = !installState.isStandalone && !enteredWeb;

  if (showLanding) {
    return (
      <>
        <LandingPage
          language={settings.language}
          onChangeLanguage={handleLanguageChange}
          installState={installState}
          onOpenInstallGuide={() => setShowInstallGuide(true)}
          onEnterWebApp={handleEnterWebApp}
        />
        <InstallGuideModal
          open={showInstallGuide}
          onClose={() => setShowInstallGuide(false)}
          isIOS={installState.isIOS}
          isIOSSafari={installState.isIOSSafari}
          isMacSafari={installState.isMacSafari}
          onContinueInBrowser={handleEnterWebApp}
        />
      </>
    );
  }

  if (!onboarded) {
    return (
      <>
        <OnboardingFlow
          initialSettings={settings}
          installState={installState}
          pushStatus={pushStatus}
          onChangeLanguage={handleLanguageChange}
          onOpenInstallGuide={() => setShowInstallGuide(true)}
          onComplete={handleCompleteOnboarding}
        />
        <InstallGuideModal
          open={showInstallGuide}
          onClose={() => setShowInstallGuide(false)}
          isIOS={installState.isIOS}
          isIOSSafari={installState.isIOSSafari}
          isMacSafari={installState.isMacSafari}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0D0E0D] text-[#141413] dark:text-[#F4F3EF] flex flex-col pt-safe">
      {/* Desktop & Tablet Top Bar */}
      <header className="hidden lg:block border-b border-[#E6E3DC] dark:border-[#262926] bg-[#FAF9F6] dark:bg-[#0D0E0D]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <NwezhMark className="w-7 h-7" />
            <span className="font-display text-base font-semibold tracking-tight">
              {t.appName}
            </span>
          </div>

          <nav
            aria-label="Primary navigation"
            className="flex items-center gap-6"
          >
            <button
              type="button"
              onClick={() => setActiveTab('today')}
              className={`text-sm font-medium transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'today'
                  ? 'text-[#141413] dark:text-[#F4F3EF] border-b-2 border-[#2F5E4E] dark:border-[#6E9F8B]'
                  : 'text-[#5C5B57] dark:text-[#9C9B95] hover:text-[#141413] dark:hover:text-[#F4F3EF]'
              }`}
            >
              {t.navToday}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`text-sm font-medium transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'settings'
                  ? 'text-[#141413] dark:text-[#F4F3EF] border-b-2 border-[#2F5E4E] dark:border-[#6E9F8B]'
                  : 'text-[#5C5B57] dark:text-[#9C9B95] hover:text-[#141413] dark:hover:text-[#F4F3EF]'
              }`}
            >
              {t.navSettings}
            </button>
          </nav>

          <div className="shrink-0">
            {!installState.isStandalone ? (
              <button
                type="button"
                onClick={() => void handleDesktopInstall()}
                className="min-h-[38px] px-4 rounded-xl bg-[#141413] dark:bg-[#F4F3EF] text-[#FAF9F6] dark:text-[#141413] text-xs font-medium whitespace-nowrap shrink-0 transition-opacity hover:opacity-90"
              >
                {t.installNwezh}
              </button>
            ) : (
              <div className="w-24" />
            )}
          </div>
        </div>
      </header>

      {/* Mobile Compact Header */}
      <header className="lg:hidden px-5 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NwezhMark className="w-6 h-6" />
          <span className="font-display text-sm font-semibold tracking-tight">
            {t.appName}
          </span>
        </div>
        {!installState.isStandalone && (
          <button
            type="button"
            onClick={() => void handleDesktopInstall()}
            className="min-h-[36px] px-3 rounded-lg border border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#151715] text-xs font-medium text-[#141413] dark:text-[#F4F3EF]"
          >
            {t.installShort}
          </button>
        )}
      </header>

      {/* Quiet Offline Indicator */}
      {!isOnline && (
        <div className="max-w-5xl w-full mx-auto px-5 sm:px-6 pt-2">
          <div className="rounded-xl border border-[#E6E3DC] dark:border-[#262926] bg-[#F2F0EB] dark:bg-[#151715] px-3.5 py-2 flex items-center gap-2 text-xs text-[#5C5B57] dark:text-[#9C9B95]">
            <WifiOff className="w-3.5 h-3.5 shrink-0" />
            <span>{t.offlineBanner}</span>
          </div>
        </div>
      )}

      {/* Quiet Foreground Prayer Arrival / Stop Adhan Banner */}
      {(foregroundBanner || isAudioActive) && (
        <div className="max-w-5xl w-full mx-auto px-5 sm:px-6 pt-3">
          <div className="rounded-xl border border-[#2F5E4E]/30 dark:border-[#6E9F8B]/30 bg-[#EDF3F0] dark:bg-[#1A2520] px-4 py-3 flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-[#2F5E4E] dark:text-[#9EC2B2]">
              {foregroundBanner || t.notificationSound}
            </span>
            <div className="flex items-center gap-3 shrink-0">
              {isAudioActive && (
                <button
                  type="button"
                  onClick={stopPrayerCue}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#141413] dark:text-[#F4F3EF]"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>{t.stopPreview}</span>
                </button>
              )}
              {foregroundBanner && (
                <button
                  type="button"
                  onClick={() => {
                    stopPrayerCue();
                    setForegroundBanner(null);
                  }}
                  className="text-xs font-medium text-[#5C5B57] dark:text-[#9C9B95]"
                >
                  {t.dismiss}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === 'today' ? (
          <HomeScreen
            now={now}
            settings={settings}
            onOpenCityPicker={() => setShowCityPicker(true)}
            onTogglePrayerNotification={(p) =>
              void handleTogglePrayerNotification(p)
            }
          />
        ) : (
          <SettingsScreen
            settings={settings}
            installState={installState}
            pushStatus={pushStatus}
            onUpdateSettings={setSettings}
            onOpenCityPicker={() => setShowCityPicker(true)}
            onOpenInstallGuide={() => setShowInstallGuide(true)}
          />
        )}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#E6E3DC] dark:border-[#262926] bg-[#FAF9F6] dark:bg-[#0D0E0D] pb-safe"
      >
        <div className="grid grid-cols-2 h-14">
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === 'today'
                ? 'text-[#2F5E4E] dark:text-[#9EC2B2]'
                : 'text-[#5C5B57] dark:text-[#9C9B95]'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-[11px] font-medium">{t.navToday}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === 'settings'
                ? 'text-[#2F5E4E] dark:text-[#9EC2B2]'
                : 'text-[#5C5B57] dark:text-[#9C9B95]'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="text-[11px] font-medium">{t.navSettings}</span>
          </button>
        </div>
      </nav>

      <CityPickerModal
        open={showCityPicker}
        language={settings.language}
        onClose={() => setShowCityPicker(false)}
        onSelectLocation={handleSelectLocation}
      />

      <InstallGuideModal
        open={showInstallGuide}
        onClose={() => setShowInstallGuide(false)}
        isIOS={installState.isIOS}
        isIOSSafari={installState.isIOSSafari}
        isMacSafari={installState.isMacSafari}
      />
    </div>
  );
}
