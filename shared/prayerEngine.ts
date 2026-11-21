import {
  CalculationMethod,
  CalculationParameters,
  Coordinates,
  HighLatitudeRule,
  Madhab,
  PrayerTimes,
} from 'adhan';

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export const PRAYER_ORDER: PrayerName[] = [
  'fajr',
  'sunrise',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
];

export const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

export type AppLanguage =
  | 'en'
  | 'ku-latn'
  | 'ckb'
  | 'ar'
  | 'tr'
  | 'ur'
  | 'fr'
  | 'id';

export type CalculationMethodId =
  | 'MuslimWorldLeague'
  | 'NorthAmerica'
  | 'UmmAlQura'
  | 'Egyptian'
  | 'Karachi'
  | 'Turkey'
  | 'Dubai'
  | 'Kuwait'
  | 'Qatar'
  | 'Singapore'
  | 'MoonsightingCommittee'
  | 'Tehran';

export interface CalculationMethodMeta {
  id: CalculationMethodId;
  name: string;
  region: string;
  angles: string;
}

export const CALCULATION_METHODS: CalculationMethodMeta[] = [
  {
    id: 'MuslimWorldLeague',
    name: 'Muslim World League',
    region: 'Europe, Kurdistan, Far East & Global',
    angles: 'Fajr 18° · Isha 17°',
  },
  {
    id: 'NorthAmerica',
    name: 'ISNA (North America)',
    region: 'United States & Canada',
    angles: 'Fajr 15° · Isha 15°',
  },
  {
    id: 'UmmAlQura',
    name: 'Umm al-Qura University',
    region: 'Saudi Arabia & Arabian Peninsula',
    angles: 'Fajr 18.5° · Isha 90m after Maghrib',
  },
  {
    id: 'Egyptian',
    name: 'Egyptian General Authority',
    region: 'Egypt, Africa & Levant',
    angles: 'Fajr 19.5° · Isha 17.5°',
  },
  {
    id: 'Turkey',
    name: 'Diyanet (Turkey)',
    region: 'Turkey & Balkans',
    angles: 'Fajr 18° · Isha 17°',
  },
  {
    id: 'Karachi',
    name: 'University of Islamic Sciences, Karachi',
    region: 'Pakistan, India, Bangladesh & Afghanistan',
    angles: 'Fajr 18° · Isha 18°',
  },
  {
    id: 'Dubai',
    name: 'Dubai (IACAD)',
    region: 'United Arab Emirates',
    angles: 'Fajr 18.2° · Isha 18.2°',
  },
  {
    id: 'Kuwait',
    name: 'Kuwait',
    region: 'Kuwait',
    angles: 'Fajr 18° · Isha 17.5°',
  },
  {
    id: 'Qatar',
    name: 'Qatar',
    region: 'Qatar',
    angles: 'Fajr 18° · Isha 90m after Maghrib',
  },
  {
    id: 'Singapore',
    name: 'MUIS (Singapore)',
    region: 'Singapore, Malaysia & Indonesia',
    angles: 'Fajr 20° · Isha 18°',
  },
  {
    id: 'MoonsightingCommittee',
    name: 'Moonsighting Committee Worldwide',
    region: 'UK, North America & High Latitudes',
    angles: 'Fajr 18° · Isha 18° (Seasonal)',
  },
  {
    id: 'Tehran',
    name: 'Institute of Geophysics, Tehran',
    region: 'Iran',
    angles: 'Fajr 17.7° · Isha 14°',
  },
];

export type AsrMethodId = 'Shafi' | 'Hanafi';
export type HighLatitudeRuleId =
  | 'Auto'
  | 'MiddleOfTheNight'
  | 'SeventhOfTheNight'
  | 'TwilightAngle';

export type PrayerAdjustments = Record<PrayerName, number>;
export type EnabledPrayers = Record<PrayerName, boolean>;

export type NotificationSoundId =
  | 'off'
  | 'chime'
  | 'bell'
  | 'takbir'
  | 'makkah'
  | 'madinah'
  | 'mishary'
  | 'qatami'
  | 'alaqsa'
  | 'custom';

export interface NotificationSoundOption {
  id: NotificationSoundId;
  label: string;
  subtitle: string;
  category: 'tone' | 'adhan' | 'custom';
  src?: string;
}

export const NOTIFICATION_SOUNDS: NotificationSoundOption[] = [
  {
    id: 'off',
    label: 'Silent',
    subtitle: 'Visual notification only',
    category: 'tone',
  },
  {
    id: 'chime',
    label: 'Gentle Chime',
    subtitle: 'Soft harmonic two-note chime',
    category: 'tone',
  },
  {
    id: 'bell',
    label: 'Sanctuary Bell',
    subtitle: 'Single resonant bell tone',
    category: 'tone',
  },
  {
    id: 'takbir',
    label: 'Contemplative Tone',
    subtitle: 'Quiet rising three-note reminder',
    category: 'tone',
  },
  {
    id: 'makkah',
    label: 'Masjid al-Haram (Makkah)',
    subtitle: 'Authentic Makkah mosque Adhan',
    category: 'adhan',
    src: '/sounds/makkah.mp3',
  },
  {
    id: 'madinah',
    label: 'Masjid an-Nabawi (Madinah)',
    subtitle: 'Authentic Madinah mosque Adhan',
    category: 'adhan',
    src: '/sounds/madinah.mp3',
  },
  {
    id: 'mishary',
    label: 'Sheikh Mishary Al-Afasy',
    subtitle: 'Recited Adhan call to prayer',
    category: 'adhan',
    src: '/sounds/mishary.mp3',
  },
  {
    id: 'qatami',
    label: 'Sheikh Nasser Al-Qatami',
    subtitle: 'Recited Adhan call to prayer',
    category: 'adhan',
    src: '/sounds/qatami.mp3',
  },
  {
    id: 'alaqsa',
    label: 'Al-Aqsa Mosque',
    subtitle: 'Authentic Jerusalem mosque Adhan',
    category: 'adhan',
    src: '/sounds/alaqsa.mp3',
  },
  {
    id: 'custom',
    label: 'Custom Audio',
    subtitle: 'Your own uploaded audio file',
    category: 'custom',
  },
];

export type ThemePreference = 'light' | 'dark' | 'system';

export interface PrayerLocation {
  name: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
  source: 'auto' | 'manual';
}

export interface PrayerSettings {
  location: PrayerLocation;
  method: CalculationMethodId;
  asrMethod: AsrMethodId;
  highLatitudeRule: HighLatitudeRuleId;
  adjustments: PrayerAdjustments;
  timeFormat: '12h' | '24h';
  language: AppLanguage;
  notifications: {
    enabled: boolean;
    prayers: EnabledPrayers;
    sound: NotificationSoundId;
    customSoundName?: string;
  };
  theme: ThemePreference;
}

export const DEFAULT_ADJUSTMENTS: PrayerAdjustments = {
  fajr: 0,
  sunrise: 0,
  dhuhr: 0,
  asr: 0,
  maghrib: 0,
  isha: 0,
};

export const DEFAULT_ENABLED_PRAYERS: EnabledPrayers = {
  fajr: true,
  sunrise: false,
  dhuhr: true,
  asr: true,
  maghrib: true,
  isha: true,
};

function getCalculationParams(
  method: CalculationMethodId,
  asrMethod: AsrMethodId,
  highLatitudeRule: HighLatitudeRuleId,
  lat: number
): CalculationParameters {
  let params: CalculationParameters;
  switch (method) {
    case 'NorthAmerica':
      params = CalculationMethod.NorthAmerica();
      break;
    case 'UmmAlQura':
      params = CalculationMethod.UmmAlQura();
      break;
    case 'Egyptian':
      params = CalculationMethod.Egyptian();
      break;
    case 'Karachi':
      params = CalculationMethod.Karachi();
      break;
    case 'Turkey':
      params = CalculationMethod.Turkey();
      break;
    case 'Dubai':
      params = CalculationMethod.Dubai();
      break;
    case 'Kuwait':
      params = CalculationMethod.Kuwait();
      break;
    case 'Qatar':
      params = CalculationMethod.Qatar();
      break;
    case 'Singapore':
      params = CalculationMethod.Singapore();
      break;
    case 'MoonsightingCommittee':
      params = CalculationMethod.MoonsightingCommittee();
      break;
    case 'Tehran':
      params = CalculationMethod.Tehran();
      break;
    case 'MuslimWorldLeague':
    default:
      params = CalculationMethod.MuslimWorldLeague();
      break;
  }

  params.madhab = asrMethod === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;

  if (highLatitudeRule === 'Auto') {
    params.highLatitudeRule = HighLatitudeRule.recommended(new Coordinates(lat, 0));
  } else if (highLatitudeRule === 'MiddleOfTheNight') {
    params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
  } else if (highLatitudeRule === 'SeventhOfTheNight') {
    params.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight;
  } else {
    params.highLatitudeRule = HighLatitudeRule.TwilightAngle;
  }

  return params;
}

export interface ZoneDateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export function getTimePartsInZone(date: Date, timezone: string): ZoneDateParts {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    const parts = formatter.formatToParts(date);
    const get = (type: string) =>
      Number(parts.find((p) => p.type === type)?.value ?? 0);
    return {
      year: get('year'),
      month: get('month'),
      day: get('day'),
      hour: get('hour') % 24,
      minute: get('minute'),
      second: get('second'),
    };
  } catch {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
    };
  }
}

export function getDateKeyInZone(date: Date, timezone: string): string {
  const p = getTimePartsInZone(date, timezone);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

export interface ComputedPrayerEntry {
  id: PrayerName;
  label: string;
  time: Date;
  formattedTime: string;
  adjustmentMinutes: number;
}

export interface DayPrayerSchedule {
  dateKey: string;
  entries: ComputedPrayerEntry[];
  timesMap: Record<PrayerName, Date>;
}

export function formatTimeInZone(
  date: Date,
  timezone: string,
  timeFormat: '12h' | '24h'
): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: timeFormat === '24h' ? '2-digit' : 'numeric',
      minute: '2-digit',
      hour12: timeFormat === '12h',
    }).format(date);
  } catch {
    return date.toLocaleTimeString([], {
      hour: timeFormat === '24h' ? '2-digit' : 'numeric',
      minute: '2-digit',
      hour12: timeFormat === '12h',
    });
  }
}

function computeScheduleForYMD(
  year: number,
  month: number,
  day: number,
  settings: Pick<
    PrayerSettings,
    'location' | 'method' | 'asrMethod' | 'highLatitudeRule' | 'adjustments' | 'timeFormat'
  >
): DayPrayerSchedule {
  const {lat, lng, timezone} = settings.location;
  const calcDate = new Date(year, month - 1, day, 12, 0, 0);

  const coordinates = new Coordinates(lat, lng);
  const params = getCalculationParams(
    settings.method,
    settings.asrMethod,
    settings.highLatitudeRule,
    lat
  );
  const raw = new PrayerTimes(coordinates, calcDate, params);

  const applyOffset = (d: Date, mins: number) =>
    new Date(d.getTime() + (mins || 0) * 60_000);

  const adj = settings.adjustments || DEFAULT_ADJUSTMENTS;
  const timesMap: Record<PrayerName, Date> = {
    fajr: applyOffset(raw.fajr, adj.fajr),
    sunrise: applyOffset(raw.sunrise, adj.sunrise),
    dhuhr: applyOffset(raw.dhuhr, adj.dhuhr),
    asr: applyOffset(raw.asr, adj.asr),
    maghrib: applyOffset(raw.maghrib, adj.maghrib),
    isha: applyOffset(raw.isha, adj.isha),
  };

  const entries: ComputedPrayerEntry[] = PRAYER_ORDER.map((id) => ({
    id,
    label: PRAYER_LABELS[id],
    time: timesMap[id],
    formattedTime: formatTimeInZone(timesMap[id], timezone, settings.timeFormat),
    adjustmentMinutes: adj[id] || 0,
  }));

  return {
    dateKey: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    entries,
    timesMap,
  };
}

function shiftCalendarDay(
  year: number,
  month: number,
  day: number,
  deltaDays: number
): {year: number; month: number; day: number} {
  const shifted = new Date(Date.UTC(year, month - 1, day + deltaDays, 12, 0, 0));
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

export function computeDaySchedule(
  referenceDate: Date,
  settings: Pick<
    PrayerSettings,
    'location' | 'method' | 'asrMethod' | 'highLatitudeRule' | 'adjustments' | 'timeFormat'
  >
): DayPrayerSchedule {
  const parts = getTimePartsInZone(referenceDate, settings.location.timezone);
  return computeScheduleForYMD(parts.year, parts.month, parts.day, settings);
}

export type PrayerRowStatus = 'passed' | 'current' | 'next' | 'upcoming';

export interface PrayerRowWithStatus extends ComputedPrayerEntry {
  status: PrayerRowStatus;
}

export interface NextPrayerSummary {
  nextPrayer: {
    id: PrayerName;
    label: string;
    time: Date;
    formattedTime: string;
    isTomorrow: boolean;
  };
  currentRelevantPrayer: PrayerName | null;
  countdownMs: number;
  countdownFormatted: string;
  progressRatio: number;
  todayRows: PrayerRowWithStatus[];
  tomorrowSchedule: DayPrayerSchedule;
}

export function formatCountdown(ms: number): string {
  const clamped = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function getNextPrayerInfo(
  now: Date,
  settings: Pick<
    PrayerSettings,
    'location' | 'method' | 'asrMethod' | 'highLatitudeRule' | 'adjustments' | 'timeFormat'
  >
): NextPrayerSummary {
  const parts = getTimePartsInZone(now, settings.location.timezone);
  const today = computeScheduleForYMD(parts.year, parts.month, parts.day, settings);
  const tom = shiftCalendarDay(parts.year, parts.month, parts.day, 1);
  const yest = shiftCalendarDay(parts.year, parts.month, parts.day, -1);
  const tomorrow = computeScheduleForYMD(tom.year, tom.month, tom.day, settings);
  const yesterday = computeScheduleForYMD(yest.year, yest.month, yest.day, settings);

  const nowMs = now.getTime();
  const nextIdx = today.entries.findIndex((e) => e.time.getTime() > nowMs);

  let nextEntry: ComputedPrayerEntry;
  let isTomorrow = false;
  let prevTimeMs: number;

  if (nextIdx === -1) {
    nextEntry = tomorrow.entries[0];
    isTomorrow = true;
    prevTimeMs = today.timesMap.isha.getTime();
  } else {
    nextEntry = today.entries[nextIdx];
    prevTimeMs =
      nextIdx === 0
        ? yesterday.timesMap.isha.getTime()
        : today.entries[nextIdx - 1].time.getTime();
  }

  let currentRelevantPrayer: PrayerName | null = null;
  if (nowMs >= today.timesMap.fajr.getTime() && nowMs < today.timesMap.sunrise.getTime()) {
    currentRelevantPrayer = 'fajr';
  } else if (nowMs >= today.timesMap.dhuhr.getTime() && nowMs < today.timesMap.asr.getTime()) {
    currentRelevantPrayer = 'dhuhr';
  } else if (nowMs >= today.timesMap.asr.getTime() && nowMs < today.timesMap.maghrib.getTime()) {
    currentRelevantPrayer = 'asr';
  } else if (nowMs >= today.timesMap.maghrib.getTime() && nowMs < today.timesMap.isha.getTime()) {
    currentRelevantPrayer = 'maghrib';
  } else if (nowMs >= today.timesMap.isha.getTime() || nowMs < today.timesMap.fajr.getTime()) {
    currentRelevantPrayer = 'isha';
  }

  const todayRows: PrayerRowWithStatus[] = today.entries.map((entry, idx) => {
    let status: PrayerRowStatus = 'upcoming';
    if (!isTomorrow && idx === nextIdx) {
      status = 'next';
    } else if (entry.id === currentRelevantPrayer && entry.time.getTime() <= nowMs) {
      status = 'current';
    } else if (entry.time.getTime() <= nowMs) {
      status = 'passed';
    }
    return {...entry, status};
  });

  const countdownMs = Math.max(0, nextEntry.time.getTime() - nowMs);
  const totalWindow = Math.max(1, nextEntry.time.getTime() - prevTimeMs);
  const progressRatio = Math.max(0, Math.min(1, (nowMs - prevTimeMs) / totalWindow));

  return {
    nextPrayer: {
      id: nextEntry.id,
      label: nextEntry.label,
      time: nextEntry.time,
      formattedTime: nextEntry.formattedTime,
      isTomorrow,
    },
    currentRelevantPrayer,
    countdownMs,
    countdownFormatted: formatCountdown(countdownMs),
    progressRatio,
    todayRows,
    tomorrowSchedule: tomorrow,
  };
}

export function getPrayerArrivalCopy(
  prayer: PrayerName,
  language: AppLanguage = 'en'
): string {
  switch (language) {
    case 'ku-latn': {
      const names: Record<PrayerName, string> = {
        fajr: 'Bayne',
        sunrise: 'Rojhalat',
        dhuhr: 'Newaro',
        asr: 'Asr',
        maghrib: 'Maghrib',
        isha: 'Isha',
      };
      return `Kati ${names[prayer]} hat.`;
    }
    case 'ckb': {
      const names: Record<PrayerName, string> = {
        fajr: 'بەیانی',
        sunrise: 'خۆرهەڵات',
        dhuhr: 'نیوەڕۆ',
        asr: 'عەسر',
        maghrib: 'مەغریب',
        isha: 'عیشا',
      };
      return prayer === 'sunrise'
        ? 'کاتی خۆرهەڵات هات.'
        : `کاتی نوێژی ${names[prayer]} هات.`;
    }
    case 'ar': {
      const names: Record<PrayerName, string> = {
        fajr: 'الفجر',
        sunrise: 'الشروق',
        dhuhr: 'الظهر',
        asr: 'العصر',
        maghrib: 'المغرب',
        isha: 'العشاء',
      };
      return prayer === 'sunrise'
        ? 'حان وقت الشروق.'
        : `حان وقت صلاة ${names[prayer]}.`;
    }
    case 'tr': {
      const names: Record<PrayerName, string> = {
        fajr: 'İmsak',
        sunrise: 'Güneş',
        dhuhr: 'Öğle',
        asr: 'İkindi',
        maghrib: 'Akşam',
        isha: 'Yatsı',
      };
      return prayer === 'sunrise'
        ? 'Güneş doğuş vakti.'
        : `${names[prayer]} vakti girdi.`;
    }
    case 'ur': {
      const names: Record<PrayerName, string> = {
        fajr: 'فجر',
        sunrise: 'طلوع آفتاب',
        dhuhr: 'ظہر',
        asr: 'عصر',
        maghrib: 'مغرب',
        isha: 'عشاء',
      };
      return prayer === 'sunrise'
        ? 'طلوع آفتاب کا وقت ہو گیا ہے۔'
        : `نماز ${names[prayer]} کا وقت ہو گیا ہے۔`;
    }
    case 'fr': {
      const names: Record<PrayerName, string> = {
        fajr: 'Fajr',
        sunrise: 'Lever du soleil',
        dhuhr: 'Dhuhr',
        asr: 'Asr',
        maghrib: 'Maghrib',
        isha: 'Isha',
      };
      return prayer === 'sunrise'
        ? 'Le lever du soleil a commencé.'
        : `L’heure de ${names[prayer]} est arrivée.`;
    }
    case 'id': {
      const names: Record<PrayerName, string> = {
        fajr: 'Subuh',
        sunrise: 'Terbit',
        dhuhr: 'Dzuhur',
        asr: 'Ashar',
        maghrib: 'Maghrib',
        isha: 'Isya',
      };
      return prayer === 'sunrise'
        ? 'Waktu terbit matahari telah tiba.'
        : `Waktu sholat ${names[prayer]} telah tiba.`;
    }
    case 'en':
    default:
      return prayer === 'sunrise'
        ? 'Sunrise has begun.'
        : `${PRAYER_LABELS[prayer]} time has arrived.`;
  }
}

export function suggestMethodForLocation(
  lat: number,
  lng: number,
  countryCode?: string
): CalculationMethodId {
  const cc = (countryCode || '').toUpperCase();
  if (cc === 'US' || cc === 'CA') return 'NorthAmerica';
  if (cc === 'SA') return 'UmmAlQura';
  if (cc === 'TR') return 'Turkey';
  if (cc === 'EG' || cc === 'SD' || cc === 'LY') return 'Egyptian';
  if (cc === 'PK' || cc === 'IN' || cc === 'BD' || cc === 'AF') return 'Karachi';
  if (cc === 'AE') return 'Dubai';
  if (cc === 'KW') return 'Kuwait';
  if (cc === 'QA') return 'Qatar';
  if (cc === 'SG' || cc === 'MY' || cc === 'ID' || cc === 'BN') return 'Singapore';
  if (cc === 'IR') return 'Tehran';
  if (cc === 'GB') return 'MoonsightingCommittee';

  if (lng < -30) return 'NorthAmerica';
  if (lat >= 36 && lat <= 42 && lng >= 26 && lng <= 45) return 'Turkey';
  if (lat >= 16 && lat <= 32 && lng >= 34 && lng <= 56) return 'UmmAlQura';
  if (lat >= 5 && lat <= 37 && lng >= 60 && lng <= 98) return 'Karachi';
  if (lat >= -10 && lat <= 10 && lng >= 95 && lng <= 141) return 'Singapore';
  return 'MuslimWorldLeague';
}

const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
];

function computeFallbackHijri(date: Date, timezone: string): string {
  const {year, month, day} = getTimePartsInZone(date, timezone);
  let m = month;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  let b = 2 - a + Math.floor(a / 4);
  if (y < 1583) b = 0;
  const jd =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    b -
    1524;

  const iyear = 10631 / 30;
  const epochastro = 1948084;
  const shift1 = 8.01 / 60;
  let z = jd - epochastro;
  const cyc = Math.floor(z / 10631);
  z -= 10631 * cyc;
  const j = Math.floor((z - shift1) / iyear);
  const iy = 30 * cyc + j;
  z -= Math.floor(j * iyear + shift1);
  let im = Math.floor((z + 28.5001) / 29.5);
  if (im === 13) im = 12;
  const id = z - Math.floor(29.5001 * im - 29);

  const monthName = HIJRI_MONTHS[Math.max(0, Math.min(11, im - 1))];
  return `${Math.max(1, id)} ${monthName} ${iy} AH`;
}

export function getHijriDateLabel(
  date: Date,
  timezone = 'UTC',
  localePrefix = 'en'
): string {
  const langBase =
    localePrefix === 'ar' || localePrefix === 'ckb' || localePrefix === 'ur'
      ? 'ar'
      : localePrefix.split('-')[0] || 'en';
  const locales = [
    `${langBase}-u-ca-islamic-umalqura`,
    `${langBase}-u-ca-islamic-civil`,
    'en-u-ca-islamic-umalqura',
    'en-u-ca-islamic',
  ];
  for (const locale of locales) {
    try {
      const formatted = new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
      if (formatted && !/\b20\d{2}\b/.test(formatted)) {
        return formatted;
      }
    } catch {
      // try next
    }
  }
  return computeFallbackHijri(date, timezone);
}

export function getGregorianDateLabel(
  date: Date,
  timezone = 'UTC',
  localeTag = 'en-US'
): string {
  try {
    return new Intl.DateTimeFormat(localeTag, {
      timeZone: timezone,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return date.toDateString();
  }
}
