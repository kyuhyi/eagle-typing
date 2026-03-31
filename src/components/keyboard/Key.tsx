'use client';

import { motion } from 'framer-motion';
import { KeyDefinition } from './layouts/qwerty';
import { getFingerColor } from '@/lib/engine/finger-mapper';

interface KeyProps {
  keyDef: KeyDefinition;
  isActive?: boolean;
  isPressed?: boolean;
  isCorrect?: boolean;
  isError?: boolean;
  isDisabled?: boolean;
  showKorean?: boolean;
}

export default function Key({
  keyDef,
  isActive = false,
  isPressed = false,
  isCorrect = false,
  isError = false,
  isDisabled = false,
  showKorean = false,
}: KeyProps) {
  const fingerColor = getFingerColor(keyDef.finger);
  const baseWidth = keyDef.width ?? 1;

  // ── State-driven styles ──────────────────────────────────────────
  let keyStyle: React.CSSProperties;
  let borderClass: string;
  let textClass: string;

  if (isDisabled) {
    keyStyle = { background: 'rgba(29,31,41,0.4)' };
    borderClass = 'border border-[#494456]/10';
    textClass = 'text-[#cbc3d9]/20';
  } else if (isPressed) {
    keyStyle = {
      background: '#5c1fde',
      boxShadow: '0 0 12px rgba(92,31,222,0.6), inset 0 1px 0 rgba(205,189,255,0.15)',
    };
    borderClass = 'border border-[#cdbdff]/20';
    textClass = 'text-white';
  } else if (isError) {
    keyStyle = {
      background: '#1d1f29',
      boxShadow: `inset 0 -2px 0 ${fingerColor}40`,
    };
    borderClass = 'border-2 border-[#ffb4ab]';
    textClass = 'text-[#ffb4ab]';
  } else if (isActive) {
    keyStyle = {
      background: '#32343e',
      boxShadow:
        '0 0 15px rgba(250,189,0,0.4), 0 0 5px rgba(250,189,0,0.2), inset 0 1px 0 rgba(250,189,0,0.1)',
    };
    borderClass = 'border-2 border-[#fabd00]';
    textClass = 'text-[#fabd00]';
  } else {
    // Normal: subtle finger-color accent at the bottom edge
    keyStyle = {
      background: '#1d1f29',
      boxShadow: `inset 0 -2px 0 ${fingerColor}50, inset 0 1px 0 rgba(255,255,255,0.04)`,
    };
    borderClass = 'border border-[#494456]/10';
    textClass = 'text-[#cbc3d9]/60';
  }

  const primaryLabel = showKorean && keyDef.koreanLabel ? keyDef.koreanLabel : keyDef.label;
  const shiftLabel = showKorean && keyDef.koreanShiftLabel
    ? keyDef.koreanShiftLabel
    : keyDef.shiftLabel;
  const isKoreanMode = showKorean && !!keyDef.koreanLabel;

  return (
    <motion.div
      style={{ ...keyStyle, minWidth: `${baseWidth * 3}rem` }}
      className={[
        'relative flex flex-col items-center justify-center',
        'h-12 rounded-lg select-none cursor-default',
        'transition-[background,box-shadow,border-color] duration-75',
        borderClass,
        textClass,
        isDisabled ? 'pointer-events-none' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      animate={{ scale: isActive && !isPressed ? 1.1 : isPressed ? 0.88 : 1 }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
    >
      {/* Home row dot */}
      {keyDef.isHomeKey && !isActive && !isPressed && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#cbc3d9]/25" />
      )}

      {/* Shift / Korean-shift label (top-left) */}
      {shiftLabel && (
        <span
          className={[
            'absolute top-0.5 left-1 leading-none',
            isKoreanMode
              ? 'text-[9px] text-[#cbc3d9]/35 font-medium'
              : 'text-[9px] text-[#cbc3d9]/25',
          ].join(' ')}
        >
          {shiftLabel}
        </span>
      )}

      {/* Primary label */}
      <span
        className={[
          'leading-none',
          isKoreanMode ? 'text-sm font-semibold' : 'text-xs font-medium',
        ].join(' ')}
      >
        {primaryLabel}
      </span>
    </motion.div>
  );
}
