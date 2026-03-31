/**
 * Web Audio API 기반 사운드 엔진
 *
 * 외부 오디오 파일 없이 oscillator + gain으로 모든 사운드를 프로그래밍합니다.
 * SSR 환경(Next.js)에서 안전하게 동작하도록 브라우저 전용 API를 lazy init합니다.
 */

interface SoundConfig {
  frequency: number;
  type: OscillatorType;
  duration: number;    // 초
  attack: number;      // 초
  decay: number;       // 초
  sustain: number;     // 0~1
  release: number;     // 초
  gainPeak: number;    // 0~1
}

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private initialized = false;
  private volume = 0.5;

  /**
   * AudioContext 초기화
   * 브라우저 정책상 반드시 사용자 제스처 이후에 호출해야 합니다.
   */
  async init(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') return;

    const AudioCtxClass =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioCtxClass) {
      console.warn('SoundEngine: Web Audio API not supported');
      return;
    }

    this.ctx = new AudioCtxClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // 일시정지 상태일 경우 resume
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.initialized = true;
  }

  /** 마스터 볼륨 설정 (0 ~ 1) */
  setVolume(value: number): void {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  /** 초기화 여부 */
  isReady(): boolean {
    return this.initialized && this.ctx !== null;
  }

  // ──────────────────────────────────────
  // Public sound methods
  // ──────────────────────────────────────

  /** 노이즈 버퍼 생성 (기계식 키보드 클릭 시뮬레이션용) */
  private createNoiseBuffer(duration: number): AudioBuffer {
    const ctx = this.ctx!;
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    return buffer;
  }

  /** 실제 기계식 키보드 클릭음 (노이즈 burst + 필터) */
  playKeyClick(): void {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // 노이즈 버스트로 클릭 임팩트
    const noiseBuffer = this.createNoiseBuffer(0.04);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    // 밴드패스 필터로 클릭 질감
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(4000, now);
    filter.Q.setValueAtTime(1.2, now);

    // 빠른 감쇄 엔벨로프
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + 0.04);

    // 짧은 톤 탭 (키캡 바운스)
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.015);
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.08, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.025);
  }

  /** 오타 에러음 (낮은 더프 사운드) */
  playKeyError(): void {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // 둔탁한 노이즈
    const noiseBuffer = this.createNoiseBuffer(0.08);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(0.7, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + 0.08);

    // 낮은 버즈
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.12, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  /** 스페이스바 입력음 (부드러운 두드림) */
  playSpace(): void {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const noiseBuffer = this.createNoiseBuffer(0.06);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.Q.setValueAtTime(0.8, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + 0.06);
  }

  /**
   * 연타 콤보 사운드
   * count가 클수록 높고 밝은 음
   *
   * @param count - 콤보 카운트 (예: 10, 20, 30...)
   */
  playCombo(count: number): void {
    if (!this.ctx) return;

    const baseFreq = 523.25;  // C5
    const step = Math.min(Math.floor(count / 10), 7);  // 최대 7단계
    const freqs = [baseFreq, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];
    const freq = freqs[step] ?? freqs[freqs.length - 1];

    // 짧은 아르페지오 (2음)
    this.playToneAt(freq, 0, {
      type: 'triangle',
      duration: 0.12,
      attack: 0.01,
      decay: 0.04,
      sustain: 0.5,
      release: 0.06,
      gainPeak: 0.2,
    });
    this.playToneAt(freq * 1.25, 0.08, {
      type: 'triangle',
      duration: 0.12,
      attack: 0.01,
      decay: 0.04,
      sustain: 0.5,
      release: 0.06,
      gainPeak: 0.25,
    });
  }

  /**
   * 레벨업 팡파르
   * 상승하는 아르페지오로 성취감 표현
   */
  playLevelUp(): void {
    if (!this.ctx) return;

    // C4-E4-G4-C5 메이저 코드 아르페지오
    const notes = [261.63, 329.63, 392.0, 523.25];
    notes.forEach((freq, i) => {
      this.playToneAt(freq, i * 0.1, {
        type: 'triangle',
        duration: 0.3,
        attack: 0.01,
        decay: 0.05,
        sustain: 0.6,
        release: 0.2,
        gainPeak: 0.3,
      });
    });

    // 마지막에 화음
    setTimeout(() => {
      this.playTone({ frequency: 523.25, type: 'sine', duration: 0.5, attack: 0.02, decay: 0.1, sustain: 0.7, release: 0.3, gainPeak: 0.25 });
      this.playTone({ frequency: 659.25, type: 'sine', duration: 0.5, attack: 0.02, decay: 0.1, sustain: 0.7, release: 0.3, gainPeak: 0.2 });
      this.playTone({ frequency: 783.99, type: 'sine', duration: 0.5, attack: 0.02, decay: 0.1, sustain: 0.7, release: 0.3, gainPeak: 0.18 });
    }, 400);
  }

  /**
   * 콤보 마일스톤 (10/20/50 연타 달성 시 승리 화음)
   * 올림 메이저 코드 + 옥타브 강조
   */
  playComboMilestone(streak: number): void {
    if (!this.ctx) return;

    // 마일스톤 크기에 따라 옥타브 상승
    const octaveShift = streak >= 50 ? 2 : streak >= 20 ? 1.5 : 1;
    const base = 261.63 * octaveShift; // C

    // 메이저 트라이어드 동시 재생
    [base, base * 1.25, base * 1.5].forEach((freq) => {
      this.playToneAt(freq, 0, {
        type: 'sine',
        duration: 0.4,
        attack: 0.01,
        decay: 0.08,
        sustain: 0.7,
        release: 0.25,
        gainPeak: 0.25,
      });
    });

    // 상승하는 옥타브 핑
    this.playToneAt(base * 2, 0.15, {
      type: 'triangle',
      duration: 0.35,
      attack: 0.01,
      decay: 0.06,
      sustain: 0.5,
      release: 0.25,
      gainPeak: 0.3,
    });
  }

  /**
   * 보스 타격음 (무겁고 짧은 임팩트)
   */
  playBossHit(): void {
    if (!this.ctx) return;

    // 저주파 펀치
    this.playTone({
      frequency: 80,
      type: 'sawtooth',
      duration: 0.2,
      attack: 0.003,
      decay: 0.06,
      sustain: 0.3,
      release: 0.12,
      gainPeak: 0.35,
    });

    // 중주파 크래시
    this.playToneAt(250, 0.01, {
      type: 'square',
      duration: 0.1,
      attack: 0.002,
      decay: 0.03,
      sustain: 0.2,
      release: 0.06,
      gainPeak: 0.2,
    });

    // 노이즈 버스트 (빠른 주파수 스윕으로 시뮬레이션)
    this.playToneAt(600, 0, {
      type: 'sawtooth',
      duration: 0.08,
      attack: 0.001,
      decay: 0.02,
      sustain: 0.1,
      release: 0.05,
      gainPeak: 0.12,
    });
  }

  /**
   * 보스 격파 (승리 팡파르)
   * 상승하는 화음 시퀀스 + 마무리 코드
   */
  playBossDefeat(): void {
    if (!this.ctx) return;

    // 1단계: 상승 아르페지오 C-E-G-B
    const fanfare = [261.63, 329.63, 392.0, 493.88];
    fanfare.forEach((freq, i) => {
      this.playToneAt(freq, i * 0.12, {
        type: 'triangle',
        duration: 0.35,
        attack: 0.01,
        decay: 0.06,
        sustain: 0.6,
        release: 0.2,
        gainPeak: 0.25,
      });
    });

    // 2단계: 풀 메이저 코드 해결 (C5 기준)
    const chordDelay = 0.55;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq) => {
      this.playToneAt(freq, chordDelay, {
        type: 'sine',
        duration: 0.8,
        attack: 0.03,
        decay: 0.15,
        sustain: 0.6,
        release: 0.5,
        gainPeak: 0.22,
      });
    });

    // 3단계: 마무리 옥타브 핑
    this.playToneAt(1046.5, chordDelay + 0.3, {
      type: 'triangle',
      duration: 0.5,
      attack: 0.02,
      decay: 0.1,
      sustain: 0.4,
      release: 0.35,
      gainPeak: 0.18,
    });
  }

  /**
   * 보스 경고음 (타이머 < 10초 시 긴장감)
   * 반복되는 저주파 펄스 + 불안한 단2도 인터벌
   */
  playBossWarning(): void {
    if (!this.ctx) return;

    // 저주파 긴장 펄스
    this.playTone({
      frequency: 110,
      type: 'sawtooth',
      duration: 0.25,
      attack: 0.01,
      decay: 0.05,
      sustain: 0.5,
      release: 0.15,
      gainPeak: 0.2,
    });

    // 단2도 위 불협화음 (긴장감)
    this.playToneAt(116.54, 0.08, {
      type: 'sawtooth',
      duration: 0.18,
      attack: 0.01,
      decay: 0.04,
      sustain: 0.4,
      release: 0.1,
      gainPeak: 0.15,
    });
  }

  /**
   * 업적 해금 (특별 차임)
   * 밝은 벨 사운드 + 글리산도 상승
   */
  playAchievementUnlock(): void {
    if (!this.ctx) return;

    // 글리산도 상승 (5음)
    const chime = [659.25, 783.99, 880, 987.77, 1174.66]; // E5-B5-D6
    chime.forEach((freq, i) => {
      this.playToneAt(freq, i * 0.07, {
        type: 'sine',
        duration: 0.2,
        attack: 0.005,
        decay: 0.04,
        sustain: 0.5,
        release: 0.12,
        gainPeak: 0.2,
      });
    });

    // 마무리 반짝이는 고음
    this.playToneAt(1318.51, 0.4, {
      type: 'sine',
      duration: 0.6,
      attack: 0.02,
      decay: 0.1,
      sustain: 0.4,
      release: 0.45,
      gainPeak: 0.18,
    });
    this.playToneAt(1567.98, 0.42, {
      type: 'sine',
      duration: 0.55,
      attack: 0.02,
      decay: 0.1,
      sustain: 0.35,
      release: 0.4,
      gainPeak: 0.14,
    });
  }

  /**
   * 스테이지 완료 (완료 징글)
   * 밝은 3화음 진행 + 해결
   */
  playStageComplete(): void {
    if (!this.ctx) return;

    // I-IV-V-I 진행 (C 메이저)
    const progression = [
      { notes: [261.63, 329.63, 392.0], time: 0 },      // I  (C-E-G)
      { notes: [349.23, 440.0, 523.25], time: 0.2 },     // IV (F-A-C)
      { notes: [392.0, 493.88, 587.33], time: 0.4 },     // V  (G-B-D)
      { notes: [523.25, 659.25, 783.99], time: 0.6 },    // I  (C5-E5-G5)
    ];

    progression.forEach(({ notes, time }) => {
      notes.forEach((freq) => {
        this.playToneAt(freq, time, {
          type: 'triangle',
          duration: 0.35,
          attack: 0.015,
          decay: 0.06,
          sustain: 0.6,
          release: 0.2,
          gainPeak: 0.2,
        });
      });
    });

    // 최종 해결 코드 (지속)
    [523.25, 659.25, 783.99, 1046.5].forEach((freq) => {
      this.playToneAt(freq, 0.85, {
        type: 'sine',
        duration: 0.7,
        attack: 0.03,
        decay: 0.12,
        sustain: 0.5,
        release: 0.5,
        gainPeak: 0.18,
      });
    });
  }

  // ──────────────────────────────────────
  // Internal helpers
  // ──────────────────────────────────────

  /** 현재 시각 기준으로 톤 재생 */
  private playTone(config: SoundConfig): void {
    this.playToneAt(config.frequency, 0, config);
  }

  /**
   * offsetSec 초 후에 톤 재생
   *
   * ADSR 엔벨로프:
   *   attack  → gainPeak 까지 선형 상승
   *   decay   → sustain * gainPeak 로 선형 하강
   *   sustain → 지속 (duration - attack - decay - release)
   *   release → 0 으로 선형 하강
   */
  private playToneAt(
    frequency: number,
    offsetSec: number,
    config: Omit<SoundConfig, 'frequency'>,
  ): void {
    if (!this.ctx || !this.masterGain) return;

    const { type, duration, attack, decay, sustain, release, gainPeak } = config;
    const now = this.ctx.currentTime + offsetSec;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);

    // ADSR 엔벨로프
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(gainPeak, now + attack);
    gainNode.gain.linearRampToValueAtTime(gainPeak * sustain, now + attack + decay);
    gainNode.gain.setValueAtTime(gainPeak * sustain, now + duration - release);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);

    // 재생 완료 후 노드 정리
    osc.onended = () => {
      osc.disconnect();
      gainNode.disconnect();
    };
  }
}

/** 싱글톤 인스턴스 (클라이언트 전용) */
let _soundEngine: SoundEngine | null = null;

export function getSoundEngine(): SoundEngine {
  if (!_soundEngine) {
    _soundEngine = new SoundEngine();
  }
  return _soundEngine;
}
