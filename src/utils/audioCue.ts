import {
  NOTIFICATION_SOUNDS,
  type NotificationSoundId,
} from '../../shared/prayerEngine';
import {loadCustomSoundFile} from './customSoundDb';

let audioCtx: AudioContext | null = null;
let activeHtmlAudio: HTMLAudioElement | null = null;
let activeObjectUrl: string | null = null;
let activePlayingId: NotificationSoundId | null = null;
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

export function stopPrayerCue() {
  if (activeHtmlAudio) {
    try {
      activeHtmlAudio.pause();
      activeHtmlAudio.currentTime = 0;
    } catch {
      // ignore
    }
    activeHtmlAudio = null;
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
    void audioCtx.resume();
  }
  return audioCtx;
}

function playSynthTones(
  notes: Array<{freq: number; delay: number; peak: number; decay: number}>
) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
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
    osc.stop(now + n.delay + n.decay + 0.05);
  }
}

export async function playPrayerCue(sound: NotificationSoundId): Promise<void> {
  stopPrayerCue();
  if (sound === 'off') return;

  if (sound === 'chime') {
    playSynthTones([
      {freq: 523.25, delay: 0, peak: 0.14, decay: 1.3},
      {freq: 783.99, delay: 0.22, peak: 0.14, decay: 1.5},
    ]);
    return;
  }

  if (sound === 'bell') {
    playSynthTones([
      {freq: 293.66, delay: 0, peak: 0.16, decay: 2.2},
      {freq: 587.33, delay: 0, peak: 0.06, decay: 1.4},
    ]);
    return;
  }

  if (sound === 'takbir') {
    playSynthTones([
      {freq: 392.0, delay: 0, peak: 0.12, decay: 0.9},
      {freq: 440.0, delay: 0.28, peak: 0.12, decay: 1.0},
      {freq: 587.33, delay: 0.56, peak: 0.14, decay: 1.8},
    ]);
    return;
  }

  if (sound === 'custom') {
    const custom = await loadCustomSoundFile();
    if (!custom) {
      // Fallback to gentle chime if custom file was cleared
      playSynthTones([
        {freq: 523.25, delay: 0, peak: 0.14, decay: 1.3},
        {freq: 783.99, delay: 0.22, peak: 0.14, decay: 1.5},
      ]);
      return;
    }
    const url = URL.createObjectURL(custom.blob);
    activeObjectUrl = url;
    const audio = new Audio(url);
    activeHtmlAudio = audio;
    activePlayingId = 'custom';
    notifyListeners();
    audio.onended = () => stopPrayerCue();
    audio.onerror = () => stopPrayerCue();
    await audio.play().catch(() => stopPrayerCue());
    return;
  }

  const meta = NOTIFICATION_SOUNDS.find((s) => s.id === sound);
  if (!meta?.src) return;

  const audio = new Audio(meta.src);
  activeHtmlAudio = audio;
  activePlayingId = sound;
  notifyListeners();
  audio.onended = () => stopPrayerCue();
  audio.onerror = () => stopPrayerCue();
  await audio.play().catch(() => stopPrayerCue());
}
