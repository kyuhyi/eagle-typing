'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTypingSession } from '@/hooks/useTypingSession';
import { useSound } from '@/hooks/useSound';
import { useBgm } from '@/hooks/useBgm';
import { useGamificationStore } from '@/stores/gamification-store';
import { useSettingsStore } from '@/stores/settings-store';
import { getLessonById } from '@/lib/curriculum/english-curriculum';
import { getKoreanLessonById } from '@/lib/curriculum/korean-curriculum';
import type { Lesson, GameStage, SessionStats, BossConfig } from '@/types';
import type { EngineLanguage } from '@/lib/engine/typing-engine';

// Components created by other agents
import Header from '@/components/navigation/Header';
import LessonSelector from '@/components/navigation/LessonSelector';
import StageMap from '@/components/navigation/StageMap';
import SettingsPanel from '@/components/settings/SettingsPanel';
import UserProfile from '@/components/profile/UserProfile';
import TypingArea from '@/components/typing/TypingArea';
import StatsBar from '@/components/typing/StatsBar';
import TypingResult from '@/components/typing/TypingResult';
import ProgressIndicator from '@/components/typing/ProgressIndicator';
import KeyboardLayout from '@/components/keyboard/KeyboardLayout';
import BossBattle from '@/components/game/BossBattle';
import WordPractice from '@/components/training/WordPractice';
import SentencePractice from '@/components/training/SentencePractice';
import LongTextPractice from '@/components/training/LongTextPractice';

type AppView = 'home' | 'training' | 'lessons' | 'stages' | 'practice' | 'free' | 'boss' | 'word-practice' | 'sentence-practice' | 'long-text';

// Word lists for WordPractice mode
const WORD_PRACTICE_WORDS_KO = [
  '사과', '학교', '컴퓨터', '타자기', '키보드', '마우스', '화면', '문서', '단어', '연습',
  '수련', '독수리', '하늘', '바람', '구름', '강물', '나무', '꽃잎', '빛깔', '소리',
  '도전', '성장', '기록', '속도', '정확', '영웅', '전설', '마법', '수호', '승리',
];
const WORD_PRACTICE_WORDS_EN = [
  'apple', 'school', 'keyboard', 'practice', 'typing', 'skill', 'speed', 'word',
  'master', 'eagle', 'cloud', 'river', 'forest', 'light', 'shadow', 'flame', 'stone',
  'quest', 'glory', 'power', 'swift', 'grace', 'forge', 'blade', 'storm', 'crest',
];

// Sample texts for free practice mode
const FREE_PRACTICE_TEXTS = [
  { label: '영문 기초', text: 'the quick brown fox jumps over the lazy dog' },
  { label: '영문 중급', text: 'typing is a skill that improves with practice. the more you type, the faster and more accurate you become.' },
  { label: '한글 기초', text: '나는 밥을 먹어요. 학교에 가요. 책을 읽어요.' },
  { label: '한글 중급', text: '독수리는 하늘 높이 날아다니며 날카로운 눈으로 먹이를 찾아요.' },
  { label: '코드', text: 'const greeting = (name) => { return `Hello, ${name}!`; };' },
];

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeInOut' as const },
};

export default function Home() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedStage, setSelectedStage] = useState<GameStage | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [sessionResult, setSessionResult] = useState<SessionStats | null>(null);
  const [freeText, setFreeText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const { currentLevel, totalXP, currentStreak, getLevelProgress } = useGamificationStore();
  const { showKeyboard } = useSettingsStore();
  const { init: initSound, playKeyClick, playError, playSpace, playComboMilestone } = useSound();
  const soundInitRef = useRef(false);
  const bgm = useBgm();

  // Determine target text and language for typing session
  const targetText = useMemo(() => {
    if (currentView === 'free') return freeText;
    if (selectedLesson && selectedLesson.exercises[exerciseIndex]) {
      return selectedLesson.exercises[exerciseIndex].content;
    }
    return '';
  }, [currentView, freeText, selectedLesson, exerciseIndex]);

  const language: EngineLanguage = useMemo(() => {
    if (selectedLesson) return selectedLesson.language as EngineLanguage;
    // Try to detect language from text
    if (/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(targetText)) return 'korean';
    return 'english';
  }, [selectedLesson, targetText]);

  const handleComplete = useCallback((stats: SessionStats) => {
    setSessionResult(stats);
  }, []);

  const { isActive, progress, stats, currentIndex, currentStreak: streak, pressedKeyCode, pressedIsCorrect, start, reset } = useTypingSession(
    targetText,
    language,
    {
      lessonId: selectedLesson?.id ?? (selectedStage?.lessonIds[0] ?? 'free'),
      onComplete: handleComplete,
      onKeystroke: (correct, _streak, char) => {
        if (!correct) {
          playError();
        } else if (char === ' ') {
          playSpace();
        } else {
          playKeyClick();
        }
      },
    }
  );

  // ── Navigation handlers ──

  const goHome = useCallback(() => {
    reset();
    setCurrentView('home');
    setSelectedLesson(null);
    setSelectedStage(null);
    setSessionResult(null);
    setExerciseIndex(0);
    setFreeText('');
  }, [reset]);

  const handleSelectLesson = useCallback((lesson: Lesson) => {
    setSelectedLesson(lesson);
    setExerciseIndex(0);
    setSessionResult(null);
    if (lesson.exercises.length > 0) {
      setCurrentView('practice');
    }
  }, []);

  const handleSelectStage = useCallback((stage: GameStage) => {
    setSelectedStage(stage);
    setSessionResult(null);
    // Look up the first lesson for this stage
    const lessonId = stage.lessonIds[0];
    const lesson = getLessonById(lessonId) ?? getKoreanLessonById(lessonId);
    if (lesson) {
      setSelectedLesson(lesson);
      setExerciseIndex(0);
    }
    if (stage.type === 'boss' && stage.bossConfig) {
      setCurrentView('boss');
    } else {
      setCurrentView('practice');
    }
  }, []);

  const handleStartFree = useCallback((text: string) => {
    setFreeText(text);
    setSelectedLesson(null);
    setSelectedStage(null);
    setSessionResult(null);
    setCurrentView('free');
  }, []);

  const handleRetry = useCallback(() => {
    setSessionResult(null);
    reset();
  }, [reset]);

  const handleNextExercise = useCallback(() => {
    if (selectedLesson && exerciseIndex < selectedLesson.exercises.length - 1) {
      setExerciseIndex((i) => i + 1);
      setSessionResult(null);
      reset();
    } else {
      goHome();
    }
  }, [selectedLesson, exerciseIndex, reset, goHome]);

  // Start session when entering practice/free mode and text is ready
  const handleStartSession = useCallback(() => {
    if (targetText) {
      initSound();
      start();
    }
  }, [targetText, initSound, start]);

  // 스페이스바로 세션 시작 (아직 타이핑 중이 아닐 때)
  useEffect(() => {
    if (isActive || sessionResult) return;
    if (currentView !== 'practice' && currentView !== 'free') return;
    if (currentView === 'free' && !freeText) return;

    const handleSpace = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleStartSession();
      }
    };
    window.addEventListener('keydown', handleSpace);
    return () => window.removeEventListener('keydown', handleSpace);
  }, [isActive, sessionResult, currentView, freeText, handleStartSession]);

  // ── Level progress for stats display ──
  const levelProgress = getLevelProgress();

  // BGM 자동재생: 첫 유저 인터랙션시 시작
  const bgmAutoStartRef = useRef(false);
  const bgmToggleRef = useRef(bgm.toggle);
  bgmToggleRef.current = bgm.toggle;

  useEffect(() => {
    const handler = () => {
      if (bgmAutoStartRef.current) return;
      bgmAutoStartRef.current = true;
      bgmToggleRef.current();
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', handler);
    };
    document.addEventListener('click', handler);
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', handler);
    };
  }, []); // 빈 dependency — 한 번만 등록

  // ── Render ──

  return (
    <div className="min-h-screen bg-[#11131c] text-white overflow-hidden">
      {/* Header */}
      <Header
        onHomeClick={goHome}
        onSettingsClick={() => setShowSettings(true)}
        onProfileClick={() => setShowProfile(true)}
      />

      {/* Settings panel overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <SettingsPanel onClose={() => setShowSettings(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User profile overlay */}
      <AnimatePresence>
        {showProfile && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowProfile(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <UserProfile onClose={() => setShowProfile(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content with transitions */}
      <main className="max-w-6xl mx-auto px-4 pb-8">
        <AnimatePresence mode="wait">
          {/* ═══════════ HOME VIEW ═══════════ */}
          {currentView === 'home' && (
            <motion.div
              key="home"
              {...pageTransition}
              className="flex flex-col items-center gap-0 -mx-4"
            >
              {/* ── Hero Section ── */}
              <section className="relative h-[500px] md:h-[614px] w-screen flex items-center justify-center overflow-hidden -mt-8">
                <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#11131c] via-[#11131c]/40 to-transparent z-10" />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#11131c] via-transparent to-transparent z-10 opacity-60" />
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwN1tDqbLqpSOndAcgj4yzMPHTakwoRBos75lwXo5xMvrHoA-KaPblRmkoh74V2QXZQOGS7ZjEU_n5obsX3DKngBeIss0rIKViGVJ-stt-iiIn4G44rozcEkFfFHcNt4sUeIlBMwTXsLXDXqfAmJPfO2X1rzpPYup0vcyuKZm_kX6J4sVf9oD8yhcnEHTsBdz5quBO2OMS99VQGHJit6C0F9ONSEdswjspDtOlXbcu9H1_rSw0MN4CzYALl9ahSfIPPWJwg41wiV_M"
                    alt="Hero"
                    className="w-full h-full object-cover scale-110 blur-[2px]"
                  />
                </div>

                {/* BGM Controller — top-right of hero */}
                <div className="absolute top-20 right-8 z-30 flex items-center gap-2 px-3 py-2 rounded-full border border-[#494456]/40"
                  style={{ background: 'rgba(29, 31, 41, 0.7)', backdropFilter: 'blur(16px)' }}
                >
                  <button
                    onClick={bgm.toggle}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      bgm.playing
                        ? 'bg-[#5c1fde] text-white shadow-[0_0_10px_rgba(92,31,222,0.4)]'
                        : 'bg-[#282933] text-[#958da2] hover:text-[#cdbdff]'
                    }`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      {bgm.playing ? 'pause' : 'play_arrow'}
                    </span>
                  </button>
                  <button
                    onClick={bgm.skip}
                    className="w-7 h-7 rounded-full flex items-center justify-center bg-[#282933] text-[#958da2] hover:text-[#cdbdff] transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>skip_next</span>
                  </button>
                  {bgm.playing && (
                    <span className="text-[10px] text-[#cdbdff] font-medium">{bgm.trackName}</span>
                  )}
                  <input
                    type="range" min="0" max="1" step="0.05"
                    value={bgm.volume}
                    onChange={(e) => bgm.changeVolume(parseFloat(e.target.value))}
                    className="w-14 h-1 appearance-none bg-[#494456] rounded-full cursor-pointer"
                    style={{ accentColor: '#fabd00' }}
                  />
                  <span className="material-symbols-outlined text-[#958da2]" style={{ fontSize: '16px' }}>
                    {bgm.volume === 0 ? 'volume_off' : bgm.volume < 0.5 ? 'volume_down' : 'volume_up'}
                  </span>
                </div>

                <div className="relative z-20 text-center px-4 max-w-4xl">
                  <motion.h1
                    className="text-5xl md:text-7xl font-bold text-[#e1e1ef] mb-4 tracking-tight"
                    style={{ textShadow: '0 0 15px rgba(250, 189, 0, 0.4)' }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                  >
                    검은 성소의 부름
                  </motion.h1>
                  <motion.p
                    className="text-xl md:text-2xl text-[#cdbdff]/80 font-light max-w-2xl mx-auto leading-relaxed"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    타자로 마법을 영창하여 어둠의 군단에 맞서십시오.<br />당신의 손가락이 가장 강력한 무기가 됩니다.
                  </motion.p>
                  <motion.div
                    className="mt-8 flex justify-center gap-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <button
                      className="bg-[#5c1fde] text-[#cdbdff] px-8 py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(92,31,222,0.4)] transition-all flex items-center gap-2 border-x-2 border-[#cdbdff]/30"
                      onClick={() => setCurrentView('training')}
                    >
                      <span className="material-symbols-outlined">play_arrow</span>
                      모험 시작하기
                    </button>
                  </motion.div>
                </div>
              </section>

              {/* ── Status Dashboard ── */}
              <section className="w-full max-w-7xl mx-auto px-6 -mt-12 relative z-30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Level */}
                  <motion.div
                    className="p-6 rounded-2xl border border-[#494456]/20 flex items-center gap-4 group hover:border-[#cdbdff]/40 transition-all"
                    style={{ background: 'rgba(29, 31, 41, 0.7)', backdropFilter: 'blur(24px)' }}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35 }}
                  >
                    <div className="w-14 h-14 rounded-xl bg-[#fabd00]/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-[#fabd00]">military_tech</span>
                    </div>
                    <div>
                      <p className="text-[#cbc3d9] text-sm font-medium">현재 레벨</p>
                      <h3 className="text-2xl font-bold text-[#fabd00]">Lv. {currentLevel} {levelProgress.level <= 10 ? '견습생' : levelProgress.level <= 20 ? '마법사' : levelProgress.level <= 30 ? '고급마법사' : '대마법사'}</h3>
                    </div>
                  </motion.div>
                  {/* EXP */}
                  <motion.div
                    className="p-6 rounded-2xl border border-[#494456]/20 flex items-center gap-4 group hover:border-[#cdbdff]/40 transition-all"
                    style={{ background: 'rgba(29, 31, 41, 0.7)', backdropFilter: 'blur(24px)' }}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="w-14 h-14 rounded-xl bg-[#cdbdff]/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-[#cdbdff]">auto_awesome</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-2">
                        <p className="text-[#cbc3d9] text-sm font-medium">경험치</p>
                        <p className="text-[#cdbdff] text-xs font-bold">{levelProgress.expInLevel} / {levelProgress.expRequired}</p>
                      </div>
                      <div className="w-full h-2 bg-[#32343e] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: 'linear-gradient(to right, #5c1fde, #cdbdff)' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${levelProgress.progressPercent}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  </motion.div>
                  {/* Streak */}
                  <motion.div
                    className="p-6 rounded-2xl border border-[#494456]/20 flex items-center gap-4 group hover:border-[#cdbdff]/40 transition-all"
                    style={{ background: 'rgba(29, 31, 41, 0.7)', backdropFilter: 'blur(24px)' }}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.45 }}
                  >
                    <div className="w-14 h-14 rounded-xl bg-[#bdc2ff]/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-[#bdc2ff]">calendar_today</span>
                    </div>
                    <div>
                      <p className="text-[#cbc3d9] text-sm font-medium">연속 수련일</p>
                      <h3 className="text-2xl font-bold text-[#bdc2ff]">{currentStreak}일째 수련 중</h3>
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* ── Menu Modes (Bento Grid) ── */}
              <section className="w-full max-w-7xl mx-auto px-6 mt-16 pb-12">
                <h2 className="text-2xl font-semibold text-[#e1e1ef] mb-8 flex items-center gap-3">
                  <span className="w-2 h-8 bg-[#fabd00] rounded-full" />
                  수련 모드 선택
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[500px]">
                  {/* Game Mode (Main Highlight — 7/12) */}
                  <motion.button
                    className="md:col-span-7 relative group cursor-pointer overflow-hidden rounded-2xl border border-[#494456]/20 text-left"
                    style={{ background: 'rgba(29, 31, 41, 0.7)', backdropFilter: 'blur(24px)' }}
                    onClick={() => setCurrentView('stages')}
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeyR_ajGKMVHTlsKON_H3Y06CukK6aCzGwi4Lff8PO9iVleimbj96cccKEErzDaAhYZA4XgHH0ODmlobh8C_rVpue5iRayUnDnAzIMzMG4B6jpkWsUqr_JxBBJZx_OLmczMHj8EMJtMtSGxPPkBPmBL85jgnb_mUAtfhLicgYIOMguXS0-9dLJTjb-TNrqtMFhZ40W3lFKNOn2i7ViFQUCoPmhBJN0t3d1uF5SVVhTL6o_mfmGM3C4f-ZaVPiNXUb61eAl09HPq1Xp"
                      alt="Game Mode"
                      className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#11131c] via-[#11131c]/60 to-transparent p-8 flex flex-col justify-end">
                      <div className="flex items-center gap-3 mb-2 text-[#fabd00]">
                        <span className="material-symbols-outlined">swords</span>
                        <span className="text-sm font-bold tracking-widest">DUNGEON EXPLORATION</span>
                      </div>
                      <h3 className="text-4xl font-bold text-[#e1e1ef] mb-3">게임 모드</h3>
                      <p className="text-[#cbc3d9] text-lg max-w-md leading-relaxed">밀려오는 몬스터들을 정확한 타이핑으로 처치하고 성소를 수호하세요. 강력한 보스가 당신을 기다립니다.</p>
                      <div className="mt-6 flex gap-4">
                        <span className="bg-[#fabd00]/20 text-[#fabd00] px-3 py-1 rounded text-xs font-bold border border-[#fabd00]/30">하드코어</span>
                        <span className="bg-[#cdbdff]/20 text-[#cdbdff] px-3 py-1 rounded text-xs font-bold border border-[#cdbdff]/30">대규모 보상</span>
                      </div>
                    </div>
                  </motion.button>

                  {/* Right Column Stack — 5/12 */}
                  <div className="md:col-span-5 flex flex-col gap-6">
                    {/* Lesson Mode */}
                    <motion.button
                      className="flex-1 relative group cursor-pointer overflow-hidden rounded-2xl border border-[#494456]/20 p-8 flex flex-col justify-center text-left"
                      style={{ background: 'rgba(29, 31, 41, 0.7)', backdropFilter: 'blur(24px)' }}
                      onClick={() => setCurrentView('lessons')}
                      initial={{ x: 40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.55 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-[100px]">auto_stories</span>
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2 text-[#cdbdff]">
                          <span className="material-symbols-outlined">school</span>
                          <span className="text-xs font-bold tracking-widest">MASTER THE ARTS</span>
                        </div>
                        <h3 className="text-2xl font-bold text-[#e1e1ef] mb-2">레슨 모드</h3>
                        <p className="text-[#cbc3d9] text-sm leading-relaxed">기초 영창법부터 고대 주문까지 단계별로 학습합니다. 완벽한 정확도를 목표로 하세요.</p>
                      </div>
                    </motion.button>

                    {/* Free Practice */}
                    <motion.button
                      className="flex-1 relative group cursor-pointer overflow-hidden rounded-2xl border border-[#494456]/20 p-8 flex flex-col justify-center text-left"
                      style={{ background: 'rgba(29, 31, 41, 0.7)', backdropFilter: 'blur(24px)' }}
                      onClick={() => setCurrentView('free')}
                      initial={{ x: 40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-[100px]">keyboard</span>
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2 text-[#bdc2ff]">
                          <span className="material-symbols-outlined">edit</span>
                          <span className="text-xs font-bold tracking-widest">UNRESTRICTED FLOW</span>
                        </div>
                        <h3 className="text-2xl font-bold text-[#e1e1ef] mb-2">자유 연습</h3>
                        <p className="text-[#cbc3d9] text-sm leading-relaxed">원하는 문장이나 고전을 선택하여 부담 없이 실력을 연마하세요. 기록 제한이 없습니다.</p>
                      </div>
                    </motion.button>
                  </div>
                </div>
              </section>

              {/* ── Achievement Notification Bar ── */}
              <section className="w-full max-w-7xl mx-auto px-6 mt-2 mb-12">
                <motion.div
                  className="rounded-2xl p-6 border border-[#494456]/15 flex items-center justify-between overflow-hidden"
                  style={{ background: 'rgba(29, 31, 41, 0.7)', backdropFilter: 'blur(24px)' }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-center gap-6">
                    <span className="material-symbols-outlined text-[#fabd00]">notifications_active</span>
                    <p className="text-[#e1e1ef] font-medium truncate max-w-md">
                      새로운 업적 달성: <span className="text-[#fabd00]">&apos;타자 수련의 시작&apos;</span> 명예 보상을 획득하셨습니다!
                    </p>
                  </div>
                  <button
                    className="text-[#cdbdff] text-sm font-bold flex items-center gap-1 hover:underline whitespace-nowrap"
                    onClick={() => setShowProfile(true)}
                  >
                    전체 보기 <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </motion.div>
              </section>
            </motion.div>
          )}

          {/* ═══════════ TRAINING VIEW ═══════════ */}
          {currentView === 'training' && (
            <motion.div key="training" {...pageTransition} className="pt-6">
              <BackButton onClick={goHome} />

              {/* ── Header ── */}
              <div className="max-w-5xl mx-auto px-4 mb-10">
                <h2 className="text-3xl font-bold text-[#e1e1ef] mb-3">수련 모드 선택</h2>
                <p className="text-[#958da2] text-base leading-relaxed max-w-xl">
                  길은 스스로 선택하는 자에게 열린다. 수련의 방식을 고르고 자판을 통한 영창의 길로 나아가라.
                </p>
              </div>

              {/* ── 4 Mode Cards ── */}
              <div className="max-w-5xl mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* 1. 자리 연습 → lessons */}
                  <TrainingModeCard
                    icon="grid_view"
                    iconColor="#cdbdff"
                    accentColor="#cdbdff"
                    title="자리 연습"
                    subtitle="POSITION MASTERY"
                    description="기본 자판 위치를 정확히 익혀 손가락 근육에 새겨 넣는 수련법"
                    buttonHoverClass="hover:bg-[#5c1fde] hover:text-[#cdbdff] hover:border-[#5c1fde]"
                    delay={0.1}
                    onClick={() => setCurrentView('lessons')}
                  />

                  {/* 2. 낱말 연습 → word-practice */}
                  <TrainingModeCard
                    icon="auto_stories"
                    iconColor="#fabd00"
                    accentColor="#fabd00"
                    title="낱말 연습"
                    subtitle="WORD PRECISION"
                    description="단어 단위의 정확성을 단련하여 어휘의 흐름을 몸에 익히는 수련법"
                    buttonHoverClass="hover:bg-[#fabd00] hover:text-[#0c0e17] hover:border-[#fabd00]"
                    delay={0.15}
                    onClick={() => setCurrentView('word-practice')}
                  />

                  {/* 3. 단문 연습 → sentence-practice */}
                  <TrainingModeCard
                    icon="bolt"
                    iconFill
                    iconColor="#bdc2ff"
                    accentColor="#bdc2ff"
                    title="단문 연습"
                    subtitle="BURST SPEED"
                    description="짧은 문장으로 속도를 폭발시키는 순간 영창 집중 훈련법"
                    buttonHoverClass="hover:bg-[#bdc2ff] hover:text-[#0c0e17] hover:border-[#bdc2ff]"
                    delay={0.2}
                    onClick={() => setCurrentView('sentence-practice')}
                  />

                  {/* 4. 장문 연습 → long-text */}
                  <TrainingModeCard
                    icon="history_edu"
                    iconColor="#ffb4ab"
                    accentColor="#ffb4ab"
                    title="장문 연습"
                    subtitle="ENDURANCE"
                    description="긴 문장을 흔들리지 않는 평정심으로 완주하는 고난도 수련법"
                    buttonHoverClass="hover:bg-[#ffb4ab] hover:text-[#0c0e17] hover:border-[#ffb4ab]"
                    delay={0.25}
                    onClick={() => setCurrentView('long-text')}
                  />
                </div>

                {/* ── Bottom Decorative Image Area ── */}
                <motion.div
                  className="mt-10 rounded-3xl overflow-hidden relative h-48"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  style={{ border: '1px solid rgba(73,68,86,0.25)' }}
                >
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwN1tDqbLqpSOndAcgj4yzMPHTakwoRBos75lwXo5xMvrHoA-KaPblRmkoh74V2QXZQOGS7ZjEU_n5obsX3DKngBeIss0rIKViGVJ-stt-iiIn4G44rozcEkFfFHcNt4sUeIlBMwTXsLXDXqfAmJPfO2X1rzpPYup0vcyuKZm_kX6J4sVf9oD8yhcnEHTsBdz5quBO2OMS99VQGHJit6C0F9ONSEdswjspDtOlXbcu9H1_rSw0MN4CzYALl9ahSfIPPWJwg41wiV_M"
                    alt="Training ground"
                    className="w-full h-full object-cover opacity-25 scale-110"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to right, rgba(17,19,28,0.95) 25%, rgba(17,19,28,0.6) 60%, rgba(17,19,28,0.4) 100%)' }}
                  />
                  <div className="absolute inset-0 flex items-center px-10 gap-8">
                    <div>
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1 mb-3 text-[10px] font-bold uppercase tracking-[0.2em]"
                        style={{
                          background: 'rgba(205,189,255,0.1)',
                          borderLeft: '2px solid #cdbdff',
                          borderRadius: '0 4px 4px 0',
                          color: '#cdbdff',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>fitness_center</span>
                        훈련 성과
                      </div>
                      <p className="text-2xl font-bold text-[#e1e1ef]">오늘의 최고 속도</p>
                      <p className="text-3xl font-bold mt-1" style={{ color: '#fabd00' }}>
                        {totalXP > 0 ? `${Math.min(Math.round(totalXP / 10), 999)} WPM` : '도전하라'}
                      </p>
                    </div>
                    <div className="flex gap-8 ml-auto">
                      {([
                        { icon: 'military_tech', label: '레벨', value: `Lv. ${currentLevel}`, color: '#fabd00' },
                        { icon: 'local_fire_department', label: '연속', value: `${currentStreak}일`, color: '#ffb4ab' },
                        { icon: 'auto_awesome', label: '총 XP', value: totalXP.toLocaleString(), color: '#cdbdff' },
                      ] as const).map(({ icon, label, value, color }) => (
                        <div key={label} className="flex flex-col items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: '28px', color }}>{icon}</span>
                          <p className="text-[10px] text-[#958da2] uppercase tracking-wider">{label}</p>
                          <p className="text-sm font-bold" style={{ color }}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ═══════════ LESSONS VIEW ═══════════ */}
          {currentView === 'lessons' && (
            <motion.div key="lessons" {...pageTransition} className="pt-6">
              <BackButton onClick={goHome} />
              <LessonSelector
                onSelectLesson={handleSelectLesson}
              />
            </motion.div>
          )}

          {/* ═══════════ STAGES VIEW ═══════════ */}
          {currentView === 'stages' && (
            <motion.div key="stages" {...pageTransition} className="pt-6">
              <BackButton onClick={goHome} />
              <StageMap
                onSelectStage={handleSelectStage}
              />
            </motion.div>
          )}

          {/* ═══════════ WORD PRACTICE VIEW ═══════════ */}
          {currentView === 'word-practice' && (
            <motion.div key="word-practice" {...pageTransition} className="pt-6">
              <WordPractice
                targetWords={WORD_PRACTICE_WORDS_KO}
                language="korean"
                onComplete={() => setCurrentView('training')}
                onExit={() => setCurrentView('training')}
              />
            </motion.div>
          )}

          {/* ═══════════ SENTENCE PRACTICE VIEW ═══════════ */}
          {currentView === 'sentence-practice' && (
            <motion.div key="sentence-practice" {...pageTransition} className="pt-6">
              <SentencePractice
                targetText="빠른 갈색 여우가 게으른 개를 뛰어넘었다. 오늘 하늘은 매우 맑고 바람이 시원하게 분다. 타자 연습은 꾸준히 하면 실력이 빠르게 늘어난다."
                language="korean"
                onComplete={() => setCurrentView('training')}
                onExit={() => setCurrentView('training')}
              />
            </motion.div>
          )}

          {/* ═══════════ LONG TEXT VIEW ═══════════ */}
          {currentView === 'long-text' && (
            <motion.div key="long-text" {...pageTransition} className="pt-6">
              <LongTextPractice
                targetText="먼 옛날, 칠흑 같은 어둠 속에서 거대한 빛이 솟아올랐을 때, 세상의 모든 기록은 하나의 문장으로부터 시작되었으니... 그것은 연대기의 시작이자 끝을 알리는 예언의 소리였다. 대지 위에 흩어진 파편들을 모아 진실을 새기는 자만이, 영원히 지워지지 않는 성전의 주인이 될 수 있으리라. 타자의 힘은 손끝에서 태어나 마음을 거쳐 세상을 바꾸는 마법이 된다."
                language="korean"
                onComplete={() => setCurrentView('training')}
                onExit={() => setCurrentView('training')}
              />
            </motion.div>
          )}

          {/* ═══════════ PRACTICE VIEW ═══════════ */}
          {(currentView === 'practice' || currentView === 'free') && (
            <motion.div key="practice" {...pageTransition} className="pt-6">
              {/* Header row */}
              <div className="flex items-center justify-between mb-4">
                <BackButton onClick={goHome} />
                {selectedLesson && (
                  <div className="text-sm text-gray-400">
                    <span className="text-amber-400 font-semibold">{selectedLesson.title}</span>
                    {' '}&mdash;{' '}
                    연습 {exerciseIndex + 1} / {selectedLesson.exercises.length}
                  </div>
                )}
              </div>

              {/* Free practice text selection (only in free mode before session starts) */}
              {currentView === 'free' && !isActive && !sessionResult && (
                <div className="flex flex-col items-center">
                  <FreePracticeSetup
                    freeText={freeText}
                    setFreeText={setFreeText}
                    onStart={handleStartSession}
                    presets={FREE_PRACTICE_TEXTS}
                  />
                </div>
              )}

              {/* Active typing area — 3-column layout */}
              {(currentView === 'practice' || (currentView === 'free' && (isActive || sessionResult))) && (
                <div className="relative">
                  {/* Background glow */}
                  <div
                    className="absolute top-0 left-0 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
                    style={{ background: 'rgba(205,189,255,0.05)' }}
                  />
                  <div
                    className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-[160px] pointer-events-none"
                    style={{ background: 'rgba(250,189,0,0.05)' }}
                  />

                  <div className="relative flex gap-4 items-start">
                    {/* ── LEFT SIDEBAR (w-72) ── */}
                    <div
                      className="w-72 flex-shrink-0 rounded-2xl border-l-2 border-r-2 border-[#494456]/40 p-5 flex flex-col gap-4"
                      style={{ background: 'rgba(29,31,41,0.7)', backdropFilter: 'blur(24px)' }}
                    >
                      {/* Title */}
                      <div className="flex items-center gap-2">
                        <span
                          className="material-symbols-outlined text-[#fabd00]"
                          style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}
                        >
                          shield_with_heart
                        </span>
                        <h3 className="text-xs font-bold tracking-widest text-[#fabd00] uppercase">전투 통계</h3>
                      </div>

                      {/* 진행 시간 */}
                      <div>
                        <p className="text-[10px] text-[#cbc3d9]/50 mb-1 uppercase tracking-wider">진행 시간</p>
                        <p className="text-3xl font-bold tabular-nums text-[#e1e1ef]">
                          {formatTime(stats?.duration ?? 0)}
                        </p>
                      </div>

                      {/* 정확도 */}
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <p className="text-[10px] text-[#cbc3d9]/50 uppercase tracking-wider">정확도</p>
                          <p className="text-[10px] font-bold text-[#cdbdff]">{Math.round(stats?.accuracy ?? 100)}%</p>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#32343e] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${stats?.accuracy ?? 100}%`,
                              background: 'linear-gradient(to right, #cdbdff, #fabd00)',
                              boxShadow: '0 0 8px rgba(205,189,255,0.4)',
                            }}
                          />
                        </div>
                      </div>

                      {/* 오타수 */}
                      <div>
                        <p className="text-[10px] text-[#cbc3d9]/50 mb-1 uppercase tracking-wider">오타</p>
                        <p className="text-2xl font-bold text-[#ffb4ab]">{stats?.errorCount ?? 0}</p>
                      </div>

                      {/* 현재 연습명 */}
                      <div
                        className="mt-auto rounded-xl p-3 flex items-start gap-2"
                        style={{ background: 'rgba(17,19,28,0.5)' }}
                      >
                        <span
                          className="material-symbols-outlined text-[#cdbdff] leading-none mt-0.5"
                          style={{ fontSize: '16px' }}
                        >
                          auto_stories
                        </span>
                        <div>
                          <p className="text-[10px] text-[#cbc3d9]/50 mb-0.5">현재 연습</p>
                          <p className="text-xs font-semibold text-[#e1e1ef] leading-snug">
                            {selectedLesson?.title ?? (currentView === 'free' ? '자유 연습' : '연습 중')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ── CENTER (flex-1) ── */}
                    <div className="flex-1 flex flex-col items-center gap-4 min-w-0">
                      {/* TARGET card */}
                      {isActive && currentIndex < targetText.length && (
                        <div
                          className="relative w-48 h-56 rounded-2xl flex flex-col items-center justify-center gap-1"
                          style={{ background: 'rgba(40,41,51,0.4)' }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-2xl">
                            <div
                              className="w-32 h-32 rounded-full blur-3xl"
                              style={{ background: 'rgba(92,31,222,0.12)' }}
                            />
                          </div>
                          <span className="text-[10px] text-[#cdbdff]/40 tracking-[0.2em] font-bold uppercase relative z-10">
                            TARGET
                          </span>
                          <span
                            className="text-[80px] font-bold leading-none relative z-10"
                            style={{
                              color: '#e1e1ef',
                              textShadow: '0 0 30px rgba(92,31,222,0.5)',
                            }}
                          >
                            {targetText[currentIndex] === ' ' ? '·' : targetText[currentIndex]}
                          </span>
                        </div>
                      )}

                      {/* TypingArea */}
                      <div className="w-full">
                        <TypingArea targetText={targetText} />
                      </div>

                      {/* Progress indicator */}
                      <div className="w-full">
                        <ProgressIndicator progress={progress} />
                      </div>

                      {/* Start prompt */}
                      {!isActive && !sessionResult && (
                        <motion.button
                          className="mt-4 px-10 py-4 rounded-xl bg-[#5c1fde] hover:bg-[#6833ea] text-[#cdbdff] font-bold text-lg transition-all hover:shadow-[0_0_20px_rgba(92,31,222,0.4)] flex items-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleStartSession}
                        >
                          <span className="material-symbols-outlined">play_arrow</span>
                          시작하기
                          <span className="text-xs opacity-60 ml-2">(Space)</span>
                        </motion.button>
                      )}

                      {/* Keyboard — scale-110 */}
                      {showKeyboard && (
                        <div className="mt-2 flex justify-center transform scale-110 origin-top">
                          <KeyboardLayout
                            layout={language === 'korean' ? 'korean-2set' : 'qwerty'}
                            pressedKeyCode={pressedKeyCode}
                            isCorrect={pressedIsCorrect}
                          />
                        </div>
                      )}
                    </div>

                    {/* ── RIGHT DECO (w-12) ── */}
                    <div className="w-12 flex-shrink-0 flex flex-col items-center gap-2 py-4 self-stretch">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#fabd00]" />
                      <div
                        className="flex-1 w-px"
                        style={{ background: 'linear-gradient(to bottom, rgba(250,189,0,0.5), transparent)' }}
                      />
                      <span
                        className="text-[8px] tracking-[0.3em] font-bold text-[#494456] uppercase"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                      >
                        SANCTUARIUM
                      </span>
                      <div
                        className="flex-1 w-px"
                        style={{ background: 'linear-gradient(to top, rgba(250,189,0,0.5), transparent)' }}
                      />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#fabd00]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Result overlay */}
              <AnimatePresence>
                {sessionResult && (
                  <motion.div
                    className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0, y: 30 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.8, opacity: 0, y: 30 }}
                      transition={{ type: 'spring', damping: 20 }}
                    >
                      <TypingResult
                        stats={sessionResult}
                        targetWpm={selectedLesson?.targetWpm}
                        onRetry={handleRetry}
                        onNextLesson={handleNextExercise}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ═══════════ BOSS BATTLE VIEW ═══════════ */}
          {currentView === 'boss' && selectedStage?.bossConfig && (
            <motion.div key="boss" {...pageTransition} className="pt-6">
              <BackButton onClick={goHome} />
              <BossBattle
                bossConfig={selectedStage.bossConfig}
                targetText={targetText}
                language={language}
                lessonId={selectedStage.lessonIds[0]}
                onVictory={(stats) => {
                  setSessionResult(stats);
                  setCurrentView('practice');
                }}
                onDefeat={() => {
                  goHome();
                }}
                onExit={goHome}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Desktop Floating Left Sidebar ── */}
      <nav className="hidden lg:flex flex-col gap-3 fixed left-6 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full border border-[#494456]/60" style={{ background: 'rgba(29, 31, 41, 0.7)', backdropFilter: 'blur(24px)' }}>
        <button
          className="p-2.5 rounded-full transition-colors duration-200 text-[#958da2] hover:text-[#fabd00] hover:bg-[#282933]"
          aria-label="통계"
          title="통계"
          onClick={() => setShowProfile(true)}
        >
          <span className="material-symbols-outlined select-none" style={{ fontSize: '22px', lineHeight: 1 }}>leaderboard</span>
        </button>
        <button
          className="p-2.5 rounded-full transition-colors duration-200 text-[#958da2] hover:text-[#cdbdff] hover:bg-[#282933]"
          aria-label="공유"
          title="공유"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: 'BSD TYPING - 검은 성소', url: window.location.href });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert('링크가 복사되었습니다!');
            }
          }}
        >
          <span className="material-symbols-outlined select-none" style={{ fontSize: '22px', lineHeight: 1 }}>share</span>
        </button>
        <button
          className="p-2.5 rounded-full transition-colors duration-200 text-[#958da2] hover:text-[#bdc2ff] hover:bg-[#282933]"
          aria-label="설정"
          title="설정"
          onClick={() => setShowSettings(true)}
        >
          <span className="material-symbols-outlined select-none" style={{ fontSize: '22px', lineHeight: 1 }}>settings</span>
        </button>
      </nav>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-4 py-2 rounded-t-2xl border-t border-[#494456]/60" style={{ background: 'rgba(17, 19, 28, 0.9)', backdropFilter: 'blur(24px)' }}>
        <button
          className="flex flex-col items-center gap-0.5 py-2 px-4 transition-colors duration-200"
          onClick={goHome}
          aria-label="퀘스트"
        >
          <span
            className="material-symbols-outlined select-none"
            style={{ fontSize: '24px', lineHeight: 1, color: (currentView === 'home' || currentView === 'stages') ? '#fabd00' : '#958da2' }}
          >
            scrollable_header
          </span>
          <span className="text-[10px] font-medium" style={{ color: (currentView === 'home' || currentView === 'stages') ? '#fabd00' : '#958da2' }}>퀘스트</span>
        </button>
        <button
          className="flex flex-col items-center gap-0.5 py-2 px-4 transition-colors duration-200"
          onClick={() => setCurrentView('stages')}
          aria-label="던전"
        >
          <span
            className="material-symbols-outlined select-none"
            style={{ fontSize: '24px', lineHeight: 1, color: currentView === 'boss' ? '#fabd00' : '#958da2' }}
          >
            swords
          </span>
          <span className="text-[10px] font-medium" style={{ color: currentView === 'boss' ? '#fabd00' : '#958da2' }}>던전</span>
        </button>
        <button
          className="flex flex-col items-center gap-0.5 py-2 px-4 transition-colors duration-200 text-[#958da2]"
          aria-label="인벤토리"
        >
          <span className="material-symbols-outlined select-none" style={{ fontSize: '24px', lineHeight: 1 }}>backpack</span>
          <span className="text-[10px] font-medium">인벤토리</span>
        </button>
        <button
          className="flex flex-col items-center gap-0.5 py-2 px-4 transition-colors duration-200 text-[#958da2]"
          aria-label="업적"
        >
          <span className="material-symbols-outlined select-none" style={{ fontSize: '24px', lineHeight: 1 }}>military_tech</span>
          <span className="text-[10px] font-medium">업적</span>
        </button>
      </nav>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function TrainingModeCard({
  icon,
  iconFill,
  iconColor,
  accentColor,
  title,
  subtitle,
  description,
  buttonHoverClass,
  delay,
  onClick,
}: {
  icon: string;
  iconFill?: boolean;
  iconColor: string;
  accentColor: string;
  title: string;
  subtitle: string;
  description: string;
  buttonHoverClass: string;
  delay: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      className="group flex flex-col items-center text-center p-8 rounded-xl cursor-pointer
                 bg-[#191b24] hover:bg-[#282933] hover:-translate-y-2
                 border-l-2 border-r-2 border-[#958da2]/15
                 transition-all duration-200"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      onClick={onClick}
    >
      {/* Icon container */}
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-[#0c0e17] transition-all duration-200"
        style={{ border: `1px solid ${accentColor}28` }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: '36px',
            color: iconColor,
            fontVariationSettings: iconFill ? "'FILL' 1" : "'FILL' 0",
          }}
        >
          {icon}
        </span>
      </div>

      {/* Text */}
      <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: accentColor }}>
        {subtitle}
      </p>
      <h3 className="text-xl font-bold text-[#e1e1ef] mb-3">{title}</h3>
      <p className="text-sm text-[#958da2] leading-relaxed mb-6 flex-1">{description}</p>

      {/* CTA Button */}
      <button
        className={`w-full py-3 rounded-md text-sm font-bold tracking-widest
                    bg-[#0c0e17] text-[#e1e1ef] border border-[#494456]/30
                    transition-all duration-200 ${buttonHoverClass}`}
      >
        입장하기
      </button>
    </motion.div>
  );
}

function ModeCard({
  icon,
  title,
  subtitle,
  description,
  color,
  delay,
  onClick,
}: {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  delay: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      className={`group relative flex flex-col items-center gap-3 p-6 rounded-2xl border bg-gradient-to-b ${color} backdrop-blur transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]`}
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      onClick={onClick}
    >
      <span className="text-4xl">{icon}</span>
      <div className="text-center">
        <p className="text-lg font-bold text-white">{title}</p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
      <p className="text-sm text-gray-300/80">{description}</p>
      <div className="absolute inset-0 rounded-2xl bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none" />
    </motion.button>
  );
}

function StatItem({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-center gap-2 text-center">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm font-medium transition-colors mb-4"
      whileHover={{ x: -3 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      돌아가기
    </motion.button>
  );
}

function FreePracticeSetup({
  freeText,
  setFreeText,
  onStart,
  presets,
}: {
  freeText: string;
  setFreeText: (text: string) => void;
  onStart: () => void;
  presets: { label: string; text: string }[];
}) {
  return (
    <motion.div
      className="w-full max-w-2xl space-y-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-xl font-bold text-center">자유 연습 모드</h2>

      {/* Preset buttons */}
      <div className="flex flex-wrap justify-center gap-2">
        {presets.map((p) => (
          <button
            key={p.label}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              freeText === p.text
                ? 'bg-amber-500 text-gray-900'
                : 'bg-white/10 hover:bg-white/20 text-gray-300'
            }`}
            onClick={() => setFreeText(p.text)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom text area */}
      <textarea
        className="w-full h-32 px-4 py-3 rounded-xl bg-gray-800/80 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none font-mono text-sm"
        placeholder="연습하고 싶은 텍스트를 직접 입력하세요..."
        value={freeText}
        onChange={(e) => setFreeText(e.target.value)}
      />

      {/* Start button */}
      <div className="flex justify-center">
        <motion.button
          className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-gray-900 font-bold text-lg transition-colors"
          whileHover={{ scale: freeText ? 1.05 : 1 }}
          whileTap={{ scale: freeText ? 0.95 : 1 }}
          disabled={!freeText.trim()}
          onClick={onStart}
        >
          연습 시작
        </motion.button>
      </div>
    </motion.div>
  );
}
