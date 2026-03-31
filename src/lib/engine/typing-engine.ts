/**
 * 메인 타이핑 엔진
 *
 * 영문/한글 통합 타이핑 세션을 관리합니다.
 * 한글은 KoreanEngine을 통해 IME 조합 상태를 추적합니다.
 */

import type { Keystroke, SessionStats } from '@/types';
import { KoreanEngine } from './korean-engine';
import { isHangul, isSyllable } from './hangul-utils';
import { calculateWPM, calculateAccuracy } from './stats-calculator';

export type EngineLanguage = 'english' | 'korean';

export interface TypingEngineOptions {
  language?: EngineLanguage;
}

export interface KeystrokeEvent {
  char: string;
  keyCode: string;
  timestamp: number;
  /** 한글 compositionend 이벤트 데이터 (한글 모드에서 사용) */
  compositionData?: string;
  isComposing?: boolean;
}

export class TypingEngine {
  private targetText = '';
  private typedText = '';
  private position = 0;
  private keystrokes: Keystroke[] = [];
  private startTime = 0;
  private endTime = 0;
  private isRunning = false;
  private language: EngineLanguage = 'english';
  private koreanEngine: KoreanEngine;

  /** 현재 조합 중인 자모 버퍼 (한글 IME 상태 표시용) */
  private composingBuffer = '';
  /** 연속 정타 스트릭 */
  private currentStreak = 0;
  private longestStreak = 0;

  constructor(options: TypingEngineOptions = {}) {
    this.language = options.language ?? 'english';
    this.koreanEngine = new KoreanEngine();
  }

  /** 새 세션 시작 */
  startSession(targetText: string): void {
    this.targetText = targetText;
    this.typedText = '';
    this.position = 0;
    this.keystrokes = [];
    this.startTime = 0;
    this.endTime = 0;
    this.isRunning = false;
    this.composingBuffer = '';
    this.currentStreak = 0;
    this.longestStreak = 0;
    this.koreanEngine.reset();

    // 언어 자동 감지
    if (isHangul(targetText[0])) {
      this.language = 'korean';
    }
  }

  /**
   * 키 입력 처리 (영문 모드 또는 한글 비조합 문자)
   *
   * @param char     - 입력된 문자
   * @param keyCode  - KeyboardEvent.code (예: 'KeyA', 'Space')
   * @param timestamp - 입력 시각 ms
   */
  processKeystroke(char: string, keyCode: string, timestamp: number): boolean {
    if (this.isComplete()) return false;

    // 첫 입력 시 세션 시작
    if (!this.isRunning) {
      this.startTime = timestamp;
      this.isRunning = true;
    }

    const expected = this.targetText[this.position] ?? '';
    const correct = char === expected;
    const prevTimestamp = this.keystrokes.at(-1)?.timestamp ?? this.startTime;

    const keystroke: Keystroke = {
      expected,
      actual: char,
      correct,
      timestamp,
      responseTime: timestamp - prevTimestamp,
    };

    this.keystrokes.push(keystroke);

    if (correct) {
      this.typedText += char;
      this.position++;
      this.currentStreak++;
      if (this.currentStreak > this.longestStreak) {
        this.longestStreak = this.currentStreak;
      }
    } else {
      this.currentStreak = 0;
    }

    if (this.isComplete()) {
      this.endTime = timestamp;
      this.isRunning = false;
    }

    return correct;
  }

  /**
   * 한글 IME compositionupdate 처리
   * 조합 중인 버퍼를 업데이트하고 부분 일치 여부를 반환합니다.
   */
  processCompositionUpdate(data: string, timestamp: number): boolean {
    if (!this.isRunning && data) {
      this.startTime = timestamp;
      this.isRunning = true;
    }

    this.composingBuffer = data;
    this.koreanEngine.processCompositionUpdate(data);

    const expected = this.targetText[this.position] ?? '';
    return this.koreanEngine.checkPartialComposition(data, expected);
  }

  /**
   * 한글 IME compositionend 처리
   * 조합이 완료된 문자를 확정하고 정오 판정을 기록합니다.
   */
  processCompositionEnd(data: string, timestamp: number): boolean {
    if (!data) return false;

    if (!this.isRunning) {
      this.startTime = timestamp;
      this.isRunning = true;
    }

    this.koreanEngine.processCompositionEnd(data);
    this.composingBuffer = '';

    const expected = this.targetText[this.position] ?? '';
    const correct = data === expected;
    const prevTimestamp = this.keystrokes.at(-1)?.timestamp ?? this.startTime;

    const keystroke: Keystroke = {
      expected,
      actual: data,
      correct,
      timestamp,
      responseTime: timestamp - prevTimestamp,
    };

    this.keystrokes.push(keystroke);

    if (correct) {
      this.typedText += data;
      this.position++;
      this.currentStreak++;
      if (this.currentStreak > this.longestStreak) {
        this.longestStreak = this.currentStreak;
      }
    } else {
      this.currentStreak = 0;
    }

    if (this.isComplete()) {
      this.endTime = timestamp;
      this.isRunning = false;
    }

    return correct;
  }

  /** 현재 세션 통계 반환 */
  getStats(): SessionStats {
    const now = Date.now();
    const end = this.endTime || (this.isRunning ? now : this.startTime);
    const durationSec = this.startTime > 0 ? (end - this.startTime) / 1000 : 0;

    const correct = this.keystrokes.filter(k => k.correct).length;
    const total = this.keystrokes.length;

    return {
      wpm: calculateWPM(this.typedText.length, durationSec),
      cpm: durationSec > 0 ? Math.round((this.typedText.length / durationSec) * 60) : 0,
      accuracy: calculateAccuracy(correct, total),
      duration: durationSec,
      totalKeystrokes: total,
      correctKeystrokes: correct,
      errorCount: total - correct,
      longestStreak: this.longestStreak,
    };
  }

  /** 세션 완료 여부 */
  isComplete(): boolean {
    return this.targetText.length > 0 && this.position >= this.targetText.length;
  }

  /** 현재 입력해야 할 문자 */
  getCurrentChar(): string {
    return this.targetText[this.position] ?? '';
  }

  /** 진행률 (0.0 ~ 1.0) */
  getProgress(): number {
    if (this.targetText.length === 0) return 0;
    return this.position / this.targetText.length;
  }

  /** 현재 커서 위치 */
  getPosition(): number {
    return this.position;
  }

  /** 확정된 타이핑 텍스트 */
  getTypedText(): string {
    return this.typedText;
  }

  /** 목표 텍스트 */
  getTargetText(): string {
    return this.targetText;
  }

  /** 현재 조합 중인 버퍼 (한글 IME) */
  getComposingBuffer(): string {
    return this.composingBuffer;
  }

  /** 전체 키스트로크 배열 */
  getKeystrokes(): readonly Keystroke[] {
    return this.keystrokes;
  }

  /** 현재 연속 정타 수 */
  getCurrentStreak(): number {
    return this.currentStreak;
  }

  /** 세션이 시작되었는지 여부 */
  hasStarted(): boolean {
    return this.isRunning || this.startTime > 0;
  }
}
