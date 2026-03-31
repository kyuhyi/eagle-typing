'use client';

import { useMemo } from 'react';
import Key from './Key';
import { KeyDefinition } from './layouts/qwerty';
import { KOREAN_2SET_LAYOUT } from './layouts/korean-2set';
import { QWERTY_LAYOUT } from './layouts/qwerty';

interface KeyboardLayoutProps {
  layout?: 'qwerty' | 'korean-2set';
  activeKeyCode?: string;
  pressedKeyCode?: string;
  isCorrect?: boolean;
  disabledKeys?: string[];
}

const ROW_OFFSETS: Record<number, number> = {
  0: 0,
  1: 0,
  2: 0.25,
  3: 0.5,
  4: 0,
};

export default function KeyboardLayout({
  layout = 'qwerty',
  activeKeyCode,
  pressedKeyCode,
  isCorrect = false,
  disabledKeys = [],
}: KeyboardLayoutProps) {
  const keys = layout === 'korean-2set' ? KOREAN_2SET_LAYOUT : QWERTY_LAYOUT;
  const showKorean = layout === 'korean-2set';

  const rows = useMemo(() => {
    const map = new Map<number, KeyDefinition[]>();
    for (const key of keys) {
      const row = map.get(key.row) ?? [];
      row.push(key);
      map.set(key.row, row);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [keys]);

  return (
    <div
      className="relative inline-flex flex-col gap-2 p-6 rounded-[1.5rem] border border-[#494456]/15 overflow-hidden"
      style={{
        background: '#0c0e17',
        boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03), 0 24px 48px rgba(0,0,0,0.5)',
      }}
    >
      {/* ── Hand guide glow overlays ─────────────────────────── */}
      {/* Left hand: bottom-left glow ellipse */}
      <div className="absolute bottom-4 left-0 w-1/2 h-20 pointer-events-none z-10 flex justify-center items-end">
        <div
          className="w-48 h-16 rounded-full blur-xl"
          style={{ background: 'radial-gradient(ellipse at center bottom, rgba(205,189,255,0.35) 0%, transparent 70%)' }}
        />
      </div>
      {/* Right hand: bottom-right glow ellipse */}
      <div className="absolute bottom-4 right-0 w-1/2 h-20 pointer-events-none z-10 flex justify-center items-end">
        <div
          className="w-48 h-16 rounded-full blur-xl"
          style={{ background: 'radial-gradient(ellipse at center bottom, rgba(205,189,255,0.35) 0%, transparent 70%)' }}
        />
      </div>

      {/* ── Key rows ─────────────────────────────────────────── */}
      {rows.map(([rowIndex, rowKeys]) => (
        <div
          key={rowIndex}
          className="relative z-20 flex gap-1.5"
          style={{ paddingLeft: `${(ROW_OFFSETS[rowIndex] ?? 0) * 3}rem` }}
        >
          {rowKeys.map((keyDef) => (
            <Key
              key={keyDef.code}
              keyDef={keyDef}
              showKorean={showKorean}
              isActive={activeKeyCode === keyDef.code}
              isPressed={pressedKeyCode === keyDef.code}
              isCorrect={pressedKeyCode === keyDef.code && isCorrect}
              isError={pressedKeyCode === keyDef.code && !isCorrect && pressedKeyCode !== undefined}
              isDisabled={disabledKeys.includes(keyDef.code)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
