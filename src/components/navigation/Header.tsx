'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGamificationStore } from '@/stores/gamification-store';
import { getLevelDefinition } from '@/lib/gamification/levels';

interface HeaderProps {
  onHomeClick?: () => void;
  onSettingsClick?: () => void;
  onProfileClick?: () => void;
  dailyGoal?: number;       // target sessions or chars for today
  dailyProgress?: number;   // current progress toward daily goal
}

const RING_SIZE = 32;
const RING_STROKE = 3;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function Header({
  onHomeClick,
  onSettingsClick,
  onProfileClick,
  dailyGoal = 5,
  dailyProgress = 0,
}: HeaderProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { currentStreak, getLevelProgress } = useGamificationStore();
  const { level, progressPercent, expInLevel, expRequired } = getLevelProgress();
  const levelDef = getLevelDefinition(level);

  // SSR 안전 값
  const safeLevel = mounted ? level : 0;
  const safeName = mounted ? (levelDef?.name ?? '???') : '...';
  const safePercent = mounted ? progressPercent : 0;
  const safeExpIn = mounted ? expInLevel : 0;
  const safeExpReq = mounted ? expRequired : 1;
  const safeStreak = mounted ? currentStreak : 0;

  const goalPercent = dailyGoal > 0 ? Math.min(100, (dailyProgress / dailyGoal) * 100) : 0;
  const goalComplete = goalPercent >= 100;
  const dashOffset = RING_CIRCUMFERENCE - (goalPercent / 100) * RING_CIRCUMFERENCE;

  return (
    <header className="sticky top-0 z-50 bg-[#11131c]/80 backdrop-blur-xl border-b border-[#494456]/60">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <motion.button
          onClick={onHomeClick}
          className="flex items-center bg-transparent border-none cursor-pointer"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          <img
            src="/bsd-white.png"
            alt="BSD TYPING"
            className="h-8 w-auto"
          />
        </motion.button>

        {/* Center: Level badge + XP bar — glass panel */}
        <motion.div
          className="hidden sm:flex items-center gap-3 px-4 py-1.5 rounded-2xl border border-[#494456]/80"
          style={{ background: 'rgba(29, 31, 41, 0.7)', backdropFilter: 'blur(24px)' }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {/* Level badge */}
          <div className="flex items-center gap-1.5">
            <span
              className="material-symbols-outlined select-none"
              style={{ fontSize: '18px', color: '#fabd00', lineHeight: 1 }}
            >
              military_tech
            </span>
            <span
              className="text-sm font-bold tabular-nums"
              style={{ color: '#fabd00', textShadow: '0 0 10px rgba(250, 189, 0, 0.3)' }}
            >
              Lv.{safeLevel}
            </span>
            <span className="text-xs font-medium" style={{ color: '#cbc3d9' }}>
              {safeName}
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-[#494456]" />

          {/* XP bar */}
          <div className="flex items-center gap-2">
            <div className="w-28 h-1.5 rounded-full overflow-hidden bg-[#282933]">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(to right, #5c1fde, #cdbdff)' }}
                initial={{ width: 0 }}
                animate={{ width: `${safePercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <span className="text-xs tabular-nums" style={{ color: '#958da2' }}>
              {safeExpIn}/{safeExpReq}
            </span>
          </div>
        </motion.div>

        {/* Right: Daily Goal Ring + Streak + Settings + Profile */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          {/* Daily Goal Progress Ring */}
          <div
            className="relative flex items-center justify-center"
            title={`Daily goal: ${dailyProgress}/${dailyGoal}`}
          >
            <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                stroke="#282933"
                strokeWidth={RING_STROKE}
              />
              <motion.circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                stroke={goalComplete ? '#4ade80' : '#cdbdff'}
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </svg>
            <span
              className="absolute text-[9px] font-bold tabular-nums"
              style={{ color: '#e1e1ef' }}
            >
              {goalComplete ? '✓' : dailyProgress}
            </span>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-1">
            <span
              className="material-symbols-outlined select-none"
              style={{ fontSize: '18px', color: '#fabd00', lineHeight: 1 }}
            >
              local_fire_department
            </span>
            <span className="text-sm font-semibold tabular-nums" style={{ color: '#e1e1ef' }}>
              {safeStreak}
            </span>
          </div>

          {/* Settings button */}
          <button
            onClick={onSettingsClick}
            className="p-2 rounded-xl transition-colors duration-200 hover:bg-[#282933]"
            style={{ color: '#958da2' }}
            aria-label="Settings"
          >
            <span
              className="material-symbols-outlined select-none hover:text-[#e1e1ef]"
              style={{ fontSize: '20px', lineHeight: 1 }}
            >
              settings
            </span>
          </button>

          {/* Profile button */}
          <button
            onClick={onProfileClick}
            className="p-2 rounded-xl transition-colors duration-200 hover:bg-[#282933]"
            style={{ color: '#958da2' }}
            aria-label="Profile"
          >
            <span
              className="material-symbols-outlined select-none hover:text-[#cdbdff]"
              style={{ fontSize: '20px', lineHeight: 1 }}
            >
              person
            </span>
          </button>
        </motion.div>

      </div>
    </header>
  );
}
