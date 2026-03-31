import type { Lesson } from '@/types';

// ─────────────────────────────────────────────
// 영문 커리큘럼 (20개 레슨)
// Phase 1 (01~04): 홈로우
// Phase 2 (05~07): 윗줄
// Phase 3 (08~10): 아랫줄 + 전체 알파벳
// Phase 4 (11~13): 숫자 & 특수문자
// Phase 5 (14~16): 단어 & 문장
// Phase 6 (17~20): 속도 훈련
// ─────────────────────────────────────────────

export const ENGLISH_LESSONS: Lesson[] = [
  // ── Phase 1: 홈로우 ──
  {
    id: 'en-01',
    order: 1,
    title: 'F & J 기준점',
    description: '검지의 기준점, F와 J 키를 익혀요.',
    language: 'english',
    category: 'home-row',
    difficulty: 'beginner',
    allowedKeys: ['f', 'j'],
    targetWpm: 10,
    targetAccuracy: 90,
    exercises: [
      {
        id: 'en-01-ex1',
        type: 'keys',
        content: 'f j f j f j fj jf fj jf ff jj fjfj jfjf',
        hint: '양손 검지로 F와 J를 번갈아 눌러요.',
      },
      {
        id: 'en-01-ex2',
        type: 'words',
        content: 'fj fj jf jf fjf jfj ffj jjf',
        hint: '리듬감 있게 입력해보세요.',
      },
    ],
  },
  {
    id: 'en-02',
    order: 2,
    title: '왼손 홈로우 ASDF',
    description: '왼손 새끼~검지: A S D F를 마스터해요.',
    language: 'english',
    category: 'home-row',
    difficulty: 'beginner',
    allowedKeys: ['a', 's', 'd', 'f'],
    targetWpm: 12,
    targetAccuracy: 90,
    exercises: [
      {
        id: 'en-02-ex1',
        type: 'keys',
        content: 'a s d f f d s a asdf fdsa ssdd ffaa adfs',
        hint: '손가락이 홈포지션을 벗어나지 않게 해요.',
      },
      {
        id: 'en-02-ex2',
        type: 'words',
        content: 'asd fad sad ads dads fads',
        hint: '실제 단어로 연습해봐요.',
      },
    ],
  },
  {
    id: 'en-03',
    order: 3,
    title: '오른손 홈로우 JKL;',
    description: '오른손 검지~새끼: J K L ;를 마스터해요.',
    language: 'english',
    category: 'home-row',
    difficulty: 'beginner',
    allowedKeys: ['j', 'k', 'l', ';'],
    targetWpm: 12,
    targetAccuracy: 90,
    exercises: [
      {
        id: 'en-03-ex1',
        type: 'keys',
        content: 'j k l ; ; l k j jkl; ;lkj kkll jj;; jlk;',
        hint: '오른손 손가락 위치를 확인하세요.',
      },
      {
        id: 'en-03-ex2',
        type: 'words',
        content: 'lll kkk jjj jk lj kl jkl',
        hint: '정확성에 집중해요.',
      },
    ],
  },
  {
    id: 'en-04',
    order: 4,
    title: '홈로우 완성 ASDF GH JKL;',
    description: '양손 홈로우 전체를 조합해 연습해요.',
    language: 'english',
    category: 'home-row',
    difficulty: 'beginner',
    allowedKeys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
    targetWpm: 18,
    targetAccuracy: 88,
    exercises: [
      {
        id: 'en-04-ex1',
        type: 'keys',
        content: 'asdf jkl; asjk dflk ghgh fjdk sldg ahfl',
        hint: '양손 균형을 유지해요.',
      },
      {
        id: 'en-04-ex2',
        type: 'words',
        content: 'fall hall glad flask shall ask flask dash',
        hint: '홈로우만으로 만들 수 있는 단어들이에요.',
      },
      {
        id: 'en-04-ex3',
        type: 'sentences',
        content: 'a glad lad had a flask; he shall ask dad',
        hint: '문장 끝의 세미콜론도 오른손 새끼손가락으로.',
      },
    ],
  },

  // ── Phase 2: 윗줄 ──
  {
    id: 'en-05',
    order: 5,
    title: '왼손 윗줄 QWER',
    description: '홈로우에서 위로: Q W E R T를 익혀요.',
    language: 'english',
    category: 'top-row',
    difficulty: 'beginner',
    allowedKeys: ['a', 's', 'd', 'f', 'q', 'w', 'e', 'r', 't'],
    targetWpm: 18,
    targetAccuracy: 88,
    exercises: [
      {
        id: 'en-05-ex1',
        type: 'keys',
        content: 'q w e r t qwer rewq tqew rqwt ewrt qret',
        hint: '윗줄로 이동할 때 손목을 들지 말고 손가락만 뻗어요.',
      },
      {
        id: 'en-05-ex2',
        type: 'words',
        content: 'wart weed feed tree stare waste trade',
        hint: '왼손 윗줄 + 홈로우 조합 단어.',
      },
    ],
  },
  {
    id: 'en-06',
    order: 6,
    title: '오른손 윗줄 UIOP',
    description: '오른손 윗줄 Y U I O P를 익혀요.',
    language: 'english',
    category: 'top-row',
    difficulty: 'beginner',
    allowedKeys: ['j', 'k', 'l', ';', 'y', 'u', 'i', 'o', 'p'],
    targetWpm: 18,
    targetAccuracy: 88,
    exercises: [
      {
        id: 'en-06-ex1',
        type: 'keys',
        content: 'y u i o p yuio piou oiuy lipu okup yiop',
        hint: '오른손 검지로 Y와 U를 담당해요.',
      },
      {
        id: 'en-06-ex2',
        type: 'words',
        content: 'pool loop poli jury yolk polo opium',
        hint: '오른손 윗줄 + 홈로우 조합 단어.',
      },
    ],
  },
  {
    id: 'en-07',
    order: 7,
    title: '윗줄 + 홈로우 단어',
    description: '알파벳 상단 두 줄을 조합한 실용 단어를 타이핑해요.',
    language: 'english',
    category: 'top-row',
    difficulty: 'beginner',
    allowedKeys: 'qwertyuiopasdfghjkl;'.split(''),
    targetWpm: 22,
    targetAccuracy: 88,
    exercises: [
      {
        id: 'en-07-ex1',
        type: 'words',
        content: 'our your work word play power super world floor',
        hint: '두 줄이 섞인 일반 단어들이에요.',
      },
      {
        id: 'en-07-ex2',
        type: 'sentences',
        content: 'the dog plays in our yard; it is so happy',
        hint: '일상적인 문장으로 연습해요.',
      },
    ],
  },

  // ── Phase 3: 아랫줄 ──
  {
    id: 'en-08',
    order: 8,
    title: '왼손 아랫줄 ZXCV',
    description: '왼손 아랫줄 Z X C V B를 익혀요.',
    language: 'english',
    category: 'bottom-row',
    difficulty: 'intermediate',
    allowedKeys: ['a', 's', 'd', 'f', 'z', 'x', 'c', 'v', 'b'],
    targetWpm: 22,
    targetAccuracy: 88,
    exercises: [
      {
        id: 'en-08-ex1',
        type: 'keys',
        content: 'z x c v b zxcv bvcx xzvc vcbz czxb',
        hint: '아랫줄은 가장 힘들 수 있어요. 천천히!',
      },
      {
        id: 'en-08-ex2',
        type: 'words',
        content: 'cave base vase back brace scab cabs',
        hint: '아랫줄 + 홈로우 조합 단어.',
      },
    ],
  },
  {
    id: 'en-09',
    order: 9,
    title: '오른손 아랫줄 NM,.',
    description: '오른손 아랫줄 N M , . /를 익혀요.',
    language: 'english',
    category: 'bottom-row',
    difficulty: 'intermediate',
    allowedKeys: ['j', 'k', 'l', 'n', 'm', ',', '.', '/'],
    targetWpm: 22,
    targetAccuracy: 88,
    exercises: [
      {
        id: 'en-09-ex1',
        type: 'keys',
        content: 'n m , . / nm,. /.,mn mn,. ,n.m nm./',
        hint: '쉼표와 마침표는 자주 쓰이니 꼭 익혀두세요.',
      },
      {
        id: 'en-09-ex2',
        type: 'words',
        content: 'monk john noun moon norm mind link',
        hint: '오른손 아랫줄 + 홈로우 조합 단어.',
      },
    ],
  },
  {
    id: 'en-10',
    order: 10,
    title: '알파벳 전체 단어',
    description: '모든 알파벳 키를 활용한 다양한 단어를 입력해요.',
    language: 'english',
    category: 'words',
    difficulty: 'intermediate',
    allowedKeys: 'abcdefghijklmnopqrstuvwxyz'.split(''),
    targetWpm: 28,
    targetAccuracy: 90,
    exercises: [
      {
        id: 'en-10-ex1',
        type: 'words',
        content: 'quick brown fox jumps over lazy dog',
        hint: '모든 알파벳이 들어있는 유명한 문장의 단어들이에요.',
      },
      {
        id: 'en-10-ex2',
        type: 'sentences',
        content: 'the quick brown fox jumps over the lazy dog',
        hint: '알파벳 26자가 모두 들어있는 유명한 pangram이에요.',
      },
      {
        id: 'en-10-ex3',
        type: 'paragraph',
        content: 'pack my box with five dozen liquor jugs. how vexingly quick daft zebras jump.',
        hint: '다양한 pangram으로 실력을 테스트해요.',
      },
    ],
  },

  // ── Phase 4: 숫자 & 특수문자 ──
  {
    id: 'en-11',
    order: 11,
    title: '숫자 키 1~0',
    description: '숫자 행 1 2 3 4 5 6 7 8 9 0을 익혀요.',
    language: 'english',
    category: 'number-row',
    difficulty: 'intermediate',
    allowedKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    targetWpm: 20,
    targetAccuracy: 90,
    exercises: [
      {
        id: 'en-11-ex1',
        type: 'keys',
        content: '1 2 3 4 5 6 7 8 9 0 12 34 56 78 90 123 456 789',
        hint: '숫자 행은 홈로우에서 가장 멀어요. 손목 자세를 확인하세요.',
      },
      {
        id: 'en-11-ex2',
        type: 'words',
        content: '2024 3.14 100 365 42 1024 2048 9876',
        hint: '숫자 조합 연습이에요.',
      },
    ],
  },
  {
    id: 'en-12',
    order: 12,
    title: '특수문자 기초',
    description: '자주 쓰이는 특수문자 ! @ # $ % & * ( ) - = 을 익혀요.',
    language: 'english',
    category: 'special-chars',
    difficulty: 'intermediate',
    allowedKeys: ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '=', '_', '+'],
    targetWpm: 15,
    targetAccuracy: 88,
    exercises: [
      {
        id: 'en-12-ex1',
        type: 'keys',
        content: '! @ # $ % ^ & * ( ) - = _ +',
        hint: 'Shift 키와 조합해요. 왼손/오른손 Shift를 번갈아 사용하세요.',
      },
      {
        id: 'en-12-ex2',
        type: 'words',
        content: 'hello! buy@price #1 $100 (done) user-name key=value',
        hint: '실제 사용 맥락에서 특수문자를 연습해요.',
      },
    ],
  },
  {
    id: 'en-13',
    order: 13,
    title: '코드 스타일 입력',
    description: '프로그래밍에 자주 나오는 패턴을 입력해요.',
    language: 'english',
    category: 'special-chars',
    difficulty: 'intermediate',
    allowedKeys: [...'abcdefghijklmnopqrstuvwxyz0123456789'.split(''), '(', ')', '{', '}', '[', ']', ';', ':', '"', "'", '=', '-', '_', '.', ',', '/', '<', '>'],
    targetWpm: 25,
    targetAccuracy: 90,
    exercises: [
      {
        id: 'en-13-ex1',
        type: 'words',
        content: 'const let var function() => {} [] "";',
        hint: 'JavaScript 스타일 코드 조각들이에요.',
      },
      {
        id: 'en-13-ex2',
        type: 'sentences',
        content: 'const name = "eagle"; const speed = 100;',
        hint: '변수 선언 패턴을 연습해요.',
      },
      {
        id: 'en-13-ex3',
        type: 'paragraph',
        content: 'function greet(name) { return "hello, " + name; }',
        hint: '함수 선언 패턴을 연습해요.',
      },
    ],
  },

  // ── Phase 5: 단어 & 문장 ──
  {
    id: 'en-14',
    order: 14,
    title: '고빈도 단어 200',
    description: '영어에서 가장 자주 쓰이는 200개 단어를 연습해요.',
    language: 'english',
    category: 'words',
    difficulty: 'intermediate',
    allowedKeys: 'abcdefghijklmnopqrstuvwxyz'.split(''),
    targetWpm: 32,
    targetAccuracy: 92,
    exercises: [
      {
        id: 'en-14-ex1',
        type: 'words',
        content: 'the of and to in is it that he was for on are with as',
        hint: '가장 자주 쓰이는 단어들이에요.',
      },
      {
        id: 'en-14-ex2',
        type: 'words',
        content: 'have be from or one had by but not what all were they we',
        hint: '계속 이어지는 고빈도 단어들.',
      },
    ],
  },
  {
    id: 'en-15',
    order: 15,
    title: '일상 영어 문장',
    description: '자연스러운 영어 문장을 타이핑해요.',
    language: 'english',
    category: 'sentences',
    difficulty: 'intermediate',
    allowedKeys: [...'abcdefghijklmnopqrstuvwxyz'.split(''), ',', '.', '!', '?', "'"],
    targetWpm: 35,
    targetAccuracy: 92,
    exercises: [
      {
        id: 'en-15-ex1',
        type: 'sentences',
        content: "it's a beautiful day outside. let's go for a walk.",
        hint: '어포스트로피 위치를 확인하세요.',
      },
      {
        id: 'en-15-ex2',
        type: 'sentences',
        content: 'she opened the door and walked into the room.',
        hint: '자연스럽게 흐르듯 입력해요.',
      },
      {
        id: 'en-15-ex3',
        type: 'paragraph',
        content: 'the sun set behind the mountains. stars began to appear in the dark sky. it was a perfect evening.',
        hint: '짧은 단락을 연습해요.',
      },
    ],
  },
  {
    id: 'en-16',
    order: 16,
    title: '긴 문단 입력',
    description: '더 긴 영어 단락을 일정한 속도로 타이핑해요.',
    language: 'english',
    category: 'sentences',
    difficulty: 'advanced',
    allowedKeys: [...'abcdefghijklmnopqrstuvwxyz'.split(''), ',', '.', '!', '?', "'", '"', ';', ':'],
    targetWpm: 40,
    targetAccuracy: 93,
    exercises: [
      {
        id: 'en-16-ex1',
        type: 'paragraph',
        content: "typing is a skill that improves with practice. the more you type, the faster and more accurate you become. try to maintain a steady rhythm rather than rushing.",
        hint: '일정한 리듬을 유지하는 것이 핵심이에요.',
      },
      {
        id: 'en-16-ex2',
        type: 'paragraph',
        content: "an eagle soars high above the clouds, its sharp eyes scanning the ground below. with powerful wings, it rides the wind currents effortlessly.",
        hint: '독수리처럼 유연하고 힘차게!',
      },
    ],
  },

  // ── Phase 6: 속도 훈련 ──
  {
    id: 'en-17',
    order: 17,
    title: '속도 훈련 1: 단어 폭발',
    description: '짧은 고빈도 단어를 최대한 빠르게 입력해요.',
    language: 'english',
    category: 'speed',
    difficulty: 'advanced',
    allowedKeys: 'abcdefghijklmnopqrstuvwxyz'.split(''),
    targetWpm: 45,
    targetAccuracy: 90,
    exercises: [
      {
        id: 'en-17-ex1',
        type: 'words',
        content: 'and the for you that this with have from they will one all',
        hint: '정확도보다 속도에 집중해봐요 (단, 90% 이상 유지).',
      },
      {
        id: 'en-17-ex2',
        type: 'words',
        content: 'run get use may see him his her way say she each',
        hint: '3글자 단어들로 리듬감을 익혀요.',
      },
    ],
  },
  {
    id: 'en-18',
    order: 18,
    title: '속도 훈련 2: 문장 연사',
    description: '연속 문장을 멈추지 않고 타이핑해요.',
    language: 'english',
    category: 'speed',
    difficulty: 'advanced',
    allowedKeys: [...'abcdefghijklmnopqrstuvwxyz'.split(''), ',', '.', '!', '?', "'"],
    targetWpm: 50,
    targetAccuracy: 91,
    exercises: [
      {
        id: 'en-18-ex1',
        type: 'paragraph',
        content: 'time flies when you are having fun. practice makes perfect. keep going and never give up.',
        hint: '중간에 멈추지 말고 실수해도 계속 앞으로!',
      },
    ],
  },
  {
    id: 'en-19',
    order: 19,
    title: '속도 훈련 3: 혼합 텍스트',
    description: '숫자, 특수문자가 포함된 복합 텍스트를 빠르게 입력해요.',
    language: 'english',
    category: 'speed',
    difficulty: 'expert',
    allowedKeys: [...'abcdefghijklmnopqrstuvwxyz0123456789'.split(''), ',', '.', '!', '?', '-', '_', '(', ')', '@'],
    targetWpm: 55,
    targetAccuracy: 92,
    exercises: [
      {
        id: 'en-19-ex1',
        type: 'paragraph',
        content: 'user123@email.com signed up on 2024-01-15. order #4892 total: $49.99 (2 items).',
        hint: '실무에서 자주 보는 혼합 텍스트 형식이에요.',
      },
    ],
  },
  {
    id: 'en-20',
    order: 20,
    title: '속도 챌린지: 극한',
    description: '목표 WPM 60! 타이핑 마스터에 도전해요.',
    language: 'english',
    category: 'speed',
    difficulty: 'expert',
    allowedKeys: [],  // 모든 키
    targetWpm: 60,
    targetAccuracy: 95,
    exercises: [
      {
        id: 'en-20-ex1',
        type: 'paragraph',
        content: 'the ability to type quickly and accurately is one of the most valuable skills in the modern workplace. dedicated practice, proper finger placement, and consistent effort will help you reach your goals.',
        hint: '여기까지 온 당신은 이미 독수리!',
      },
      {
        id: 'en-20-ex2',
        type: 'paragraph',
        content: "speed comes from muscle memory, not from looking at the keyboard. keep your eyes on the screen and let your fingers find their way. you've come a long way—now fly!",
        hint: '화면을 보며 손가락이 기억하게 해요.',
      },
    ],
  },
];

export function getLessonById(id: string): Lesson | undefined {
  return ENGLISH_LESSONS.find(l => l.id === id);
}

export function getLessonsByDifficulty(difficulty: Lesson['difficulty']): Lesson[] {
  return ENGLISH_LESSONS.filter(l => l.difficulty === difficulty);
}
