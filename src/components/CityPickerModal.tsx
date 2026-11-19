import React, {useEffect, useMemo, useState} from 'react';
import {MapPin, Search, X} from 'lucide-react';
import {
  suggestMethodForLocation,
  type AppLanguage,
  type CalculationMethodId,
  type PrayerLocation,
} from '../../shared/prayerEngine';
import {WORLD_CITIES, type CityEntry} from '../data/cities';
import {getTranslations} from '../i18n/translations';
import {detectDeviceCoordinates} from '../utils/location';

interface CityPickerModalProps {
  open: boolean;
  language: AppLanguage;
  onClose: () => void;
  onSelectLocation: (
    location: PrayerLocation,
    suggestedMethod?: CalculationMethodId
  ) => void;
}

interface RemoteCityResult {
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
}

export const CityPickerModal: React.FC<CityPickerModalProps> = ({
  open,
  language,
  onClose,
  onSelectLocation,
}) => {
  const [query, setQuery] = useState('');
  const [remoteResults, setRemoteResults] = useState<RemoteCityResult[]>([]);
  const [isSearchingRemote, setIsSearchingRemote] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);
  const t = useMemo(() => getTranslations(language), [language]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setRemoteResults([]);
      setDetectError(null);
    }
  }, [open]);

  const localMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return WORLD_CITIES.slice(0, 24);
    return WORLD_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
    ).slice(0, 24);
  }, [query]);

  useEffect(() => {
    const q = query.trim();
    if (!open || q.length < 3 || localMatches.length >= 4 || !navigator.onLine) {
      setRemoteResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearchingRemote(true);
      try {
        const res = await fetch(`/api/cities?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = (await res.json()) as {results?: RemoteCityResult[]};
          setRemoteResults(data.results || []);
        }
      } catch {
        // ignore
      } finally {
        setIsSearchingRemote(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, open, localMatches.length]);

  if (!open) return null;

  const handleUseCurrentLocation = async () => {
    setDetectError(null);
    setIsDetecting(true);
    try {
      const result = await detectDeviceCoordinates();
      onSelectLocation(result.location, result.suggestedMethod);
      onClose();
    } catch (err) {
      setDetectError(
        err instanceof Error
          ? err.message
          : 'Unable to detect your location.'
      );
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSelectCity = (city: CityEntry) => {
    onSelectLocation(
      {
        name: city.name,
        country: city.country,
        lat: city.lat,
        lng: city.lng,
        timezone: city.timezone,
        source: 'manual',
      },
      suggestMethodForLocation(city.lat, city.lng, city.countryCode)
    );
    onClose();
  };

  const handleSelectRemote = (city: RemoteCityResult) => {
    const guessedTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    onSelectLocation(
      {
        name: city.name,
        country: city.country,
        lat: city.lat,
        lng: city.lng,
        timezone: guessedTz,
        source: 'manual',
      },
      suggestMethodForLocation(city.lat, city.lng, city.countryCode)
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="city-picker-title"
    >
      <div className="w-full sm:max-w-lg bg-[#FAF9F6] dark:bg-[#151715] border-t sm:border border-[#E6E3DC] dark:border-[#262926] rounded-t-3xl sm:rounded-2xl flex flex-col max-h-[88vh] pb-safe">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#E6E3DC] dark:border-[#262926]">
          <h2
            id="city-picker-title"
            className="font-display text-lg font-semibold tracking-tight text-[#141413] dark:text-[#F4F3EF]"
          >
            {t.selectLocation}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.dismiss}
            className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-xl text-[#5C5B57] hover:text-[#141413] dark:text-[#9C9B95] dark:hover:text-[#F4F3EF]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3 border-b border-[#E6E3DC] dark:border-[#262926]">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isDetecting}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl border border-[#2F5E4E]/30 dark:border-[#6E9F8B]/30 bg-[#EDF3F0] dark:bg-[#1A2520] text-[#2F5E4E] dark:text-[#9EC2B2] text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <MapPin className="w-4 h-4 shrink-0" />
            <span>
              {isDetecting ? t.detectingLocation : t.useCurrentLocation}
            </span>
          </button>

          {detectError && (
            <p className="text-xs text-[#8A3B2E] dark:text-[#E59B8D]">
              {detectError}
            </p>
          )}

          <div className="relative">
            <Search className="w-4 h-4 text-[#5C5B57] dark:text-[#9C9B95] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchCityPlaceholder}
              aria-label={t.searchCityPlaceholder}
              className="w-full min-h-[44px] ps-10 pe-4 rounded-xl border border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#1D201D] text-sm text-[#141413] dark:text-[#F4F3EF] placeholder:text-[#5C5B57]/70 dark:placeholder:text-[#9C9B95]/70 focus:outline-none focus:border-[#2F5E4E] dark:focus:border-[#6E9F8B]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#E6E3DC]/70 dark:divide-[#262926]/70 px-5">
          {localMatches.map((city) => (
            <button
              key={`${city.name}-${city.countryCode}`}
              type="button"
              onClick={() => handleSelectCity(city)}
              className="w-full min-h-[52px] py-3 flex items-center justify-between text-start hover:bg-[#F2F0EB]/60 dark:hover:bg-[#1D201D]/60 -mx-2 px-2 rounded-lg transition-colors"
            >
              <div>
                <div className="text-sm font-medium text-[#141413] dark:text-[#F4F3EF]">
                  {city.name}
                </div>
                <div className="text-xs text-[#5C5B57] dark:text-[#9C9B95]">
                  {city.country}
                </div>
              </div>
              <span className="text-xs text-[#5C5B57] dark:text-[#9C9B95] tabular-nums">
                {city.timezone.split('/').pop()?.replace(/_/g, ' ')}
              </span>
            </button>
          ))}

          {isSearchingRemote && (
            <div className="py-4 text-xs text-[#5C5B57] dark:text-[#9C9B95]">
              …
            </div>
          )}

          {!isSearchingRemote &&
            remoteResults.map((city, idx) => (
              <button
                key={`${city.name}-${city.lat}-${idx}`}
                type="button"
                onClick={() => handleSelectRemote(city)}
                className="w-full min-h-[52px] py-3 flex items-center justify-between text-start hover:bg-[#F2F0EB]/60 dark:hover:bg-[#1D201D]/60 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div>
                  <div className="text-sm font-medium text-[#141413] dark:text-[#F4F3EF]">
                    {city.name}
                  </div>
                  <div className="text-xs text-[#5C5B57] dark:text-[#9C9B95]">
                    {city.country}
                  </div>
                </div>
                <span className="text-xs text-[#5C5B57] dark:text-[#9C9B95] tabular-nums">
                  {city.lat.toFixed(1)}°, {city.lng.toFixed(1)}°
                </span>
              </button>
            ))}

          {localMatches.length === 0 &&
            remoteResults.length === 0 &&
            !isSearchingRemote && (
              <div className="py-10 text-center text-sm text-[#5C5B57] dark:text-[#9C9B95]">
                {t.noCitiesFound}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
