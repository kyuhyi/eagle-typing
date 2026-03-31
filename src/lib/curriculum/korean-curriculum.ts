import type { Lesson } from '@/types';

// ─────────────────────────────────────────────
// 한글 커리큘럼 (20개 레슨) - 두벌식 기준
// Phase 1 (01~03): 자음
// Phase 2 (04~05): 모음
// Phase 3 (06~09): 자음+모음 조합 (음절)
// Phase 4 (10~13): 받침 + 단어
// Phase 5 (14~17): 문장
// Phase 6 (18~20): 속도 훈련
// ─────────────────────────────────────────────

// 두벌식 키보드 배열 참고:
// 자음: ㅂ(q) ㅈ(w) ㄷ(e) ㄱ(r) ㅅ(t) ㅛ(y) ㅕ(u) ㅣ(i) ㅐ(o) ㅔ(p)
//       ㅁ(a) ㄴ(s) ㅇ(d) ㄹ(f) ㅎ(g) ㅗ(h) ㅓ(j) ㅏ(k) ㅣ(l)
//       ㅋ(z) ㅌ(x) ㅊ(c) ㅍ(v) ㅠ(b) ㅜ(n) ㅡ(m)

export const KOREAN_LESSONS: Lesson[] = [
  // ── Phase 1: 기본 음절 (자음+모음 조합) ──
  {
    id: 'ko-01',
    order: 1,
    title: '기본 음절 1: 가나다라마',
    description: '한글 두벌식의 가장 기본 음절을 익혀요.',
    language: 'korean',
    category: 'korean-syllable',
    difficulty: 'beginner',
    allowedKeys: ['가', '나', '다', '라', '마'],
    targetWpm: 10,
    targetAccuracy: 90,
    exercises: [
      {
        id: 'ko-01-ex1',
        type: 'keys',
        content: '가 나 다 라 마 가나 다라 마가 나다 라마',
        hint: '가=rk, 나=sk, 다=ek, 라=fk, 마=ak',
      },
      {
        id: 'ko-01-ex2',
        type: 'keys',
        content: '가나다 라마가 나다라 마가나 다라마',
        hint: '천천히 정확하게 입력해요.',
      },
    ],
  },
  {
    id: 'ko-02',
    order: 2,
    title: '기본 음절 2: 바사아자',
    description: '자주 쓰는 음절을 더 익혀요.',
    language: 'korean',
    category: 'korean-syllable',
    difficulty: 'beginner',
    allowedKeys: ['바', '사', '아', '자', '하'],
    targetWpm: 10,
    targetAccuracy: 90,
    exercises: [
      {
        id: 'ko-02-ex1',
        type: 'keys',
        content: '바 사 아 자 하 바사 아자 하바 사아 자하',
        hint: '바=qk, 사=tk, 아=dk, 자=wk, 하=gk',
      },
      {
        id: 'ko-02-ex2',
        type: 'keys',
        content: '바사아 자하바 사아자 하바사 아자하',
        hint: '리듬감 있게 입력해 봐요.',
      },
    ],
  },
  {
    id: 'ko-03',
    order: 3,
    title: '모음 변화: 거너더러머',
    description: '모음을 바꿔가며 다양한 음절을 연습해요.',
    language: 'korean',
    category: 'korean-syllable',
    difficulty: 'beginner',
    allowedKeys: ['거', '너', '더', '러', '머', '고', '노', '도', '로', '모'],
    targetWpm: 12,
    targetAccuracy: 88,
    exercises: [
      {
        id: 'ko-03-ex1',
        type: 'keys',
        content: '거 너 더 러 머 고 노 도 로 모',
        hint: '거=rj, 너=sj, 고=rh, 노=sh',
      },
      {
        id: 'ko-03-ex2',
        type: 'keys',
        content: '가거고 나너노 다더도 라러로 마머모',
        hint: '같은 자음에 모음만 바꿔보세요.',
      },
    ],
  },

  // ── Phase 2: 다양한 모음 음절 ──
  {
    id: 'ko-04',
    order: 4,
    title: '모음 확장: 구누두루무',
    description: 'ㅜ, ㅡ, ㅣ 모음이 들어간 음절을 익혀요.',
    language: 'korean',
    category: 'korean-syllable',
    difficulty: 'beginner',
    allowedKeys: ['구', '누', '두', '루', '무', '기', '니', '디', '리', '미'],
    targetWpm: 12,
    targetAccuracy: 90,
    exercises: [
      {
        id: 'ko-04-ex1',
        type: 'keys',
        content: '구 누 두 루 무 기 니 디 리 미',
        hint: '구=rn, 누=sn, 기=rl, 니=sl',
      },
      {
        id: 'ko-04-ex2',
        type: 'keys',
        content: '가구기 나누니 다두디 라루리 마무미',
        hint: '같은 자음으로 모음만 바꿔보세요.',
      },
    ],
  },
  {
    id: 'ko-05',
    order: 5,
    title: '쉬운 단어: 나무 바다 가지',
    description: '2글자 쉬운 단어를 입력해봐요.',
    language: 'korean',
    category: 'korean-word',
    difficulty: 'beginner',
    allowedKeys: [],
    targetWpm: 12,
    targetAccuracy: 88,
    exercises: [
      {
        id: 'ko-05-ex1',
        type: 'keys',
        content: '나무 바다 가지 모기 무리 도로 구두',
        hint: '두 글자 단어를 천천히 입력해요.',
      },
      {
        id: 'ko-05-ex2',
        type: 'keys',
        content: '나라 고기 두부 머리 누나 거미 도시',
        hint: '리듬감 있게 단어를 완성해 봐요.',
      },
    ],
  },

  // ── Phase 3: 음절 조합 ──
  {
    id: 'ko-06',
    order: 6,
    title: '받침 없는 음절: 아야어여',
    description: 'ㅇ + 모음으로 만드는 기본 음절을 익혀요.',
    language: 'korean',
    category: 'korean-syllable',
    difficulty: 'beginner',
    allowedKeys: ['ㅇ', 'ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ'],
    targetWpm: 15,
    targetAccuracy: 90,
    exercises: [
      {
        id: 'ko-06-ex1',
        type: 'keys',
        content: '아 야 어 여 오 요 우 유 으 이',
        hint: '모음 앞에 ㅇ이 자동으로 붙어요.',
      },
      {
        id: 'ko-06-ex2',
        type: 'words',
        content: '아이 이유 오이 우리 야외 여우 유아',
        hint: '간단한 두 글자 단어들이에요.',
      },
    ],
  },
  {
    id: 'ko-07',
    order: 7,
    title: '기본 자음+모음 조합',
    description: 'ㄱ~ㅎ 자음과 모음을 조합해 음절을 만들어요.',
    language: 'korean',
    category: 'korean-syllable',
    difficulty: 'beginner',
    allowedKeys: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ'],
    targetWpm: 18,
    targetAccuracy: 88,
    exercises: [
      {
        id: 'ko-07-ex1',
        type: 'keys',
        content: '가 나 다 라 마 바 사 자 가나 다라 마바',
        hint: '자음+모음(ㅏ) 조합 연습이에요.',
      },
      {
        id: 'ko-07-ex2',
        type: 'words',
        content: '가나 나라 다리 바다 사자 도로 누나 보조',
        hint: '받침 없는 2글자 단어들.',
      },
    ],
  },
  {
    id: 'ko-08',
    order: 8,
    title: '받침 있는 음절 기초',
    description: 'ㄱ ㄴ ㄷ ㄹ ㅁ 받침이 있는 음절을 익혀요.',
    language: 'korean',
    category: 'korean-syllable',
    difficulty: 'intermediate',
    allowedKeys: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ'],
    targetWpm: 18,
    targetAccuracy: 88,
    exercises: [
      {
        id: 'ko-08-ex1',
        type: 'keys',
        content: '각 난 달 람 밥 산 장 먹 넣 닭',
        hint: '받침이 있으면 세 번 눌러야 해요: 자음+모음+받침.',
      },
      {
        id: 'ko-08-ex2',
        type: 'words',
        content: '산길 달빛 강물 밥상 남산 곰탕',
        hint: '받침 있는 2글자 단어들이에요.',
      },
    ],
  },
  {
    id: 'ko-09',
    order: 9,
    title: '받침 완성 + 복잡 음절',
    description: 'ㅂ ㅅ ㅇ ㅈ ㅎ 받침과 겹받침을 포함한 음절을 익혀요.',
    language: 'korean',
    category: 'korean-syllable',
    difficulty: 'intermediate',
    allowedKeys: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅎ', 'ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ', 'ㅐ', 'ㅔ'],
    targetWpm: 20,
    targetAccuracy: 88,
    exercises: [
      {
        id: 'ko-09-ex1',
        type: 'keys',
        content: '입 잎 닭 삶 읽 없 앉 핥 넓',
        hint: '겹받침은 두 개의 자음이 받침 자리에 와요.',
      },
      {
        id: 'ko-09-ex2',
        type: 'words',
        content: '닭볶음 읽기 넓다 앉아서 없어서',
        hint: '겹받침 단어 연습이에요.',
      },
    ],
  },

  // ── Phase 4: 단어 ──
  {
    id: 'ko-10',
    order: 10,
    title: '기초 명사 단어',
    description: '일상에서 자주 쓰이는 명사를 타이핑해요.',
    language: 'korean',
    category: 'korean-word',
    difficulty: 'intermediate',
    allowedKeys: [],
    targetWpm: 22,
    targetAccuracy: 90,
    exercises: [
      {
        id: 'ko-10-ex1',
        type: 'words',
        content: '사람 학교 집 책 물 밥 길 나무 하늘 바람',
        hint: '기본 명사 10개를 반복 연습해요.',
      },
      {
        id: 'ko-10-ex2',
        type: 'words',
        content: '의자 컴퓨터 핸드폰 음식 공부 여행 친구 가족 시간 마음',
        hint: '조금 더 다양한 명사들이에요.',
      },
    ],
  },
  {
    id: 'ko-11',
    order: 11,
    title: '기초 동사 & 형용사',
    description: '자주 쓰이는 동사와 형용사를 타이핑해요.',
    language: 'korean',
    category: 'korean-word',
    difficulty: 'intermediate',
    allowedKeys: [],
    targetWpm: 24,
    targetAccuracy: 90,
    exercises: [
      {
        id: 'ko-11-ex1',
        type: 'words',
        content: '먹다 마시다 가다 오다 보다 듣다 읽다 쓰다 앉다 서다',
        hint: '기본 동사 원형을 연습해요.',
      },
      {
        id: 'ko-11-ex2',
        type: 'words',
        content: '크다 작다 좋다 나쁘다 빠르다 느리다 예쁘다 맛있다',
        hint: '기본 형용사를 연습해요.',
      },
    ],
  },
  {
    id: 'ko-12',
    order: 12,
    title: '조사와 어미',
    description: '한글의 조사와 어미 변화를 포함한 단어를 연습해요.',
    language: 'korean',
    category: 'korean-word',
    difficulty: 'intermediate',
    allowedKeys: [],
    targetWpm: 26,
    targetAccuracy: 90,
    exercises: [
      {
        id: 'ko-12-ex1',
        type: 'words',
        content: '나는 너를 학교에 집에서 친구와 밥을 물이 책으로',
        hint: '조사가 붙은 형태를 연습해요.',
      },
      {
        id: 'ko-12-ex2',
        type: 'words',
        content: '먹어요 먹었어요 갔어요 왔어요 보았어요 들었어요',
        hint: '과거형 어미 변화를 연습해요.',
      },
    ],
  },
  {
    id: 'ko-13',
    order: 13,
    title: '고빈도 한국어 단어 200',
    description: '한국어에서 가장 자주 쓰이는 단어들을 타이핑해요.',
    language: 'korean',
    category: 'korean-word',
    difficulty: 'intermediate',
    allowedKeys: [],
    targetWpm: 28,
    targetAccuracy: 90,
    exercises: [
      {
        id: 'ko-13-ex1',
        type: 'words',
        content: '이 그 저 것 수 있다 없다 하다 되다 않다 같다 때 년 한 대',
        hint: '가장 자주 쓰이는 단어들이에요.',
      },
      {
        id: 'ko-13-ex2',
        type: 'words',
        content: '우리 나라 사람 말 일 그냥 정말 너무 조금 많이 빨리',
        hint: '자주 쓰이는 부사와 명사들이에요.',
      },
    ],
  },

  // ── Phase 5: 문장 ──
  {
    id: 'ko-14',
    order: 14,
    title: '기초 한글 문장',
    description: '짧고 쉬운 한글 문장을 타이핑해요.',
    language: 'korean',
    category: 'korean-sentence',
    difficulty: 'intermediate',
    allowedKeys: [],
    targetWpm: 25,
    targetAccuracy: 90,
    exercises: [
      {
        id: 'ko-14-ex1',
        type: 'sentences',
        content: '나는 밥을 먹어요. 학교에 가요. 책을 읽어요.',
        hint: '주어+목적어+서술어 기본 문장 구조예요.',
      },
      {
        id: 'ko-14-ex2',
        type: 'sentences',
        content: '하늘이 맑아요. 바람이 불어요. 날씨가 좋아요.',
        hint: '주어+서술어 형태의 단문이에요.',
      },
    ],
  },
  {
    id: 'ko-15',
    order: 15,
    title: '일상 대화 문장',
    description: '실생활에서 자주 쓰이는 대화체 문장을 입력해요.',
    language: 'korean',
    category: 'korean-sentence',
    difficulty: 'intermediate',
    allowedKeys: [],
    targetWpm: 28,
    targetAccuracy: 90,
    exercises: [
      {
        id: 'ko-15-ex1',
        type: 'sentences',
        content: '안녕하세요. 오늘 기분이 어때요? 저는 좋아요.',
        hint: '인사와 안부를 묻는 대화예요.',
      },
      {
        id: 'ko-15-ex2',
        type: 'sentences',
        content: '같이 밥 먹을래요? 네, 좋아요. 어디로 갈까요?',
        hint: '일상 대화 패턴을 익혀요.',
      },
    ],
  },
  {
    id: 'ko-16',
    order: 16,
    title: '중급 한글 문장',
    description: '더 복잡한 문장 구조를 가진 한글 문장을 입력해요.',
    language: 'korean',
    category: 'korean-sentence',
    difficulty: 'advanced',
    allowedKeys: [],
    targetWpm: 32,
    targetAccuracy: 90,
    exercises: [
      {
        id: 'ko-16-ex1',
        type: 'paragraph',
        content: '독수리는 하늘 높이 날아다니며 날카로운 눈으로 먹이를 찾아요. 강력한 날개와 발톱으로 빠르게 사냥해요.',
        hint: '독수리에 관한 문장이에요.',
      },
      {
        id: 'ko-16-ex2',
        type: 'paragraph',
        content: '타이핑 연습을 꾸준히 하면 속도와 정확도가 높아져요. 매일 조금씩 연습하는 것이 중요해요.',
        hint: '연습의 중요성에 대한 문장이에요.',
      },
    ],
  },
  {
    id: 'ko-17',
    order: 17,
    title: '긴 한글 문단',
    description: '긴 한글 단락을 일정한 속도로 타이핑해요.',
    language: 'korean',
    category: 'korean-sentence',
    difficulty: 'advanced',
    allowedKeys: [],
    targetWpm: 35,
    targetAccuracy: 91,
    exercises: [
      {
        id: 'ko-17-ex1',
        type: 'paragraph',
        content: '한글은 세종대왕이 1443년에 창제한 문자예요. 과학적인 원리로 만들어진 한글은 배우기 쉽고 사용하기 편리해요. 자음과 모음을 조합해 다양한 소리를 표현할 수 있어요.',
        hint: '한글에 관한 설명 단락이에요.',
      },
    ],
  },

  // ── Phase 6: 속도 훈련 ──
  {
    id: 'ko-18',
    order: 18,
    title: '한글 속도 훈련 1: 단어 폭발',
    description: '짧은 고빈도 한국어 단어를 최대한 빠르게 입력해요.',
    language: 'korean',
    category: 'speed',
    difficulty: 'advanced',
    allowedKeys: [],
    targetWpm: 38,
    targetAccuracy: 90,
    exercises: [
      {
        id: 'ko-18-ex1',
        type: 'words',
        content: '나 너 우리 하다 되다 있다 없다 그것 이것 저것 왜 어디 언제 어떻게',
        hint: '자주 쓰이는 짧은 단어를 빠르게!',
      },
    ],
  },
  {
    id: 'ko-19',
    order: 19,
    title: '한글 속도 훈련 2: 문장 연사',
    description: '멈추지 않고 연속 문장을 타이핑해요.',
    language: 'korean',
    category: 'speed',
    difficulty: 'advanced',
    allowedKeys: [],
    targetWpm: 42,
    targetAccuracy: 91,
    exercises: [
      {
        id: 'ko-19-ex1',
        type: 'paragraph',
        content: '연습은 실력을 만들어요. 꾸준히 하면 누구나 빨라질 수 있어요. 지금 이 순간에도 실력이 늘고 있어요.',
        hint: '중간에 멈추지 말고 계속 앞으로!',
      },
    ],
  },
  {
    id: 'ko-20',
    order: 20,
    title: '한글 속도 챌린지: 극한',
    description: '한글 타이핑 마스터! 목표 WPM 45에 도전해요.',
    language: 'korean',
    category: 'speed',
    difficulty: 'expert',
    allowedKeys: [],
    targetWpm: 45,
    targetAccuracy: 93,
    exercises: [
      {
        id: 'ko-20-ex1',
        type: 'paragraph',
        content: '독수리처럼 빠르고 정확하게 날아가세요. 오랜 연습 끝에 얻은 실력은 절대 사라지지 않아요. 이제 당신은 한글 타이핑의 독수리입니다.',
        hint: '여기까지 온 당신은 진정한 독수리!',
      },
      {
        id: 'ko-20-ex2',
        type: 'paragraph',
        content: '빠른 타이핑은 생각을 글로 옮기는 속도를 높여줘요. 아이디어가 떠올랐을 때 바로바로 입력할 수 있는 실력, 오늘 여기서 완성되었어요.',
        hint: '마지막까지 집중! 당신은 이미 하늘의 왕.',
      },
    ],
  },
];

export function getKoreanLessonById(id: string): Lesson | undefined {
  return KOREAN_LESSONS.find(l => l.id === id);
}

export function getKoreanLessonsByDifficulty(difficulty: Lesson['difficulty']): Lesson[] {
  return KOREAN_LESSONS.filter(l => l.difficulty === difficulty);
}
