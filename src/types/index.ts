// ─────────────────────────────────────────────
// Keyboard & Input
// ─────────────────────────────────────────────

export type Finger =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'left-thumb'
  | 'right-thumb'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky';

export type Hand = 'left' | 'right';

export type KeyRow = 'number' | 'top' | 'home' | 'bottom' | 'space';

export interface KeyDefinition {
  key: string;           // 실제 키 값 (소문자)
  shiftKey?: string;     // Shift 입력 시 값
  finger: Finger;
  hand: Hand;
  row: KeyRow;
  x: number;             // 키보드 레이아웃 상 X 위치 (단위: 키 1개 너비)
  y: number;             // Y 위치
  width?: number;        // 기본값 1
}

export type KeyboardLayoutType = 'qwerty' | 'dvorak' | 'colemak';

export interface KeyboardLayout {
  type: KeyboardLayoutType;
  keys: KeyDefinition[];
}

// ─────────────────────────────────────────────
// Typing Session
// ─────────────────────────────────────────────

export interface Keystroke {
  expected: string;
  actual: string;
  correct: boolean;
  timestamp: number;     // ms
  responseTime: number;  // 이전 키스트로크와의 간격 ms
}

export interface TypingSession {
  id: string;
  lessonId: string;
  language: 'english' | 'korean';
  startedAt: number;
  endedAt?: number;
  keystrokes: Keystroke[];
  targetText: string;
  typedText: string;
}

export interface SessionStats {
  wpm: number;           // 분당 단어 수
  cpm: number;           // 분당 글자 수
  accuracy: number;      // 0~100
  duration: number;      // 초
  totalKeystrokes: number;
  correctKeystrokes: number;
  errorCount: number;
  longestStreak: number; // 연속 정타 최대
}

// ─────────────────────────────────────────────
// Curriculum
// ─────────────────────────────────────────────

export type LessonCategory =
  | 'home-row'
  | 'top-row'
  | 'bottom-row'
  | 'number-row'
  | 'special-chars'
  | 'words'
  | 'sentences'
  | 'speed'
  | 'korean-consonant'
  | 'korean-vowel'
  | 'korean-syllable'
  | 'korean-word'
  | 'korean-sentence';

export type LessonDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Lesson {
  id: string;
  order: number;
  title: string;
  description: string;
  language: 'english' | 'korean';
  category: LessonCategory;
  difficulty: LessonDifficulty;
  allowedKeys: string[];   // 이 레슨에서 등장하는 키 목록
  targetWpm: number;
  targetAccuracy: number;  // 0~100
  exercises: LessonExercise[];
}

export interface LessonExercise {
  id: string;
  type: 'keys' | 'words' | 'sentences' | 'paragraph';
  content: string;
  hint?: string;
}

export interface LessonProgress {
  lessonId: string;
  userId: string;
  bestWpm: number;
  bestAccuracy: number;
  completedAt?: number;
  attempts: number;
  stars: 0 | 1 | 2 | 3;  // 별점: 완료/목표WPM달성/목표정확도달성
  unlocked: boolean;
}

// ─────────────────────────────────────────────
// Game Stages
// ─────────────────────────────────────────────

export type StageType = 'normal' | 'boss' | 'bonus';

export interface GameStage {
  id: string;
  world: number;          // 1~7
  stage: number;          // 월드 내 스테이지 번호
  title: string;
  description: string;
  type: StageType;
  allowedKeys: string[];
  lessonIds: string[];
  requiredStars: number;  // 해금에 필요한 누적 별 수
  rewards: StageReward;
  bossConfig?: BossConfig;
}

export interface StageReward {
  exp: number;
  coins: number;
  unlocksStageId?: string;
}

export interface BossConfig {
  name: string;
  hp: number;
  targetWpm: number;
  targetAccuracy: number;
  timeLimit: number;  // 초
}

// ─────────────────────────────────────────────
// User
// ─────────────────────────────────────────────

export interface UserProfile {
  id: string;
  nickname: string;
  avatarLevel: number;    // 독수리 진화 레벨 (0~9)
  totalExp: number;
  coins: number;
  createdAt: number;
  lastLoginAt: number;
  preferredLanguage: 'english' | 'korean' | 'both';
}

export interface UserSettings {
  keyboardLayout: KeyboardLayoutType;
  soundEnabled: boolean;
  showFingerGuide: boolean;
  showKeyHighlight: boolean;
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  caretStyle: 'line' | 'block' | 'underline';
}

// ─────────────────────────────────────────────
// Statistics
// ─────────────────────────────────────────────

export interface DailyStats {
  date: string;           // YYYY-MM-DD
  userId: string;
  totalSessions: number;
  totalMinutes: number;
  avgWpm: number;
  avgAccuracy: number;
  exp: number;
  lessonsCompleted: number;
}

export interface PerKeyStats {
  key: string;
  totalPresses: number;
  errorCount: number;
  avgResponseTime: number;
  accuracy: number;
}

// ─────────────────────────────────────────────
// Gamification
// ─────────────────────────────────────────────

export type AchievementCategory =
  | 'speed'
  | 'accuracy'
  | 'streak'
  | 'korean'
  | 'lesson'
  | 'daily'
  | 'special';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  iconKey: string;
  condition: AchievementCondition;
  reward: {
    exp: number;
    coins: number;
  };
  hidden: boolean;  // 달성 전까지 숨겨지는 비밀 업적
}

export type AchievementConditionType =
  | 'wpm_over'
  | 'accuracy_over'
  | 'streak_days'
  | 'streak_correct'
  | 'lessons_complete'
  | 'korean_wpm_over'
  | 'total_chars'
  | 'boss_cleared'
  | 'sessions_count';

export interface AchievementCondition {
  type: AchievementConditionType;
  value: number;
}

export interface UserAchievement {
  achievementId: string;
  userId: string;
  unlockedAt: number;
}

export interface LevelDefinition {
  level: number;
  name: string;
  description: string;
  sprite: string;         // 스프라이트 키 (에셋 참조용)
  requiredExp: number;    // 해당 레벨 달성에 필요한 누적 EXP
  perks: LevelPerk[];
}

export type LevelPerkType =
  | 'unlock_world'
  | 'unlock_theme'
  | 'bonus_exp_rate'
  | 'unlock_achievement_category';

export interface LevelPerk {
  type: LevelPerkType;
  value: string | number;
  description: string;
}
