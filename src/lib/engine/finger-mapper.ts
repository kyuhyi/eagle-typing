import { Finger, QWERTY_LAYOUT } from '@/components/keyboard/layouts/qwerty';

const CODE_TO_FINGER: Record<string, Finger> = Object.fromEntries(
  QWERTY_LAYOUT.map((k) => [k.code, k.finger])
);

export function getFingerForKey(code: string): Finger | undefined {
  return CODE_TO_FINGER[code];
}

export const FINGER_COLORS: Record<Finger, string> = {
  'left-pinky':   '#f87171', // red-400
  'left-ring':    '#fb923c', // orange-400
  'left-middle':  '#facc15', // yellow-400
  'left-index':   '#4ade80', // green-400
  'right-index':  '#60a5fa', // blue-400
  'right-middle': '#a78bfa', // violet-400
  'right-ring':   '#f472b6', // pink-400
  'right-pinky':  '#34d399', // emerald-400
  'thumb':        '#94a3b8', // slate-400
};

export function getFingerColor(finger: Finger): string {
  return FINGER_COLORS[finger];
}

export function getHomeKeys(): string[] {
  return QWERTY_LAYOUT.filter((k) => k.isHomeKey).map((k) => k.code);
}
