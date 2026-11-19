import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Check,
  ChevronRight,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  Square,
  Trash2,
  Upload,
  Volume2,
} from 'lucide-react';
import {
  CALCULATION_METHODS,
  DEFAULT_ADJUSTMENTS,
  NOTIFICATION_SOUNDS,
  PRAYER_ORDER,
  type AppLanguage,
  type AsrMethodId,
  type CalculationMethodId,
  type HighLatitudeRuleId,
  type NotificationSoundId,
  type PrayerName,
  type PrayerSettings,
  type ThemePreference,
} from '../../shared/prayerEngine';
import type {PWAInstallState} from '../hooks/usePWAInstall';
import type {PushStatus} from '../hooks/usePushNotifications';
import {getTranslations, LANGUAGES} from '../i18n/translations';
import {
  playPrayerCue,
  stopPrayerCue,
  subscribeAudioState,
} from '../utils/audioCue';
import {
  deleteCustomSoundFile,
  loadCustomSoundFile,
  saveCustomSoundFile,
} from '../utils/customSoundDb';
import {detectDeviceCoordinates} from '../utils/location';
import {NwezhMark} from './NwezhMark';

interface SettingsScreenProps {
  settings: PrayerSettings;
  installState: PWAInstallState;
  pushStatus: PushStatus;
  onUpdateSettings: (next: PrayerSettings) => void;
  onOpenCityPicker: () => void;
  onOpenInstallGuide: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  installState,
  pushStatus,
  onUpdateSettings,
  onOpenCityPicker,
  onOpenInstallGuide,
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [playingSoundId, setPlayingSoundId] =
    useState<NotificationSoundId | null>(null);
  const [customSoundName, setCustomSoundName] = useState<string | null>(
    settings.notifications.customSoundName || null
  );
  const [customSoundError, setCustomSoundError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const t = useMemo(() => getTranslations(settings.language), [settings.language]);

  useEffect(() => {
    const unsub = subscribeAudioState(setPlayingSoundId);
    void loadCustomSoundFile().then((entry) => {
      if (entry) {
        setCustomSoundName(entry.name);
      }
    });
    return () => {
      unsub();
      stopPrayerCue();
    };
  }, []);

  const handleAutoDetect = async () => {
    setLocationMessage(null);
    setIsDetecting(true);
    try {
      const res = await detectDeviceCoordinates();
      onUpdateSettings({
        ...settings,
        location: res.location,
        method: res.suggestedMethod,
      });
      setLocationMessage(res.location.name);
    } catch (err) {
      setLocationMessage(
        err instanceof Error ? err.message : 'Unable to detect location.'
      );
    } finally {
      setIsDetecting(false);
    }
  };

  const handleToggleMasterNotifications = async () => {
    const nextEnabled = !settings.notifications.enabled;
    if (nextEnabled) {
      if (pushStatus.support === 'supported') {
        await pushStatus.enableAndSubscribe({
          ...settings,
          notifications: {...settings.notifications, enabled: true},
        });
      }
      onUpdateSettings({
        ...settings,
        notifications: {...settings.notifications, enabled: true},
      });
    } else {
      await pushStatus.disableAndUnsubscribe();
      onUpdateSettings({
        ...settings,
        notifications: {...settings.notifications, enabled: false},
      });
    }
  };

  const handleTogglePrayer = (prayer: PrayerName) => {
    onUpdateSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        prayers: {
          ...settings.notifications.prayers,
          [prayer]: !settings.notifications.prayers[prayer],
        },
      },
    });
  };

  const handleSelectSound = (id: NotificationSoundId) => {
    onUpdateSettings({
      ...settings,
      notifications: {...settings.notifications, sound: id},
    });
    if (id === 'off') {
      stopPrayerCue();
    } else {
      void playPrayerCue(id);
    }
  };

  const handleTogglePreview = (
    e: React.MouseEvent,
    id: NotificationSoundId
  ) => {
    e.stopPropagation();
    if (playingSoundId === id) {
      stopPrayerCue();
    } else {
      void playPrayerCue(id);
    }
  };

  const handleCustomFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomSoundError(null);
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const saved = await saveCustomSoundFile(file);
      setCustomSoundName(saved.name);
      onUpdateSettings({
        ...settings,
        notifications: {
          ...settings.notifications,
          sound: 'custom',
          customSoundName: saved.name,
        },
      });
      void playPrayerCue('custom');
    } catch (err) {
      setCustomSoundError(
        err instanceof Error ? err.message : 'Could not save audio file.'
      );
    }
  };

  const handleRemoveCustomSound = async (e: React.MouseEvent) => {
    e.stopPropagation();
    stopPrayerCue();
    await deleteCustomSoundFile();
    setCustomSoundName(null);
    onUpdateSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        sound:
          settings.notifications.sound === 'custom'
            ? 'makkah'
            : settings.notifications.sound,
        customSoundName: undefined,
      },
    });
  };

  const handleAdjustPrayer = (prayer: PrayerName, delta: number) => {
    const current = settings.adjustments[prayer] || 0;
    const nextVal = Math.max(-30, Math.min(30, current + delta));
    onUpdateSettings({
      ...settings,
      adjustments: {
        ...settings.adjustments,
        [prayer]: nextVal,
      },
    });
  };

  const hasAnyAdjustments = PRAYER_ORDER.some(
    (p) => (settings.adjustments[p] || 0) !== 0
  );

  const handleInstallClick = async () => {
    if (installState.canNativeInstall) {
      await installState.promptInstall();
      return;
    }
    onOpenInstallGuide();
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-5 sm:px-6 pt-6 sm:pt-8 pb-28 lg:pb-14 space-y-10">
      <header className="space-y-1">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
          {t.settingsTitle}
        </h1>
        <p className="text-sm text-[#5C5B57] dark:text-[#9C9B95]">
          {t.settingsSubtitle}
        </p>
      </header>

      {/* 1. Appearance & Language */}
      <section className="space-y-3" aria-labelledby="settings-lang-heading">
        <h2
          id="settings-lang-heading"
          className="text-xs font-medium text-[#5C5B57] dark:text-[#9C9B95] px-1"
        >
          {t.sectionAppearance}
        </h2>
        <div className="rounded-2xl border border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#151715] divide-y divide-[#E6E3DC]/70 dark:divide-[#262926] overflow-hidden">
          <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label htmlFor="language-select" className="text-sm font-medium">
              {t.languageLabel}
            </label>
            <select
              id="language-select"
              value={settings.language}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  language: e.target.value as AppLanguage,
                })
              }
              className="min-h-[40px] rounded-xl border border-[#E6E3DC] dark:border-[#262926] bg-[#FAF9F6] dark:bg-[#1D201D] px-3 text-sm text-[#141413] dark:text-[#F4F3EF] focus:outline-none focus:border-[#2F5E4E]"
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nativeName} — {l.englishName}
                </option>
              ))}
            </select>
          </div>

          <div className="px-4 py-3.5 flex items-center justify-between gap-4">
            <span className="text-sm font-medium">{t.themeLabel}</span>
            <div className="inline-flex p-1 rounded-xl bg-[#F2F0EB] dark:bg-[#0D0E0D] border border-[#E6E3DC]/70 dark:border-[#262926]">
              {(
                [
                  {id: 'light', label: t.themeLight},
                  {id: 'dark', label: t.themeDark},
                  {id: 'system', label: t.themeSystem},
                ] as Array<{id: ThemePreference; label: string}>
              ).map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onUpdateSettings({...settings, theme: theme.id})}
                  className={`min-h-[36px] px-3.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    settings.theme === theme.id
                      ? 'bg-white dark:bg-[#262926] text-[#141413] dark:text-[#F4F3EF]'
                      : 'text-[#5C5B57] dark:text-[#9C9B95]'
                  }`}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Location */}
      <section className="space-y-3" aria-labelledby="settings-location-heading">
        <h2
          id="settings-location-heading"
          className="text-xs font-medium text-[#5C5B57] dark:text-[#9C9B95] px-1"
        >
          {t.sectionLocation}
        </h2>
        <div className="rounded-2xl border border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#151715] divide-y divide-[#E6E3DC]/70 dark:divide-[#262926] overflow-hidden">
          <button
            type="button"
            onClick={onOpenCityPicker}
            className="w-full min-h-[60px] px-4 py-3.5 flex items-center justify-between gap-4 text-start hover:bg-[#FAF9F6] dark:hover:bg-[#1D201D] transition-colors"
          >
            <div>
              <div className="text-sm font-medium">
                {settings.location.name}
                {settings.location.country ? `, ${settings.location.country}` : ''}
              </div>
              <div
                dir="ltr"
                className="text-xs text-[#5C5B57] dark:text-[#9C9B95] tabular-nums mt-0.5"
              >
                {settings.location.lat.toFixed(3)}°,{' '}
                {settings.location.lng.toFixed(3)}° · {settings.location.timezone}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#5C5B57] dark:text-[#9C9B95] shrink-0 rtl:rotate-180" />
          </button>

          <button
            type="button"
            onClick={handleAutoDetect}
            disabled={isDetecting}
            className="w-full min-h-[48px] px-4 py-3 flex items-center gap-2.5 text-sm font-medium text-[#2F5E4E] dark:text-[#6E9F8B] hover:bg-[#FAF9F6] dark:hover:bg-[#1D201D] transition-colors disabled:opacity-60"
          >
            <MapPin className="w-4 h-4 shrink-0" />
            <span>
              {isDetecting ? t.detectingLocation : t.detectAutomatically}
            </span>
          </button>
        </div>
        {locationMessage && (
          <p className="text-xs text-[#5C5B57] dark:text-[#9C9B95] px-1">
            {locationMessage}
          </p>
        )}
      </section>

      {/* 3. Prayer Calculation */}
      <section className="space-y-3" aria-labelledby="settings-calc-heading">
        <h2
          id="settings-calc-heading"
          className="text-xs font-medium text-[#5C5B57] dark:text-[#9C9B95] px-1"
        >
          {t.sectionCalculation}
        </h2>
        <div className="rounded-2xl border border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#151715] divide-y divide-[#E6E3DC]/70 dark:divide-[#262926] overflow-hidden">
          <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label
              htmlFor="calc-method-select"
              className="text-sm font-medium"
            >
              {t.calculationMethod}
            </label>
            <select
              id="calc-method-select"
              value={settings.method}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  method: e.target.value as CalculationMethodId,
                })
              }
              className="min-h-[40px] rounded-xl border border-[#E6E3DC] dark:border-[#262926] bg-[#FAF9F6] dark:bg-[#1D201D] px-3 text-sm text-[#141413] dark:text-[#F4F3EF] focus:outline-none focus:border-[#2F5E4E]"
            >
              {CALCULATION_METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">{t.asrCalculation}</div>
            </div>
            <div className="inline-flex p-1 rounded-xl bg-[#F2F0EB] dark:bg-[#0D0E0D] border border-[#E6E3DC]/70 dark:border-[#262926] self-start sm:self-auto">
              {(['Shafi', 'Hanafi'] as AsrMethodId[]).map((asr) => (
                <button
                  key={asr}
                  type="button"
                  onClick={() => onUpdateSettings({...settings, asrMethod: asr})}
                  className={`min-h-[36px] px-3.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    settings.asrMethod === asr
                      ? 'bg-white dark:bg-[#262926] text-[#141413] dark:text-[#F4F3EF]'
                      : 'text-[#5C5B57] dark:text-[#9C9B95]'
                  }`}
                >
                  {asr === 'Shafi' ? t.standardLabel : t.hanafiLabel}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label htmlFor="high-lat-select" className="text-sm font-medium">
              {t.highLatitudeRule}
            </label>
            <select
              id="high-lat-select"
              value={settings.highLatitudeRule}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  highLatitudeRule: e.target.value as HighLatitudeRuleId,
                })
              }
              className="min-h-[40px] rounded-xl border border-[#E6E3DC] dark:border-[#262926] bg-[#FAF9F6] dark:bg-[#1D201D] px-3 text-sm text-[#141413] dark:text-[#F4F3EF] focus:outline-none focus:border-[#2F5E4E]"
            >
              <option value="Auto">Automatic (Recommended)</option>
              <option value="MiddleOfTheNight">Middle of the Night</option>
              <option value="SeventhOfTheNight">One-Seventh of the Night</option>
              <option value="TwilightAngle">Twilight Angle</option>
            </select>
          </div>

          <div className="px-4 py-3.5 flex items-center justify-between gap-4">
            <span className="text-sm font-medium">{t.timeFormat}</span>
            <div className="inline-flex p-1 rounded-xl bg-[#F2F0EB] dark:bg-[#0D0E0D] border border-[#E6E3DC]/70 dark:border-[#262926]">
              {(['12h', '24h'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => onUpdateSettings({...settings, timeFormat: fmt})}
                  className={`min-h-[36px] px-3.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    settings.timeFormat === fmt
                      ? 'bg-white dark:bg-[#262926] text-[#141413] dark:text-[#F4F3EF]'
                      : 'text-[#5C5B57] dark:text-[#9C9B95]'
                  }`}
                >
                  {fmt === '12h' ? t.format12h : t.format24h}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Notifications & Real Adhan / Custom Sounds */}
      <section className="space-y-3" aria-labelledby="settings-notif-heading">
        <h2
          id="settings-notif-heading"
          className="text-xs font-medium text-[#5C5B57] dark:text-[#9C9B95] px-1"
        >
          {t.sectionNotifications}
        </h2>

        <div className="rounded-2xl border border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#151715] divide-y divide-[#E6E3DC]/70 dark:divide-[#262926] overflow-hidden">
          <button
            type="button"
            role="switch"
            aria-checked={settings.notifications.enabled}
            disabled={pushStatus.isBusy}
            onClick={() => void handleToggleMasterNotifications()}
            className="w-full min-h-[56px] px-4 py-3.5 flex items-center justify-between gap-4 text-start hover:bg-[#FAF9F6] dark:hover:bg-[#1D201D] transition-colors"
          >
            <div>
              <div className="text-sm font-medium">{t.prayerReminders}</div>
              <div className="text-xs text-[#5C5B57] dark:text-[#9C9B95] mt-0.5">
                {pushStatus.support === 'ios-needs-install'
                  ? t.iosHomeRequiredTitle
                  : pushStatus.isSubscribed && settings.notifications.enabled
                    ? 'Active · Background push reminders enabled'
                    : settings.notifications.enabled
                      ? 'Active while Nwezh is open'
                      : 'Receive a quiet reminder when prayer arrives'}
              </div>
            </div>
            <span
              className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center shrink-0 ${
                settings.notifications.enabled
                  ? 'bg-[#2F5E4E] dark:bg-[#6E9F8B] justify-end'
                  : 'bg-[#E6E3DC] dark:bg-[#262926] justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white dark:bg-[#0D0E0D]" />
            </span>
          </button>

          {PRAYER_ORDER.map((prayer) => {
            const active = settings.notifications.prayers[prayer];
            return (
              <button
                key={prayer}
                type="button"
                role="switch"
                aria-checked={active}
                onClick={() => handleTogglePrayer(prayer)}
                className="w-full min-h-[48px] px-4 py-3 flex items-center justify-between gap-4 text-start hover:bg-[#FAF9F6] dark:hover:bg-[#1D201D] transition-colors"
              >
                <span className="text-sm">{t.prayers[prayer]}</span>
                <span
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors flex items-center shrink-0 ${
                    active
                      ? 'bg-[#2F5E4E] dark:bg-[#6E9F8B] justify-end'
                      : 'bg-[#E6E3DC] dark:bg-[#262926] justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white dark:bg-[#0D0E0D]" />
                </span>
              </button>
            );
          })}
        </div>

        {/* Adhan & Sound Selector */}
        <div className="rounded-2xl border border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#151715] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-[#E6E3DC]/70 dark:border-[#262926]">
            <div className="text-sm font-medium">{t.notificationSound}</div>
            <p className="text-xs text-[#5C5B57] dark:text-[#9C9B95] mt-0.5 leading-relaxed">
              {t.soundHint}
            </p>
          </div>

          <div className="divide-y divide-[#E6E3DC]/60 dark:divide-[#262926]">
            {NOTIFICATION_SOUNDS.map((sound) => {
              const selected = settings.notifications.sound === sound.id;
              const isPlaying = playingSoundId === sound.id;
              const isCustomMissing = sound.id === 'custom' && !customSoundName;

              return (
                <div
                  key={sound.id}
                  onClick={() => {
                    if (isCustomMissing) {
                      fileInputRef.current?.click();
                    } else {
                      handleSelectSound(sound.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (isCustomMissing) {
                        fileInputRef.current?.click();
                      } else {
                        handleSelectSound(sound.id);
                      }
                    }
                  }}
                  className={`px-4 py-3 min-h-[54px] flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    selected
                      ? 'bg-[#EDF3F0]/75 dark:bg-[#1A2520]'
                      : 'hover:bg-[#FAF9F6] dark:hover:bg-[#1D201D]'
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <span className="w-5 flex items-center justify-center shrink-0">
                      {selected && (
                        <Check className="w-4 h-4 text-[#2F5E4E] dark:text-[#6E9F8B]" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#141413] dark:text-[#F4F3EF] truncate">
                        {sound.id === 'custom' && customSoundName
                          ? customSoundName
                          : sound.label}
                      </div>
                      <div className="text-xs text-[#5C5B57] dark:text-[#9C9B95] truncate">
                        {sound.id === 'custom' && customSoundName
                          ? t.customSoundStored
                          : sound.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {sound.id === 'custom' && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="min-h-[36px] px-3 rounded-lg border border-[#E6E3DC] dark:border-[#262926] text-xs font-medium text-[#141413] dark:text-[#F4F3EF] hover:bg-white dark:hover:bg-[#262926] flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>
                            {customSoundName
                              ? t.replaceCustomSound
                              : t.uploadCustomSound}
                          </span>
                        </button>
                        {customSoundName && (
                          <button
                            type="button"
                            onClick={(e) => void handleRemoveCustomSound(e)}
                            aria-label={t.removeCustomSound}
                            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg border border-[#E6E3DC] dark:border-[#262926] text-[#5C5B57] hover:text-[#8A3B2E] dark:text-[#9C9B95]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}

                    {sound.id !== 'off' && !isCustomMissing && (
                      <button
                        type="button"
                        onClick={(e) => handleTogglePreview(e, sound.id)}
                        aria-label={
                          isPlaying ? t.stopPreview : t.previewSound
                        }
                        className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl border border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#1D201D] text-[#141413] dark:text-[#F4F3EF] hover:opacity-80"
                      >
                        {isPlaying ? (
                          <Square className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac"
            onChange={(e) => void handleCustomFileChange(e)}
            className="hidden"
          />
        </div>

        {customSoundError && (
          <p className="text-xs text-[#8A3B2E] dark:text-[#E59B8D] px-1">
            {customSoundError}
          </p>
        )}

        {/* Test Push Action */}
        <div className="rounded-2xl border border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#151715] px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#5C5B57] dark:text-[#9C9B95]">
            {pushStatus.support === 'ios-needs-install'
              ? t.testReminderIOSHint
              : t.testReminderHint}
          </div>
          <button
            type="button"
            disabled={pushStatus.isBusy || pushStatus.support !== 'supported'}
            onClick={() => void pushStatus.sendTestPush(settings)}
            className="min-h-[40px] px-4 rounded-xl border border-[#E6E3DC] dark:border-[#262926] text-xs font-medium text-[#141413] dark:text-[#F4F3EF] hover:bg-[#FAF9F6] dark:hover:bg-[#1D201D] disabled:opacity-45 transition-colors whitespace-nowrap shrink-0"
          >
            {pushStatus.isBusy ? t.sendingTest : t.sendTestReminder}
          </button>
        </div>

        {pushStatus.error && (
          <p className="text-xs text-[#8A3B2E] dark:text-[#E59B8D] px-1">
            {pushStatus.error}
          </p>
        )}
        {pushStatus.testMessage && (
          <p className="text-xs text-[#2F5E4E] dark:text-[#6E9F8B] px-1">
            {pushStatus.testMessage}
          </p>
        )}
      </section>

      {/* 5. Manual Prayer Time Adjustments */}
      <section className="space-y-3" aria-labelledby="settings-adj-heading">
        <div className="flex items-center justify-between px-1">
          <h2
            id="settings-adj-heading"
            className="text-xs font-medium text-[#5C5B57] dark:text-[#9C9B95]"
          >
            {t.sectionAdjustments}
          </h2>
          {hasAnyAdjustments && (
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({
                  ...settings,
                  adjustments: {...DEFAULT_ADJUSTMENTS},
                })
              }
              className="inline-flex items-center gap-1 text-xs font-medium text-[#2F5E4E] dark:text-[#6E9F8B] hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.resetAll}</span>
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#151715] divide-y divide-[#E6E3DC]/70 dark:divide-[#262926] overflow-hidden">
          {PRAYER_ORDER.map((prayer) => {
            const offset = settings.adjustments[prayer] || 0;
            return (
              <div
                key={prayer}
                className="min-h-[52px] px-4 py-2.5 flex items-center justify-between gap-4"
              >
                <span className="text-sm font-medium">{t.prayers[prayer]}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAdjustPrayer(prayer, -1)}
                    aria-label={`-1m ${t.prayers[prayer]}`}
                    className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl border border-[#E6E3DC] dark:border-[#262926] text-[#141413] dark:text-[#F4F3EF] hover:bg-[#FAF9F6] dark:hover:bg-[#1D201D]"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span
                    dir="ltr"
                    className="w-14 text-center text-xs font-medium tabular-nums text-[#5C5B57] dark:text-[#9C9B95]"
                  >
                    {offset > 0 ? `+${offset}m` : `${offset}m`}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAdjustPrayer(prayer, 1)}
                    aria-label={`+1m ${t.prayers[prayer]}`}
                    className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl border border-[#E6E3DC] dark:border-[#262926] text-[#141413] dark:text-[#F4F3EF] hover:bg-[#FAF9F6] dark:hover:bg-[#1D201D]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Installation, Privacy & About */}
      <section className="space-y-3" aria-labelledby="settings-about-heading">
        <h2
          id="settings-about-heading"
          className="text-xs font-medium text-[#5C5B57] dark:text-[#9C9B95] px-1"
        >
          {t.sectionAboutPrivacy}
        </h2>
        <div className="rounded-2xl border border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#151715] divide-y divide-[#E6E3DC]/70 dark:divide-[#262926] overflow-hidden">
          <div className="px-4 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <NwezhMark className="w-9 h-9 shrink-0" />
              <div>
                <div className="text-sm font-medium">{t.appName}</div>
                <div className="text-xs text-[#5C5B57] dark:text-[#9C9B95]">
                  {t.tagline}
                </div>
              </div>
            </div>
            {installState.isStandalone ? (
              <span className="text-xs text-[#2F5E4E] dark:text-[#6E9F8B] font-medium">
                {t.installedLabel}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => void handleInstallClick()}
                className="min-h-[40px] px-4 rounded-xl bg-[#141413] dark:bg-[#F4F3EF] text-[#FAF9F6] dark:text-[#141413] text-xs font-medium whitespace-nowrap shrink-0"
              >
                {t.installAppBtn}
              </button>
            )}
          </div>

          <div className="px-4 py-4 space-y-1.5">
            <div className="text-sm font-medium">{t.installInstructionsTitle}</div>
            <p className="text-xs text-[#5C5B57] dark:text-[#9C9B95] leading-relaxed">
              {t.installInstructionsDesc}
            </p>
            {!installState.isStandalone && (
              <button
                type="button"
                onClick={onOpenInstallGuide}
                className="text-xs font-medium text-[#2F5E4E] dark:text-[#6E9F8B] hover:underline pt-1"
              >
                {t.openStepGuide}
              </button>
            )}
          </div>

          <div className="px-4 py-4 space-y-1.5">
            <div className="text-sm font-medium">{t.privacyTitle}</div>
            <p className="text-xs text-[#5C5B57] dark:text-[#9C9B95] leading-relaxed">
              {t.privacyDesc}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
