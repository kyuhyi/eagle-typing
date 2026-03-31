import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LessonProgress, DailyStats, SessionStats } from '@/types';

interface ProgressState {
  lessonProgress: Record<string, LessonProgress>;
  dailyStats: Record<string, DailyStats>;
}

interface ProgressActions {
  recordSessionResult: (
    lessonId: string,
    userId: string,
    stats: SessionStats,
    language: 'english' | 'korean'
  ) => void;
  updateLessonProgress: (lessonId: string, progress: Partial<LessonProgress>) => void;
  getDailyStats: (date: string) => DailyStats | undefined;
  resetProgress: () => void;
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function calcStars(
  stats: SessionStats,
  targetWpm: number,
  targetAccuracy: number
): 0 | 1 | 2 | 3 {
  const completed = stats.accuracy >= 60;
  if (!completed) return 0;
  const wpmOk = stats.wpm >= targetWpm;
  const accOk = stats.accuracy >= targetAccuracy;
  if (wpmOk && accOk) return 3;
  if (wpmOk || accOk) return 2;
  return 1;
}

export const useProgressStore = create<ProgressState & ProgressActions>()(
  persist(
    (set, get) => ({
      lessonProgress: {},
      dailyStats: {},

      recordSessionResult: (lessonId, userId, stats, _language) => {
        const today = getTodayKey();
        set((state) => {
          // ── lesson progress ──
          const existing = state.lessonProgress[lessonId];
          const attempts = (existing?.attempts ?? 0) + 1;
          const bestWpm = Math.max(existing?.bestWpm ?? 0, stats.wpm);
          const bestAccuracy = Math.max(existing?.bestAccuracy ?? 0, stats.accuracy);
          const newStars = calcStars(stats, 60, 90);
          const stars = Math.max(existing?.stars ?? 0, newStars) as 0 | 1 | 2 | 3;
          const completedAt =
            stars > 0 ? (existing?.completedAt ?? Date.now()) : existing?.completedAt;

          const updatedLesson: LessonProgress = {
            lessonId,
            userId,
            bestWpm,
            bestAccuracy,
            attempts,
            stars,
            completedAt,
            unlocked: existing?.unlocked ?? true,
          };

          // ── daily stats ──
          const daily = state.dailyStats[today];
          const totalSessions = (daily?.totalSessions ?? 0) + 1;
          const totalMinutes =
            (daily?.totalMinutes ?? 0) + Math.round(stats.duration / 60);
          const avgWpm = daily
            ? Math.round((daily.avgWpm * daily.totalSessions + stats.wpm) / totalSessions)
            : stats.wpm;
          const avgAccuracy = daily
            ? Math.round(
                (daily.avgAccuracy * daily.totalSessions + stats.accuracy) / totalSessions
              )
            : stats.accuracy;
          const lessonsCompleted =
            (daily?.lessonsCompleted ?? 0) + (stars > 0 ? 1 : 0);

          const updatedDaily: DailyStats = {
            date: today,
            userId,
            totalSessions,
            totalMinutes,
            avgWpm,
            avgAccuracy,
            exp: (daily?.exp ?? 0),
            lessonsCompleted,
          };

          return {
            lessonProgress: {
              ...state.lessonProgress,
              [lessonId]: updatedLesson,
            },
            dailyStats: {
              ...state.dailyStats,
              [today]: updatedDaily,
            },
          };
        });
      },

      updateLessonProgress: (lessonId, progress) =>
        set((state) => ({
          lessonProgress: {
            ...state.lessonProgress,
            [lessonId]: {
              ...state.lessonProgress[lessonId],
              ...progress,
            } as LessonProgress,
          },
        })),

      getDailyStats: (date) => get().dailyStats[date],

      resetProgress: () => set({ lessonProgress: {}, dailyStats: {} }),
    }),
    { name: 'eagle-typing-progress' }
  )
);
