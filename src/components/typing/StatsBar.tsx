'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';

interface StatsBarProps {
  wpm: number;
  accuracy: number;
  streak: number;
  elapsedTime: number; // seconds
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Animated number that rolls up/down to its target value */
function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const spring = useSpring(0, { stiffness: 120, damping: 20 });
  const display = useTransform(spring, (v) =>
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString()
  );
  const [displayVal, setDisplayVal] = useState(decimals > 0 ? value.toFixed(decimals) : String(value));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => setDisplayVal(v));
    return unsubscribe;
  }, [display]);

  return <>{displayVal}</>;
}

interface StatCardProps {
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'amber' | 'gray';
  icon: string;
  numericValue?: number; // for animated counter
  suffix?: string;       // e.g. "%"
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-600 dark:text-blue-400',
    glow: 'shadow-blue-200/50 dark:shadow-blue-800/30',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-600 dark:text-emerald-400',
    glow: 'shadow-emerald-200/50 dark:shadow-emerald-800/30',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-600 dark:text-amber-400',
    glow: 'shadow-amber-200/50 dark:shadow-amber-800/30',
  },
  gray: {
    bg: 'bg-gray-50 dark:bg-gray-950/40',
    border: 'border-gray-200 dark:border-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
    glow: 'shadow-gray-200/50 dark:shadow-gray-800/30',
  },
};

function StatCard({ label, value, color, icon, numericValue, suffix }: StatCardProps) {
  const c = colorMap[color];

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border ${c.border} ${c.bg} px-3 py-2 shadow-sm ${c.glow}`}
    >
      <span className="text-base" role="img" aria-hidden>
        {icon}
      </span>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
          {label}
        </span>
        <span className={`text-lg font-bold tabular-nums ${c.text}`}>
          {numericValue !== undefined ? (
            <>
              <AnimatedNumber value={numericValue} />
              {suffix}
            </>
          ) : (
            value
          )}
        </span>
      </div>
    </div>
  );
}

/** Combo multiplier badge shown when streak exceeds threshold */
function ComboMultiplier({ streak }: { streak: number }) {
  const multiplier = streak >= 50 ? 5 : streak >= 30 ? 3 : 2;

  return (
    <motion.div
      className="flex items-center gap-1.5 rounded-lg border border-purple-400/50 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-3 py-2 shadow-sm shadow-purple-300/30 dark:shadow-purple-800/30"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    >
      <motion.span
        className="text-base"
        animate={{ rotate: [0, -15, 15, -10, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
      >
        💥
      </motion.span>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-purple-300 font-medium">
          콤보
        </span>
        <motion.span
          className="text-lg font-extrabold tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1.5 }}
        >
          x{multiplier}
        </motion.span>
      </div>
    </motion.div>
  );
}

export default function StatsBar({ wpm, accuracy, streak, elapsedTime }: StatsBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-3">
      <StatCard icon="⚡" label="타수 WPM" value={wpm} numericValue={wpm} color="blue" />
      <StatCard icon="🎯" label="정확도" value={`${accuracy}%`} numericValue={accuracy} suffix="%" color="green" />
      <StatCard icon="🔥" label="연속" value={streak} numericValue={streak} color="amber" />
      <StatCard icon="⏱" label="시간" value={formatTime(elapsedTime)} color="gray" />
      <AnimatePresence>
        {streak > 10 && <ComboMultiplier streak={streak} />}
      </AnimatePresence>
    </div>
  );
}
