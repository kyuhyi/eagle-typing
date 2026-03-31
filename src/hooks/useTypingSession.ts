'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useTypingStore } from '@/stores/typing-store';
import { useProgressStore } from '@/stores/progress-store';
import { useGamificationStore } from '@/stores/gamification-store';
import { TypingEngine } from '@/lib/engine/typing-engine';
import type { EngineLanguage } from '@/lib/engine/typing-engine';
import type { SessionStats } from '@/types';

interface UseTypingSessionOptions {
  lessonId?: string;
  userId?: string;
  onComplete?: (stats: SessionStats) => void;
  onKeystroke?: (correct: boolean, streak: number, char: string) => void;
}

export function useTypingSession(
  targetText: string,
  language: EngineLanguage = 'english',
  options: UseTypingSessionOptions = {}
) {
  const { lessonId = 'free', userId = 'local', onComplete, onKeystroke } = options;

  const engineRef = useRef<TypingEngine | null>(null);
  const [pressedKeyCode, setPressedKeyCode] = useState<string | undefined>(undefined);
  const [pressedIsCorrect, setPressedIsCorrect] = useState(false);
  const pressedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    isActive,
    isPaused,
    currentIndex,
    composingText,
    startSession,
    recordKeystroke,
    updateComposition,
    completeSession,
    resetSession,
  } = useTypingStore();

  const recordSessionResult = useProgressStore((s) => s.recordSessionResult);
  const { awardXP, checkAchievements, updateStreak } = useGamificationStore();

  // エンジン初期化
  useEffect(() => {
    engineRef.current = new TypingEngine({ language });
  }, [language]);

  const start = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || !targetText) return;
    engine.startSession(targetText);
    startSession(targetText);
  }, [targetText, startSession]);

  const reset = useCallback(() => {
    engineRef.current = new TypingEngine({ language });
    resetSession();
  }, [language, resetSession]);

  // 세션 완료 처리
  const handleComplete = useCallback(
    (stats: SessionStats) => {
      completeSession();
      updateStreak();
      recordSessionResult(lessonId, userId, stats, language);
      awardXP(Math.round(stats.wpm * (stats.accuracy / 100)));
      checkAchievements({
        ...stats,
        koreanWpm: language === 'korean' ? stats.wpm : undefined,
      });
      onComplete?.(stats);
    },
    [
      completeSession,
      updateStreak,
      recordSessionResult,
      awardXP,
      checkAchievements,
      lessonId,
      userId,
      language,
      onComplete,
    ]
  );

  // 키보드 이벤트 핸들러
  useEffect(() => {
    if (!isActive || isPaused) return;

    const engine = engineRef.current;
    if (!engine) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 한글 IME 조합 중이거나 IME 처리 키(229)인 경우 compositionend에서 처리
      if (e.isComposing || e.keyCode === 229) return;
      // 조작 키 무시
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Shift' || e.key === 'CapsLock' || e.key === 'Tab') return;

      const char = e.key === 'Enter' ? '\n' : e.key === 'Tab' ? '\t' : e.key;
      if (char.length !== 1) return;

      // 한글 자모가 keydown으로 들어오면 무시 (composition 이벤트로 처리)
      if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(char)) return;

      const correct = engine.processKeystroke(char, e.code, Date.now());
      const ks = engine.getKeystrokes().at(-1);
      if (ks) recordKeystroke(ks);
      onKeystroke?.(correct, engine.getCurrentStreak(), char);

      // Flash the pressed key on the keyboard visual
      setPressedKeyCode(e.code);
      setPressedIsCorrect(correct);
      if (pressedTimerRef.current) clearTimeout(pressedTimerRef.current);
      pressedTimerRef.current = setTimeout(() => setPressedKeyCode(undefined), 150);

      if (engine.isComplete()) {
        handleComplete(engine.getStats());
      }
    };

    const handleCompositionUpdate = (e: CompositionEvent) => {
      engine.processCompositionUpdate(e.data, Date.now());
      updateComposition(e.data);
    };

    const handleCompositionEnd = (e: CompositionEvent) => {
      if (!e.data) return;
      const correct = engine.processCompositionEnd(e.data, Date.now());
      const ks = engine.getKeystrokes().at(-1);
      if (ks) recordKeystroke(ks);
      updateComposition('');
      onKeystroke?.(correct, engine.getCurrentStreak(), e.data);

      if (engine.isComplete()) {
        handleComplete(engine.getStats());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('compositionupdate', handleCompositionUpdate);
    window.addEventListener('compositionend', handleCompositionEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('compositionupdate', handleCompositionUpdate);
      window.removeEventListener('compositionend', handleCompositionEnd);
      if (pressedTimerRef.current) clearTimeout(pressedTimerRef.current);
    };
  }, [isActive, isPaused, recordKeystroke, updateComposition, handleComplete, onKeystroke]);

  return {
    isActive,
    isPaused,
    currentIndex,
    composingText,
    progress: engineRef.current?.getProgress() ?? 0,
    stats: engineRef.current?.getStats() ?? null,
    currentStreak: engineRef.current?.getCurrentStreak() ?? 0,
    pressedKeyCode,
    pressedIsCorrect,
    start,
    reset,
  };
}
