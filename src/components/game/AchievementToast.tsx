'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Achievement } from '@/types';

const CATEGORY_ICONS: Record<string, string> = {
  speed: '⚡',
  accuracy: '🎯',
  streak: '🔥',
  korean: '🇰🇷',
  lesson: '📚',
  daily: '☀️',
  special: '🌟',
};

interface AchievementToastProps {
  achievement: Achievement;
  onDismiss: () => void;
  autoCloseMs?: number;
}

export default function AchievementToast({
  achievement,
  onDismiss,
  autoCloseMs = 3000,
}: AchievementToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, autoCloseMs);
    return () => clearTimeout(timer);
  }, [onDismiss, autoCloseMs]);

  const icon = CATEGORY_ICONS[achievement.category] ?? '🏅';

  return (
    <motion.div
      className="fixed top-6 right-6 z-[60] pointer-events-auto"
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
    >
      <div
        className="flex items-start gap-3 px-5 py-4 rounded-xl bg-gray-900 border border-amber-500/40 shadow-lg shadow-amber-500/10 max-w-xs cursor-pointer"
        onClick={onDismiss}
      >
        {/* Icon */}
        <motion.div
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-amber-500/15 text-2xl"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 8, stiffness: 200, delay: 0.15 }}
        >
          {icon}
        </motion.div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <motion.p
            className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.15em] mb-0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            업적 달성!
          </motion.p>
          <motion.p
            className="text-sm font-bold text-white truncate"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            {achievement.title}
          </motion.p>
          <motion.p
            className="text-xs text-gray-400 truncate mt-0.5"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {achievement.description}
          </motion.p>
          {/* XP reward */}
          <motion.p
            className="text-[10px] text-amber-500/80 mt-1 font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            +{achievement.reward.exp} XP
          </motion.p>
        </div>

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 1.5, delay: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent -translate-x-full animate-[shimmer_1.5s_ease-in-out_1]" />
        </motion.div>

        {/* Auto-close progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-amber-500/50 rounded-b-xl"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: autoCloseMs / 1000, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
}
