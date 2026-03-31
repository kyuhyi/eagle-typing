import { create } from 'zustand';
import type { Keystroke } from '@/types';

interface TypingState {
  targetText: string;
  currentIndex: number;
  keystrokes: Keystroke[];
  isActive: boolean;
  isPaused: boolean;
  composingText: string;
  startTime: number | null;
}

interface TypingActions {
  startSession: (targetText: string) => void;
  recordKeystroke: (keystroke: Keystroke) => void;
  updateComposition: (text: string) => void;
  completeSession: () => void;
  resetSession: () => void;
  setCurrentIndex: (index: number) => void;
  setPaused: (paused: boolean) => void;
}

const initialState: TypingState = {
  targetText: '',
  currentIndex: 0,
  keystrokes: [],
  isActive: false,
  isPaused: false,
  composingText: '',
  startTime: null,
};

export const useTypingStore = create<TypingState & TypingActions>()((set) => ({
  ...initialState,

  startSession: (targetText) =>
    set({
      targetText,
      currentIndex: 0,
      keystrokes: [],
      isActive: true,
      isPaused: false,
      composingText: '',
      startTime: Date.now(),
    }),

  recordKeystroke: (keystroke) =>
    set((state) => ({
      keystrokes: [...state.keystrokes, keystroke],
      currentIndex: keystroke.correct
        ? state.currentIndex + 1
        : state.currentIndex,
    })),

  updateComposition: (text) => set({ composingText: text }),

  completeSession: () => set({ isActive: false, isPaused: false }),

  resetSession: () => set(initialState),

  setCurrentIndex: (index) => set({ currentIndex: index }),

  setPaused: (paused) => set({ isPaused: paused }),
}));
