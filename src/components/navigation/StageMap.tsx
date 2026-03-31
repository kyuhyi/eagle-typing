'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_STAGES, getStagesByWorld } from '@/lib/curriculum/game-stages';
import { useProgressStore } from '@/stores/progress-store';
import { useGamificationStore } from '@/stores/gamification-store';
import type { GameStage } from '@/types';

interface StageMapProps {
  onSelectStage?: (stage: GameStage) => void;
}

const WORLD_META: Record<number, { name: string; description: string; icon: string; color: string }> = {
  1: { name: '홈로우 둥지', description: 'ASDF JKL; 홈 포지션을 익혀요', icon: '🪺', color: 'from-green-600 to-green-800' },
  2: { name: '구름 위 세계', description: 'QWER UIOP 윗줄을 정복해요', icon: '☁️', color: 'from-sky-600 to-sky-800' },
  3: { name: '대지의 숲', description: 'ZXCV NM 아랫줄을 마스터해요', icon: '🌲', color: 'from-emerald-600 to-emerald-800' },
  4: { name: '숫자 마법탑', description: '숫자와 특수문자의 세계', icon: '🏰', color: 'from-purple-600 to-purple-800' },
  5: { name: '한글 왕국', description: '한글 자음과 모음의 세계', icon: '🏯', color: 'from-rose-600 to-rose-800' },
  6: { name: '한글 도시', description: '한글 단어와 문장의 세계', icon: '🌆', color: 'from-pink-600 to-pink-800' },
  7: { name: '하늘의 왕좌', description: '최고 속도에 도전하는 최종 스테이지', icon: '👑', color: 'from-amber-600 to-amber-800' },
};

const BOSS_ICONS: Record<string, string> = {
  '거대 지렁이': '🐛',
  '폭풍 구름': '⛈️',
  '대지의 곰': '🐻',
  '코드 마법사': '🧙',
  '한글 수호신': '🐉',
  '전설의 학': '🦢',
  '하늘의 왕': '🦅',
};

function StarDisplay({ stars }: { stars: 0 | 1 | 2 | 3 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i <= stars ? 'text-yellow-400' : 'text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function StageNode({
  stage,
  isUnlocked,
  stars,
  isLast,
  onClick,
}: {
  stage: GameStage;
  isUnlocked: boolean;
  stars: 0 | 1 | 2 | 3;
  isLast: boolean;
  onClick: () => void;
}) {
  const isBoss = stage.type === 'boss';
  const bossIcon = isBoss && stage.bossConfig ? BOSS_ICONS[stage.bossConfig.name] ?? '👹' : null;

  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <motion.button
        onClick={onClick}
        disabled={!isUnlocked}
        whileHover={isUnlocked ? { scale: 1.1 } : undefined}
        whileTap={isUnlocked ? { scale: 0.95 } : undefined}
        className={`relative flex items-center justify-center transition-all ${
          isBoss
            ? `w-20 h-20 rounded-2xl border-2 ${
                isUnlocked
                  ? 'bg-gradient-to-br from-red-900/60 to-red-800/40 border-red-500/60 hover:border-red-400'
                  : 'bg-gray-800/40 border-gray-700/30 opacity-40 cursor-not-allowed'
              }`
            : `w-14 h-14 rounded-xl border ${
                isUnlocked
                  ? stars > 0
                    ? 'bg-gray-800/60 border-gray-500/50 hover:border-gray-400/60'
                    : 'bg-gray-800/80 border-gray-600/50 hover:border-amber-500/50'
                  : 'bg-gray-800/30 border-gray-700/30 opacity-40 cursor-not-allowed'
              }`
        }`}
      >
        {!isUnlocked ? (
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : isBoss ? (
          <span className="text-3xl">{bossIcon}</span>
        ) : (
          <span className="text-white text-sm font-bold">{stage.stage}</span>
        )}
      </motion.button>

      {/* Title + Stars */}
      <div className="mt-2 text-center max-w-24">
        <p
          className={`text-xs font-medium leading-tight ${
            isUnlocked ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          {stage.title}
        </p>
        {isUnlocked && stars > 0 && (
          <div className="mt-1 flex justify-center">
            <StarDisplay stars={stars} />
          </div>
        )}
      </div>

      {/* Connector line */}
      {!isLast && (
        <div className="w-px h-6 bg-gray-700 mt-2" />
      )}
    </div>
  );
}

export default function StageMap({ onSelectStage }: StageMapProps) {
  const [selectedWorld, setSelectedWorld] = useState<number | null>(null);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminInput, setAdminInput] = useState('');
  const [adminError, setAdminError] = useState(false);
  const { lessonProgress } = useProgressStore();

  const handleAdminSubmit = () => {
    if (adminInput === '1212') {
      setAdminUnlocked(true);
      setShowAdminModal(false);
      setAdminInput('');
      setAdminError(false);
    } else {
      setAdminError(true);
    }
  };

  // Calculate total stars
  const totalStars = useMemo(() => {
    return Object.values(lessonProgress).reduce((sum, p) => sum + (p.stars ?? 0), 0);
  }, [lessonProgress]);

  // Determine unlocked stages
  const unlockedStageIds = useMemo(() => {
    const set = new Set<string>();
    for (const stage of GAME_STAGES) {
      if (adminUnlocked || stage.requiredStars <= totalStars) {
        set.add(stage.id);
      }
    }
    return set;
  }, [totalStars, adminUnlocked]);

  // Get stage stars from linked lesson progress
  const getStageStars = (stage: GameStage): 0 | 1 | 2 | 3 => {
    if (stage.lessonIds.length === 0) return 0;
    const starValues = stage.lessonIds.map(
      (lid) => lessonProgress[lid]?.stars ?? 0
    );
    return Math.min(...starValues) as 0 | 1 | 2 | 3;
  };

  // Check if world is unlocked (first stage of world is unlocked)
  const isWorldUnlocked = (world: number): boolean => {
    if (adminUnlocked) return true;
    const stages = getStagesByWorld(world);
    return stages.length > 0 && unlockedStageIds.has(stages[0].id);
  };

  const selectedWorldStages = selectedWorld ? getStagesByWorld(selectedWorld) : [];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Adventure Map</h1>
          <p className="text-sm text-gray-500">총 별: {totalStars}개</p>
        </div>
        {!adminUnlocked ? (
          <button
            onClick={() => setShowAdminModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#282933] text-[#958da2] border border-[#494456]/40 hover:text-[#fabd00] hover:border-[#fabd00]/40 transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lock</span>
            전체 잠금해제
          </button>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#4ade80]">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lock_open</span>
            전체 해제됨
          </span>
        )}
      </div>

      {/* Admin password modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAdminModal(false)}>
          <div
            className="rounded-2xl border border-[#494456]/50 p-6 w-80"
            style={{ background: 'rgba(29, 31, 41, 0.95)', backdropFilter: 'blur(24px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#e1e1ef] mb-1">관리자 잠금해제</h3>
            <p className="text-sm text-[#958da2] mb-4">비밀번호를 입력하면 모든 스테이지가 열립니다.</p>
            <input
              type="password"
              value={adminInput}
              onChange={(e) => { setAdminInput(e.target.value); setAdminError(false); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdminSubmit(); }}
              placeholder="비밀번호 입력"
              autoFocus
              className={`w-full px-4 py-3 rounded-xl bg-[#282933] border text-[#e1e1ef] placeholder-[#958da2]/50 focus:outline-none text-sm ${
                adminError ? 'border-[#ffb4ab] focus:ring-1 focus:ring-[#ffb4ab]' : 'border-[#494456] focus:ring-1 focus:ring-[#cdbdff]'
              }`}
            />
            {adminError && <p className="text-xs text-[#ffb4ab] mt-2">비밀번호가 틀렸습니다.</p>}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowAdminModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#494456] bg-[#282933] text-[#e1e1ef] font-semibold text-sm hover:bg-[#32343e] transition-all"
              >
                취소
              </button>
              <button
                onClick={handleAdminSubmit}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#5c1fde] text-[#cdbdff] font-semibold text-sm hover:bg-[#6833ea] transition-all"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* World selector grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        {[1, 2, 3, 4, 5, 6, 7].map((world) => {
          const meta = WORLD_META[world];
          const unlocked = isWorldUnlocked(world);
          const worldStages = getStagesByWorld(world);
          const bossStage = worldStages.find((s) => s.type === 'boss');
          const bossIcon = bossStage?.bossConfig
            ? BOSS_ICONS[bossStage.bossConfig.name] ?? '👹'
            : '❓';

          return (
            <motion.button
              key={world}
              onClick={() => unlocked && setSelectedWorld(world === selectedWorld ? null : world)}
              disabled={!unlocked}
              whileHover={unlocked ? { scale: 1.03 } : undefined}
              whileTap={unlocked ? { scale: 0.97 } : undefined}
              className={`relative rounded-xl p-4 border text-left transition-all ${
                !unlocked
                  ? 'bg-gray-800/30 border-gray-700/20 opacity-40 cursor-not-allowed'
                  : selectedWorld === world
                  ? `bg-gradient-to-br ${meta.color} border-white/20 ring-2 ring-white/10`
                  : `bg-gradient-to-br ${meta.color} border-white/10 hover:border-white/20`
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{meta.icon}</span>
                <span className="text-lg">{bossIcon}</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-0.5">
                World {world}
              </h3>
              <p className="text-xs text-white/70 font-medium">{meta.name}</p>
              <p className="text-xs text-white/50 mt-1">{meta.description}</p>
              <div className="mt-2 text-xs text-white/60">
                {worldStages.length} stages
              </div>

              {/* Lock overlay */}
              {!unlocked && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-gray-900/50">
                  <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected world stages */}
      <AnimatePresence mode="wait">
        {selectedWorld !== null && (
          <motion.div
            key={selectedWorld}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-6">
              <h2 className="text-lg font-bold text-white mb-1">
                {WORLD_META[selectedWorld].icon} {WORLD_META[selectedWorld].name}
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                {WORLD_META[selectedWorld].description}
              </p>

              <div className="flex flex-wrap justify-center gap-6">
                {selectedWorldStages.map((stage, idx) => (
                  <StageNode
                    key={stage.id}
                    stage={stage}
                    isUnlocked={unlockedStageIds.has(stage.id)}
                    stars={getStageStars(stage)}
                    isLast={idx === selectedWorldStages.length - 1}
                    onClick={() => onSelectStage?.(stage)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
