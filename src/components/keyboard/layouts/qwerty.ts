export type Finger =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky'
  | 'thumb';

export interface KeyDefinition {
  code: string;
  label: string;
  koreanLabel?: string;
  shiftLabel?: string;
  koreanShiftLabel?: string;
  finger: Finger;
  row: number;
  col: number;
  width?: number;
  isHomeKey?: boolean;
}

export const QWERTY_LAYOUT: KeyDefinition[] = [
  // Row 0 - Number row
  { code: 'Backquote',   label: '`',  shiftLabel: '~',  finger: 'left-pinky',  row: 0, col: 0 },
  { code: 'Digit1',      label: '1',  shiftLabel: '!',  finger: 'left-pinky',  row: 0, col: 1 },
  { code: 'Digit2',      label: '2',  shiftLabel: '@',  finger: 'left-ring',   row: 0, col: 2 },
  { code: 'Digit3',      label: '3',  shiftLabel: '#',  finger: 'left-middle', row: 0, col: 3 },
  { code: 'Digit4',      label: '4',  shiftLabel: '$',  finger: 'left-index',  row: 0, col: 4 },
  { code: 'Digit5',      label: '5',  shiftLabel: '%',  finger: 'left-index',  row: 0, col: 5 },
  { code: 'Digit6',      label: '6',  shiftLabel: '^',  finger: 'right-index', row: 0, col: 6 },
  { code: 'Digit7',      label: '7',  shiftLabel: '&',  finger: 'right-index', row: 0, col: 7 },
  { code: 'Digit8',      label: '8',  shiftLabel: '*',  finger: 'right-middle',row: 0, col: 8 },
  { code: 'Digit9',      label: '9',  shiftLabel: '(',  finger: 'right-ring',  row: 0, col: 9 },
  { code: 'Digit0',      label: '0',  shiftLabel: ')',  finger: 'right-pinky', row: 0, col: 10 },
  { code: 'Minus',       label: '-',  shiftLabel: '_',  finger: 'right-pinky', row: 0, col: 11 },
  { code: 'Equal',       label: '=',  shiftLabel: '+',  finger: 'right-pinky', row: 0, col: 12 },
  { code: 'Backspace',   label: '⌫',                    finger: 'right-pinky', row: 0, col: 13, width: 2 },

  // Row 1 - QWERTY row
  { code: 'Tab',         label: 'Tab',                  finger: 'left-pinky',  row: 1, col: 0, width: 1.5 },
  { code: 'KeyQ',        label: 'Q',                    finger: 'left-pinky',  row: 1, col: 1 },
  { code: 'KeyW',        label: 'W',                    finger: 'left-ring',   row: 1, col: 2 },
  { code: 'KeyE',        label: 'E',                    finger: 'left-middle', row: 1, col: 3 },
  { code: 'KeyR',        label: 'R',                    finger: 'left-index',  row: 1, col: 4 },
  { code: 'KeyT',        label: 'T',                    finger: 'left-index',  row: 1, col: 5 },
  { code: 'KeyY',        label: 'Y',                    finger: 'right-index', row: 1, col: 6 },
  { code: 'KeyU',        label: 'U',                    finger: 'right-index', row: 1, col: 7 },
  { code: 'KeyI',        label: 'I',                    finger: 'right-middle',row: 1, col: 8 },
  { code: 'KeyO',        label: 'O',                    finger: 'right-ring',  row: 1, col: 9 },
  { code: 'KeyP',        label: 'P',                    finger: 'right-pinky', row: 1, col: 10 },
  { code: 'BracketLeft', label: '[',  shiftLabel: '{',  finger: 'right-pinky', row: 1, col: 11 },
  { code: 'BracketRight',label: ']',  shiftLabel: '}',  finger: 'right-pinky', row: 1, col: 12 },
  { code: 'Backslash',   label: '\\', shiftLabel: '|',  finger: 'right-pinky', row: 1, col: 13, width: 1.5 },

  // Row 2 - Home row
  { code: 'CapsLock',    label: 'Caps',                 finger: 'left-pinky',  row: 2, col: 0, width: 1.75 },
  { code: 'KeyA',        label: 'A',                    finger: 'left-pinky',  row: 2, col: 1, isHomeKey: true },
  { code: 'KeyS',        label: 'S',                    finger: 'left-ring',   row: 2, col: 2, isHomeKey: true },
  { code: 'KeyD',        label: 'D',                    finger: 'left-middle', row: 2, col: 3, isHomeKey: true },
  { code: 'KeyF',        label: 'F',                    finger: 'left-index',  row: 2, col: 4, isHomeKey: true },
  { code: 'KeyG',        label: 'G',                    finger: 'left-index',  row: 2, col: 5 },
  { code: 'KeyH',        label: 'H',                    finger: 'right-index', row: 2, col: 6 },
  { code: 'KeyJ',        label: 'J',                    finger: 'right-index', row: 2, col: 7, isHomeKey: true },
  { code: 'KeyK',        label: 'K',                    finger: 'right-middle',row: 2, col: 8, isHomeKey: true },
  { code: 'KeyL',        label: 'L',                    finger: 'right-ring',  row: 2, col: 9, isHomeKey: true },
  { code: 'Semicolon',   label: ';',  shiftLabel: ':',  finger: 'right-pinky', row: 2, col: 10, isHomeKey: true },
  { code: 'Quote',       label: '\'', shiftLabel: '"',  finger: 'right-pinky', row: 2, col: 11 },
  { code: 'Enter',       label: 'Enter',                finger: 'right-pinky', row: 2, col: 12, width: 2.25 },

  // Row 3 - Bottom alpha row
  { code: 'ShiftLeft',   label: 'Shift',                finger: 'left-pinky',  row: 3, col: 0, width: 2.25 },
  { code: 'KeyZ',        label: 'Z',                    finger: 'left-pinky',  row: 3, col: 1 },
  { code: 'KeyX',        label: 'X',                    finger: 'left-ring',   row: 3, col: 2 },
  { code: 'KeyC',        label: 'C',                    finger: 'left-middle', row: 3, col: 3 },
  { code: 'KeyV',        label: 'V',                    finger: 'left-index',  row: 3, col: 4 },
  { code: 'KeyB',        label: 'B',                    finger: 'left-index',  row: 3, col: 5 },
  { code: 'KeyN',        label: 'N',                    finger: 'right-index', row: 3, col: 6 },
  { code: 'KeyM',        label: 'M',                    finger: 'right-index', row: 3, col: 7 },
  { code: 'Comma',       label: ',',  shiftLabel: '<',  finger: 'right-middle',row: 3, col: 8 },
  { code: 'Period',      label: '.',  shiftLabel: '>',  finger: 'right-ring',  row: 3, col: 9 },
  { code: 'Slash',       label: '/',  shiftLabel: '?',  finger: 'right-pinky', row: 3, col: 10 },
  { code: 'ShiftRight',  label: 'Shift',                finger: 'right-pinky', row: 3, col: 11, width: 2.75 },

  // Row 4 - Space row
  { code: 'ControlLeft', label: 'Ctrl',                 finger: 'left-pinky',  row: 4, col: 0, width: 1.25 },
  { code: 'MetaLeft',    label: 'Win',                  finger: 'left-pinky',  row: 4, col: 1, width: 1.25 },
  { code: 'AltLeft',     label: 'Alt',                  finger: 'left-pinky',  row: 4, col: 2, width: 1.25 },
  { code: 'Space',       label: ' ',                    finger: 'thumb',       row: 4, col: 3, width: 6.25 },
  { code: 'AltRight',    label: 'Alt',                  finger: 'right-pinky', row: 4, col: 4, width: 1.25 },
  { code: 'MetaRight',   label: 'Win',                  finger: 'right-pinky', row: 4, col: 5, width: 1.25 },
  { code: 'ContextMenu', label: 'Menu',                 finger: 'right-pinky', row: 4, col: 6, width: 1.25 },
  { code: 'ControlRight',label: 'Ctrl',                 finger: 'right-pinky', row: 4, col: 7, width: 1.25 },
];
