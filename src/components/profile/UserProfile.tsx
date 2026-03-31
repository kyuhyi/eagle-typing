'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGamificationStore } from '@/stores/gamification-store';
import { useProgressStore } from '@/stores/progress-store';
import { getLevelDefinition, LEVEL_DEFINITIONS } from '@/lib/gamification/levels';
import { ACHIEVEMENTS } from '@/lib/gamification/achievements';

const EVOLUTION_EMOJI: Record<number, string> = {
  0: '🥚',
  1: '🐣',
  2: '🐥',
  3: '🐤',
  4: '🦜',
  5: '🦅',
  6: '🦅',
  7: '🦅',
  8: '🦅',
  9: '👑',
};

export default function UserProfile({ onClose }: { onClose?: () => void } = {}) {
  const {
    currentLevel,
    totalXP,
    currentStreak,
    longestStreak,
    achievements,
    getLevelProgress,
  } = useGamificationStore();

  const { lessonProgress } = useProgressStore();

  const { level, progressPercent, expInLevel, expRequired } = getLevelProgress();
  const levelDef = getLevelDefinition(level);

  const completedLessons = useMemo(() => {
    return Object.values(lessonProgress).filter((p) => p.stars > 0).length;
  }, [lessonProgress]);

  const bestWpm = useMemo(() => {
    return Object.values(lessonProgress).reduce(
      (max, p) => Math.max(max, p.bestWpm ?? 0),
      0
    );
  }, [lessonProgress]);

  // Get recent achievements (last 3)
  const recentAchievements = useMemo(() => {
    const sorted = [...achievements].sort((a, b) => b.unlockedAt - a.unlockedAt);
    return sorted.slice(0, 3).map((ua) => {
      const def = ACHIEVEMENTS.find((a) => a.id === ua.achievementId);
      return { ...ua, title: def?.title ?? '???', description: def?.description ?? '' };
    });
  }, [achievements]);

  const emoji = EVOLUTION_EMOJI[level] ?? '🦅';

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-gray-900 border border-gray-700/50 rounded-2xl overflow-hidden relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        )}
        {/* Top section: avatar + level */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-6xl mb-3"
          >
            {emoji}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                {level}
              </span>
              <h2 className="text-lg font-bold text-white">
                {levelDef?.name ?? '???'}
              </h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              {levelDef?.description ?? ''}
            </p>
          </motion.div>

          {/* XP bar */}
          <div className="px-2">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>XP</span>
              <span className="tabular-nums">
                {expInLevel} / {expRequired}
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1 tabular-nums">
              Total XP: {totalXP.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 divide-x divide-gray-800 border-t border-gray-800">
          <StatBox label="Lessons" value={completedLessons.toString()} icon="📚" />
          <StatBox label="Best WPM" value={bestWpm.toString()} icon="⚡" />
          <StatBox label="Achievements" value={achievements.length.toString()} icon="🏆" />
        </div>

        {/* Streak */}
        <div className="border-t border-gray-800 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-orange-400 text-lg">🔥</span>
            <div>
              <p className="text-sm font-semibold text-white">
                {currentStreak} day streak
              </p>
              <p className="text-xs text-gray-500">
                Best: {longestStreak} days
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-sm ${
                  i < currentStreak ? 'bg-orange-500' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Recent achievements */}
        {recentAchievements.length > 0 && (
          <div className="border-t border-gray-800 px-5 py-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Recent Achievements
            </h3>
            <div className="space-y-2">
              {recentAchievements.map((ach) => (
                <motion.div
                  key={ach.achievementId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 bg-gray-800/50 rounded-lg px-3 py-2"
                >
                  <span className="text-lg">🏅</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {ach.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {ach.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="py-4 text-center">
      <span className="text-base">{icon}</span>
      <p className="text-lg font-bold text-white tabular-nums mt-1">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
