import type { LevelDefinition } from '@/types';

// ─────────────────────────────────────────────
// 독수리 진화 레벨 시스템 (10단계)
//
// Stage 0: 알 (Egg)
// Stage 1: 알에서 깨어남 (Hatching)
// Stage 2: 병아리 독수리 (Eaglet)
// Stage 3: 아기 독수리 (Fledgling)
// Stage 4: 청소년 독수리 (Juvenile)
// Stage 5: 성체 독수리 (Adult Eagle)
// Stage 6: 사냥꾼 독수리 (Hunter Eagle)
// Stage 7: 황금 독수리 (Golden Eagle)
// Stage 8: 전설의 독수리 (Legendary Eagle)
// Stage 9: 하늘의 왕 (Sky King)
// ─────────────────────────────────────────────

export const LEVEL_DEFINITIONS: LevelDefinition[] = [
  {
    level: 0,
    name: '알',
    description: '아직 알 속에 있어요. 첫 번째 레슨을 시작해보세요!',
    sprite: 'egg',
    requiredExp: 0,
    perks: [],
  },
  {
    level: 1,
    name: '깨어남',
    description: '알을 깨고 세상 밖으로 나왔어요. 홈로우를 배우기 시작해요.',
    sprite: 'hatching',
    requiredExp: 100,
    perks: [
      {
        type: 'unlock_world',
        value: 1,
        description: 'World 1 해금',
      },
    ],
  },
  {
    level: 2,
    name: '병아리 독수리',
    description: '작지만 용감한 병아리 독수리! 양손 홈로우를 마스터했어요.',
    sprite: 'eaglet',
    requiredExp: 300,
    perks: [
      {
        type: 'bonus_exp_rate',
        value: 1.1,
        description: 'EXP 10% 보너스',
      },
    ],
  },
  {
    level: 3,
    name: '아기 독수리',
    description: '날개가 자라기 시작했어요. 윗줄 키를 배우고 있어요.',
    sprite: 'fledgling',
    requiredExp: 700,
    perks: [
      {
        type: 'unlock_world',
        value: 2,
        description: 'World 2 조기 해금',
      },
      {
        type: 'bonus_exp_rate',
        value: 1.15,
        description: 'EXP 15% 보너스',
      },
    ],
  },
  {
    level: 4,
    name: '청소년 독수리',
    description: '이제 짧은 거리는 날 수 있어요. 아랫줄을 정복했어요!',
    sprite: 'juvenile',
    requiredExp: 1500,
    perks: [
      {
        type: 'unlock_world',
        value: 3,
        description: 'World 3 조기 해금',
      },
      {
        type: 'bonus_exp_rate',
        value: 1.2,
        description: 'EXP 20% 보너스',
      },
      {
        type: 'unlock_theme',
        value: 'forest',
        description: '숲 테마 해금',
      },
    ],
  },
  {
    level: 5,
    name: '성체 독수리',
    description: '드디어 완전히 성장했어요! 알파벳 전체를 자유롭게 사용해요.',
    sprite: 'adult-eagle',
    requiredExp: 3000,
    perks: [
      {
        type: 'unlock_world',
        value: 4,
        description: 'World 4 조기 해금',
      },
      {
        type: 'bonus_exp_rate',
        value: 1.25,
        description: 'EXP 25% 보너스',
      },
      {
        type: 'unlock_theme',
        value: 'sky',
        description: '하늘 테마 해금',
      },
    ],
  },
  {
    level: 6,
    name: '사냥꾼 독수리',
    description: '숫자와 특수문자를 날카로운 발톱으로 낚아채요!',
    sprite: 'hunter-eagle',
    requiredExp: 5500,
    perks: [
      {
        type: 'unlock_world',
        value: 5,
        description: 'World 5 (한글) 조기 해금',
      },
      {
        type: 'bonus_exp_rate',
        value: 1.3,
        description: 'EXP 30% 보너스',
      },
      {
        type: 'unlock_achievement_category',
        value: 'speed',
        description: '속도 업적 카테고리 해금',
      },
    ],
  },
  {
    level: 7,
    name: '황금 독수리',
    description: '황금빛 깃털이 반짝여요. 한글까지 정복한 진정한 타이피스트!',
    sprite: 'golden-eagle',
    requiredExp: 9000,
    perks: [
      {
        type: 'unlock_world',
        value: 6,
        description: 'World 6 조기 해금',
      },
      {
        type: 'bonus_exp_rate',
        value: 1.4,
        description: 'EXP 40% 보너스',
      },
      {
        type: 'unlock_theme',
        value: 'golden',
        description: '황금 테마 해금',
      },
    ],
  },
  {
    level: 8,
    name: '전설의 독수리',
    description: '전설 속에만 존재하던 독수리가 눈앞에! 속도 챌린지를 제패했어요.',
    sprite: 'legendary-eagle',
    requiredExp: 15000,
    perks: [
      {
        type: 'unlock_world',
        value: 7,
        description: 'World 7 (속도 챌린지) 조기 해금',
      },
      {
        type: 'bonus_exp_rate',
        value: 1.5,
        description: 'EXP 50% 보너스',
      },
      {
        type: 'unlock_theme',
        value: 'legendary',
        description: '전설 테마 해금',
      },
      {
        type: 'unlock_achievement_category',
        value: 'special',
        description: '특별 업적 카테고리 해금',
      },
    ],
  },
  {
    level: 9,
    name: '하늘의 왕',
    description: '하늘을 지배하는 최강의 독수리! 모든 도전을 완수한 진정한 챔피언.',
    sprite: 'sky-king',
    requiredExp: 25000,
    perks: [
      {
        type: 'bonus_exp_rate',
        value: 2.0,
        description: 'EXP 2배 보너스',
      },
      {
        type: 'unlock_theme',
        value: 'sky-king',
        description: '하늘의 왕 전용 테마 해금',
      },
    ],
  },
];

// 현재 EXP로 레벨 계산
export function getLevelFromExp(exp: number): number {
  let level = 0;
  for (let i = LEVEL_DEFINITIONS.length - 1; i >= 0; i--) {
    if (exp >= LEVEL_DEFINITIONS[i].requiredExp) {
      level = LEVEL_DEFINITIONS[i].level;
      break;
    }
  }
  return level;
}

// 다음 레벨까지 필요한 EXP
export function getExpToNextLevel(exp: number): { current: number; required: number; percentage: number } {
  const currentLevel = getLevelFromExp(exp);
  if (currentLevel >= LEVEL_DEFINITIONS.length - 1) {
    return { current: 0, required: 0, percentage: 100 };
  }

  const currentLevelDef = LEVEL_DEFINITIONS[currentLevel];
  const nextLevelDef = LEVEL_DEFINITIONS[currentLevel + 1];
  const expInCurrentLevel = exp - currentLevelDef.requiredExp;
  const expRequired = nextLevelDef.requiredExp - currentLevelDef.requiredExp;
  const percentage = Math.floor((expInCurrentLevel / expRequired) * 100);

  return {
    current: expInCurrentLevel,
    required: expRequired,
    percentage,
  };
}

export function getLevelDefinition(level: number): LevelDefinition | undefined {
  return LEVEL_DEFINITIONS.find(l => l.level === level);
}
