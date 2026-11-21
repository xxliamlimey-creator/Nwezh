import {
  computeDaySchedule,
  DEFAULT_ADJUSTMENTS,
  DEFAULT_ENABLED_PRAYERS,
  getDateKeyInZone,
  suggestMethodForLocation,
  type AppLanguage,
  type PrayerName,
  type PrayerSettings,
} from '../../shared/prayerEngine';
import {findNearestCity, WORLD_CITIES, type CityEntry} from '../data/cities';

const SETTINGS_KEY = 'nwezh.settings.v1';
const ONBOARDED_KEY = 'nwezh.onboarded.v1';
const PREVIEW_WEB_APP_KEY = 'nwezh.web_entered.v1';
const CACHE_KEY = 'nwezh.schedule_cache.v1';

const TIMEZONE_ALIASES: Record<string, string> = {
  'Asia/Calcutta': 'Asia/Kolkata',
  'Asia/Arbil': 'Asia/Baghdad',
  'Europe/Kiev': 'Europe/Kyiv',
  'Asia/Saigon': 'Asia/Ho_Chi_Minh',
  'Asia/Rangoon': 'Asia/Yangon',
  'US/Eastern': 'America/New_York',
  'US/Central': 'America/Chicago',
  'US/Pacific': 'America/Los_Angeles',
  'US/Mountain': 'America/Denver',
  'GMT': 'Europe/London',
};

function findCityForTimezone(tz: string): CityEntry | undefined {
  const canonical = TIMEZONE_ALIASES[tz] || tz;
  return (
    WORLD_CITIES.find((c) => c.timezone === canonical) ||
    WORLD_CITIES.find((c) => c.timezone === tz)
  );
}

function isValidTimeZone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, {timeZone: tz});
    return true;
  } catch {
    return false;
  }
}

export interface CachedScheduleMap {
  signature: string;
  days: Record<
    string,
    Array<{
      id: PrayerName;
      iso: string;
    }>
  >;
}

function detectInitialLanguage(): AppLanguage {
  if (typeof navigator === 'undefined') return 'en';
  const lang = (navigator.language || 'en').toLowerCase();
  if (lang.startsWith('ckb')) return 'ckb';
  if (lang.startsWith('ku')) return 'ku-latn';
  if (lang.startsWith('ar')) return 'ar';
  if (lang.startsWith('tr')) return 'tr';
  if (lang.startsWith('ur')) return 'ur';
  if (lang.startsWith('fr')) return 'fr';
  if (lang.startsWith('id')) return 'id';
  return 'en';
}

export function getDefaultSettings(): PrayerSettings {
  const detectedTz =
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/London'
      : 'Europe/London';

  const matched =
    findCityForTimezone(detectedTz) ||
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
    adjustments: {...DEFAULT_ADJUSTMENTS},
    timeFormat: '12h',
    language: detectInitialLanguage(),
    notifications: {
      enabled: false,
      prayers: {...DEFAULT_ENABLED_PRAYERS},
      sound: 'makkah',
    },
    theme: 'system',
  };
}

export function loadSettings(): PrayerSettings {
  const defaults = getDefaultSettings();
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<PrayerSettings>;
    const mergedLocation = {
      ...defaults.location,
      ...(parsed.location || {}),
    };
    let mergedMethod = parsed.method || defaults.method;

    // Heal legacy default bug where London coordinates were paired with a non-London timezone
    if (
      mergedLocation.source === 'manual' &&
      mergedLocation.name === 'London' &&
      Math.abs(mergedLocation.lat - 51.5072) < 0.05 &&
      mergedLocation.timezone !== 'Europe/London'
    ) {
      const matched = findCityForTimezone(mergedLocation.timezone);
      if (matched) {
        mergedLocation.name = matched.name;
        mergedLocation.country = matched.country;
        mergedLocation.lat = matched.lat;
        mergedLocation.lng = matched.lng;
        mergedLocation.timezone = matched.timezone;
        mergedMethod = suggestMethodForLocation(
          matched.lat,
          matched.lng,
          matched.countryCode
        );
      } else {
        mergedLocation.timezone = 'Europe/London';
      }
    }

    if (!mergedLocation.timezone || !isValidTimeZone(mergedLocation.timezone)) {
      mergedLocation.timezone = findNearestCity(
        mergedLocation.lat,
        mergedLocation.lng
      ).city.timezone;
    }

    return {
      ...defaults,
      ...parsed,
      method: mergedMethod,
      language: parsed.language || defaults.language,
      location: mergedLocation,
      adjustments: {
        ...defaults.adjustments,
        ...(parsed.adjustments || {}),
      },
      notifications: {
        ...defaults.notifications,
        ...(parsed.notifications || {}),
        prayers: {
          ...defaults.notifications.prayers,
          ...(parsed.notifications?.prayers || {}),
        },
      },
    };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings: PrayerSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore quota errors
  }
}

export function hasCompletedOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setOnboardingComplete(done: boolean) {
  try {
    localStorage.setItem(ONBOARDED_KEY, done ? 'true' : 'false');
  } catch {
    // ignore
  }
}

export function hasEnteredWebApp(): boolean {
  try {
    return localStorage.getItem(PREVIEW_WEB_APP_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setEnteredWebApp(entered: boolean) {
  try {
    localStorage.setItem(PREVIEW_WEB_APP_KEY, entered ? 'true' : 'false');
  } catch {
    // ignore
  }
}

export function buildScheduleSignature(settings: PrayerSettings): string {
  return JSON.stringify({
    lat: settings.location.lat.toFixed(4),
    lng: settings.location.lng.toFixed(4),
    tz: settings.location.timezone,
    m: settings.method,
    a: settings.asrMethod,
    h: settings.highLatitudeRule,
    adj: settings.adjustments,
  });
}

export function refreshOfflineScheduleCache(settings: PrayerSettings) {
  try {
    const signature = buildScheduleSignature(settings);
    const now = new Date();
    const days: CachedScheduleMap['days'] = {};

    for (let i = -1; i <= 30; i++) {
      const ref = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const dayKey = getDateKeyInZone(ref, settings.location.timezone);
      const sched = computeDaySchedule(ref, settings);
      days[dayKey] = sched.entries.map((e) => ({
        id: e.id,
        iso: e.time.toISOString(),
      }));
    }

    const payload: CachedScheduleMap = {signature, days};
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota errors
  }
}
