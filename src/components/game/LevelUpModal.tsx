'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLevelDefinition } from '@/lib/gamification/levels';

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

interface LevelUpModalProps {
  oldLevel: number;
  newLevel: number;
  onClose: () => void;
}

export default function LevelUpModal({ oldLevel, newLevel, onClose }: LevelUpModalProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [phase, setPhase] = useState<'evolve' | 'details'>('evolve');

  const oldEmoji = EVOLUTION_EMOJI[oldLevel] ?? '🦅';
  const newEmoji = EVOLUTION_EMOJI[newLevel] ?? '🦅';
  const newLevelDef = getLevelDefinition(newLevel);
  const perks = newLevelDef?.perks ?? [];

  useEffect(() => {
    const timer = setTimeout(() => setPhase('details'), 1800);
    const confettiTimer = setTimeout(() => setShowConfetti(false), 4000);
    return () => {
      clearTimeout(timer);
      clearTimeout(confettiTimer);
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Confetti particles */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#fbbf24', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#22c55e'][i % 6],
              }}
              initial={{ top: '-5%', opacity: 1, rotate: 0 }}
              animate={{
                top: '110%',
                opacity: [1, 1, 0.5, 0],
                rotate: Math.random() * 720 - 360,
                x: Math.random() * 200 - 100,
              }}
              transition={{
                duration: 2.5 + Math.random() * 1.5,
                delay: Math.random() * 0.8,
                ease: 'easeIn',
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        className="relative w-full max-w-sm mx-4 bg-gray-900 border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl shadow-amber-500/10"
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 150 }}
      >
        {/* Glow header */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-amber-500/20 to-transparent pointer-events-none" />

        <div className="relative p-8 text-center">
          {/* Title */}
          <motion.p
            className="text-sm font-bold text-amber-400 uppercase tracking-[0.3em] mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Level Up!
          </motion.p>

          {/* Evolution animation */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <motion.div
              className="text-5xl"
              initial={{ opacity: 1, scale: 1 }}
              animate={phase === 'evolve'
                ? { opacity: [1, 1, 0.3], scale: [1, 1.1, 0.8] }
                : { opacity: 0.3, scale: 0.8 }
              }
              transition={{ duration: 1.2 }}
            >
              {oldEmoji}
            </motion.div>

            <motion.div
              className="text-2xl text-amber-400"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
            >
              →
            </motion.div>

            <motion.div
              className="text-5xl"
              initial={{ opacity: 0, scale: 0.3, filter: 'brightness(2)' }}
              animate={{
                opacity: 1,
                scale: [0.3, 1.3, 1],
                filter: ['brightness(2)', 'brightness(1.5)', 'brightness(1)'],
              }}
              transition={{ delay: 0.8, duration: 0.8, type: 'spring', damping: 10 }}
            >
              {newEmoji}
            </motion.div>
          </div>

          {/* Level info */}
          <AnimatePresence>
            {phase === 'details' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 text-sm font-bold border border-amber-500/30">
                    {newLevel}
                  </span>
                  <h2 className="text-2xl font-extrabold text-white">
                    {newLevelDef?.name ?? '???'}
                  </h2>
                </div>

                <p className="text-sm text-gray-400 mb-5">
                  {newLevelDef?.description ?? ''}
                </p>

                {/* New perks */}
                {perks.length > 0 && (
                  <div className="bg-gray-800/60 rounded-xl p-4 mb-6 text-left">
                    <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">
                      새로운 보상
                    </p>
                    <ul className="space-y-2">
                      {perks.map((perk, i) => (
                        <motion.li
                          key={i}
                          className="flex items-center gap-2 text-sm text-gray-300"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * i }}
                        >
                          <span className="text-amber-400">✦</span>
                          {perk.description}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                <motion.button
                  className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-gray-900 font-bold text-base transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                >
                  계속하기
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
