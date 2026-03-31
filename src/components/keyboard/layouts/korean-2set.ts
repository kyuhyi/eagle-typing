import { QWERTY_LAYOUT, KeyDefinition } from './qwerty';

// 한글 두벌식 키 매핑 (소문자 → 초성/종성, 대문자 → 쌍자음/모음)
const KOREAN_MAP: Record<string, { label: string; shiftLabel?: string }> = {
  KeyQ: { label: 'ㅂ', shiftLabel: 'ㅃ' },
  KeyW: { label: 'ㅈ', shiftLabel: 'ㅉ' },
  KeyE: { label: 'ㄷ', shiftLabel: 'ㄸ' },
  KeyR: { label: 'ㄱ', shiftLabel: 'ㄲ' },
  KeyT: { label: 'ㅅ', shiftLabel: 'ㅆ' },
  KeyY: { label: 'ㅛ' },
  KeyU: { label: 'ㅕ' },
  KeyI: { label: 'ㅑ' },
  KeyO: { label: 'ㅐ', shiftLabel: 'ㅒ' },
  KeyP: { label: 'ㅔ', shiftLabel: 'ㅖ' },
  KeyA: { label: 'ㅁ' },
  KeyS: { label: 'ㄴ' },
  KeyD: { label: 'ㅇ' },
  KeyF: { label: 'ㄹ' },
  KeyG: { label: 'ㅎ' },
  KeyH: { label: 'ㅗ' },
  KeyJ: { label: 'ㅓ' },
  KeyK: { label: 'ㅏ' },
  KeyL: { label: 'ㅣ' },
  KeyZ: { label: 'ㅋ' },
  KeyX: { label: 'ㅌ' },
  KeyC: { label: 'ㅊ' },
  KeyV: { label: 'ㅍ' },
  KeyB: { label: 'ㅠ' },
  KeyN: { label: 'ㅜ' },
  KeyM: { label: 'ㅡ' },
};

export const KOREAN_2SET_LAYOUT: KeyDefinition[] = QWERTY_LAYOUT.map((key) => {
  const korean = KOREAN_MAP[key.code];
  if (!korean) return key;
  return {
    ...key,
    koreanLabel: korean.label,
    koreanShiftLabel: korean.shiftLabel,
  };
});
