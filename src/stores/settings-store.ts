import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { KeyboardLayoutType } from '@/types';

interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  showKeyboard: boolean;
  showFingerGuide: boolean;
  soundEnabled: boolean;
  soundVolume: number;        // 0 ~ 1
  fontSize: 'small' | 'medium' | 'large';
  koreanLayout: KeyboardLayoutType;
}

interface SettingsActions {
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  resetToDefaults: () => void;
}

const defaults: SettingsState = {
  theme: 'system',
  showKeyboard: true,
  showFingerGuide: true,
  soundEnabled: true,
  soundVolume: 0.5,
  fontSize: 'medium',
  koreanLayout: 'qwerty',
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      ...defaults,

      updateSetting: (key, value) => set({ [key]: value }),

      resetToDefaults: () => set(defaults),
    }),
    { name: 'eagle-typing-settings' }
  )
);
