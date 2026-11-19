import React, {useMemo, useState} from 'react';
import {Check, ChevronRight, MapPin, Search} from 'lucide-react';
import {
  CALCULATION_METHODS,
  PRAYER_ORDER,
  type AppLanguage,
  type AsrMethodId,
  type CalculationMethodId,
  type PrayerLocation,
  type PrayerName,
  type PrayerSettings,
} from '../../shared/prayerEngine';
import type {PWAInstallState} from '../hooks/usePWAInstall';
import type {PushStatus} from '../hooks/usePushNotifications';
import {getTranslations, LANGUAGES} from '../i18n/translations';
import {detectDeviceCoordinates} from '../utils/location';
import {CityPickerModal} from './CityPickerModal';
import {NwezhMark} from './NwezhMark';

interface OnboardingFlowProps {
  initialSettings: PrayerSettings;
  installState: PWAInstallState;
  pushStatus: PushStatus;
  onChangeLanguage: (lang: AppLanguage) => void;
  onOpenInstallGuide: () => void;
  onComplete: (finalSettings: PrayerSettings) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  initialSettings,
  installState,
  pushStatus,
  onChangeLanguage,
  onOpenInstallGuide,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [settings, setSettings] = useState<PrayerSettings>(initialSettings);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showCityPicker, setShowCityPicker] = useState(false);

  const t = useMemo(() => getTranslations(settings.language), [settings.language]);

  const handleLanguageChange = (lang: AppLanguage) => {
    setSettings((prev) => ({...prev, language: lang}));
    onChangeLanguage(lang);
  };

  const handleAutoDetect = async () => {
    setLocationError(null);
    setIsDetecting(true);
    try {
      const result = await detectDeviceCoordinates();
      setSettings((prev) => ({
        ...prev,
        location: result.location,
        method: result.suggestedMethod,
      }));
      setLocationConfirmed(true);
      setStep(2);
    } catch (err) {
      setLocationError(
        err instanceof Error
          ? err.message
          : 'Could not detect location. Please select a city.'
      );
    } finally {
      setIsDetecting(false);
    }
  };

  const handleManualLocation = (
    location: PrayerLocation,
    suggestedMethod?: CalculationMethodId
  ) => {
    setSettings((prev) => ({
      ...prev,
      location,
      method: suggestedMethod || prev.method,
    }));
    setLocationConfirmed(true);
    setLocationError(null);
    setStep(2);
  };

  const togglePrayerNotification = (prayer: PrayerName) => {
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

  const handleFinish = async (enableReminders: boolean) => {
    const nextSettings: PrayerSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        enabled: enableReminders,
      },
    };

    if (enableReminders && pushStatus.support === 'supported') {
      const granted = await pushStatus.enableAndSubscribe(nextSettings);
      nextSettings.notifications.enabled = granted;
    }

    onComplete(nextSettings);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0D0E0D] text-[#141413] dark:text-[#F4F3EF] flex flex-col pt-safe pb-safe">
      <header className="w-full max-w-xl mx-auto px-6 pt-6 pb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <NwezhMark className="w-7 h-7" />
          <span className="font-display text-base font-semibold tracking-tight">
            {t.appName}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <select
            aria-label={t.languageLabel}
            value={settings.language}
            onChange={(e) => handleLanguageChange(e.target.value as AppLanguage)}
            className="min-h-[36px] rounded-lg border border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#151715] px-2.5 text-xs text-[#141413] dark:text-[#F4F3EF] focus:outline-none focus:border-[#2F5E4E]"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nativeName}
              </option>
            ))}
          </select>
          <span className="text-xs text-[#5C5B57] dark:text-[#9C9B95] tabular-nums whitespace-nowrap">
            {t.stepOf(step, 4)}
          </span>
        </div>
      </header>

      <div className="w-full max-w-xl mx-auto px-6">
        <div className="h-[2px] w-full bg-[#E6E3DC] dark:bg-[#262926] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2F5E4E] dark:bg-[#6E9F8B] transition-all duration-300"
            style={{width: `${(step / 4) * 100}%`}}
          />
        </div>
      </div>

      <main className="flex-1 w-full max-w-xl mx-auto px-6 py-8 flex flex-col justify-between">
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
                {t.wherePraying}
              </h1>
              <p className="text-sm text-[#5C5B57] dark:text-[#9C9B95] leading-relaxed">
                {t.wherePrayingDesc}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleAutoDetect}
                disabled={isDetecting}
                className="w-full min-h-[52px] px-4 rounded-xl bg-[#141413] dark:bg-[#F4F3EF] text-[#FAF9F6] dark:text-[#141413] text-sm font-medium flex items-center justify-center gap-2.5 transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                <MapPin className="w-4 h-4 shrink-0" />
                <span>
                  {isDetecting ? t.detectingLocation : t.useCurrentLocation}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowCityPicker(true)}
                className="w-full min-h-[52px] px-4 rounded-xl border border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#151715] text-sm font-medium flex items-center justify-center gap-2.5 hover:bg-[#F2F0EB]/60 dark:hover:bg-[#1D201D] transition-colors"
              >
                <Search className="w-4 h-4 shrink-0 text-[#5C5B57] dark:text-[#9C9B95]" />
                <span>{t.selectCityManually}</span>
              </button>

              {locationError && (
                <p className="text-xs text-[#8A3B2E] dark:text-[#E59B8D] pt-1">
                  {locationError}
                </p>
              )}

              {locationConfirmed && (
                <p className="text-xs text-[#2F5E4E] dark:text-[#6E9F8B] pt-1">
                  {settings.location.name}
                  {settings.location.country ? `, ${settings.location.country}` : ''}
                </p>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
                {t.calcMethodTitle}
              </h1>
              <p className="text-sm text-[#5C5B57] dark:text-[#9C9B95] leading-relaxed">
                {t.calcMethodDesc(settings.location.name)}
              </p>
            </div>

            <div className="divide-y divide-[#E6E3DC] dark:divide-[#262926] border border-[#E6E3DC] dark:border-[#262926] rounded-2xl bg-white dark:bg-[#151715] overflow-hidden max-h-[52vh] overflow-y-auto">
              {CALCULATION_METHODS.map((m) => {
                const selected = settings.method === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSettings((prev) => ({...prev, method: m.id}))}
                    className={`w-full px-4 py-3.5 text-start flex items-center justify-between gap-4 transition-colors ${
                      selected
                        ? 'bg-[#EDF3F0] dark:bg-[#1A2520]'
                        : 'hover:bg-[#FAF9F6] dark:hover:bg-[#1D201D]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#141413] dark:text-[#F4F3EF]">
                        {m.name}
                      </div>
                      <div className="text-xs text-[#5C5B57] dark:text-[#9C9B95] mt-0.5">
                        {m.region} · {m.angles}
                      </div>
                    </div>
                    {selected && (
                      <Check className="w-4 h-4 text-[#2F5E4E] dark:text-[#6E9F8B] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
                {t.asrCalcTitle}
              </h1>
              <p className="text-sm text-[#5C5B57] dark:text-[#9C9B95] leading-relaxed">
                {t.asrCalcDesc}
              </p>
            </div>

            <div className="space-y-3">
              {(
                [
                  {
                    id: 'Shafi' as AsrMethodId,
                    title: t.asrStandardTitle,
                    desc: t.asrStandardDesc,
                  },
                  {
                    id: 'Hanafi' as AsrMethodId,
                    title: t.asrHanafiTitle,
                    desc: t.asrHanafiDesc,
                  },
                ] as const
              ).map((option) => {
                const selected = settings.asrMethod === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({...prev, asrMethod: option.id}))
                    }
                    className={`w-full p-4 rounded-2xl border text-start flex items-start justify-between gap-4 transition-colors ${
                      selected
                        ? 'border-[#2F5E4E] dark:border-[#6E9F8B] bg-[#EDF3F0] dark:bg-[#1A2520]'
                        : 'border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#151715] hover:bg-[#F2F0EB]/60 dark:hover:bg-[#1D201D]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-[#141413] dark:text-[#F4F3EF]">
                        {option.title}
                      </div>
                      <p className="text-xs text-[#5C5B57] dark:text-[#9C9B95] leading-relaxed">
                        {option.desc}
                      </p>
                    </div>
                    {selected && (
                      <Check className="w-4 h-4 text-[#2F5E4E] dark:text-[#6E9F8B] shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
                {t.remindersTitle}
              </h1>
              <p className="text-sm text-[#5C5B57] dark:text-[#9C9B95] leading-relaxed">
                {t.remindersDesc}
              </p>
            </div>

            {pushStatus.support === 'ios-needs-install' && (
              <div className="rounded-2xl border border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#151715] p-4 space-y-2">
                <p className="text-xs font-medium text-[#141413] dark:text-[#F4F3EF]">
                  {t.iosHomeRequiredTitle}
                </p>
                <p className="text-xs text-[#5C5B57] dark:text-[#9C9B95] leading-relaxed">
                  {t.iosHomeRequiredDesc}
                </p>
                {!installState.isStandalone && (
                  <button
                    type="button"
                    onClick={onOpenInstallGuide}
                    className="text-xs font-medium text-[#2F5E4E] dark:text-[#6E9F8B] hover:underline pt-1"
                  >
                    {t.viewInstallSteps}
                  </button>
                )}
              </div>
            )}

            <div className="divide-y divide-[#E6E3DC] dark:divide-[#262926] border border-[#E6E3DC] dark:border-[#262926] rounded-2xl bg-white dark:bg-[#151715] overflow-hidden">
              {PRAYER_ORDER.map((prayer) => {
                const enabled = settings.notifications.prayers[prayer];
                return (
                  <button
                    key={prayer}
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    onClick={() => togglePrayerNotification(prayer)}
                    className="w-full min-h-[52px] px-4 py-3 flex items-center justify-between text-start hover:bg-[#FAF9F6] dark:hover:bg-[#1D201D] transition-colors"
                  >
                    <span className="text-sm font-medium">
                      {t.prayers[prayer]}
                    </span>
                    <span
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center ${
                        enabled
                          ? 'bg-[#2F5E4E] dark:bg-[#6E9F8B] justify-end'
                          : 'bg-[#E6E3DC] dark:bg-[#262926] justify-start'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-white dark:bg-[#0D0E0D]" />
                    </span>
                  </button>
                );
              })}
            </div>

            {pushStatus.error && (
              <p className="text-xs text-[#8A3B2E] dark:text-[#E59B8D]">
                {pushStatus.error}
              </p>
            )}
          </div>
        )}

        <div className="pt-8 flex items-center justify-between gap-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
              className="min-h-[44px] px-4 rounded-xl text-sm font-medium text-[#5C5B57] dark:text-[#9C9B95] hover:text-[#141413] dark:hover:text-[#F4F3EF] transition-colors"
            >
              {t.back}
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3 | 4)}
              className="min-h-[44px] px-6 rounded-xl bg-[#141413] dark:bg-[#F4F3EF] text-[#FAF9F6] dark:text-[#141413] text-sm font-medium flex items-center gap-1.5 transition-opacity hover:opacity-90"
            >
              <span>{t.continueBtn}</span>
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void handleFinish(false)}
                className="min-h-[44px] px-4 rounded-xl text-sm font-medium text-[#5C5B57] dark:text-[#9C9B95] hover:text-[#141413] dark:hover:text-[#F4F3EF]"
              >
                {t.skipForNow}
              </button>
              <button
                type="button"
                disabled={pushStatus.isBusy}
                onClick={() =>
                  void handleFinish(pushStatus.support === 'supported')
                }
                className="min-h-[44px] px-6 rounded-xl bg-[#2F5E4E] dark:bg-[#6E9F8B] text-[#FAF9F6] dark:text-[#0D0E0D] text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {pushStatus.isBusy
                  ? t.enabling
                  : pushStatus.support === 'supported'
                    ? t.enableAndFinish
                    : t.finishSetup}
              </button>
            </div>
          )}
        </div>
      </main>

      <CityPickerModal
        open={showCityPicker}
        language={settings.language}
        onClose={() => setShowCityPicker(false)}
        onSelectLocation={handleManualLocation}
      />
    </div>
  );
};
