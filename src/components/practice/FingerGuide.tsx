'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QWERTY_LAYOUT, type Finger } from '@/components/keyboard/layouts/qwerty';
import { FINGER_COLORS } from '@/lib/engine/finger-mapper';

interface FingerGuideProps {
  nextKey?: string; // The character or code of the next key to press
}

// Map characters to key codes for lookup
const CHAR_TO_CODE: Record<string, string> = {};
for (const k of QWERTY_LAYOUT) {
  if (k.label.length === 1) CHAR_TO_CODE[k.label.toLowerCase()] = k.code;
  if (k.shiftLabel && k.shiftLabel.length === 1) CHAR_TO_CODE[k.shiftLabel] = k.code;
}
CHAR_TO_CODE[' '] = 'Space';

const FINGER_LABELS: Record<Finger, string> = {
  'left-pinky': '새끼',
  'left-ring': '약지',
  'left-middle': '중지',
  'left-index': '검지',
  'right-index': '검지',
  'right-middle': '중지',
  'right-ring': '약지',
  'right-pinky': '새끼',
  thumb: '엄지',
};

// Finger positions for SVG hand diagrams (fingertip cx, cy)
const LEFT_FINGERS: { finger: Finger; cx: number; cy: number }[] = [
  { finger: 'left-pinky', cx: 18, cy: 18 },
  { finger: 'left-ring', cx: 34, cy: 8 },
  { finger: 'left-middle', cx: 50, cy: 4 },
  { finger: 'left-index', cx: 66, cy: 12 },
  { finger: 'thumb', cx: 78, cy: 52 },
];

const RIGHT_FINGERS: { finger: Finger; cx: number; cy: number }[] = [
  { finger: 'thumb', cx: 22, cy: 52 },
  { finger: 'right-index', cx: 34, cy: 12 },
  { finger: 'right-middle', cx: 50, cy: 4 },
  { finger: 'right-ring', cx: 66, cy: 8 },
  { finger: 'right-pinky', cx: 82, cy: 18 },
];

function HandSVG({
  side,
  activeFinger,
}: {
  side: 'left' | 'right';
  activeFinger: Finger | null;
}) {
  const fingers = side === 'left' ? LEFT_FINGERS : RIGHT_FINGERS;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] text-gray-500 uppercase tracking-wider">
        {side === 'left' ? '왼손' : '오른손'}
      </span>
      <svg viewBox="0 0 100 70" className="w-28 h-20">
        {/* Palm */}
        <ellipse
          cx={50}
          cy={48}
          rx={30}
          ry={18}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          className="text-gray-600"
        />
        {/* Finger stalks */}
        {fingers.map((f) => (
          <line
            key={f.finger}
            x1={f.cx}
            y1={f.cy + 10}
            x2={f.finger === 'thumb' ? f.cx : f.cx}
            y2={40}
            stroke="currentColor"
            strokeWidth={1}
            className="text-gray-600"
          />
        ))}
        {/* Fingertips */}
        {fingers.map((f) => {
          const isActive = activeFinger === f.finger;
          const color = FINGER_COLORS[f.finger];
          return (
            <g key={f.finger}>
              <circle
                cx={f.cx}
                cy={f.cy}
                r={isActive ? 9 : 7}
                fill={isActive ? color : 'transparent'}
                stroke={color}
                strokeWidth={isActive ? 2 : 1.2}
                opacity={isActive ? 1 : 0.4}
              />
              {isActive && (
                <motion.circle
                  cx={f.cx}
                  cy={f.cy}
                  r={9}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  initial={{ r: 9, opacity: 0.8 }}
                  animate={{ r: 16, opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function FingerGuide({ nextKey }: FingerGuideProps) {
  const fingerInfo = useMemo(() => {
    if (!nextKey) return null;
    const code = CHAR_TO_CODE[nextKey] ?? CHAR_TO_CODE[nextKey.toLowerCase()];
    if (!code) return null;
    const keyDef = QWERTY_LAYOUT.find((k) => k.code === code);
    if (!keyDef) return null;
    const hand: 'left' | 'right' = keyDef.finger.startsWith('left') ? 'left' : keyDef.finger === 'thumb' ? 'left' : 'right';
    return { finger: keyDef.finger, hand, label: FINGER_LABELS[keyDef.finger] };
  }, [nextKey]);

  return (
    <div className="flex items-center gap-6 px-4 py-3 rounded-xl bg-gray-800/60 border border-white/10">
      <AnimatePresence mode="wait">
        <motion.div
          key={fingerInfo?.finger ?? 'none'}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-6"
        >
          <HandSVG
            side="left"
            activeFinger={fingerInfo?.hand === 'left' ? fingerInfo.finger : null}
          />
          <HandSVG
            side="right"
            activeFinger={fingerInfo?.hand === 'right' ? fingerInfo.finger : null}
          />
        </motion.div>
      </AnimatePresence>

      {fingerInfo && (
        <div className="text-center min-w-[60px]">
          <div
            className="text-2xl font-bold"
            style={{ color: FINGER_COLORS[fingerInfo.finger] }}
          >
            {nextKey === ' ' ? '␣' : nextKey}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {fingerInfo.hand === 'left' ? '왼' : '오른'}손 {fingerInfo.label}
          </div>
        </div>
      )}
    </div>
  );
}
