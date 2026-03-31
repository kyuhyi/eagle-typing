import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserAchievement, SessionStats } from '@/types';
import { ACHIEVEMENTS } from '@/lib/gamification/achievements';
import { getLevelFromExp, getExpToNextLevel } from '@/lib/gamification/levels';

interface GamificationState {
  currentLevel: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;   // YYYY-MM-DD
  achievements: UserAchievement[];
}

interface GamificationActions {
  awardXP: (amount: number) => void;
  checkAchievements: (stats: SessionStats & {
    totalChars?: number;
    sessionsCount?: number;
    koreanWpm?: number;
    bossCleared?: boolean;
    streakDays?: number;
    streakCorrect?: number;
    lessonsComplete?: number;
  }) => UserAchievement[];
  updateStreak: () => void;
  getLevelProgress: () => { level: number; progressPercent: number; expInLevel: number; expRequired: number };
  resetGamification: () => void;
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

const initialState: GamificationState = {
  currentLevel: 0,
  totalXP: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastPracticeDate: null,
  achievements: [],
};

export const useGamificationStore = create<GamificationState & GamificationActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      awardXP: (amount) => {
        set((state) => {
          const newTotal = state.totalXP + amount;
          const newLevel = getLevelFromExp(newTotal);
          return { totalXP: newTotal, currentLevel: newLevel };
        });
      },

      checkAchievements: (stats) => {
        const state = get();
        const alreadyUnlocked = new Set(state.achievements.map((a) => a.achievementId));
        const newlyUnlocked: UserAchievement[] = [];

        for (const achievement of ACHIEVEMENTS) {
          if (alreadyUnlocked.has(achievement.id)) continue;

          const { type, value } = achievement.condition;
          let met = false;

          switch (type) {
            case 'wpm_over':
              met = stats.wpm >= value;
              break;
            case 'accuracy_over':
              met = stats.accuracy >= value;
              break;
            case 'streak_days':
              met = (stats.streakDays ?? state.currentStreak) >= value;
              break;
            case 'streak_correct':
              met = (stats.streakCorrect ?? stats.longestStreak) >= value;
              break;
            case 'lessons_complete':
              met = (stats.lessonsComplete ?? 0) >= value;
              break;
            case 'korean_wpm_over':
              met = (stats.koreanWpm ?? 0) >= value;
              break;
            case 'total_chars':
              met = (stats.totalChars ?? 0) >= value;
              break;
            case 'boss_cleared':
              met = stats.bossCleared === true;
              break;
            case 'sessions_count':
              met = (stats.sessionsCount ?? 0) >= value;
              break;
          }

          if (met) {
            const ua: UserAchievement = {
              achievementId: achievement.id,
              userId: 'local',
              unlockedAt: Date.now(),
            };
            newlyUnlocked.push(ua);
          }
        }

        if (newlyUnlocked.length > 0) {
          const totalBonusXP = newlyUnlocked.reduce((sum, ua) => {
            const def = ACHIEVEMENTS.find((a) => a.id === ua.achievementId);
            return sum + (def?.reward.exp ?? 0);
          }, 0);

          set((state) => {
            const newTotal = state.totalXP + totalBonusXP;
            return {
              achievements: [...state.achievements, ...newlyUnlocked],
              totalXP: newTotal,
              currentLevel: getLevelFromExp(newTotal),
            };
          });
        }

        return newlyUnlocked;
      },

      updateStreak: () => {
        const today = getTodayKey();
        const yesterday = getYesterdayKey();
        set((state) => {
          if (state.lastPracticeDate === today) return {};

          const continued = state.lastPracticeDate === yesterday;
          const newStreak = continued ? state.currentStreak + 1 : 1;
          const longestStreak = Math.max(state.longestStreak, newStreak);

          return {
            currentStreak: newStreak,
            longestStreak,
            lastPracticeDate: today,
          };
        });
      },

      getLevelProgress: () => {
        const { totalXP } = get();
        const { current, required, percentage } = getExpToNextLevel(totalXP);
        return {
          level: getLevelFromExp(totalXP),
          progressPercent: percentage,
          expInLevel: current,
          expRequired: required,
        };
      },

      resetGamification: () => set(initialState),
    }),
    { name: 'eagle-typing-gamification' }
  )
);
