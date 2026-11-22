// 移动端轻量化 Web Audio API 音效反馈（无需外部音频文件）

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    try {
      audioCtx = new Ctx();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export type SoundKind = 'tap' | 'turn' | 'vote' | 'night' | 'dawn' | 'win';

export function playSound(kind: SoundKind, enabled = true) {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const playTone = (
    freq: number,
    duration: number,
    delay = 0,
    type: OscillatorType = 'sine',
    gainVal = 0.045,
  ) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now + delay);
    gain.gain.setValueAtTime(0.0001, now + delay);
    gain.gain.exponentialRampToValueAtTime(gainVal, now + delay + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + delay);
    osc.stop(now + delay + duration + 0.02);
  };

  switch (kind) {
    case 'tap':
      playTone(520, 0.06, 0, 'triangle', 0.03);
      break;
    case 'turn':
      playTone(440, 0.14, 0, 'sine', 0.04);
      playTone(587.33, 0.18, 0.07, 'sine', 0.04);
      break;
    case 'vote':
      playTone(659.25, 0.12, 0, 'triangle', 0.045);
      playTone(880, 0.16, 0.08, 'sine', 0.035);
      break;
    case 'night':
      playTone(329.63, 0.28, 0, 'sine', 0.04);
      playTone(246.94, 0.36, 0.14, 'sine', 0.035);
      break;
    case 'dawn':
      playTone(392.0, 0.2, 0, 'sine', 0.04);
      playTone(493.88, 0.22, 0.1, 'sine', 0.04);
      playTone(587.33, 0.3, 0.2, 'sine', 0.04);
      break;
    case 'win':
      playTone(440, 0.18, 0, 'triangle', 0.045);
      playTone(554.37, 0.18, 0.1, 'triangle', 0.045);
      playTone(659.25, 0.22, 0.2, 'triangle', 0.045);
      playTone(880, 0.36, 0.32, 'sine', 0.05);
      break;
  }
}
