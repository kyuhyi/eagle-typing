/**
 * 한글 유니코드 처리 유틸리티
 *
 * 한글 음절 범위:  0xAC00 ~ 0xD7A3
 * 조합 공식: 0xAC00 + (초성 * 21 + 중성) * 28 + 종성
 */

// 초성 19개
const INITIALS = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ',
  'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] as const;

// 중성 21개
const MEDIALS = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ',
  'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ',
] as const;

// 종성 28개 (0번 = 없음)
const FINALS = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ',
  'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ',
  'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] as const;

// 복합 중성 분해 테이블 (ㅘ → ㅗ+ㅏ 등)
const COMPOUND_MEDIAL: Record<string, string[]> = {
  'ㅘ': ['ㅗ', 'ㅏ'],
  'ㅙ': ['ㅗ', 'ㅐ'],
  'ㅚ': ['ㅗ', 'ㅣ'],
  'ㅝ': ['ㅜ', 'ㅓ'],
  'ㅞ': ['ㅜ', 'ㅔ'],
  'ㅟ': ['ㅜ', 'ㅣ'],
  'ㅢ': ['ㅡ', 'ㅣ'],
};

// 복합 종성 분해 테이블
const COMPOUND_FINAL: Record<string, string[]> = {
  'ㄳ': ['ㄱ', 'ㅅ'],
  'ㄵ': ['ㄴ', 'ㅈ'],
  'ㄶ': ['ㄴ', 'ㅎ'],
  'ㄺ': ['ㄹ', 'ㄱ'],
  'ㄻ': ['ㄹ', 'ㅁ'],
  'ㄼ': ['ㄹ', 'ㅂ'],
  'ㄽ': ['ㄹ', 'ㅅ'],
  'ㄾ': ['ㄹ', 'ㅌ'],
  'ㄿ': ['ㄹ', 'ㅍ'],
  'ㅀ': ['ㄹ', 'ㅎ'],
  'ㅄ': ['ㅂ', 'ㅅ'],
};

/**
 * 한글 음절을 초성·중성·종성 자모 배열로 분해합니다.
 * 복합 자모(ㅘ, ㄺ 등)는 개별 자모로 풀어 반환합니다.
 *
 * @example decompose('한') → ['ㅎ', 'ㅏ', 'ㄴ']
 * @example decompose('봐') → ['ㅂ', 'ㅗ', 'ㅏ']   (복합 중성 분해)
 */
export function decompose(syllable: string): string[] {
  const code = syllable.charCodeAt(0);

  if (code < 0xAC00 || code > 0xD7A3) {
    // 음절이 아닌 자모 단독 문자인 경우 그대로 반환
    return [syllable];
  }

  const offset = code - 0xAC00;
  const finalIdx = offset % 28;
  const medialIdx = Math.floor(offset / 28) % 21;
  const initialIdx = Math.floor(offset / 28 / 21);

  const initial = INITIALS[initialIdx];
  const medial = MEDIALS[medialIdx];
  const final = FINALS[finalIdx];

  const result: string[] = [initial];

  // 복합 중성 분해
  if (COMPOUND_MEDIAL[medial]) {
    result.push(...COMPOUND_MEDIAL[medial]);
  } else {
    result.push(medial);
  }

  // 종성이 있는 경우
  if (final) {
    if (COMPOUND_FINAL[final]) {
      result.push(...COMPOUND_FINAL[final]);
    } else {
      result.push(final);
    }
  }

  return result;
}

/**
 * 초성·중성·(종성)으로 한글 음절을 조합합니다.
 *
 * @example compose('ㅎ', 'ㅏ', 'ㄴ') → '한'
 * @example compose('ㅇ', 'ㅏ') → '아'
 */
export function compose(initial: string, medial: string, final?: string): string {
  const initialIdx = INITIALS.indexOf(initial as typeof INITIALS[number]);
  const medialIdx = MEDIALS.indexOf(medial as typeof MEDIALS[number]);
  const finalIdx = final ? FINALS.indexOf(final as typeof FINALS[number]) : 0;

  if (initialIdx === -1 || medialIdx === -1) {
    return initial + medial + (final ?? '');
  }

  const code = 0xAC00 + (initialIdx * 21 + medialIdx) * 28 + (finalIdx === -1 ? 0 : finalIdx);
  return String.fromCharCode(code);
}

/** 자모 낱자인지 확인 (ㄱ~ㅣ 범위, 호환 자모) */
export function isJamo(char: string): boolean {
  const code = char.charCodeAt(0);
  return (code >= 0x3131 && code <= 0x318E);
}

/** 완성된 한글 음절인지 확인 (가~힣) */
export function isSyllable(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 0xAC00 && code <= 0xD7A3;
}

/** 한글 문자(자모 또는 음절)인지 확인 */
export function isHangul(char: string): boolean {
  return isJamo(char) || isSyllable(char);
}

/** 초성 인덱스 반환 (-1이면 초성 아님) */
export function getInitialIndex(jamo: string): number {
  return INITIALS.indexOf(jamo as typeof INITIALS[number]);
}

/** 중성 인덱스 반환 (-1이면 중성 아님) */
export function getMedialIndex(jamo: string): number {
  return MEDIALS.indexOf(jamo as typeof MEDIALS[number]);
}

/** 종성 인덱스 반환 (-1이면 종성 아님, 0은 종성 없음) */
export function getFinalIndex(jamo: string): number {
  return FINALS.indexOf(jamo as typeof FINALS[number]);
}

/** 해당 자모가 초성으로 사용 가능한지 */
export function isInitial(jamo: string): boolean {
  return getInitialIndex(jamo) !== -1;
}

/** 해당 자모가 중성으로 사용 가능한지 */
export function isMedial(jamo: string): boolean {
  return getMedialIndex(jamo) !== -1;
}

/** 해당 자모가 종성으로 사용 가능한지 */
export function isFinal(jamo: string): boolean {
  return getFinalIndex(jamo) > 0;  // 0은 빈 종성
}

export const HANGUL_INITIALS = INITIALS;
export const HANGUL_MEDIALS = MEDIALS;
export const HANGUL_FINALS = FINALS;
export const HANGUL_COMPOUND_MEDIAL = COMPOUND_MEDIAL;
export const HANGUL_COMPOUND_FINAL = COMPOUND_FINAL;
