/**
 * 한글 IME 추적 엔진
 *
 * 브라우저의 compositionupdate / compositionend 이벤트를 추적하여
 * 현재 조합 중인 자모 상태와 목표 텍스트를 비교합니다.
 */

import {
  decompose,
  isHangul,
  isSyllable,
  isJamo,
  HANGUL_COMPOUND_MEDIAL,
  HANGUL_COMPOUND_FINAL,
} from './hangul-utils';

export interface CompositionState {
  /** 현재 조합 중인 문자열 (IME 조합 버퍼) */
  composing: string;
  /** 확정된 텍스트 (compositionend로 확정된 부분) */
  committed: string;
  /** 마지막 compositionend 데이터 */
  lastCommit: string;
}

export class KoreanEngine {
  private state: CompositionState = {
    composing: '',
    committed: '',
    lastCommit: '',
  };

  /** compositionupdate 이벤트 처리 */
  processCompositionUpdate(data: string): void {
    this.state.composing = data;
  }

  /** compositionend 이벤트 처리 */
  processCompositionEnd(data: string): void {
    this.state.lastCommit = data;
    this.state.committed += data;
    this.state.composing = '';
  }

  /** 현재 상태 반환 */
  getState(): Readonly<CompositionState> {
    return { ...this.state };
  }

  /** 상태 초기화 */
  reset(): void {
    this.state = { composing: '', committed: '', lastCommit: '' };
  }

  /**
   * 목표 텍스트의 특정 위치에서 타이핑해야 할 자모 시퀀스를 반환합니다.
   *
   * 한글 음절 → 초성+중성+(종성) 자모 배열로 변환
   * 복합 자모(ㅘ, ㄺ 등)는 개별 자모로 분해
   *
   * @example
   *   targetText = '한글', position = 0
   *   → ['ㅎ', 'ㅏ', 'ㄴ']
   */
  getExpectedJamo(targetText: string, position: number): string[] {
    if (position < 0 || position >= targetText.length) return [];

    const char = targetText[position];

    if (isSyllable(char)) {
      return decompose(char);
    }

    if (isJamo(char)) {
      return [char];
    }

    // 한글이 아닌 문자(공백, 영문 등)는 그대로 반환
    return [char];
  }

  /**
   * 현재 조합 중인 자모 시퀀스가 기대값과 일치하는지 확인합니다.
   * 부분 일치(prefix match)를 허용합니다.
   *
   * @param composing - IME 조합 버퍼 (예: 'ㅎ', '하', '한')
   * @param expected - 목표 음절 (예: '한')
   *
   * @example
   *   checkPartialComposition('하', '한') → true  (조합 진행 중)
   *   checkPartialComposition('히', '한') → false (잘못된 중성)
   */
  checkPartialComposition(composing: string, expected: string): boolean {
    if (!composing) return true;

    // 조합 중인 자모 시퀀스
    const composingJamo = this.toJamoSequence(composing);
    // 목표 음절의 자모 시퀀스
    const expectedJamo = this.getExpectedJamo(expected, 0);

    if (composingJamo.length > expectedJamo.length) return false;

    return composingJamo.every((jamo, i) => jamo === expectedJamo[i]);
  }

  /**
   * 문자열을 자모 시퀀스 배열로 변환합니다.
   * 조합 중 상태의 문자열을 분석할 때 사용합니다.
   *
   * @example
   *   toJamoSequence('하') → ['ㅎ', 'ㅏ']
   *   toJamoSequence('한') → ['ㅎ', 'ㅏ', 'ㄴ']
   */
  toJamoSequence(text: string): string[] {
    const result: string[] = [];
    for (const char of text) {
      if (isSyllable(char)) {
        result.push(...decompose(char));
      } else if (isJamo(char)) {
        result.push(char);
      } else {
        result.push(char);
      }
    }
    return result;
  }

  /**
   * 목표 텍스트 전체를 자모 시퀀스로 변환합니다.
   * 타이핑 진행률 계산 등에 활용합니다.
   */
  getFullJamoSequence(targetText: string): string[] {
    const result: string[] = [];
    for (let i = 0; i < targetText.length; i++) {
      result.push(...this.getExpectedJamo(targetText, i));
    }
    return result;
  }

  /**
   * 목표 음절과 현재 조합 중인 문자를 비교하여 정확도를 반환합니다.
   * 0.0 ~ 1.0 사이 값. 완전 일치 = 1.0, 부분 일치 = 진행 비율.
   */
  getCompositionProgress(composing: string, target: string): number {
    if (!isHangul(target[0])) {
      return composing === target ? 1.0 : 0.0;
    }

    const composingJamo = this.toJamoSequence(composing);
    const targetJamo = this.getExpectedJamo(target, 0);

    if (targetJamo.length === 0) return 0.0;

    let matched = 0;
    for (let i = 0; i < Math.min(composingJamo.length, targetJamo.length); i++) {
      if (composingJamo[i] === targetJamo[i]) matched++;
      else break;
    }

    return matched / targetJamo.length;
  }
}
