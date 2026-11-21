import {
  NOTIFICATION_SOUNDS,
  type NotificationSoundId,
} from '../../shared/prayerEngine';
import {loadCustomSoundFile} from './customSoundDb';

// Minimal valid 44-byte silent PCM WAV used solely to bless HTMLAudioElement
// inside a synchronous user gesture for iOS Safari / WebKit post-await playback.
const SILENT_WAV_DATA_URI =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

let audioCtx: AudioContext | null = null;
let sharedAudioElement: HTMLAudioElement | null = null;
let htmlAudioUnlocked = false;
let activeObjectUrl: string | null = null;
let activePlayingId: NotificationSoundId | null = null;
let activeSynthTimer: number | null = null;
const listeners = new Set<(playingId: NotificationSoundId | null) => void>();

function notifyListeners() {
  for (const cb of listeners) {
    cb(activePlayingId);
  }
}

export function subscribeAudioState(
  cb: (playingId: NotificationSoundId | null) => void
): () => void {
  listeners.add(cb);
  cb(activePlayingId);
  return () => {
    listeners.delete(cb);
  };
}

function getSharedAudioElement(): HTMLAudioElement | null {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') {
    return null;
  }
  if (!sharedAudioElement) {
    sharedAudioElement = new Audio();
    sharedAudioElement.preload = 'auto';
  }
  return sharedAudioElement;
}

export function stopPrayerCue() {
  if (activeSynthTimer !== null && typeof window !== 'undefined') {
    window.clearTimeout(activeSynthTimer);
    activeSynthTimer = null;
  }
  if (sharedAudioElement) {
    try {
      sharedAudioElement.onended = null;
      sharedAudioElement.onerror = null;
      sharedAudioElement.pause();
      sharedAudioElement.currentTime = 0;
    } catch {
      // ignore
    }
  }
  if (activeObjectUrl) {
    URL.revokeObjectURL(activeObjectUrl);
    activeObjectUrl = null;
  }
  if (activePlayingId !== null) {
    activePlayingId = null;
    notifyListeners();
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as {webkitAudioContext?: typeof AudioContext})
      .webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) {
    audioCtx = new Ctor();
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Must be called synchronously inside a user tap/click before any `await`
 * so iOS Safari and desktop browsers keep both Web Audio and HTMLAudioElement
 * unlocked after asynchronous permission prompts or push API requests.
 */
export function unlockAudioPlayback() {
  if (typeof window === 'undefined') return;

  const ctx = getAudioContext();
  if (ctx) {
    try {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch {
      // ignore
    }
  }

  if (activePlayingId === null && !htmlAudioUnlocked) {
    const el = getSharedAudioElement();
    if (el) {
      try {
        el.muted = true;
        el.src = SILENT_WAV_DATA_URI;
        const p = el.play();
        if (p) {
          void p
            .then(() => {
              if (activePlayingId === null) {
                el.pause();
                el.currentTime = 0;
              }
              el.muted = false;
              htmlAudioUnlocked = true;
            })
            .catch(() => {
              el.muted = false;
            });
        } else {
          el.muted = false;
          htmlAudioUnlocked = true;
        }
      } catch {
        el.muted = false;
      }
    }
  }
}

function playSynthTones(
  sound: NotificationSoundId,
  notes: Array<{freq: number; delay: number; peak: number; decay: number}>
): boolean {
  const ctx = getAudioContext();
  if (!ctx) return false;
  const now = ctx.currentTime;
  let maxEnd = 0;

  for (const n of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(n.freq, now + n.delay);
    gain.gain.setValueAtTime(0.0001, now + n.delay);
    gain.gain.exponentialRampToValueAtTime(n.peak, now + n.delay + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + n.delay + n.decay);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + n.delay);
    const end = n.delay + n.decay + 0.05;
    osc.stop(now + end);
    if (end > maxEnd) maxEnd = end;
  }

  activePlayingId = sound;
  notifyListeners();
  if (typeof window !== 'undefined') {
    activeSynthTimer = window.setTimeout(
      () => {
        activeSynthTimer = null;
        if (activePlayingId === sound) {
          activePlayingId = null;
          notifyListeners();
        }
      },
      Math.ceil(maxEnd * 1000) + 80
    );
  }
  return true;
}

async function playHtmlAudioSource(
  sound: NotificationSoundId,
  src: string
): Promise<boolean> {
  const el = getSharedAudioElement();
  if (!el) return false;

  el.muted = false;
  el.src = src;
  el.currentTime = 0;
  activePlayingId = sound;
  notifyListeners();

  el.onended = () => stopPrayerCue();
  el.onerror = () => stopPrayerCue();

  try {
    await el.play();
    htmlAudioUnlocked = true;
    return true;
  } catch {
    stopPrayerCue();
    return false;
  }
}

export async function prefetchAdhanAudio(sound: NotificationSoundId): Promise<void> {
  const meta = NOTIFICATION_SOUNDS.find((s) => s.id === sound);
  if (!meta?.src || typeof fetch === 'undefined') return;
  await fetch(meta.src, {cache: 'force-cache'}).catch(() => {});
}

export async function playPrayerCue(
  sound: NotificationSoundId
): Promise<boolean> {
  stopPrayerCue();
  if (sound === 'off') return false;

  if (sound === 'chime') {
    return playSynthTones('chime', [
      {freq: 523.25, delay: 0, peak: 0.16, decay: 1.3},
      {freq: 783.99, delay: 0.22, peak: 0.16, decay: 1.5},
    ]);
  }

  if (sound === 'bell') {
    return playSynthTones('bell', [
      {freq: 293.66, delay: 0, peak: 0.18, decay: 2.2},
      {freq: 587.33, delay: 0, peak: 0.08, decay: 1.4},
    ]);
  }

  if (sound === 'takbir') {
    return playSynthTones('takbir', [
      {freq: 392.0, delay: 0, peak: 0.14, decay: 0.9},
      {freq: 440.0, delay: 0.28, peak: 0.14, decay: 1.0},
      {freq: 587.33, delay: 0.56, peak: 0.16, decay: 1.8},
    ]);
  }

  if (sound === 'custom') {
    const custom = await loadCustomSoundFile();
    if (!custom) {
      return playSynthTones('chime', [
        {freq: 523.25, delay: 0, peak: 0.16, decay: 1.3},
        {freq: 783.99, delay: 0.22, peak: 0.16, decay: 1.5},
      ]);
    }
    const typedBlob =
      custom.blob.type && custom.blob.type.length > 0
        ? custom.blob
        : new Blob([custom.blob], {type: custom.type || 'audio/mpeg'});
    const url = URL.createObjectURL(typedBlob);
    activeObjectUrl = url;
    return await playHtmlAudioSource('custom', url);
  }

  const meta = NOTIFICATION_SOUNDS.find((s) => s.id === sound);
  if (!meta?.src) return false;

  return await playHtmlAudioSource(sound, meta.src);
}
