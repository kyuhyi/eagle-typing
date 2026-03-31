'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QWERTY_LAYOUT, type Finger } from '@/components/keyboard/layouts/qwerty';
import { FINGER_COLORS } from '@/lib/engine/finger-mapper';

interface KeyHintProps {
  nextKey?: string;
  visible?: boolean;
}

const CHAR_TO_KEY: Record<string, { code: string; label: string; finger: Finger }> = {};
for (const k of QWERTY_LAYOUT) {
  if (k.label.length === 1) {
    CHAR_TO_KEY[k.label.toLowerCase()] = { code: k.code, label: k.label, finger: k.finger };
  }
  if (k.shiftLabel && k.shiftLabel.length === 1) {
    CHAR_TO_KEY[k.shiftLabel] = { code: k.code, label: k.shiftLabel, finger: k.finger };
  }
}
CHAR_TO_KEY[' '] = { code: 'Space', label: 'Space', finger: 'thumb' };

const FINGER_NAME: Record<Finger, string> = {
  'left-pinky': 'L Pinky',
  'left-ring': 'L Ring',
  'left-middle': 'L Middle',
  'left-index': 'L Index',
  'right-index': 'R Index',
  'right-middle': 'R Middle',
  'right-ring': 'R Ring',
  'right-pinky': 'R Pinky',
  thumb: 'Thumb',
};

export default function KeyHint({ nextKey, visible = true }: KeyHintProps) {
  const info = useMemo(() => {
    if (!nextKey) return null;
    return CHAR_TO_KEY[nextKey] ?? CHAR_TO_KEY[nextKey.toLowerCase()] ?? null;
  }, [nextKey]);

  if (!visible || !info) return null;

  const color = FINGER_COLORS[info.finger];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={nextKey ?? 'none'}
        initial={{ opacity: 0, y: 8, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.9 }}
        transition={{ duration: 0.12 }}
        className="inline-flex items-center gap-2.5 px-4 py-2 rounded-lg border shadow-lg backdrop-blur-sm"
        style={{
          borderColor: `${color}44`,
          backgroundColor: `${color}15`,
          boxShadow: `0 4px 20px ${color}20`,
        }}
      >
        {/* Key badge */}
        <span
          className="flex items-center justify-center min-w-[32px] h-8 px-2 rounded-md text-sm font-bold border"
          style={{
            borderColor: `${color}66`,
            color,
            backgroundColor: `${color}22`,
          }}
        >
          {nextKey === ' ' ? '␣' : nextKey!.toUpperCase()}
        </span>

        {/* Finger indicator dot + name */}
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs text-gray-300 font-medium">
            {FINGER_NAME[info.finger]}
          </span>
        </div>

        {/* Floating arrow triangle pointing down */}
        <div
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
          style={{ backgroundColor: `${color}15`, borderRight: `1px solid ${color}44`, borderBottom: `1px solid ${color}44` }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
