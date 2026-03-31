/**
 * 타이핑 통계 계산 모듈
 *
 * WPM, 정확도, 손가락별 통계, 오류 맵 등을 계산합니다.
 * 모든 함수는 순수 함수(pure function)입니다.
 */

import type { Keystroke, PerKeyStats, Finger } from '@/types';

// 키보드 레이아웃(QWERTY) 기반 키-손가락 매핑
const KEY_FINGER_MAP: Record<string, Finger> = {
  // 왼손 새끼손가락
  '`': 'left-pinky', '1': 'left-pinky', 'q': 'left-pinky',
  'a': 'left-pinky', 'z': 'left-pinky',
  // 왼손 약지
  '2': 'left-ring', 'w': 'left-ring', 's': 'left-ring', 'x': 'left-ring',
  // 왼손 중지
  '3': 'left-middle', 'e': 'left-middle', 'd': 'left-middle', 'c': 'left-middle',
  // 왼손 검지
  '4': 'left-index', '5': 'left-index',
  'r': 'left-index', 't': 'left-index',
  'f': 'left-index', 'g': 'left-index',
  'v': 'left-index', 'b': 'left-index',
  // 왼손 엄지
  ' ': 'left-thumb',
  // 오른손 엄지 (space 공유)
  // 오른손 검지
  '6': 'right-index', '7': 'right-index',
  'y': 'right-index', 'u': 'right-index',
  'h': 'right-index', 'j': 'right-index',
  'n': 'right-index', 'm': 'right-index',
  // 오른손 중지
  '8': 'right-middle', 'i': 'right-middle', 'k': 'right-middle', ',': 'right-middle',
  // 오른손 약지
  '9': 'right-ring', 'o': 'right-ring', 'l': 'right-ring', '.': 'right-ring',
  // 오른손 새끼손가락
  '0': 'right-pinky', '-': 'right-pinky', '=': 'right-pinky',
  'p': 'right-pinky', '[': 'right-pinky', ']': 'right-pinky', '\\': 'right-pinky',
  ';': 'right-pinky', "'": 'right-pinky',
  '/': 'right-pinky',
};

/**
 * 분당 단어 수(WPM) 계산
 * 표준: 5글자 = 1단어
 *
 * @param chars   - 올바르게 입력한 문자 수
 * @param seconds - 경과 시간(초)
 */
export function calculateWPM(chars: number, seconds: number): number {
  if (seconds <= 0 || chars <= 0) return 0;
  return Math.round((chars / 5) / (seconds / 60));
}

/**
 * 정확도 계산 (0 ~ 100)
 *
 * @param correct - 정타 수
 * @param total   - 전체 키 입력 수
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total <= 0) return 100;
  return Math.round((correct / total) * 100 * 10) / 10;  // 소수점 1자리
}

/**
 * 손가락별 정확도 계산
 * 각 손가락에 할당된 키들의 입력 성공률을 반환합니다.
 *
 * @returns 손가락 ID → 정확도(0~100) 맵
 */
export function calculateFingerAccuracy(
  keystrokes: readonly Keystroke[],
): Record<Finger, number> {
  const fingerStats: Record<string, { correct: number; total: number }> = {};

  for (const ks of keystrokes) {
    const key = ks.expected.toLowerCase();
    const finger: Finger = KEY_FINGER_MAP[key] ?? 'right-index';

    if (!fingerStats[finger]) {
      fingerStats[finger] = { correct: 0, total: 0 };
    }

    fingerStats[finger].total++;
    if (ks.correct) fingerStats[finger].correct++;
  }

  const result = {} as Record<Finger, number>;
  for (const [finger, stats] of Object.entries(fingerStats)) {
    result[finger as Finger] = calculateAccuracy(stats.correct, stats.total);
  }

  return result;
}

/**
 * 키별 오류 맵 반환
 * 어떤 키에서 얼마나 틀렸는지 집계합니다.
 *
 * @returns 키 문자 → 오류 횟수 맵 (오류가 있는 키만 포함)
 */
export function getErrorMap(keystrokes: readonly Keystroke[]): Record<string, number> {
  const errorMap: Record<string, number> = {};

  for (const ks of keystrokes) {
    if (!ks.correct) {
      const key = ks.expected;
      errorMap[key] = (errorMap[key] ?? 0) + 1;
    }
  }

  return errorMap;
}

/**
 * 키별 상세 통계 배열 반환
 * 정타율, 평균 반응속도 등을 키 단위로 집계합니다.
 */
export function getPerKeyStats(keystrokes: readonly Keystroke[]): PerKeyStats[] {
  const statsMap: Record<string, {
    totalPresses: number;
    errorCount: number;
    totalResponseTime: number;
  }> = {};

  for (const ks of keystrokes) {
    const key = ks.expected;
    if (!statsMap[key]) {
      statsMap[key] = { totalPresses: 0, errorCount: 0, totalResponseTime: 0 };
    }
    statsMap[key].totalPresses++;
    if (!ks.correct) statsMap[key].errorCount++;
    statsMap[key].totalResponseTime += ks.responseTime;
  }

  return Object.entries(statsMap).map(([key, s]) => ({
    key,
    totalPresses: s.totalPresses,
    errorCount: s.errorCount,
    avgResponseTime: s.totalPresses > 0
      ? Math.round(s.totalResponseTime / s.totalPresses)
      : 0,
    accuracy: calculateAccuracy(s.totalPresses - s.errorCount, s.totalPresses),
  }));
}

/**
 * 타이핑 속도 추이 계산 (시간 구간별 WPM)
 * 전체 세션을 intervalSec 단위로 분할하여 구간별 WPM을 반환합니다.
 *
 * @param keystrokes  - 키스트로크 배열
 * @param startTime   - 세션 시작 ms
 * @param intervalSec - 구간 길이(초), 기본값 5초
 */
export function getWpmTrend(
  keystrokes: readonly Keystroke[],
  startTime: number,
  intervalSec = 5,
): Array<{ second: number; wpm: number }> {
  if (keystrokes.length === 0) return [];

  const correctByInterval: Record<number, number> = {};

  for (const ks of keystrokes) {
    if (!ks.correct) continue;
    const elapsedSec = (ks.timestamp - startTime) / 1000;
    const bucket = Math.floor(elapsedSec / intervalSec) * intervalSec;
    correctByInterval[bucket] = (correctByInterval[bucket] ?? 0) + 1;
  }

  return Object.entries(correctByInterval)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([second, chars]) => ({
      second: Number(second),
      wpm: calculateWPM(chars, intervalSec),
    }));
}

/**
 * 최장 연속 정타 계산
 */
export function calculateLongestStreak(keystrokes: readonly Keystroke[]): number {
  let max = 0;
  let current = 0;

  for (const ks of keystrokes) {
    if (ks.correct) {
      current++;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  }

  return max;
}
