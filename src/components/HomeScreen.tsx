import React, {useMemo, useState} from 'react';
import {Bell, BellOff, ChevronDown, MapPin} from 'lucide-react';
import {
  CALCULATION_METHODS,
  getGregorianDateLabel,
  getHijriDateLabel,
  getNextPrayerInfo,
  type PrayerName,
  type PrayerSettings,
} from '../../shared/prayerEngine';
import {getLanguageMeta, getTranslations} from '../i18n/translations';

interface HomeScreenProps {
  now: Date;
  settings: PrayerSettings;
  onOpenCityPicker: () => void;
  onTogglePrayerNotification: (prayer: PrayerName) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  now,
  settings,
  onOpenCityPicker,
  onTogglePrayerNotification,
}) => {
  const [dayView, setDayView] = useState<'today' | 'tomorrow'>('today');

  const t = useMemo(() => getTranslations(settings.language), [settings.language]);
  const langMeta = useMemo(
    () => getLanguageMeta(settings.language),
    [settings.language]
  );

  const summary = useMemo(
    () => getNextPrayerInfo(now, settings),
    [now, settings]
  );

  const displayDate = useMemo(() => {
    if (dayView === 'tomorrow') {
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
    return now;
  }, [dayView, now]);

  const hijriDate = useMemo(
    () =>
      getHijriDateLabel(
        displayDate,
        settings.location.timezone,
        langMeta.localeTag
      ),
    [displayDate, settings.location.timezone, langMeta.localeTag]
  );

  const gregorianDate = useMemo(
    () =>
      getGregorianDateLabel(
        displayDate,
        settings.location.timezone,
        langMeta.localeTag
      ),
    [displayDate, settings.location.timezone, langMeta.localeTag]
  );

  const methodMeta = useMemo(
    () => CALCULATION_METHODS.find((m) => m.id === settings.method),
    [settings.method]
  );

  const displayedRows =
    dayView === 'today'
      ? summary.todayRows
      : summary.tomorrowSchedule.entries.map((entry) => ({
          ...entry,
          status: 'upcoming' as const,
        }));

  return (
    <div className="w-full max-w-5xl mx-auto px-5 sm:px-6 pt-4 sm:pt-8 pb-28 lg:pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column */}
        <section
          aria-label={t.nextPrayer}
          className="lg:col-span-5 space-y-6"
        >
          <div className="space-y-3">
            <button
              type="button"
              onClick={onOpenCityPicker}
              className="inline-flex items-center gap-2 min-h-[44px] -ms-2 px-2 rounded-xl text-start hover:bg-[#F2F0EB] dark:hover:bg-[#151715] transition-colors focus-visible:outline-2 focus-visible:outline-[#2F5E4E]"
            >
              <MapPin className="w-4 h-4 text-[#2F5E4E] dark:text-[#6E9F8B] shrink-0" />
              <span className="text-sm font-medium text-[#141413] dark:text-[#F4F3EF]">
                {settings.location.name}
                {settings.location.country ? `, ${settings.location.country}` : ''}
              </span>
              <ChevronDown className="w-4 h-4 text-[#5C5B57] dark:text-[#9C9B95] shrink-0" />
            </button>

            <div className="space-y-0.5">
              <p className="font-display text-lg sm:text-xl font-medium tracking-tight text-[#141413] dark:text-[#F4F3EF]">
                {hijriDate}
              </p>
              <p className="text-sm text-[#5C5B57] dark:text-[#9C9B95]">
                {gregorianDate}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#151715] p-6 sm:p-7 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#2F5E4E] dark:text-[#6E9F8B]">
                  {summary.nextPrayer.isTomorrow
                    ? t.nextPrayerTomorrow
                    : t.nextPrayer}
                </p>
                <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#141413] dark:text-[#F4F3EF]">
                  {t.prayers[summary.nextPrayer.id]}
                </h1>
              </div>
              <div className="text-end pt-1">
                <span
                  dir="ltr"
                  className="font-display text-2xl sm:text-3xl font-medium tracking-tight tabular-nums text-[#141413] dark:text-[#F4F3EF]"
                >
                  {summary.nextPrayer.formattedTime}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-[#E6E3DC]/70 dark:border-[#262926]">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-xs text-[#5C5B57] dark:text-[#9C9B95]">
                  {t.remaining}
                </span>
                <span
                  dir="ltr"
                  className="font-display text-2xl font-medium tracking-tight tabular-nums text-[#141413] dark:text-[#F4F3EF]"
                >
                  {summary.countdownFormatted}
                </span>
              </div>

              <div
                className="h-[3px] w-full bg-[#F2F0EB] dark:bg-[#262926] rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={Math.round(summary.progressRatio * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t.remaining}
              >
                <div
                  className="h-full bg-[#2F5E4E] dark:bg-[#6E9F8B] transition-all duration-700"
                  style={{width: `${Math.round(summary.progressRatio * 100)}%`}}
                />
              </div>

              {summary.currentRelevantPrayer && (
                <p className="text-xs text-[#5C5B57] dark:text-[#9C9B95]">
                  {t.currentWindow}:{' '}
                  <span className="font-medium text-[#141413] dark:text-[#F4F3EF]">
                    {t.prayers[summary.currentRelevantPrayer]}
                  </span>
                </p>
              )}
            </div>
          </div>

          <p className="text-xs text-[#5C5B57] dark:text-[#9C9B95] leading-relaxed">
            {methodMeta?.name || settings.method} ·{' '}
            {settings.asrMethod === 'Shafi' ? t.standardLabel : t.hanafiLabel}
          </p>
        </section>

        {/* Right Column */}
        <section
          aria-label={t.prayerSchedule}
          className="lg:col-span-7 space-y-4"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-base font-semibold tracking-tight text-[#141413] dark:text-[#F4F3EF]">
              {t.prayerSchedule}
            </h2>

            <div
              className="inline-flex items-center p-1 rounded-xl bg-[#F2F0EB] dark:bg-[#151715] border border-[#E6E3DC]/70 dark:border-[#262926]"
              role="tablist"
              aria-label={t.prayerSchedule}
            >
              <button
                type="button"
                role="tab"
                aria-selected={dayView === 'today'}
                onClick={() => setDayView('today')}
                className={`min-h-[36px] px-3.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  dayView === 'today'
                    ? 'bg-white dark:bg-[#262926] text-[#141413] dark:text-[#F4F3EF]'
                    : 'text-[#5C5B57] dark:text-[#9C9B95] hover:text-[#141413] dark:hover:text-[#F4F3EF]'
                }`}
              >
                {t.today}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={dayView === 'tomorrow'}
                onClick={() => setDayView('tomorrow')}
                className={`min-h-[36px] px-3.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  dayView === 'tomorrow'
                    ? 'bg-white dark:bg-[#262926] text-[#141413] dark:text-[#F4F3EF]'
                    : 'text-[#5C5B57] dark:text-[#9C9B95] hover:text-[#141413] dark:hover:text-[#F4F3EF]'
                }`}
              >
                {t.tomorrow}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#151715] divide-y divide-[#E6E3DC]/70 dark:divide-[#262926] overflow-hidden">
            {displayedRows.map((row) => {
              const isNext = row.status === 'next';
              const isCurrent = row.status === 'current';
              const isPassed = row.status === 'passed';
              const notifyEnabled =
                settings.notifications.enabled &&
                settings.notifications.prayers[row.id];

              const statusText =
                row.status === 'next'
                  ? t.statusNext
                  : row.status === 'current'
                    ? t.statusCurrent
                    : row.status === 'passed'
                      ? t.statusPassed
                      : t.statusUpcoming;

              return (
                <div
                  key={row.id}
                  className={`px-5 py-3.5 min-h-[64px] flex items-center justify-between gap-4 transition-colors ${
                    isNext ? 'bg-[#EDF3F0]/80 dark:bg-[#1A2520]' : ''
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-3.5">
                    <div className="min-w-[88px]">
                      <div
                        className={`text-base font-medium ${
                          isNext
                            ? 'text-[#2F5E4E] dark:text-[#9EC2B2]'
                            : isPassed
                              ? 'text-[#5C5B57]/65 dark:text-[#9C9B95]/55'
                              : 'text-[#141413] dark:text-[#F4F3EF]'
                        }`}
                      >
                        {t.prayers[row.id]}
                      </div>
                      <div
                        className={`text-xs ${
                          isNext
                            ? 'text-[#2F5E4E] dark:text-[#6E9F8B]'
                            : isCurrent
                              ? 'text-[#141413] dark:text-[#F4F3EF]'
                              : 'text-[#5C5B57]/75 dark:text-[#9C9B95]/75'
                        }`}
                      >
                        {statusText}
                        {row.adjustmentMinutes !== 0
                          ? ` · ${row.adjustmentMinutes > 0 ? `+${row.adjustmentMinutes}` : row.adjustmentMinutes}m`
                          : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      dir="ltr"
                      className={`text-base sm:text-lg tabular-nums font-medium ${
                        isNext
                          ? 'text-[#2F5E4E] dark:text-[#9EC2B2]'
                          : isPassed
                            ? 'text-[#5C5B57]/65 dark:text-[#9C9B95]/55'
                            : 'text-[#141413] dark:text-[#F4F3EF]'
                      }`}
                    >
                      {row.formattedTime}
                    </span>

                    <button
                      type="button"
                      onClick={() => onTogglePrayerNotification(row.id)}
                      aria-label={t.prayers[row.id]}
                      aria-pressed={notifyEnabled}
                      className={`min-w-[44px] min-h-[44px] -me-2 flex items-center justify-center rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-[#2F5E4E] ${
                        notifyEnabled
                          ? 'text-[#2F5E4E] dark:text-[#9EC2B2] hover:bg-[#2F5E4E]/10'
                          : 'text-[#5C5B57]/45 dark:text-[#9C9B95]/45 hover:text-[#5C5B57] dark:hover:text-[#9C9B95]'
                      }`}
                    >
                      {notifyEnabled ? (
                        <Bell className="w-4 h-4" />
                      ) : (
                        <BellOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
