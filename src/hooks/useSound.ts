'use client';

import { useCallback, useEffect, useRef } from 'react';
import { getSoundEngine, SoundEngine } from '@/lib/sound/sound-engine';
import { useSettingsStore } from '@/stores/settings-store';

export function useSound() {
  const engineRef = useRef<SoundEngine | null>(null);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const soundVolume = useSettingsStore((s) => s.soundVolume);

  // 볼륨 변경 반영
  useEffect(() => {
    engineRef.current?.setVolume(soundVolume);
  }, [soundVolume]);

  const init = useCallback(async () => {
    const engine = getSoundEngine();
    engineRef.current = engine;
    engine.setVolume(soundVolume);
    await engine.init();
  }, [soundVolume]);

  const playKeyClick = useCallback(() => {
    if (!soundEnabled) return;
    engineRef.current?.playKeyClick();
  }, [soundEnabled]);

  const playError = useCallback(() => {
    if (!soundEnabled) return;
    engineRef.current?.playKeyError();
  }, [soundEnabled]);

  const playSpace = useCallback(() => {
    if (!soundEnabled) return;
    engineRef.current?.playSpace();
  }, [soundEnabled]);

  const playCombo = useCallback(
    (count: number) => {
      if (!soundEnabled) return;
      engineRef.current?.playCombo(count);
    },
    [soundEnabled]
  );

  const playLevelUp = useCallback(() => {
    if (!soundEnabled) return;
    engineRef.current?.playLevelUp();
  }, [soundEnabled]);

  const playComboMilestone = useCallback(
    (streak: number) => {
      if (!soundEnabled) return;
      engineRef.current?.playComboMilestone(streak);
    },
    [soundEnabled]
  );

  const playBossHit = useCallback(() => {
    if (!soundEnabled) return;
    engineRef.current?.playBossHit();
  }, [soundEnabled]);

  const playBossDefeat = useCallback(() => {
    if (!soundEnabled) return;
    engineRef.current?.playBossDefeat();
  }, [soundEnabled]);

  const playBossWarning = useCallback(() => {
    if (!soundEnabled) return;
    engineRef.current?.playBossWarning();
  }, [soundEnabled]);

  const playAchievementUnlock = useCallback(() => {
    if (!soundEnabled) return;
    engineRef.current?.playAchievementUnlock();
  }, [soundEnabled]);

  const playStageComplete = useCallback(() => {
    if (!soundEnabled) return;
    engineRef.current?.playStageComplete();
  }, [soundEnabled]);

  return {
    init,
    playKeyClick,
    playError,
    playSpace,
    playCombo,
    playLevelUp,
    playComboMilestone,
    playBossHit,
    playBossDefeat,
    playBossWarning,
    playAchievementUnlock,
    playStageComplete,
  };
}
