import type { Achievement } from '@/types';

// ─────────────────────────────────────────────
// 업적 정의
// Categories:
//   speed      - 타이핑 속도 관련
//   accuracy   - 정확도 관련
//   streak     - 연속 기록 관련
//   korean     - 한글 타이핑 특화
//   lesson     - 레슨 완료 관련
//   daily      - 일일 활동 관련
//   special    - 숨겨진 특별 업적
// ─────────────────────────────────────────────

export const ACHIEVEMENTS: Achievement[] = [
  // ─────────────── 속도 업적 ───────────────
  {
    id: 'speed-10wpm',
    title: '첫 날갯짓',
    description: '10 WPM을 달성했어요!',
    category: 'speed',
    iconKey: 'speed-bronze',
    condition: { type: 'wpm_over', value: 10 },
    reward: { exp: 50, coins: 10 },
    hidden: false,
  },
  {
    id: 'speed-20wpm',
    title: '날개를 펼치다',
    description: '20 WPM을 달성했어요!',
    category: 'speed',
    iconKey: 'speed-bronze',
    condition: { type: 'wpm_over', value: 20 },
    reward: { exp: 100, coins: 20 },
    hidden: false,
  },
  {
    id: 'speed-30wpm',
    title: '바람을 타다',
    description: '30 WPM을 달성했어요!',
    category: 'speed',
    iconKey: 'speed-silver',
    condition: { type: 'wpm_over', value: 30 },
    reward: { exp: 150, coins: 30 },
    hidden: false,
  },
  {
    id: 'speed-40wpm',
    title: '구름 위를 날다',
    description: '40 WPM을 달성했어요!',
    category: 'speed',
    iconKey: 'speed-silver',
    condition: { type: 'wpm_over', value: 40 },
    reward: { exp: 200, coins: 50 },
    hidden: false,
  },
  {
    id: 'speed-50wpm',
    title: '하늘을 가르다',
    description: '50 WPM을 달성했어요!',
    category: 'speed',
    iconKey: 'speed-gold',
    condition: { type: 'wpm_over', value: 50 },
    reward: { exp: 300, coins: 80 },
    hidden: false,
  },
  {
    id: 'speed-60wpm',
    title: '음속의 독수리',
    description: '60 WPM을 달성했어요! 진정한 마스터!',
    category: 'speed',
    iconKey: 'speed-platinum',
    condition: { type: 'wpm_over', value: 60 },
    reward: { exp: 500, coins: 150 },
    hidden: false,
  },
  {
    id: 'speed-80wpm',
    title: '번개 발톱',
    description: '80 WPM을 달성했어요! 믿을 수 없는 속도!',
    category: 'speed',
    iconKey: 'speed-diamond',
    condition: { type: 'wpm_over', value: 80 },
    reward: { exp: 1000, coins: 300 },
    hidden: false,
  },
  {
    id: 'speed-100wpm',
    title: '신의 손가락',
    description: '100 WPM 달성! 전설이 되었어요!',
    category: 'speed',
    iconKey: 'speed-legendary',
    condition: { type: 'wpm_over', value: 100 },
    reward: { exp: 2000, coins: 500 },
    hidden: true,
  },

  // ─────────────── 정확도 업적 ───────────────
  {
    id: 'accuracy-80',
    title: '정확한 눈',
    description: '정확도 80% 이상으로 레슨을 완료했어요.',
    category: 'accuracy',
    iconKey: 'accuracy-bronze',
    condition: { type: 'accuracy_over', value: 80 },
    reward: { exp: 50, coins: 10 },
    hidden: false,
  },
  {
    id: 'accuracy-90',
    title: '예리한 발톱',
    description: '정확도 90% 이상을 달성했어요!',
    category: 'accuracy',
    iconKey: 'accuracy-silver',
    condition: { type: 'accuracy_over', value: 90 },
    reward: { exp: 100, coins: 25 },
    hidden: false,
  },
  {
    id: 'accuracy-95',
    title: '완벽에 가까운 비행',
    description: '정확도 95% 이상을 달성했어요!',
    category: 'accuracy',
    iconKey: 'accuracy-gold',
    condition: { type: 'accuracy_over', value: 95 },
    reward: { exp: 200, coins: 60 },
    hidden: false,
  },
  {
    id: 'accuracy-99',
    title: '완벽한 독수리',
    description: '정확도 99% 이상을 달성했어요!',
    category: 'accuracy',
    iconKey: 'accuracy-platinum',
    condition: { type: 'accuracy_over', value: 99 },
    reward: { exp: 500, coins: 150 },
    hidden: false,
  },
  {
    id: 'accuracy-100',
    title: '무결점 비행',
    description: '실수 없이 완벽하게 레슨을 완료했어요! (100%)',
    category: 'accuracy',
    iconKey: 'accuracy-legendary',
    condition: { type: 'accuracy_over', value: 100 },
    reward: { exp: 1000, coins: 300 },
    hidden: true,
  },

  // ─────────────── 연속 업적 ───────────────
  {
    id: 'streak-days-3',
    title: '3일 연속',
    description: '3일 연속으로 연습했어요!',
    category: 'streak',
    iconKey: 'streak-bronze',
    condition: { type: 'streak_days', value: 3 },
    reward: { exp: 80, coins: 15 },
    hidden: false,
  },
  {
    id: 'streak-days-7',
    title: '일주일 독수리',
    description: '7일 연속으로 연습했어요! 습관이 만들어지고 있어요.',
    category: 'streak',
    iconKey: 'streak-silver',
    condition: { type: 'streak_days', value: 7 },
    reward: { exp: 200, coins: 50 },
    hidden: false,
  },
  {
    id: 'streak-days-30',
    title: '한 달의 날개',
    description: '30일 연속 달성! 놀라운 의지력이에요!',
    category: 'streak',
    iconKey: 'streak-gold',
    condition: { type: 'streak_days', value: 30 },
    reward: { exp: 800, coins: 200 },
    hidden: false,
  },
  {
    id: 'streak-days-100',
    title: '100일의 전설',
    description: '100일 연속! 당신은 전설이에요!',
    category: 'streak',
    iconKey: 'streak-legendary',
    condition: { type: 'streak_days', value: 100 },
    reward: { exp: 3000, coins: 1000 },
    hidden: true,
  },
  {
    id: 'streak-correct-50',
    title: '50연속 정타',
    description: '실수 없이 50타를 연속으로 입력했어요!',
    category: 'streak',
    iconKey: 'combo-bronze',
    condition: { type: 'streak_correct', value: 50 },
    reward: { exp: 100, coins: 20 },
    hidden: false,
  },
  {
    id: 'streak-correct-100',
    title: '100연속 정타',
    description: '100타 연속 정타! 믿을 수 없는 집중력!',
    category: 'streak',
    iconKey: 'combo-silver',
    condition: { type: 'streak_correct', value: 100 },
    reward: { exp: 250, coins: 60 },
    hidden: false,
  },
  {
    id: 'streak-correct-200',
    title: '200연속 정타',
    description: '200타 연속 정타 달성! 신의 경지!',
    category: 'streak',
    iconKey: 'combo-gold',
    condition: { type: 'streak_correct', value: 200 },
    reward: { exp: 600, coins: 150 },
    hidden: false,
  },

  // ─────────────── 한글 업적 ───────────────
  {
    id: 'korean-first',
    title: '한글 입문',
    description: '첫 한글 레슨을 완료했어요!',
    category: 'korean',
    iconKey: 'korean-bronze',
    condition: { type: 'lessons_complete', value: 1 },
    reward: { exp: 100, coins: 20 },
    hidden: false,
  },
  {
    id: 'korean-20wpm',
    title: '한글 새싹',
    description: '한글 타이핑 20 WPM을 달성했어요!',
    category: 'korean',
    iconKey: 'korean-bronze',
    condition: { type: 'korean_wpm_over', value: 20 },
    reward: { exp: 150, coins: 30 },
    hidden: false,
  },
  {
    id: 'korean-30wpm',
    title: '한글 날개',
    description: '한글 타이핑 30 WPM을 달성했어요!',
    category: 'korean',
    iconKey: 'korean-silver',
    condition: { type: 'korean_wpm_over', value: 30 },
    reward: { exp: 250, coins: 60 },
    hidden: false,
  },
  {
    id: 'korean-40wpm',
    title: '한글 독수리',
    description: '한글 타이핑 40 WPM 달성! 한글도 정복했어요!',
    category: 'korean',
    iconKey: 'korean-gold',
    condition: { type: 'korean_wpm_over', value: 40 },
    reward: { exp: 400, coins: 100 },
    hidden: false,
  },
  {
    id: 'korean-50wpm',
    title: '한글의 왕',
    description: '한글 타이핑 50 WPM! 한글 타이핑의 최강자!',
    category: 'korean',
    iconKey: 'korean-legendary',
    condition: { type: 'korean_wpm_over', value: 50 },
    reward: { exp: 800, coins: 250 },
    hidden: true,
  },
  {
    id: 'korean-all-lessons',
    title: '한글 완전 정복',
    description: '한글 커리큘럼 20개 레슨을 모두 완료했어요!',
    category: 'korean',
    iconKey: 'korean-platinum',
    condition: { type: 'lessons_complete', value: 20 },
    reward: { exp: 1500, coins: 500 },
    hidden: false,
  },

  // ─────────────── 레슨 업적 ───────────────
  {
    id: 'lesson-first',
    title: '첫걸음',
    description: '첫 번째 레슨을 완료했어요!',
    category: 'lesson',
    iconKey: 'lesson-start',
    condition: { type: 'lessons_complete', value: 1 },
    reward: { exp: 30, coins: 5 },
    hidden: false,
  },
  {
    id: 'lesson-5',
    title: '5레슨 달성',
    description: '5개 레슨을 완료했어요!',
    category: 'lesson',
    iconKey: 'lesson-bronze',
    condition: { type: 'lessons_complete', value: 5 },
    reward: { exp: 100, coins: 20 },
    hidden: false,
  },
  {
    id: 'lesson-10',
    title: '10레슨 달성',
    description: '10개 레슨을 완료했어요! 절반을 넘었어요.',
    category: 'lesson',
    iconKey: 'lesson-silver',
    condition: { type: 'lessons_complete', value: 10 },
    reward: { exp: 250, coins: 60 },
    hidden: false,
  },
  {
    id: 'lesson-20',
    title: '영문 완전 정복',
    description: '영문 커리큘럼 20개 레슨을 모두 완료했어요!',
    category: 'lesson',
    iconKey: 'lesson-gold',
    condition: { type: 'lessons_complete', value: 20 },
    reward: { exp: 500, coins: 150 },
    hidden: false,
  },
  {
    id: 'lesson-40',
    title: '커리큘럼 완전 정복',
    description: '영문 + 한글 커리큘럼 40개 레슨을 모두 완료했어요!',
    category: 'lesson',
    iconKey: 'lesson-platinum',
    condition: { type: 'lessons_complete', value: 40 },
    reward: { exp: 2000, coins: 600 },
    hidden: false,
  },

  // ─────────────── 일일 업적 ───────────────
  {
    id: 'daily-first',
    title: '오늘의 첫 연습',
    description: '오늘 첫 번째 연습 세션을 완료했어요.',
    category: 'daily',
    iconKey: 'daily-sun',
    condition: { type: 'sessions_count', value: 1 },
    reward: { exp: 20, coins: 5 },
    hidden: false,
  },
  {
    id: 'daily-5sessions',
    title: '열정 독수리',
    description: '오늘 5번 연습했어요!',
    category: 'daily',
    iconKey: 'daily-fire',
    condition: { type: 'sessions_count', value: 5 },
    reward: { exp: 80, coins: 20 },
    hidden: false,
  },
  {
    id: 'daily-1000chars',
    title: '1000타 달성',
    description: '누적 1,000자를 입력했어요!',
    category: 'daily',
    iconKey: 'chars-bronze',
    condition: { type: 'total_chars', value: 1000 },
    reward: { exp: 50, coins: 10 },
    hidden: false,
  },
  {
    id: 'daily-10000chars',
    title: '1만 타 달성',
    description: '누적 10,000자를 입력했어요!',
    category: 'daily',
    iconKey: 'chars-silver',
    condition: { type: 'total_chars', value: 10000 },
    reward: { exp: 200, coins: 50 },
    hidden: false,
  },
  {
    id: 'daily-100000chars',
    title: '10만 타 달성',
    description: '누적 100,000자를 입력했어요! 대단해요!',
    category: 'daily',
    iconKey: 'chars-gold',
    condition: { type: 'total_chars', value: 100000 },
    reward: { exp: 1000, coins: 300 },
    hidden: false,
  },

  // ─────────────── 보스 & 특별 업적 ───────────────
  {
    id: 'boss-first',
    title: '첫 보스 격파',
    description: '첫 번째 보스를 물리쳤어요!',
    category: 'special',
    iconKey: 'boss-bronze',
    condition: { type: 'boss_cleared', value: 1 },
    reward: { exp: 200, coins: 50 },
    hidden: false,
  },
  {
    id: 'boss-all',
    title: '보스 킬러',
    description: '모든 보스를 물리쳤어요!',
    category: 'special',
    iconKey: 'boss-gold',
    condition: { type: 'boss_cleared', value: 7 },
    reward: { exp: 1500, coins: 500 },
    hidden: false,
  },
  {
    id: 'special-midnight',
    title: '올빼미 독수리',
    description: '자정(00:00~01:00)에 연습했어요. 늦게까지 수고했어요!',
    category: 'special',
    iconKey: 'owl-eagle',
    condition: { type: 'sessions_count', value: 1 },
    reward: { exp: 100, coins: 30 },
    hidden: true,
  },
  {
    id: 'special-early-bird',
    title: '새벽 독수리',
    description: '새벽 5시 이전에 연습을 완료했어요!',
    category: 'special',
    iconKey: 'dawn-eagle',
    condition: { type: 'sessions_count', value: 1 },
    reward: { exp: 100, coins: 30 },
    hidden: true,
  },
  {
    id: 'special-speed-accuracy',
    title: '완전체 독수리',
    description: '60 WPM 이상 + 정확도 95% 이상을 동시에 달성했어요!',
    category: 'special',
    iconKey: 'perfect-eagle',
    condition: { type: 'wpm_over', value: 60 },
    reward: { exp: 2000, coins: 800 },
    hidden: true,
  },
];

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === category);
}

export function getVisibleAchievements(): Achievement[] {
  return ACHIEVEMENTS.filter(a => !a.hidden);
}

export function checkAchievement(
  achievement: Achievement,
  stats: {
    wpm?: number;
    accuracy?: number;
    streakDays?: number;
    streakCorrect?: number;
    totalChars?: number;
    sessionsCount?: number;
    lessonsCompleted?: number;
    koreanWpm?: number;
    bossesCleared?: number;
  }
): boolean {
  const { condition } = achievement;
  switch (condition.type) {
    case 'wpm_over':
      return (stats.wpm ?? 0) >= condition.value;
    case 'accuracy_over':
      return (stats.accuracy ?? 0) >= condition.value;
    case 'streak_days':
      return (stats.streakDays ?? 0) >= condition.value;
    case 'streak_correct':
      return (stats.streakCorrect ?? 0) >= condition.value;
    case 'total_chars':
      return (stats.totalChars ?? 0) >= condition.value;
    case 'sessions_count':
      return (stats.sessionsCount ?? 0) >= condition.value;
    case 'lessons_complete':
      return (stats.lessonsCompleted ?? 0) >= condition.value;
    case 'korean_wpm_over':
      return (stats.koreanWpm ?? 0) >= condition.value;
    case 'boss_cleared':
      return (stats.bossesCleared ?? 0) >= condition.value;
    default:
      return false;
  }
}
