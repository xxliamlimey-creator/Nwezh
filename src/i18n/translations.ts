import type {PrayerName} from '../../shared/prayerEngine';

export type LanguageId =
  | 'en'
  | 'ku-latn'
  | 'ckb'
  | 'ar'
  | 'tr'
  | 'ur'
  | 'fr'
  | 'id';

export interface LanguageMeta {
  id: LanguageId;
  nativeName: string;
  englishName: string;
  dir: 'ltr' | 'rtl';
  localeTag: string;
}

export const LANGUAGES: LanguageMeta[] = [
  {id: 'en', nativeName: 'English', englishName: 'English', dir: 'ltr', localeTag: 'en-US'},
  {id: 'ku-latn', nativeName: 'Kurdî (Latin)', englishName: 'Kurdish (Latin)', dir: 'ltr', localeTag: 'ku'},
  {id: 'ckb', nativeName: 'کوردی (سۆرانی)', englishName: 'Kurdish (Sorani)', dir: 'rtl', localeTag: 'ckb'},
  {id: 'ar', nativeName: 'العربية', englishName: 'Arabic', dir: 'rtl', localeTag: 'ar'},
  {id: 'tr', nativeName: 'Türkçe', englishName: 'Turkish', dir: 'ltr', localeTag: 'tr-TR'},
  {id: 'ur', nativeName: 'اردو', englishName: 'Urdu', dir: 'rtl', localeTag: 'ur-PK'},
  {id: 'fr', nativeName: 'Français', englishName: 'French', dir: 'ltr', localeTag: 'fr-FR'},
  {id: 'id', nativeName: 'Bahasa Indonesia', englishName: 'Indonesian', dir: 'ltr', localeTag: 'id-ID'},
];

export function getLanguageMeta(lang: LanguageId): LanguageMeta {
  return LANGUAGES.find((l) => l.id === lang) || LANGUAGES[0];
}

export interface TranslationStrings {
  appName: string;
  tagline: string;
  landingDesc: string;
  installNwezh: string;
  openInBrowser: string;
  installNoteNative: string;
  installNoteIOS: string;
  installNoteOther: string;
  footerPrivacy: string;
  howToInstallIOS: string;
  // Nav & Tabs
  navToday: string;
  navSettings: string;
  installShort: string;
  // Home
  nextPrayer: string;
  nextPrayerTomorrow: string;
  remaining: string;
  currentWindow: string;
  prayerSchedule: string;
  today: string;
  tomorrow: string;
  statusNext: string;
  statusCurrent: string;
  statusPassed: string;
  statusUpcoming: string;
  offlineBanner: string;
  dismiss: string;
  // Onboarding
  stepOf: (step: number, total: number) => string;
  wherePraying: string;
  wherePrayingDesc: string;
  useCurrentLocation: string;
  detectingLocation: string;
  selectCityManually: string;
  calcMethodTitle: string;
  calcMethodDesc: (city: string) => string;
  asrCalcTitle: string;
  asrCalcDesc: string;
  asrStandardTitle: string;
  asrStandardDesc: string;
  asrHanafiTitle: string;
  asrHanafiDesc: string;
  remindersTitle: string;
  remindersDesc: string;
  iosHomeRequiredTitle: string;
  iosHomeRequiredDesc: string;
  viewInstallSteps: string;
  back: string;
  continueBtn: string;
  skipForNow: string;
  enableAndFinish: string;
  finishSetup: string;
  enabling: string;
  // Settings
  settingsTitle: string;
  settingsSubtitle: string;
  sectionLocation: string;
  detectAutomatically: string;
  sectionCalculation: string;
  calculationMethod: string;
  asrCalculation: string;
  standardLabel: string;
  hanafiLabel: string;
  highLatitudeRule: string;
  timeFormat: string;
  format12h: string;
  format24h: string;
  sectionNotifications: string;
  prayerReminders: string;
  notificationSound: string;
  soundHint: string;
  uploadCustomSound: string;
  replaceCustomSound: string;
  removeCustomSound: string;
  customSoundStored: string;
  stopPreview: string;
  previewSound: string;
  sendTestReminder: string;
  sendingTest: string;
  testReminderHint: string;
  testReminderIOSHint: string;
  sectionAdjustments: string;
  resetAll: string;
  sectionAppearance: string;
  themeLabel: string;
  themeLight: string;
  themeDark: string;
  themeSystem: string;
  languageLabel: string;
  sectionAboutPrivacy: string;
  installedLabel: string;
  installAppBtn: string;
  installInstructionsTitle: string;
  installInstructionsDesc: string;
  openStepGuide: string;
  privacyTitle: string;
  privacyDesc: string;
  // City Picker
  selectLocation: string;
  searchCityPlaceholder: string;
  noCitiesFound: string;
  // Prayers & Notification copy
  prayers: Record<PrayerName, string>;
  prayerArrived: (prayer: PrayerName) => string;
}

const EN: TranslationStrings = {
  appName: 'Nwezh',
  tagline: 'A masjid in your pocket.',
  landingDesc:
    'Nwezh keeps track of daily prayer times and quietly reminds you when each prayer arrives — offline-ready, private, and free of distractions.',
  installNwezh: 'Install Nwezh',
  openInBrowser: 'Open in browser',
  installNoteNative: 'Installs directly as a standalone app on your device.',
  installNoteIOS:
    'On iPhone and iPad, install through Safari’s Add to Home Screen to unlock standalone mode and prayer notifications.',
  installNoteOther:
    'Add Nwezh to your Home Screen or Dock for a dedicated, distraction-free prayer experience.',
  footerPrivacy: 'Nwezh · No accounts, no tracking, works offline',
  howToInstallIOS: 'How to install on iPhone',
  navToday: 'Today',
  navSettings: 'Settings',
  installShort: 'Install',
  nextPrayer: 'Next prayer',
  nextPrayerTomorrow: 'Next prayer · Tomorrow',
  remaining: 'Remaining',
  currentWindow: 'Current window',
  prayerSchedule: 'Prayer Schedule',
  today: 'Today',
  tomorrow: 'Tomorrow',
  statusNext: 'Next',
  statusCurrent: 'Current',
  statusPassed: 'Passed',
  statusUpcoming: 'Upcoming',
  offlineBanner: 'Offline — prayer times calculated locally on device.',
  dismiss: 'Dismiss',
  stepOf: (s, t) => `Step ${s} of ${t}`,
  wherePraying: 'Where are you praying?',
  wherePrayingDesc:
    'Your location is used strictly to calculate accurate prayer times on your device. No account or personal data is collected.',
  useCurrentLocation: 'Use My Current Location',
  detectingLocation: 'Detecting location…',
  selectCityManually: 'Select City Manually',
  calcMethodTitle: 'Calculation method',
  calcMethodDesc: (city) =>
    `Choose the authority used in ${city}. You can adjust this anytime in Settings.`,
  asrCalcTitle: 'Asr calculation',
  asrCalcDesc:
    'Select how Asr prayer time is determined based on your juristic preference.',
  asrStandardTitle: 'Standard (Shafi’i, Maliki, Hanbali)',
  asrStandardDesc:
    'Asr begins when the shadow of an object equals its height plus noon shadow.',
  asrHanafiTitle: 'Hanafi',
  asrHanafiDesc:
    'Asr begins when the shadow of an object is twice its height plus noon shadow.',
  remindersTitle: 'Prayer reminders',
  remindersDesc:
    'Choose which prayers you would like to be reminded for when their time arrives.',
  iosHomeRequiredTitle: 'Home Screen installation required on iPhone & iPad',
  iosHomeRequiredDesc:
    'Apple Safari only delivers Web Push prayer reminders to apps added to your Home Screen. Save your preferences now, then add Nwezh to your Home Screen and turn reminders on in Settings.',
  viewInstallSteps: 'View Add to Home Screen steps',
  back: 'Back',
  continueBtn: 'Continue',
  skipForNow: 'Skip for now',
  enableAndFinish: 'Enable & Finish',
  finishSetup: 'Finish Setup',
  enabling: 'Enabling…',
  settingsTitle: 'Settings',
  settingsSubtitle: 'Calculation rules, reminders, language, and sound.',
  sectionLocation: 'Location',
  detectAutomatically: 'Detect Location Automatically',
  sectionCalculation: 'Prayer Calculation',
  calculationMethod: 'Calculation Method',
  asrCalculation: 'Asr Calculation',
  standardLabel: 'Standard',
  hanafiLabel: 'Hanafi',
  highLatitudeRule: 'High Latitude Rule',
  timeFormat: 'Time Format',
  format12h: '12-hour',
  format24h: '24-hour',
  sectionNotifications: 'Notifications & Sound',
  prayerReminders: 'Prayer Reminders',
  notificationSound: 'Adhan & Notification Sound',
  soundHint:
    'Real Masjid Adhan recitations, calm tones, or your own audio file play when Nwezh is open; background push uses your device alert tone.',
  uploadCustomSound: 'Upload custom audio (MP3, M4A, WAV)',
  replaceCustomSound: 'Replace custom audio',
  removeCustomSound: 'Remove',
  customSoundStored: 'Saved offline on this device',
  stopPreview: 'Stop audio',
  previewSound: 'Preview sound',
  sendTestReminder: 'Send Test Reminder',
  sendingTest: 'Sending…',
  testReminderHint: 'Send a test push notification to verify delivery.',
  testReminderIOSHint: 'Add Nwezh to Home Screen first to test iOS Web Push.',
  sectionAdjustments: 'Manual Time Adjustments',
  resetAll: 'Reset all',
  sectionAppearance: 'Appearance & Language',
  themeLabel: 'Theme',
  themeLight: 'Light',
  themeDark: 'Dark',
  themeSystem: 'System',
  languageLabel: 'Language',
  sectionAboutPrivacy: 'About & Privacy',
  installedLabel: 'Installed',
  installAppBtn: 'Install App',
  installInstructionsTitle: 'Installation Instructions',
  installInstructionsDesc:
    'On iPhone and iPad, open Nwezh in Safari, tap Share, and select Add to Home Screen. On Android or desktop Chromium browsers, choose Install from the browser menu.',
  openStepGuide: 'Open step-by-step guide',
  privacyTitle: 'Privacy',
  privacyDesc:
    'Nwezh requires no account, runs prayer calculations locally on your device, and contains no ads or analytics trackers. Your location is stored on your device and is only shared anonymously with the push server if you enable background Web Push reminders.',
  selectLocation: 'Select Location',
  searchCityPlaceholder: 'Search city or country…',
  noCitiesFound: 'No matching cities found.',
  prayers: {
    fajr: 'Fajr',
    sunrise: 'Sunrise',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',
  },
  prayerArrived: (p) =>
    p === 'sunrise' ? 'Sunrise has begun.' : `${EN.prayers[p]} time has arrived.`,
};

const KU_LATN: TranslationStrings = {
  ...EN,
  tagline: 'Mizgeftek le girfani toda.',
  landingDesc:
    'Nwezh katakani nweji rojane hesap dekat u be arami agadart dekatewe — be internetish kar dekat u be reklam e.',
  installNwezh: 'Nwezh dabmezêne',
  openInBrowser: 'Le browserda bikewe',
  installNoteNative: 'Rastewxo wek appêkî serbexo le ser amêreket dademezrê.',
  installNoteIOS:
    'Le ser iPhone u iPad, le Safari da "Add to Home Screen" helbijêre bo agadarkirinî kati nwej.',
  installNoteOther:
    'Nwezh bo Home Screen yan Dock zyad bike bo ezmûnêkî aram.',
  footerPrivacy: 'Nwezh · Bê hesab, bê çavdêrî, offline kar dekat',
  howToInstallIOS: 'Çonêti damezrandin le ser iPhone',
  navToday: 'Emro',
  navSettings: 'Rêkxistin',
  installShort: 'Damezêne',
  nextPrayer: 'Nweji dahatû',
  nextPrayerTomorrow: 'Nweji dahatû · Sibeynê',
  remaining: 'Kati mawe',
  currentWindow: 'Kati êsta',
  prayerSchedule: 'Xiştey Nwej',
  today: 'Emro',
  tomorrow: 'Sibeynê',
  statusNext: 'Dahatû',
  statusCurrent: 'Êsta',
  statusPassed: 'Têperî',
  statusUpcoming: 'Dêt',
  offlineBanner: 'Offline — katakani nwej le ser amêreket hesap dekrên.',
  dismiss: 'Daxistin',
  stepOf: (s, t) => `Hengaw ${s} le ${t}`,
  wherePraying: 'Le kwê nwej dekeyt?',
  wherePrayingDesc:
    'Şwêneket tenya bo hesap-kirdini kati nwej bekar dêt le ser amêri xot.',
  useCurrentLocation: 'Şwêni êstam bekar bihêne',
  detectingLocation: 'Şwêneket dedozrêtewe…',
  selectCityManually: 'Şar be dest helbijêre',
  calcMethodTitle: 'Rêgay hesap-kirdin',
  calcMethodDesc: (city) =>
    `Rêgay hesap-kirdin bo ${city} helbijêre. Her katêk detwanît le Rêkxistinda bigorrît.`,
  asrCalcTitle: 'Hesap-kirdini Asr',
  asrCalcDesc: 'Rêgay hesap-kirdini kati Asr helbijêre.',
  asrStandardTitle: 'Standard (Şafi’î, Malikî, Henbelî)',
  asrStandardDesc: 'Asr dest pê dekat katêk sêberî şitêk debêt be qed berzî xoy.',
  asrHanafiTitle: 'Henefî',
  asrHanafiDesc: 'Asr dest pê dekat katêk sêberî şitêk debêt be dû hênde berzî xoy.',
  remindersTitle: 'Agadarkerewey nwej',
  remindersDesc: 'Ew nwejaney detewê agadart bikatewe helbijêre.',
  iosHomeRequiredTitle: 'Bo iPhone u iPad damezrandin pêwîste',
  iosHomeRequiredDesc:
    'Safari tenya agadarkerewey push denêrêt katêk app-eke bo Home Screen zyad kirabêt.',
  viewInstallSteps: 'Hengawakani Add to Home Screen bibîne',
  back: 'Gerranewe',
  continueBtn: 'Berdewam be',
  skipForNow: 'Êsta têperîne',
  enableAndFinish: 'Çalak bike u tewaw',
  finishSetup: 'Tewaw-kirdin',
  enabling: 'Çalak dekrêt…',
  settingsTitle: 'Rêkxistin',
  settingsSubtitle: 'Hesap-kirdin, agadarkerewe, ziman u deng.',
  sectionLocation: 'Şwên',
  detectAutomatically: 'Şwên xoy bidozêtewe',
  sectionCalculation: 'Hesap-kirdini Nwej',
  calculationMethod: 'Rêgay Hesap-kirdin',
  asrCalculation: 'Hesap-kirdini Asr',
  standardLabel: 'Standard',
  hanafiLabel: 'Henefî',
  highLatitudeRule: 'Yasay Berzî Zevî',
  timeFormat: 'Şêwey Kat',
  format12h: '12-katjmêr',
  format24h: '24-katjmêr',
  sectionNotifications: 'Agadarkerewe u Deng',
  prayerReminders: 'Agadarkerewey Nwej',
  notificationSound: 'Dengi Bang u Agadarkerewe',
  soundHint:
    'Bangi şêxakanî mizgeft, dengi aram yan dengi taybetî xot lê dedrêt katêk Nwezh kirawetewe.',
  uploadCustomSound: 'Dengi taybet zyad bike (MP3, M4A, WAV)',
  replaceCustomSound: 'Dengi taybet bigorre',
  removeCustomSound: 'Bisurewe',
  customSoundStored: 'Le ser amêreket offline helgîrawe',
  stopPreview: 'Rawestandin',
  previewSound: 'Gwê lê bigre',
  sendTestReminder: 'Nardni taqîkirdinewe',
  sendingTest: 'Denêrdrêt…',
  testReminderHint: 'Agadarkereweyekî taqîkirdinewe binêre.',
  testReminderIOSHint: 'Yekem car Nwezh bo Home Screen zyad bike bo iOS Push.',
  sectionAdjustments: 'Rastkirdinewey Kat be Dest',
  resetAll: 'Sifirkirdinewe',
  sectionAppearance: 'Rûkar u Ziman',
  themeLabel: 'Rûkar',
  themeLight: 'Rûnak',
  themeDark: 'Tarîk',
  themeSystem: 'Sîstem',
  languageLabel: 'Ziman',
  sectionAboutPrivacy: 'Derbare u Taybetmendî',
  installedLabel: 'Damezrawe',
  installAppBtn: 'Damezêne',
  installInstructionsTitle: 'Rênumayî Damezrandin',
  installInstructionsDesc:
    'Le iPhone u iPad, Nwezh le Safari bikewe, Share dabigre u Add to Home Screen helbijêre.',
  openStepGuide: 'Rênumayî hengaw be hengaw',
  privacyTitle: 'Taybetmendî',
  privacyDesc:
    'Nwezh pêwîstî be hesab nîye, katakani nwej le ser amêri xot hesap dekat u hîç reklamêkî tîda nîye.',
  selectLocation: 'Şwên Helbijêre',
  searchCityPlaceholder: 'Gerran bo şar yan welat…',
  noCitiesFound: 'Hîç şarêk nedozrayewe.',
  prayers: {
    fajr: 'Bayne',
    sunrise: 'Rojhalat',
    dhuhr: 'Newaro',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',
  },
  prayerArrived: (p) =>
    p === 'sunrise'
      ? 'Kati Rojhalat hat.'
      : `Kati ${KU_LATN.prayers[p]} hat.`,
};

const CKB: TranslationStrings = {
  ...EN,
  tagline: 'مزگەوتێک لە گیرفانتدا.',
  landingDesc:
    'نوێژ کاتەکانی نوێژی ڕۆژانە هەژمار دەکات و بە ئارامی ئاگادارت دەکاتەوە کاتێک هەر نوێژێک دێت — بەبێ ئینتەرنێت کار دەکات و بێ ڕیکلامە.',
  installNwezh: 'دامەزراندنی نوێژ',
  openInBrowser: 'کردنەوە لە وێبگەڕدا',
  installNoteNative: 'ڕاستەوخۆ وەک ئەپێکی سەربەخۆ لەسەر ئامێرەکەت دادەمەزرێت.',
  installNoteIOS:
    'لەسەر ئایفۆن و ئایپاد، لە سەفاریدا "Add to Home Screen" هەڵبژێرە بۆ کاراکردنی ئاگادارکەرەوەی نوێژ.',
  installNoteOther:
    'نوێژ زیاد بکە بۆ شاشەی سەرەکی بۆ ئەزموونێکی ئارام و بێ سەرقاڵی.',
  footerPrivacy: 'نوێژ · بێ هەژمار، بێ چاودێری، ئۆفلاین کار دەکات',
  howToInstallIOS: 'چۆنیەتی دامەزراندن لەسەر ئایفۆن',
  navToday: 'ئەمڕۆ',
  navSettings: 'ڕێکخستنەکان',
  installShort: 'دامەزراندن',
  nextPrayer: 'نوێژی داهاتوو',
  nextPrayerTomorrow: 'نوێژی داهاتوو · سبەینێ',
  remaining: 'کات ماوە',
  currentWindow: 'کاتی ئێستا',
  prayerSchedule: 'خشتەی نوێژەکان',
  today: 'ئەمڕۆ',
  tomorrow: 'سبەینێ',
  statusNext: 'داهاتوو',
  statusCurrent: 'ئێستا',
  statusPassed: 'تێپەڕی',
  statusUpcoming: 'دێت',
  offlineBanner: 'ئۆفلاین — کاتەکانی نوێژ لەسەر ئامێرەکەت هەژمار دەکرێن.',
  dismiss: 'داخستن',
  stepOf: (s, t) => `هەنگاوی ${s} لە ${t}`,
  wherePraying: 'لە کوێ نوێژ دەکەیت؟',
  wherePrayingDesc:
    'شوێنەکەت تەنها بۆ هەژمارکردنی وردی کاتەکانی نوێژ بەکاردێت لەسەر ئامێرەکەت. هیچ زانیارییەکی کەسی کۆناکرێتەوە.',
  useCurrentLocation: 'بەکارهێنانی شوێنی ئێستام',
  detectingLocation: 'شوێنەکەت دەدۆزرێتەوە…',
  selectCityManually: 'هەڵبژاردنی شار بە دەست',
  calcMethodTitle: 'شێوازی هەژمارکردن',
  calcMethodDesc: (city) =>
    `شێوازی هەژمارکردن بۆ ${city} هەڵبژێرە. هەر کاتێک دەتوانیت لە ڕێکخستنەکاندا بیگۆڕیت.`,
  asrCalcTitle: 'هەژمارکردنی عەسر',
  asrCalcDesc: 'شێوازی دیاریکردنی کاتی نوێژی عەسر هەڵبژێرە.',
  asrStandardTitle: 'ستاندارد (شافیعی، مالیکی، حەنبەلی)',
  asrStandardDesc: 'عەسر دەست پێ دەکات کاتێک سێبەری شتێک یەکسان دەبێت بە بەرزیی خۆی.',
  asrHanafiTitle: 'حەنەفی',
  asrHanafiDesc: 'عەسر دەست پێ دەکات کاتێک سێبەری شتێک دەبێتە دوو هێندەی بەرزیی خۆی.',
  remindersTitle: 'ئاگادارکەرەوەی نوێژ',
  remindersDesc: 'ئەو نوێژانە هەڵبژێرە کە دەتەوێت ئاگادار بکرێیتەوە کاتێک کاتیان دێت.',
  iosHomeRequiredTitle: 'دامەزراندن لەسەر شاشەی سەرەکی پێویستە بۆ ئایفۆن و ئایپاد',
  iosHomeRequiredDesc:
    'سەفاری تەنها ئاگادارکەرەوەی نوێژ دەنێرێت کاتێک ئەپەکە زیادکرابێت بۆ شاشەی سەرەکی (Add to Home Screen).',
  viewInstallSteps: 'بینینی هەنگاوەکانی دامەزراندن',
  back: 'گەڕانەوە',
  continueBtn: 'بەردەوام بە',
  skipForNow: 'ئێستا تێپەڕێنە',
  enableAndFinish: 'چالاککردن و تەواو',
  finishSetup: 'تەواوکردن',
  enabling: 'چالاک دەکرێت…',
  settingsTitle: 'ڕێکخستنەکان',
  settingsSubtitle: 'شێوازی هەژمارکردن، ئاگادارکەرەوە، زمان و دەنگ.',
  sectionLocation: 'شوێن',
  detectAutomatically: 'دۆزینەوەی شوێن بە شێوەی خۆکار',
  sectionCalculation: 'هەژمارکردنی نوێژ',
  calculationMethod: 'ڕێگای هەژمارکردن',
  asrCalculation: 'هەژمارکردنی عەسر',
  standardLabel: 'ستاندارد',
  hanafiLabel: 'حەنەفی',
  highLatitudeRule: 'یاسای ناوچە باکوورییەکان',
  timeFormat: 'شێوازی کات',
  format12h: '١٢ کاتژمێر',
  format24h: '٢٤ کاتژمێر',
  sectionNotifications: 'ئاگادارکەرەوە و دەنگ',
  prayerReminders: 'ئاگادارکەرەوەی نوێژ',
  notificationSound: 'دەنگی بانگ و ئاگادارکەرەوە',
  soundHint:
    'بانگی شێخەکانی مزگەوت، دەنگی ئارام یان دەنگی تایبەتی خۆت لێ دەدرێت کاتێک ئەپەکە کراوەتەوە.',
  uploadCustomSound: 'بارکردنی دەنگی تایبەت (MP3, M4A, WAV)',
  replaceCustomSound: 'گۆڕینی دەنگی تایبەت',
  removeCustomSound: 'سڕینەوە',
  customSoundStored: 'لەسەر ئامێرەکەت بە ئۆفلاین هەڵگیراوە',
  stopPreview: 'وەستاندن',
  previewSound: 'گوێگرتن',
  sendTestReminder: 'ناردنی ئاگادارکەرەوەی تاقیکاری',
  sendingTest: 'دەنێردرێت…',
  testReminderHint: 'ئاگادارکەرەوەیەکی تاقیکاری بنێرە بۆ دڵنیابوون.',
  testReminderIOSHint: 'سەرەتا نوێژ زیاد بکە بۆ شاشەی سەرەکی بۆ تاقیکردنەوەی iOS.',
  sectionAdjustments: 'ڕاستکردنەوەی کات بە دەست',
  resetAll: 'سفرکردنەوە',
  sectionAppearance: 'ڕووکار و زمان',
  themeLabel: 'ڕووکار',
  themeLight: 'ڕووناک',
  themeDark: 'تاریک',
  themeSystem: 'سیستەم',
  languageLabel: 'زمان',
  sectionAboutPrivacy: 'دەربارە و تایبەتمەندی',
  installedLabel: 'دامەزراوە',
  installAppBtn: 'دامەزراندن',
  installInstructionsTitle: 'ڕێنمایی دامەزراندن',
  installInstructionsDesc:
    'لەسەر ئایفۆن و ئایپاد، نوێژ لە سەفاری بکەرەوە، دوگمەی Share دابگرە و Add to Home Screen هەڵبژێرە.',
  openStepGuide: 'کردنەوەی ڕێنمایی هەنگاو بە هەنگاو',
  privacyTitle: 'تایبەتمەندی',
  privacyDesc:
    'نوێژ پێویستی بە هەژمار نییە، کاتەکان لەسەر ئامێرەکەت هەژمار دەکات و هیچ ڕیکلامێکی تێدا نییە.',
  selectLocation: 'هەڵبژاردنی شوێن',
  searchCityPlaceholder: 'گەڕان بۆ شار یان وڵات…',
  noCitiesFound: 'هیچ شارێک نەدۆزرایەوە.',
  prayers: {
    fajr: 'بەیانی',
    sunrise: 'خۆرهەڵات',
    dhuhr: 'نیوەڕۆ',
    asr: 'عەسر',
    maghrib: 'مەغریب',
    isha: 'عیشا',
  },
  prayerArrived: (p) =>
    p === 'sunrise'
      ? 'کاتی خۆرهەڵات هات.'
      : `کاتی نوێژی ${CKB.prayers[p]} هات.`,
};

const AR: TranslationStrings = {
  ...EN,
  tagline: 'مسجدٌ في جيبك.',
  landingDesc:
    'يحفظ تطبيق نويژ مواقيت الصلاة اليومية ويذكّرك بهدوء عند دخول كل صلاة — يعمل دون إنترنت، بخصوصية تامة ودون إعلانات.',
  installNwezh: 'تثبيت نويژ',
  openInBrowser: 'فتح في المتصفح',
  installNoteNative: 'يثبّت مباشرة كتطبيق مستقل على جهازك.',
  installNoteIOS:
    'على آيفون وآيباد، أضفه إلى الشاشة الرئيسية عبر سفاري لتفعيل التنبيهات والوضع المستقل.',
  installNoteOther:
    'أضف نويژ إلى الشاشة الرئيسية لتجربة صلاة هادئة خالية من المشتتات.',
  footerPrivacy: 'نويژ · دون حسابات، دون تتبع، يعمل دون إنترنت',
  howToInstallIOS: 'طريقة التثبيت على آيفون',
  navToday: 'اليوم',
  navSettings: 'الإعدادات',
  installShort: 'تثبيت',
  nextPrayer: 'الصلاة القادمة',
  nextPrayerTomorrow: 'الصلاة القادمة · غداً',
  remaining: 'المتبقي',
  currentWindow: 'الوقت الحالي',
  prayerSchedule: 'مواقيت الصلاة',
  today: 'اليوم',
  tomorrow: 'غداً',
  statusNext: 'القادمة',
  statusCurrent: 'الحالية',
  statusPassed: 'مضت',
  statusUpcoming: 'لاحقاً',
  offlineBanner: 'دون إنترنت — يتم حساب المواقيت محلياً على جهازك.',
  dismiss: 'إغلاق',
  stepOf: (s, t) => `الخطوة ${s} من ${t}`,
  wherePraying: 'أين تصلّي؟',
  wherePrayingDesc:
    'يُستخدم موقعك فقط لحساب مواقيت الصلاة بدقة على جهازك. لا يتم جمع أي بيانات شخصية.',
  useCurrentLocation: 'استخدام موقعي الحالي',
  detectingLocation: 'جاري تحديد الموقع…',
  selectCityManually: 'اختيار المدينة يدوياً',
  calcMethodTitle: 'طريقة الحساب',
  calcMethodDesc: (city) =>
    `اختر الهيئة المعتمدة في ${city}. يمكنك تعديلها في أي وقت من الإعدادات.`,
  asrCalcTitle: 'حساب العصر',
  asrCalcDesc: 'اختر المذهب الفقهي لحساب وقت صلاة العصر.',
  asrStandardTitle: 'الجمهور (الشافعي، المالكي، الحنبلي)',
  asrStandardDesc: 'يدخل وقت العصر عندما يصبح ظل الشيء مثل طوله.',
  asrHanafiTitle: 'الحنفي',
  asrHanafiDesc: 'يدخل وقت العصر عندما يصبح ظل الشيء مثلي طوله.',
  remindersTitle: 'تنبيهات الصلاة',
  remindersDesc: 'اختر الصلوات التي ترغب في تلقي تنبيه عند دخول وقتها.',
  iosHomeRequiredTitle: 'يلزم التثبيت على الشاشة الرئيسية في آيفون وآيباد',
  iosHomeRequiredDesc:
    'يدعم متصفح سفاري إشعارات الويب فقط للتطبيقات المضافة إلى الشاشة الرئيسية.',
  viewInstallSteps: 'عرض خطوات الإضافة إلى الشاشة الرئيسية',
  back: 'رجوع',
  continueBtn: 'متابعة',
  skipForNow: 'تخطي الآن',
  enableAndFinish: 'تفعيل وإنهاء',
  finishSetup: 'إنهاء الإعداد',
  enabling: 'جاري التفعيل…',
  settingsTitle: 'الإعدادات',
  settingsSubtitle: 'طرق الحساب، التنبيهات، اللغة والصوت.',
  sectionLocation: 'الموقع',
  detectAutomatically: 'تحديد الموقع تلقائياً',
  sectionCalculation: 'حساب المواقيت',
  calculationMethod: 'طريقة الحساب',
  asrCalculation: 'مذهب العصر',
  standardLabel: 'الجمهور',
  hanafiLabel: 'الحنفي',
  highLatitudeRule: 'قواعد خطوط العرض العليا',
  timeFormat: 'تنسيق الوقت',
  format12h: '١٢ ساعة',
  format24h: '٢٤ ساعة',
  sectionNotifications: 'التنبيهات والصوت',
  prayerReminders: 'تنبيهات الصلاة',
  notificationSound: 'صوت الأذان والتنبيه',
  soundHint:
    'تعمل أصوات أذان الحرمين والمشايخ أو ملفك الصوتي الخاص عند فتح التطبيق، وتستخدم التنبيهات في الخلفية نغمة الجهاز.',
  uploadCustomSound: 'رفع صوت مخصص (MP3, M4A, WAV)',
  replaceCustomSound: 'تغيير الصوت المخصص',
  removeCustomSound: 'حذف',
  customSoundStored: 'محفوظ محلياً دون إنترنت',
  stopPreview: 'إيقاف',
  previewSound: 'معاينة الصوت',
  sendTestReminder: 'إرسال تنبيه تجريبي',
  sendingTest: 'جاري الإرسال…',
  testReminderHint: 'أرسل تنبيهاً تجريبياً للتحقق من وصول الإشعارات.',
  testReminderIOSHint: 'أضف التطبيق إلى الشاشة الرئيسية أولاً لتجربة إشعارات iOS.',
  sectionAdjustments: 'تعديل المواقيت يدوياً',
  resetAll: 'إعادة ضبط',
  sectionAppearance: 'المظهر واللغة',
  themeLabel: 'المظهر',
  themeLight: 'فاتح',
  themeDark: 'داكن',
  themeSystem: 'النظام',
  languageLabel: 'اللغة',
  sectionAboutPrivacy: 'حول التطبيق والخصوصية',
  installedLabel: 'مثبّت',
  installAppBtn: 'تثبيت التطبيق',
  installInstructionsTitle: 'تعليمات التثبيت',
  installInstructionsDesc:
    'على آيفون وآيباد، افتح نويژ في سفاري، اضغط على مشاركة ثم اختر إضافة إلى الشاشة الرئيسية.',
  openStepGuide: 'عرض الخطوات التفصيلية',
  privacyTitle: 'الخصوصية',
  privacyDesc:
    'لا يتطلب نويژ إنشاء حساب، ويحسب المواقيت محلياً على جهازك دون إعلانات أو تتبع.',
  selectLocation: 'اختر الموقع',
  searchCityPlaceholder: 'ابحث عن مدينة أو دولة…',
  noCitiesFound: 'لم يتم العثور على مدن مطابقة.',
  prayers: {
    fajr: 'الفجر',
    sunrise: 'الشروق',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء',
  },
  prayerArrived: (p) =>
    p === 'sunrise'
      ? 'حان وقت الشروق.'
      : `حان وقت صلاة ${AR.prayers[p]}.`,
};

const TR: TranslationStrings = {
  ...EN,
  tagline: 'Cebinizde bir mescit.',
  landingDesc:
    'Nwezh günlük namaz vakitlerini hesaplar ve vakit girdiğinde sizi sessizce hatırlatır — çevrimdışı çalışır, reklamsız ve gizlilik odaklıdır.',
  installNwezh: 'Nwezh’i Yükle',
  openInBrowser: 'Tarayıcıda aç',
  navToday: 'Bugün',
  navSettings: 'Ayarlar',
  installShort: 'Yükle',
  nextPrayer: 'Sıradaki vakit',
  nextPrayerTomorrow: 'Sıradaki vakit · Yarın',
  remaining: 'Kalan süre',
  currentWindow: 'Mevcut vakit',
  prayerSchedule: 'Namaz Vakitleri',
  today: 'Bugün',
  tomorrow: 'Yarın',
  statusNext: 'Sıradaki',
  statusCurrent: 'Şimdi',
  statusPassed: 'Geçti',
  statusUpcoming: 'Yaklaşıyor',
  settingsTitle: 'Ayarlar',
  settingsSubtitle: 'Hesaplama, bildirimler, dil ve ses tercihleri.',
  sectionLocation: 'Konum',
  detectAutomatically: 'Konumu Otomatik Bul',
  sectionCalculation: 'Vakit Hesaplama',
  calculationMethod: 'Hesaplama Yöntemi',
  asrCalculation: 'İkindi Hesaplama',
  standardLabel: 'Standart',
  hanafiLabel: 'Hanefi',
  timeFormat: 'Saat Biçimi',
  sectionNotifications: 'Bildirimler ve Ses',
  prayerReminders: 'Namaz Hatırlatıcıları',
  notificationSound: 'Ezan ve Bildirim Sesi',
  uploadCustomSound: 'Özel ses yükle (MP3, M4A, WAV)',
  previewSound: 'Dinle',
  stopPreview: 'Durdur',
  sendTestReminder: 'Test Bildirimi Gönder',
  sectionAdjustments: 'Manuel Vakit Ayarları',
  sectionAppearance: 'Görünüm ve Dil',
  themeLabel: 'Tema',
  themeLight: 'Açık',
  themeDark: 'Koyu',
  themeSystem: 'Sistem',
  languageLabel: 'Dil',
  selectLocation: 'Konum Seçin',
  searchCityPlaceholder: 'Şehir veya ülke ara…',
  prayers: {
    fajr: 'İmsak',
    sunrise: 'Güneş',
    dhuhr: 'Öğle',
    asr: 'İkindi',
    maghrib: 'Akşam',
    isha: 'Yatsı',
  },
  prayerArrived: (p) =>
    p === 'sunrise'
      ? 'Güneş doğuş vakti.'
      : `${TR.prayers[p]} vakti girdi.`,
};

const UR: TranslationStrings = {
  ...EN,
  tagline: 'آپ کی جیب میں ایک مسجد۔',
  landingDesc:
    'نویژ روزانہ نماز کے اوقات کا حساب رکھتا ہے اور ہر نماز کا وقت آنے پر آپ کو خاموشی سے یاد دلاتا ہے — آف لائن اور بغیر اشتہارات کے۔',
  installNwezh: 'نویژ انسٹال کریں',
  openInBrowser: 'براؤزر میں کھولیں',
  navToday: 'آج',
  navSettings: 'ترتیبات',
  installShort: 'انسٹال',
  nextPrayer: 'اگلی نماز',
  nextPrayerTomorrow: 'اگلی نماز · کل',
  remaining: 'باقی وقت',
  currentWindow: 'موجودہ وقت',
  prayerSchedule: 'نماز کا شیڈول',
  today: 'آج',
  tomorrow: 'کل',
  statusNext: 'اگلی',
  statusCurrent: 'جاری',
  statusPassed: 'گزر گئی',
  statusUpcoming: 'آنے والی',
  settingsTitle: 'ترتیبات',
  sectionLocation: 'مقام',
  sectionCalculation: 'حساب کا طریقہ',
  sectionNotifications: 'اطلاعات اور آواز',
  notificationSound: 'اذان اور اطلاع کی آواز',
  uploadCustomSound: 'اپنی آواز اپلوڈ کریں (MP3, M4A, WAV)',
  sectionAppearance: 'ظاہری شکل اور زبان',
  themeLabel: 'تھیم',
  themeLight: 'روشن',
  themeDark: 'تاریک',
  themeSystem: 'سسٹم',
  languageLabel: 'زبان',
  selectLocation: 'مقام منتخب کریں',
  searchCityPlaceholder: 'شہر یا ملک تلاش کریں…',
  prayers: {
    fajr: 'فجر',
    sunrise: 'طلوع آفتاب',
    dhuhr: 'ظہر',
    asr: 'عصر',
    maghrib: 'مغرب',
    isha: 'عشاء',
  },
  prayerArrived: (p) =>
    p === 'sunrise'
      ? 'طلوع آفتاب کا وقت ہو گیا ہے۔'
      : `نماز ${UR.prayers[p]} کا وقت ہو گیا ہے۔`,
};

const FR: TranslationStrings = {
  ...EN,
  tagline: 'Une mosquée dans votre poche.',
  landingDesc:
    'Nwezh suit vos horaires de prière quotidiens et vous rappelle calmement chaque prière — hors ligne, privé et sans distraction.',
  installNwezh: 'Installer Nwezh',
  openInBrowser: 'Ouvrir dans le navigateur',
  navToday: 'Aujourd’hui',
  navSettings: 'Réglages',
  installShort: 'Installer',
  nextPrayer: 'Prochaine prière',
  nextPrayerTomorrow: 'Prochaine prière · Demain',
  remaining: 'Temps restant',
  currentWindow: 'Période actuelle',
  prayerSchedule: 'Horaires du jour',
  today: 'Aujourd’hui',
  tomorrow: 'Demain',
  statusNext: 'Suivante',
  statusCurrent: 'En cours',
  statusPassed: 'Passée',
  statusUpcoming: 'À venir',
  settingsTitle: 'Réglages',
  sectionLocation: 'Localisation',
  sectionCalculation: 'Calcul des prières',
  sectionNotifications: 'Notifications et son',
  notificationSound: 'Son de l’Adhan et rappel',
  uploadCustomSound: 'Importer un son personnalisé (MP3, M4A, WAV)',
  sectionAppearance: 'Apparence et langue',
  themeLabel: 'Thème',
  themeLight: 'Clair',
  themeDark: 'Sombre',
  themeSystem: 'Système',
  languageLabel: 'Langue',
  selectLocation: 'Choisir un lieu',
  searchCityPlaceholder: 'Rechercher une ville…',
  prayers: {
    fajr: 'Fajr',
    sunrise: 'Lever du soleil',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',
  },
  prayerArrived: (p) =>
    p === 'sunrise'
      ? 'Le lever du soleil a commencé.'
      : `L’heure de ${FR.prayers[p]} est arrivée.`,
};

const ID: TranslationStrings = {
  ...EN,
  tagline: 'Masjid di dalam saku Anda.',
  landingDesc:
    'Nwezh menghitung jadwal sholat harian dan mengingatkan Anda dengan tenang saat waktu sholat tiba — siap offline, privat, tanpa iklan.',
  installNwezh: 'Pasang Nwezh',
  openInBrowser: 'Buka di browser',
  navToday: 'Hari Ini',
  navSettings: 'Pengaturan',
  installShort: 'Pasang',
  nextPrayer: 'Sholat berikutnya',
  nextPrayerTomorrow: 'Sholat berikutnya · Besok',
  remaining: 'Tersisa',
  currentWindow: 'Waktu saat ini',
  prayerSchedule: 'Jadwal Sholat',
  today: 'Hari Ini',
  tomorrow: 'Besok',
  statusNext: 'Berikutnya',
  statusCurrent: 'Saat ini',
  statusPassed: 'Lewat',
  statusUpcoming: 'Akan datang',
  settingsTitle: 'Pengaturan',
  sectionLocation: 'Lokasi',
  sectionCalculation: 'Perhitungan Sholat',
  sectionNotifications: 'Notifikasi & Suara',
  notificationSound: 'Suara Adzan & Pengingat',
  uploadCustomSound: 'Unggah suara kustom (MP3, M4A, WAV)',
  sectionAppearance: 'Tampilan & Bahasa',
  themeLabel: 'Tema',
  themeLight: 'Terang',
  themeDark: 'Gelap',
  themeSystem: 'Sistem',
  languageLabel: 'Bahasa',
  selectLocation: 'Pilih Lokasi',
  searchCityPlaceholder: 'Cari kota atau negara…',
  prayers: {
    fajr: 'Subuh',
    sunrise: 'Terbit',
    dhuhr: 'Dzuhur',
    asr: 'Ashar',
    maghrib: 'Maghrib',
    isha: 'Isya',
  },
  prayerArrived: (p) =>
    p === 'sunrise'
      ? 'Waktu terbit matahari telah tiba.'
      : `Waktu sholat ${ID.prayers[p]} telah tiba.`,
};

const TRANSLATIONS: Record<LanguageId, TranslationStrings> = {
  en: EN,
  'ku-latn': KU_LATN,
  ckb: CKB,
  ar: AR,
  tr: TR,
  ur: UR,
  fr: FR,
  id: ID,
};

export function getTranslations(lang: LanguageId | undefined): TranslationStrings {
  return TRANSLATIONS[lang || 'en'] || EN;
}
