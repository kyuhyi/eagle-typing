'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { SessionStats } from '@/types';

interface TypingResultProps {
  stats: SessionStats;
  targetWpm?: number;
  xpEarned?: number;
  onRetry: () => void;
  onNextLesson?: () => void;
}

function getStarRating(stats: SessionStats, targetWpm: number): 1 | 2 | 3 {
  if (stats.accuracy >= 95 && stats.wpm >= targetWpm) return 3;
  if (stats.accuracy >= 85) return 2;
  return 1;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m === 0) return `${s}초`;
  return `${m}분 ${s}초`;
}

interface StarDisplayProps {
  count: 1 | 2 | 3;
}

function StarDisplay({ count }: StarDisplayProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3].map((i) => {
        const filled = i <= count;
        return (
          <motion.span
            key={i}
            className={`text-4xl md:text-5xl ${
              filled ? 'text-yellow-400 drop-shadow-lg' : 'text-gray-300 dark:text-gray-600'
            }`}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.3 + i * 0.2,
              type: 'spring',
              stiffness: 260,
              damping: 15,
            }}
          >
            {'\u2605'}
          </motion.span>
        );
      })}
    </div>
  );
}

export default function TypingResult({
  stats,
  targetWpm = 60,
  xpEarned = 0,
  onRetry,
  onNextLesson,
}: TypingResultProps) {
  const stars = getStarRating(stats, targetWpm);
  const isGoodResult = stars >= 2;
  const hasNext = !!onNextLesson;
  const [selectedIdx, setSelectedIdx] = useState(hasNext ? 1 : 0); // 기본: 다음으로

  const actions = hasNext ? [onRetry, onNextLesson!] : [onRetry];

  const handleKeyNav = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(actions.length - 1, i + 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      actions[selectedIdx]?.();
    }
  }, [actions, selectedIdx]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyNav);
    return () => window.removeEventListener('keydown', handleKeyNav);
  }, [handleKeyNav]);

  return (
    <motion.div
      className="mx-auto max-w-md rounded-2xl border border-[#494456]/50 p-8 shadow-2xl"
      style={{ background: 'rgba(29, 31, 41, 0.9)', backdropFilter: 'blur(24px)', boxShadow: '0 0 40px rgba(92,31,222,0.1), 0 8px 32px rgba(0,0,0,0.5)' }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Celebration particles for good results */}
      {isGoodResult && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-full"
              style={{
                background: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5],
                left: `${10 + Math.random() * 80}%`,
                top: '50%',
              }}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{
                opacity: 0,
                y: -120 - Math.random() * 80,
                x: (Math.random() - 0.5) * 100,
                scale: 0,
              }}
              transition={{
                duration: 1.2 + Math.random() * 0.6,
                delay: 0.2 + Math.random() * 0.4,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Title */}
      <motion.h2
        className="mb-4 text-center text-2xl font-bold text-[#e1e1ef]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {isGoodResult ? '잘했어요!' : '연습 완료'}
      </motion.h2>

      {/* Stars */}
      <div className="mb-6">
        <StarDisplay count={stars} />
      </div>

      {/* Stats Grid */}
      <motion.div
        className="mb-6 grid grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <StatItem label="타수 (WPM)" value={`${stats.wpm}`} color="text-[#cdbdff]" />
        <StatItem label="정확도" value={`${stats.accuracy}%`} color="text-[#4ade80]" />
        <StatItem label="소요 시간" value={formatDuration(stats.duration)} color="text-[#fabd00]" />
        <StatItem label="총 키입력" value={`${stats.totalKeystrokes}`} color="text-[#bdc2ff]" />
      </motion.div>

      {/* XP Earned */}
      {xpEarned > 0 && (
        <motion.div
          className="mb-6 flex items-center justify-center gap-2 text-lg font-semibold text-purple-600 dark:text-purple-400"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
        >
          <span>+{xpEarned} XP</span>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        className="flex gap-3 justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <button
          onClick={onRetry}
          className={`rounded-xl border px-6 py-3 font-bold transition-all ${
            selectedIdx === 0
              ? 'border-[#fabd00] bg-[#32343e] text-[#fabd00] shadow-[0_0_12px_rgba(250,189,0,0.2)]'
              : 'border-[#494456] bg-[#282933] text-[#e1e1ef] hover:bg-[#32343e]'
          }`}
        >
          다시 하기
        </button>
        {onNextLesson && (
          <button
            onClick={onNextLesson}
            className={`rounded-xl px-6 py-3 font-bold transition-all ${
              selectedIdx === 1
                ? 'bg-[#6833ea] text-white shadow-[0_0_20px_rgba(92,31,222,0.5)] ring-2 ring-[#fabd00]'
                : 'bg-[#5c1fde] text-[#cdbdff] hover:bg-[#6833ea]'
            }`}
          >
            다음으로
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

interface StatItemProps {
  label: string;
  value: string;
  color: string;
}

function StatItem({ label, value, color }: StatItemProps) {
  return (
    <div className="rounded-xl bg-[#282933] border border-[#494456]/30 p-3 text-center">
      <div className="text-xs text-[#958da2] mb-1">{label}</div>
      <div className={`text-xl font-bold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}
