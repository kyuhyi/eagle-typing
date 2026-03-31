'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

interface ComboEffectProps {
  streak: number;
  isActive: boolean;
}

const MILESTONES = [10, 20, 50, 100] as const;

function getMilestoneLabel(streak: number): string | null {
  if (streak >= 100) return '🔥 UNSTOPPABLE 🔥';
  if (streak >= 50) return '🔥 ON FIRE 🔥';
  if (streak >= 20) return '🔥 BLAZING!';
  if (streak >= 10) return '🔥 HOT!';
  return null;
}

function getComboColor(streak: number): string {
  if (streak >= 50) return 'text-red-400';
  if (streak >= 20) return 'text-orange-400';
  if (streak >= 10) return 'text-amber-400';
  return 'text-gray-400';
}

function getGlowColor(streak: number): string {
  if (streak >= 50) return 'drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]';
  if (streak >= 20) return 'drop-shadow-[0_0_12px_rgba(251,146,60,0.7)]';
  if (streak >= 10) return 'drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]';
  return '';
}

export default function ComboEffect({ streak, isActive }: ComboEffectProps) {
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneText, setMilestoneText] = useState('');
  const [shake, setShake] = useState(false);
  const controls = useAnimation();

  // Detect milestone hits
  useEffect(() => {
    if (!isActive || streak <= 0) return;

    const isMilestone = MILESTONES.includes(streak as typeof MILESTONES[number]);
    if (isMilestone) {
      setMilestoneText(getMilestoneLabel(streak) ?? '');
      setShowMilestone(true);
      setShake(true);

      const timer = setTimeout(() => setShowMilestone(false), 1500);
      const shakeTimer = setTimeout(() => setShake(false), 500);
      return () => {
        clearTimeout(timer);
        clearTimeout(shakeTimer);
      };
    }
  }, [streak, isActive]);

  // Pulse animation on every keystroke in combo
  useEffect(() => {
    if (streak > 0 && isActive) {
      controls.start({
        scale: [1, 1.15, 1],
        transition: { duration: 0.15 },
      });
    }
  }, [streak, isActive, controls]);

  if (!isActive || streak < 5) return null;

  const comboColor = getComboColor(streak);
  const glowClass = getGlowColor(streak);

  return (
    <div className="relative">
      {/* Screen shake wrapper - applies to parent via CSS class */}
      {shake && (
        <style>{`
          .combo-screen-shake {
            animation: combo-shake 0.4s ease-out;
          }
          @keyframes combo-shake {
            0%, 100% { transform: translate(0, 0); }
            10% { transform: translate(-4px, -2px); }
            20% { transform: translate(4px, 2px); }
            30% { transform: translate(-3px, 1px); }
            40% { transform: translate(3px, -1px); }
            50% { transform: translate(-2px, 2px); }
            60% { transform: translate(2px, -2px); }
            70% { transform: translate(-1px, 1px); }
            80% { transform: translate(1px, -1px); }
          }
        `}</style>
      )}

      {/* Combo counter */}
      <motion.div
        animate={controls}
        className={`flex items-center gap-2 ${glowClass}`}
      >
        {/* Fire particles for 10+ streak */}
        {streak >= 10 && (
          <div className="relative">
            {Array.from({ length: Math.min(Math.floor(streak / 10), 5) }).map((_, i) => (
              <motion.span
                key={`fire-${i}`}
                className="absolute text-sm pointer-events-none"
                style={{ left: `${i * 6 - 12}px` }}
                animate={{
                  y: [0, -20, -30],
                  opacity: [1, 0.8, 0],
                  scale: [1, 1.2, 0.5],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeOut',
                }}
              >
                🔥
              </motion.span>
            ))}
          </div>
        )}

        <div className={`font-mono font-extrabold text-lg tabular-nums ${comboColor}`}>
          {streak}
        </div>

        <div className={`text-xs font-bold uppercase tracking-wider ${comboColor}`}>
          combo
        </div>

        {/* Extra fire effect at 20+ */}
        {streak >= 20 && (
          <motion.span
            className="text-base"
            animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            🔥
          </motion.span>
        )}

        {/* Double fire at 50+ */}
        {streak >= 50 && (
          <motion.span
            className="text-lg"
            animate={{ scale: [1, 1.4, 1], y: [0, -3, 0] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          >
            💥
          </motion.span>
        )}
      </motion.div>

      {/* Milestone popup */}
      <AnimatePresence>
        {showMilestone && milestoneText && (
          <motion.div
            className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none z-50"
            initial={{ scale: 0.3, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 10, stiffness: 200 }}
          >
            <span className={`text-xl font-extrabold ${comboColor} ${glowClass}`}>
              {milestoneText}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
