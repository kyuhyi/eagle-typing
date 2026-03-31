'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ENGLISH_LESSONS } from '@/lib/curriculum/english-curriculum';
import { KOREAN_LESSONS } from '@/lib/curriculum/korean-curriculum';
import { useProgressStore } from '@/stores/progress-store';
import type { Lesson } from '@/types';

interface LessonSelectorProps {
  onSelectLesson: (lesson: Lesson) => void;
}

const ENGLISH_PHASES = [
  { key: 'phase1', title: 'Phase 1: 홈로우', description: '타이핑의 기본 홈 포지션을 익혀요', lessonRange: [1, 4] },
  { key: 'phase2', title: 'Phase 2: 윗줄', description: 'QWERTY 윗줄을 정복해요', lessonRange: [5, 7] },
  { key: 'phase3', title: 'Phase 3: 아랫줄 + 전체', description: '아랫줄까지 마스터해요', lessonRange: [8, 10] },
  { key: 'phase4', title: 'Phase 4: 숫자 & 특수문자', description: '숫자와 특수문자를 익혀요', lessonRange: [11, 13] },
  { key: 'phase5', title: 'Phase 5: 단어 & 문장', description: '실용적인 문장을 타이핑해요', lessonRange: [14, 16] },
  { key: 'phase6', title: 'Phase 6: 속도 훈련', description: '최고 속도에 도전해요', lessonRange: [17, 20] },
] as const;

const KOREAN_PHASES = [
  { key: 'kphase1', title: 'Phase 1: 기본 음절', description: '가나다라마 기본 음절을 익혀요', lessonRange: [1, 3] },
  { key: 'kphase2', title: 'Phase 2: 모음 확장', description: '다양한 모음 음절과 쉬운 단어', lessonRange: [4, 5] },
  { key: 'kphase3', title: 'Phase 3: 받침 음절', description: '받침이 있는 음절과 단어', lessonRange: [6, 9] },
  { key: 'kphase4', title: 'Phase 4: 단어', description: '한글 단어를 타이핑해요', lessonRange: [10, 13] },
  { key: 'kphase5', title: 'Phase 5: 문장', description: '한글 문장을 타이핑해요', lessonRange: [14, 17] },
  { key: 'kphase6', title: 'Phase 6: 속도 훈련', description: '한글 속도에 도전해요', lessonRange: [18, 20] },
] as const;

const PHASE_LESSON_ICONS: string[][] = [
  ['keyboard', 'home_work', 'dashboard_customize', 'grid_view'],
  ['arrow_upward', 'auto_fix_normal', 'flare'],
  ['shield', 'security', 'all_inclusive'],
  ['tag', 'pin', 'data_array'],
  ['history_edu', 'article', 'description'],
  ['bolt', 'local_fire_department', 'rocket_launch', 'military_tech'],
];

function getLessonIcon(phaseIndex: number, posInPhase: number): string {
  const icons = PHASE_LESSON_ICONS[phaseIndex] ?? ['keyboard'];
  return icons[posInPhase % icons.length];
}

function LessonCard({
  lesson,
  isUnlocked,
  isCurrent,
  isBoss,
  stars,
  icon,
  onClick,
}: {
  lesson: Lesson;
  isUnlocked: boolean;
  isCurrent: boolean;
  isBoss: boolean;
  stars: 0 | 1 | 2 | 3;
  icon: string;
  onClick: () => void;
}) {
  const isCleared = stars > 0;
  const progressPct = (stars / 3) * 100;

  // ── Border style per state ──────────────────────────────────────
  const borderStyle: React.CSSProperties = !isUnlocked
    ? {
        borderLeft: '1px solid rgba(73,68,86,0.12)',
        borderRight: '1px solid rgba(73,68,86,0.12)',
        borderTop: '1px solid rgba(73,68,86,0.07)',
        borderBottom: '1px solid rgba(73,68,86,0.07)',
      }
    : isBoss
    ? {
        borderLeft: '1px solid rgba(250,189,0,0.25)',
        borderRight: '1px solid rgba(250,189,0,0.25)',
        borderTop: '1px solid rgba(250,189,0,0.12)',
        borderBottom: '1px solid rgba(250,189,0,0.08)',
      }
    : isCleared
    ? {
        borderLeft: '1px solid rgba(205,189,255,0.2)',
        borderRight: '1px solid rgba(205,189,255,0.2)',
        borderTop: '1px solid rgba(205,189,255,0.1)',
        borderBottom: '1px solid rgba(205,189,255,0.06)',
        boxShadow: '0 0 20px rgba(92,31,222,0.06)',
      }
    : {
        borderLeft: '1px solid rgba(73,68,86,0.15)',
        borderRight: '1px solid rgba(73,68,86,0.15)',
        borderTop: '1px solid rgba(73,68,86,0.08)',
        borderBottom: '1px solid rgba(73,68,86,0.06)',
      };

  const bgStyle: React.CSSProperties = !isUnlocked
    ? { background: 'rgba(22,24,32,0.5)', backdropFilter: 'blur(24px)' }
    : isBoss
    ? {
        background:
          'linear-gradient(135deg, rgba(50,52,62,0.6) 0%, rgba(250,189,0,0.05) 100%)',
        backdropFilter: 'blur(24px)',
      }
    : { background: 'rgba(50,52,62,0.6)', backdropFilter: 'blur(24px)' };

  const iconColor = !isUnlocked
    ? '#494456'
    : isBoss
    ? '#fabd00'
    : isCleared
    ? '#cdbdff'
    : '#958da2';

  const buttonLabel = !isUnlocked
    ? 'LOCKED'
    : isCleared
    ? 'REPLAY'
    : isCurrent
    ? 'ENTER'
    : 'START';

  return (
    <motion.div
      className={`relative rounded-xl p-5 flex flex-col gap-4 transition-all duration-200 group ${
        isUnlocked ? 'cursor-pointer hover:-translate-y-2 hover:border-[#cdbdff]/40' : 'opacity-50'
      } ${isCurrent && isUnlocked ? 'ring-1 ring-[#cdbdff]/20' : ''}`}
      style={{ ...bgStyle, ...borderStyle }}
      whileHover={isUnlocked ? { y: -8 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      {/* Current lesson pulse indicator */}
      {isCurrent && isUnlocked && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 z-10">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#cdbdff] opacity-50" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-[#5c1fde] border border-[#cdbdff]/40" />
        </span>
      )}

      {/* Boss glow accent */}
      {isBoss && isUnlocked && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden"
          style={{
            background:
              'radial-gradient(ellipse at 80% 20%, rgba(250,189,0,0.07) 0%, transparent 60%)',
          }}
        />
      )}

      {/* Icon + status badge */}
      <div className="flex items-start justify-between">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{
            background: isBoss && isUnlocked ? 'rgba(250,189,0,0.08)' : '#282933',
            border: isBoss && isUnlocked
              ? '1px solid rgba(250,189,0,0.2)'
              : '1px solid rgba(73,68,86,0.25)',
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '24px', color: iconColor }}
          >
            {isUnlocked ? icon : 'lock'}
          </span>
        </div>

        {isBoss ? (
          <span
            className="text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(250,189,0,0.1)',
              color: '#fabd00',
              border: '1px solid rgba(250,189,0,0.3)',
            }}
          >
            BOSS
          </span>
        ) : isCleared ? (
          <span
            className="text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(250,189,0,0.1)',
              color: '#fabd00',
              border: '1px solid rgba(250,189,0,0.3)',
            }}
          >
            CLEARED
          </span>
        ) : isUnlocked ? (
          <span
            className="text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(92,31,222,0.15)',
              color: '#cdbdff',
              border: '1px solid rgba(205,189,255,0.2)',
            }}
          >
            LV.{lesson.order}
          </span>
        ) : (
          <span
            className="text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(22,24,32,0.5)',
              color: '#494456',
              border: '1px solid rgba(73,68,86,0.2)',
            }}
          >
            LOCKED
          </span>
        )}
      </div>

      {/* Title + description */}
      <div className="flex-1">
        <h3
          className="text-xl font-semibold mb-1.5"
          style={{ color: isBoss && isUnlocked ? '#fabd00' : '#e1e1ef' }}
        >
          {lesson.title}
        </h3>
        <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#958da2' }}>
          {lesson.description}
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full overflow-hidden bg-[#32343e]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progressPct}%`,
            background:
              isBoss || isCleared
                ? 'linear-gradient(to right, #fabd00, #ffd260)'
                : 'linear-gradient(to right, #5c1fde, #cdbdff)',
          }}
        />
      </div>

      {/* CTA button */}
      <button
        onClick={isUnlocked ? onClick : undefined}
        disabled={!isUnlocked}
        className={`w-full py-3 rounded-md text-sm font-bold tracking-widest transition-all duration-200 ${
          !isUnlocked
            ? 'cursor-not-allowed'
            : isBoss
            ? 'border border-[#fabd00]/30 text-[#fabd00] hover:bg-[#fabd00]/10'
            : isCurrent
            ? 'bg-[#5c1fde] text-[#cdbdff] hover:bg-[#6833ea]'
            : 'text-[#e1e1ef] hover:bg-[#5c1fde] hover:text-[#cdbdff]'
        }`}
        style={
          !isUnlocked
            ? { background: 'rgba(22,24,32,0.4)', color: 'rgba(73,68,86,0.7)' }
            : !isCurrent && !isBoss
            ? { background: '#32343e' }
            : isBoss
            ? { background: '#32343e' }
            : undefined
        }
      >
        {buttonLabel}
      </button>
    </motion.div>
  );
}

export default function LessonSelector({ onSelectLesson }: LessonSelectorProps) {
  const [tab, setTab] = useState<'english' | 'korean'>('korean');
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminInput, setAdminInput] = useState('');
  const [adminError, setAdminError] = useState(false);
  const { lessonProgress } = useProgressStore();

  const lessons = tab === 'english' ? ENGLISH_LESSONS : KOREAN_LESSONS;
  const phases = tab === 'english' ? ENGLISH_PHASES : KOREAN_PHASES;

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

  const unlockedSet = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      if (adminUnlocked) {
        set.add(lesson.id);
      } else if (i === 0) {
        set.add(lesson.id);
      } else {
        const prevLesson = lessons[i - 1];
        const prevProgress = lessonProgress[prevLesson.id];
        if (prevProgress && prevProgress.stars > 0) {
          set.add(lesson.id);
        }
      }
    }
    return set;
  }, [lessons, lessonProgress, adminUnlocked]);

  const currentLessonId = useMemo(() => {
    for (const lesson of lessons) {
      if (unlockedSet.has(lesson.id)) {
        const progress = lessonProgress[lesson.id];
        if (!progress || progress.stars === 0) {
          return lesson.id;
        }
      }
    }
    return lessons[lessons.length - 1]?.id;
  }, [lessons, unlockedSet, lessonProgress]);

  const stats = useMemo(() => {
    const completed = Object.values(lessonProgress).filter((p) => p.stars > 0).length;
    const totalStars = Object.values(lessonProgress).reduce(
      (sum, p) => sum + (p.stars ?? 0),
      0
    );
    return { completed, totalStars };
  }, [lessonProgress]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">

      {/* ══════════════════════════════════════════
          CHAPTER HEADER
      ══════════════════════════════════════════ */}
      <div className="mb-10">
        {/* Chapter badge */}
        <div className="mb-4">
          <span
            className="inline-flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{
              background: 'rgba(205,189,255,0.1)',
              borderLeft: '2px solid #cdbdff',
              borderRadius: '0 4px 4px 0',
              color: '#cdbdff',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>book</span>
            {tab === 'korean' ? 'Chapter KR — 자리 연습' : 'Chapter EN — Position Practice'}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight" style={{ color: '#e1e1ef' }}>
          {tab === 'korean' ? '자리 연습: ' : 'Key Mastery: '}
          <span style={{ color: '#cdbdff' }}>
            {tab === 'korean' ? '수련의 시작' : 'Beginning of Training'}
          </span>
        </h1>

        {/* Description */}
        <p className="text-lg leading-relaxed max-w-2xl" style={{ color: '#958da2' }}>
          {tab === 'korean'
            ? '어둠의 성소에 발을 디딘 수련자여. 자판의 위치를 손가락에 새기는 것이 모든 전투의 시작이니라. 단계를 차례로 밟아 마스터의 경지에 오르라.'
            : "Initiate who has set foot in the dark sanctum — carving the key positions into your fingers is the beginning of all battles. Ascend each phase to reach the master's realm."}
        </p>
      </div>

      {/* ══════════════════════════════════════════
          TAB SWITCHER + ADMIN UNLOCK
      ══════════════════════════════════════════ */}
      <div className="flex gap-2 mb-8 items-center">
        {(['korean', 'english'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === t
                ? 'bg-[#5c1fde] text-[#cdbdff] shadow-[0_0_12px_rgba(92,31,222,0.3)]'
                : 'bg-[#282933] text-[#958da2] hover:text-[#e1e1ef] hover:bg-[#32343e] border border-[#494456]/40'
            }`}
          >
            {t === 'korean' ? '한글 (Korean)' : '영문 (English)'}
          </button>
        ))}
        <div className="flex-1" />
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

      {/* ══════════════════════════════════════════
          ADMIN PASSWORD MODAL
      ══════════════════════════════════════════ */}
      {showAdminModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowAdminModal(false)}
        >
          <div
            className="rounded-2xl border border-[#494456]/50 p-6 w-80"
            style={{ background: 'rgba(29, 31, 41, 0.95)', backdropFilter: 'blur(24px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#e1e1ef] mb-1">관리자 잠금해제</h3>
            <p className="text-sm text-[#958da2] mb-4">비밀번호를 입력하면 모든 레슨이 열립니다.</p>
            <input
              type="password"
              value={adminInput}
              onChange={(e) => {
                setAdminInput(e.target.value);
                setAdminError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdminSubmit();
              }}
              placeholder="비밀번호 입력"
              autoFocus
              className={`w-full px-4 py-3 rounded-xl bg-[#282933] border text-[#e1e1ef] placeholder-[#958da2]/50 focus:outline-none text-sm ${
                adminError
                  ? 'border-[#ffb4ab] focus:ring-1 focus:ring-[#ffb4ab]'
                  : 'border-[#494456] focus:ring-1 focus:ring-[#cdbdff]'
              }`}
            />
            {adminError && (
              <p className="text-xs text-[#ffb4ab] mt-2">비밀번호가 틀렸습니다.</p>
            )}
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

      {/* ══════════════════════════════════════════
          DUNGEON PHASE SECTIONS
      ══════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-10"
        >
          {phases.map((phase, phaseIndex) => {
            const [start, end] = phase.lessonRange;
            const phaseLessons = lessons.filter(
              (l) => l.order >= start && l.order <= end
            );
            const isLastPhase = phaseIndex === phases.length - 1;

            return (
              <section key={phase.key}>
                {/* Phase header */}
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className="shrink-0 inline-flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em]"
                    style={{
                      background: isLastPhase
                        ? 'rgba(250,189,0,0.08)'
                        : 'rgba(92,31,222,0.1)',
                      borderLeft: isLastPhase
                        ? '2px solid rgba(250,189,0,0.5)'
                        : '2px solid rgba(92,31,222,0.6)',
                      borderRadius: '0 4px 4px 0',
                      color: isLastPhase ? '#fabd00' : '#cdbdff',
                    }}
                  >
                    {phase.title.split(':')[0]}
                  </div>
                  <p className="text-xs shrink-0" style={{ color: '#958da2' }}>
                    {phase.description}
                  </p>
                  <div className="flex-1 h-px" style={{ background: 'rgba(73,68,86,0.2)' }} />
                </div>

                {/* Dungeon card grid — 4 cols on large */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {phaseLessons.map((lesson, posInPhase) => {
                    const progress = lessonProgress[lesson.id];
                    const isUnlocked = unlockedSet.has(lesson.id);
                    const stars = (progress?.stars ?? 0) as 0 | 1 | 2 | 3;
                    const isBoss = posInPhase === phaseLessons.length - 1;
                    const icon = getLessonIcon(phaseIndex, posInPhase);

                    return (
                      <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        isUnlocked={isUnlocked}
                        isCurrent={lesson.id === currentLessonId}
                        isBoss={isBoss}
                        stars={stars}
                        icon={icon}
                        onClick={() => onSelectLesson(lesson)}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          BOTTOM DECORATION — 훈련 성과
      ══════════════════════════════════════════ */}
      <div className="mt-12 rounded-3xl overflow-hidden relative h-48">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDwN1tDqbLqpSOndAcgj4yzMPHTakwoRBos75lwXo5xMvrHoA-KaPblRmkoh74V2QXZQOGS7ZjEU_n5obsX3DKngBeIss0rIKViGVJ-stt-iiIn4G44rozcEkFfFHcNt4sUeIlBMwTXsLXDXqfAmJPfO2X1rzpPYup0vcyuKZm_kX6J4sVf9oD8yhcnEHTsBdz5quBO2OMS99VQGHJit6C0F9ONSEdswjspDtOlXbcu9H1_rSw0MN4CzYALl9ahSfIPPWJwg41wiV_M')",
          }}
        />

        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(12,14,23,0.92) 0%, rgba(22,24,32,0.80) 50%, rgba(50,52,62,0.70) 100%)',
          }}
        />

        {/* Purple-gold radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 80% 50%, rgba(250,189,0,0.08) 0%, transparent 55%)',
          }}
        />

        {/* Content */}
        <div className="relative h-full flex items-center justify-between px-8">
          <div>
            {/* Badge */}
            <div className="mb-3">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{
                  background: 'rgba(205,189,255,0.1)',
                  borderLeft: '2px solid #cdbdff',
                  borderRadius: '0 4px 4px 0',
                  color: '#cdbdff',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                  emoji_events
                </span>
                훈련 성과
              </span>
            </div>

            <p className="text-2xl font-bold mb-1" style={{ color: '#e1e1ef' }}>
              {stats.completed} 레슨 완료
            </p>
            <p className="text-sm" style={{ color: '#958da2' }}>
              획득한 별:{' '}
              <span style={{ color: '#fabd00', fontWeight: 700 }}>{stats.totalStars}</span>
              <span style={{ color: '#494456' }}> / {lessons.length * 3}</span>
            </p>

            {/* Star bar */}
            <div className="mt-3 flex gap-1">
              {Array.from({ length: Math.min(stats.totalStars, 10) }).map((_, i) => (
                <span
                  key={i}
                  className="material-symbols-outlined"
                  style={{ fontSize: '16px', color: '#fabd00', fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
              ))}
              {stats.totalStars > 10 && (
                <span className="text-xs text-[#fabd00] font-bold self-center ml-1">
                  +{stats.totalStars - 10}
                </span>
              )}
            </div>
          </div>

          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '72px',
              color: stats.completed > 0 ? '#fabd00' : '#494456',
              opacity: stats.completed > 0 ? 0.9 : 0.3,
              fontVariationSettings: "'FILL' 1",
            }}
          >
            military_tech
          </span>
        </div>
      </div>
    </div>
  );
}
