import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import http from 'node:http';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import type webpushType from 'web-push';
import {
  computeDaySchedule,
  getDateKeyInZone,
  getPrayerArrivalCopy,
  getTimePartsInZone,
  PRAYER_ORDER,
  type AppLanguage,
  type AsrMethodId,
  type CalculationMethodId,
  type EnabledPrayers,
  type HighLatitudeRuleId,
  type PrayerAdjustments,
  type PrayerLocation,
  type PrayerName,
} from './shared/prayerEngine.ts';

const require = createRequire(import.meta.url);
const webpush = require('web-push') as typeof webpushType;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '.nwezh-data');
const VAPID_FILE = path.join(DATA_DIR, 'vapid.json');
const SUBS_FILE = path.join(DATA_DIR, 'subscriptions.json');

interface VapidKeys {
  publicKey: string;
  privateKey: string;
}

interface StoredSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  location: PrayerLocation;
  method: CalculationMethodId;
  asrMethod: AsrMethodId;
  highLatitudeRule: HighLatitudeRuleId;
  adjustments: PrayerAdjustments;
  timeFormat: '12h' | '24h';
  language: AppLanguage;
  enabled: boolean;
  prayers: EnabledPrayers;
  silent: boolean;
  lastSentKeys: Record<string, string>;
  updatedAt: string;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {recursive: true});
  }
}

function loadOrGenerateVapidKeys(): VapidKeys {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    return {
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY,
    };
  }
  ensureDataDir();
  if (fs.existsSync(VAPID_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(VAPID_FILE, 'utf8')) as VapidKeys;
      if (parsed.publicKey && parsed.privateKey) {
        return parsed;
      }
    } catch {
      // regenerate below
    }
  }
  const generated = webpush.generateVAPIDKeys();
  fs.writeFileSync(VAPID_FILE, JSON.stringify(generated, null, 2), 'utf8');
  return generated;
}

function loadSubscriptions(): Map<string, StoredSubscription> {
  ensureDataDir();
  const map = new Map<string, StoredSubscription>();
  if (!fs.existsSync(SUBS_FILE)) return map;
  try {
    const arr = JSON.parse(fs.readFileSync(SUBS_FILE, 'utf8')) as StoredSubscription[];
    if (Array.isArray(arr)) {
      for (const item of arr) {
        if (item?.endpoint && item?.keys?.p256dh && item?.keys?.auth) {
          map.set(item.endpoint, item);
        }
      }
    }
  } catch {
    // start fresh if corrupted
  }
  return map;
}

function saveSubscriptions(map: Map<string, StoredSubscription>) {
  ensureDataDir();
  fs.writeFileSync(SUBS_FILE, JSON.stringify(Array.from(map.values()), null, 2), 'utf8');
}

const vapidKeys = loadOrGenerateVapidKeys();
process.env.VITE_VAPID_PUBLIC_KEY = vapidKeys.publicKey;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:reminders@nwezh.app';
webpush.setVapidDetails(vapidSubject, vapidKeys.publicKey, vapidKeys.privateKey);

const subscriptions = loadSubscriptions();

async function dispatchPrayerPush(
  sub: StoredSubscription,
  prayer: PrayerName,
  formattedTime: string,
  dateKey: string
) {
  const copy = getPrayerArrivalCopy(prayer, sub.language || 'en');
  const payload = JSON.stringify({
    title: 'Nwezh',
    body: formattedTime ? `${copy} (${formattedTime})` : copy,
    tag: `nwezh-${dateKey}-${prayer}`,
    prayer,
    url: '/',
    silent: sub.silent,
  });

  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: sub.keys,
      },
      payload,
      {TTL: 300}
    );
  } catch (err: unknown) {
    const statusCode =
      typeof err === 'object' && err !== null && 'statusCode' in err
        ? Number((err as {statusCode: number}).statusCode)
        : 0;
    if (statusCode === 404 || statusCode === 410) {
      subscriptions.delete(sub.endpoint);
      saveSubscriptions(subscriptions);
    }
  }
}

async function runNotificationTick() {
  if (subscriptions.size === 0) return;
  const now = new Date();
  let mutated = false;

  for (const sub of subscriptions.values()) {
    if (!sub.enabled) continue;
    const tz = sub.location?.timezone || 'UTC';
    const nowParts = getTimePartsInZone(now, tz);
    const dateKey = getDateKeyInZone(now, tz);

    const schedule = computeDaySchedule(now, {
      location: sub.location,
      method: sub.method,
      asrMethod: sub.asrMethod,
      highLatitudeRule: sub.highLatitudeRule,
      adjustments: sub.adjustments,
      timeFormat: sub.timeFormat,
    });

    for (const prayer of PRAYER_ORDER) {
      if (!sub.prayers?.[prayer]) continue;
      if (sub.lastSentKeys?.[prayer] === dateKey) continue;

      const prayerTime = schedule.timesMap[prayer];
      const prayerParts = getTimePartsInZone(prayerTime, tz);

      const nowMinutes = nowParts.hour * 60 + nowParts.minute;
      const prayerMinutes = prayerParts.hour * 60 + prayerParts.minute;

      if (nowMinutes === prayerMinutes) {
        const entry = schedule.entries.find((e) => e.id === prayer);
        sub.lastSentKeys = sub.lastSentKeys || {};
        sub.lastSentKeys[prayer] = dateKey;
        mutated = true;
        await dispatchPrayerPush(
          sub,
          prayer,
          entry?.formattedTime || '',
          dateKey
        );
      }
    }
  }

  if (mutated) {
    saveSubscriptions(subscriptions);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({limit: '256kb'}));

  app.get('/api/health', (_req, res) => {
    res.json({ok: true, subscribers: subscriptions.size});
  });

  app.use('/api/push', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  app.get('/api/push/vapid-public-key', (_req, res) => {
    res.json({publicKey: vapidKeys.publicKey});
  });

  app.post('/api/push/subscribe', (req, res) => {
    const body = req.body as Partial<StoredSubscription>;
    if (
      !body?.endpoint ||
      !body?.keys?.p256dh ||
      !body?.keys?.auth ||
      !body?.location ||
      typeof body.location.lat !== 'number' ||
      typeof body.location.lng !== 'number'
    ) {
      res.status(400).json({error: 'Invalid push subscription payload.'});
      return;
    }

    const existing = subscriptions.get(body.endpoint);
    const record: StoredSubscription = {
      endpoint: body.endpoint,
      keys: {
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
      },
      location: body.location,
      method: body.method || 'MuslimWorldLeague',
      asrMethod: body.asrMethod || 'Shafi',
      highLatitudeRule: body.highLatitudeRule || 'Auto',
      adjustments: body.adjustments || {
        fajr: 0,
        sunrise: 0,
        dhuhr: 0,
        asr: 0,
        maghrib: 0,
        isha: 0,
      },
      timeFormat: body.timeFormat || '12h',
      language: body.language || 'en',
      enabled: body.enabled !== false,
      prayers: body.prayers || {
        fajr: true,
        sunrise: false,
        dhuhr: true,
        asr: true,
        maghrib: true,
        isha: true,
      },
      silent: Boolean(body.silent),
      lastSentKeys: existing?.lastSentKeys || {},
      updatedAt: new Date().toISOString(),
    };

    subscriptions.set(record.endpoint, record);
    saveSubscriptions(subscriptions);
    res.json({ok: true});
  });

  app.post('/api/push/unsubscribe', (req, res) => {
    const {endpoint} = req.body as {endpoint?: string};
    if (endpoint && subscriptions.has(endpoint)) {
      subscriptions.delete(endpoint);
      saveSubscriptions(subscriptions);
    }
    res.json({ok: true});
  });

  app.post('/api/push/test', async (req, res) => {
    const {endpoint, keys, silent, language} = req.body as {
      endpoint?: string;
      keys?: {p256dh?: string; auth?: string};
      silent?: boolean;
      language?: AppLanguage;
    };

    const stored = endpoint ? subscriptions.get(endpoint) : undefined;
    const targetSub =
      endpoint && keys?.p256dh && keys?.auth
        ? {endpoint, keys: {p256dh: keys.p256dh, auth: keys.auth}}
        : stored
          ? {endpoint: stored.endpoint, keys: stored.keys}
          : null;

    if (!targetSub) {
      res.status(404).json({error: 'No active push subscription found for this device.'});
      return;
    }

    try {
      const lang = language || stored?.language || 'en';
      await webpush.sendNotification(
        targetSub,
        JSON.stringify({
          title: 'Nwezh',
          body: getPrayerArrivalCopy('asr', lang),
          tag: `nwezh-test-${Date.now()}`,
          prayer: 'asr',
          url: '/',
          silent: Boolean(silent),
        }),
        {TTL: 60}
      );
      res.json({ok: true});
    } catch (err: unknown) {
      const statusCode =
        typeof err === 'object' && err !== null && 'statusCode' in err
          ? Number((err as {statusCode: number}).statusCode)
          : 500;
      if (statusCode === 404 || statusCode === 410) {
        subscriptions.delete(targetSub.endpoint);
        saveSubscriptions(subscriptions);
      }
      res.status(502).json({
        error: 'Push service rejected the notification. Please re-enable notifications.',
      });
    }
  });

  async function resolveTimezoneForCoords(
    lat: number,
    lng: number
  ): Promise<string | null> {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1400);
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&timezone=auto&forecast_days=1`,
        {signal: controller.signal}
      );
      clearTimeout(timer);
      if (!res.ok) return null;
      const data = (await res.json()) as {timezone?: string};
      return typeof data.timezone === 'string' && data.timezone.includes('/')
        ? data.timezone
        : null;
    } catch {
      return null;
    }
  }

  app.get('/api/cities', async (req, res) => {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) {
      res.json({results: []});
      return;
    }
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&featuretype=city&limit=8&q=${encodeURIComponent(q)}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'NwezhPWA/1.0 (prayer-times-lookup)',
          'Accept-Language': 'en',
        },
      });
      if (!response.ok) {
        res.json({results: []});
        return;
      }
      const data = (await response.json()) as Array<{
        lat: string;
        lon: string;
        name?: string;
        display_name?: string;
        address?: {
          city?: string;
          town?: string;
          village?: string;
          state?: string;
          country?: string;
          country_code?: string;
        };
      }>;

      const results = await Promise.all(
        data.map(async (item) => {
          const lat = Number(item.lat);
          const lng = Number(item.lon);
          const timezone = await resolveTimezoneForCoords(lat, lng);
          return {
            name:
              item.address?.city ||
              item.address?.town ||
              item.address?.village ||
              item.name ||
              item.display_name?.split(',')[0] ||
              q,
            country: item.address?.country || '',
            countryCode: (item.address?.country_code || '').toUpperCase(),
            lat,
            lng,
            timezone: timezone || undefined,
          };
        })
      );
      res.json({results});
    } catch {
      res.json({results: []});
    }
  });

  app.get('/api/reverse-geocode', async (req, res) => {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      res.status(400).json({error: 'Invalid coordinates'});
      return;
    }
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10`;
      const [response, timezone] = await Promise.all([
        fetch(url, {
          headers: {
            'User-Agent': 'NwezhPWA/1.0 (prayer-times-lookup)',
            'Accept-Language': 'en',
          },
        }),
        resolveTimezoneForCoords(lat, lng),
      ]);
      if (!response.ok) {
        res.json({city: null, timezone: timezone || undefined});
        return;
      }
      const data = (await response.json()) as {
        address?: {
          city?: string;
          town?: string;
          village?: string;
          municipality?: string;
          state?: string;
          country?: string;
          country_code?: string;
        };
      };
      const name =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.municipality ||
        data.address?.state ||
        null;
      res.json({
        city: name
          ? {
              name,
              country: data.address?.country || '',
              countryCode: (data.address?.country_code || '').toUpperCase(),
            }
          : null,
        timezone: timezone || undefined,
      });
    } catch {
      res.json({city: null});
    }
  });

  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const {createServer: createViteServer} = await import('vite');
    const disableHmr = process.env.DISABLE_HMR === 'true';
    const disableHmrPlugin = {
      name: 'nwezh-disable-hmr-client-ws',
      enforce: 'post' as const,
      transform(code: string, id: string) {
        if (!id.replace(/\\/g, '/').endsWith('vite/dist/client/client.mjs')) {
          return null;
        }
        return code.replace(
          /const transport = normalizeModuleRunnerTransport\([\s\S]*?\}\)\(\)\);/,
          'const transport = normalizeModuleRunnerTransport({ async connect() {}, async disconnect() {}, send() {} });'
        );
      },
    };
    const vite = await createViteServer({
      plugins: disableHmr ? [disableHmrPlugin] : [],
      server: disableHmr
        ? {
            middlewareMode: true,
            hmr: false,
            ws: false,
          }
        : {
            middlewareMode: true,
            hmr: {server: httpServer},
            ws: {server: httpServer},
          },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(
      express.static(distPath, {
        setHeaders(res, filePath) {
          if (filePath.endsWith('sw.js') || filePath.endsWith('manifest.webmanifest')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          }
          if (filePath.endsWith('sw.js')) {
            res.setHeader('Service-Worker-Allowed', '/');
          }
        },
      })
    );
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        res.status(404).json({error: 'Not found'});
        return;
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  setInterval(() => {
    void runNotificationTick();
  }, 20_000);

  const PORT = 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Nwezh server listening on http://0.0.0.0:${PORT}`);
  });
}

void startServer();
