import React, {useEffect, useMemo, useState} from 'react';
import {
  getGregorianDateLabel,
  getHijriDateLabel,
  getNextPrayerInfo,
  suggestMethodForLocation,
  type AppLanguage,
  type PrayerSettings,
} from '../../shared/prayerEngine';
import {WORLD_CITIES} from '../data/cities';
import type {PWAInstallState} from '../hooks/usePWAInstall';
import {getLanguageMeta, getTranslations, LANGUAGES} from '../i18n/translations';
import {NwezhMark} from './NwezhMark';

interface LandingPageProps {
  language: AppLanguage;
  onChangeLanguage: (lang: AppLanguage) => void;
  installState: PWAInstallState;
  onOpenInstallGuide: () => void;
  onEnterWebApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  language,
  onChangeLanguage,
  installState,
  onOpenInstallGuide,
  onEnterWebApp,
}) => {
  const [now, setNow] = useState(() => new Date());
  const t = useMemo(() => getTranslations(language), [language]);
  const langMeta = useMemo(() => getLanguageMeta(language), [language]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const previewSettings = useMemo<PrayerSettings>(() => {
    const tz =
      typeof Intl !== 'undefined'
        ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/London'
        : 'Europe/London';
    const matched =
      WORLD_CITIES.find((c) => c.timezone === tz) ||
      WORLD_CITIES.find((c) => c.name === 'London')!;
    return {
      location: {
        name: matched.name,
        country: matched.country,
        lat: matched.lat,
        lng: matched.lng,
        timezone: matched.timezone,
        source: 'manual',
      },
      method: suggestMethodForLocation(
        matched.lat,
        matched.lng,
        matched.countryCode
      ),
      asrMethod: 'Shafi',
      highLatitudeRule: 'Auto',
      adjustments: {
        fajr: 0,
        sunrise: 0,
        dhuhr: 0,
        asr: 0,
        maghrib: 0,
        isha: 0,
      },
      timeFormat: '12h',
      language,
      notifications: {
        enabled: true,
        prayers: {
          fajr: true,
          sunrise: false,
          dhuhr: true,
          asr: true,
          maghrib: true,
          isha: true,
        },
        sound: 'makkah',
      },
      theme: 'system',
    };
  }, [language]);

  const previewInfo = useMemo(
    () => getNextPrayerInfo(now, previewSettings),
    [now, previewSettings]
  );

  const hijriLabel = useMemo(
    () =>
      getHijriDateLabel(
        now,
        previewSettings.location.timezone,
        langMeta.localeTag
      ),
    [now, previewSettings.location.timezone, langMeta.localeTag]
  );

  const gregorianLabel = useMemo(
    () =>
      getGregorianDateLabel(
        now,
        previewSettings.location.timezone,
        langMeta.localeTag
      ),
    [now, previewSettings.location.timezone, langMeta.localeTag]
  );

  const handleInstallClick = async () => {
    if (installState.canNativeInstall) {
      const outcome = await installState.promptInstall();
      if (outcome === 'accepted') {
        onEnterWebApp();
      }
      return;
    }
    onOpenInstallGuide();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] dark:bg-[#0D0E0D] text-[#141413] dark:text-[#F4F3EF] pt-safe pb-safe">
      {/* Minimal Top Bar */}
      <header className="w-full max-w-5xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <NwezhMark className="w-7 h-7" />
          <span className="font-display text-base font-semibold tracking-tight">
            {t.appName}
          </span>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <select
            aria-label="Language"
            value={language}
            onChange={(e) => onChangeLanguage(e.target.value as AppLanguage)}
            className="min-h-[38px] rounded-lg border border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#151715] px-2.5 text-xs text-[#141413] dark:text-[#F4F3EF] focus:outline-none focus:border-[#2F5E4E]"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nativeName}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onEnterWebApp}
            className="text-sm font-medium text-[#5C5B57] dark:text-[#9C9B95] hover:text-[#141413] dark:hover:text-[#F4F3EF] transition-colors whitespace-nowrap shrink-0 min-h-[44px] px-1"
          >
            {t.openInBrowser}
          </button>
        </div>
      </header>

      {/* Main Hero */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-8 lg:py-16 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3">
                <NwezhMark className="w-12 h-12" />
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-[#141413] dark:text-[#F4F3EF] leading-[1.12] text-balance">
                {t.tagline}
              </h1>
              <p className="text-base sm:text-lg text-[#5C5B57] dark:text-[#9C9B95] leading-relaxed max-w-md">
                {t.landingDesc}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="min-h-[48px] px-7 rounded-xl bg-[#141413] dark:bg-[#F4F3EF] text-[#FAF9F6] dark:text-[#141413] text-sm font-medium tracking-tight transition-opacity hover:opacity-90 active:scale-[0.99] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#2F5E4E]"
                >
                  {t.installNwezh}
                </button>
              </div>

              <p className="text-xs text-[#5C5B57] dark:text-[#9C9B95] leading-relaxed max-w-sm">
                {installState.canNativeInstall
                  ? t.installNoteNative
                  : installState.isIOS
                    ? t.installNoteIOS
                    : t.installNoteOther}
              </p>
            </div>
          </div>

          {/* Right Column: Minimal Live App Preview */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div
              className="w-full max-w-[360px] rounded-[28px] border border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#151715] p-6"
              aria-label="Live preview of the Nwezh prayer schedule"
            >
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#E6E3DC]/70 dark:border-[#262926]">
                <div>
                  <div className="text-xs text-[#5C5B57] dark:text-[#9C9B95]">
                    {previewSettings.location.name}
                  </div>
                  <div className="mt-1 text-sm font-medium text-[#141413] dark:text-[#F4F3EF]">
                    {hijriLabel}
                  </div>
                  <div className="text-xs text-[#5C5B57] dark:text-[#9C9B95]">
                    {gregorianLabel}
                  </div>
                </div>
                <NwezhMark
                  variant="monochrome"
                  className="w-6 h-6 text-[#141413] dark:text-[#F4F3EF] shrink-0"
                />
              </div>

              <div className="py-5 border-b border-[#E6E3DC]/70 dark:border-[#262926]">
                <div className="text-xs text-[#2F5E4E] dark:text-[#6E9F8B] font-medium">
                  {t.nextPrayer}
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-4">
                  <span className="font-display text-2xl font-semibold tracking-tight">
                    {t.prayers[previewInfo.nextPrayer.id]}
                  </span>
                  <span className="text-lg font-medium tabular-nums">
                    {previewInfo.nextPrayer.formattedTime}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-[#5C5B57] dark:text-[#9C9B95]">
                  <span>{t.remaining}</span>
                  <span className="tabular-nums font-medium text-[#141413] dark:text-[#F4F3EF]">
                    {previewInfo.countdownFormatted}
                  </span>
                </div>
                <div className="mt-3 h-[2px] w-full bg-[#E6E3DC] dark:bg-[#262926] overflow-hidden rounded-full">
                  <div
                    className="h-full bg-[#2F5E4E] dark:bg-[#6E9F8B] transition-all duration-500"
                    style={{width: `${Math.round(previewInfo.progressRatio * 100)}%`}}
                  />
                </div>
              </div>

              <div className="pt-3 divide-y divide-[#E6E3DC]/50 dark:divide-[#262926]/60">
                {previewInfo.todayRows.map((row) => {
                  const isNext = row.status === 'next';
                  const isPassed = row.status === 'passed';
                  return (
                    <div
                      key={row.id}
                      className={`py-2.5 flex items-center justify-between text-sm ${
                        isNext
                          ? 'text-[#2F5E4E] dark:text-[#9EC2B2] font-medium'
                          : isPassed
                            ? 'text-[#5C5B57]/60 dark:text-[#9C9B95]/55'
                            : 'text-[#141413] dark:text-[#F4F3EF]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span>{t.prayers[row.id]}</span>
                        {isNext && (
                          <span className="text-[11px] font-normal text-[#2F5E4E] dark:text-[#6E9F8B]">
                            {t.statusNext}
                          </span>
                        )}
                      </div>
                      <span className="tabular-nums">{row.formattedTime}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-5xl mx-auto px-6 py-6 border-t border-[#E6E3DC]/70 dark:border-[#262926] flex flex-wrap items-center justify-between gap-4 text-xs text-[#5C5B57] dark:text-[#9C9B95]">
        <span>{t.footerPrivacy}</span>
        <button
          type="button"
          onClick={onOpenInstallGuide}
          className="hover:text-[#141413] dark:hover:text-[#F4F3EF] transition-colors"
        >
          {t.howToInstallIOS}
        </button>
      </footer>
    </div>
  );
};
