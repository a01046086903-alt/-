export type Direction = 'across' | 'down';

export type CategoryType = 'literature' | 'grammar' | 'reading_logic' | 'idiom' | 'comprehensive';

export interface WordClue {
  id: string; // e.g. "1-across"
  number: number;
  word: string; // The correct Korean answer, e.g. "구개음화"
  direction: Direction;
  startX: number; // 0-indexed column
  startY: number; // 0-indexed row
  clue: string; // Question clue for Middle School Grade 3
  category: CategoryType;
  categoryLabel: string;
  consonants: string; // 초성 힌트 (e.g. "ㄱㄱㅇㅎ")
  textbookTip: string; // 교과서 핵심 콕콕 설명
  example: string; // 교과서 예시 및 기출 예문
}

export interface GridCell {
  x: number;
  y: number;
  char: string; // Target letter
  acrossWordId?: string;
  downWordId?: string;
  number?: number; // Clue number to display in cell corner
}

export interface StageData {
  id: string;
  stageNumber: number;
  title: string;
  subtitle: string;
  category: CategoryType;
  gradeBadge: string;
  gridWidth: number;
  gridHeight: number;
  description: string;
  clues: WordClue[];
}

export interface UserAnswerMap {
  [cellKey: string]: string; // key: `${x},${y}` -> user entered char
}

export interface PlayerStats {
  exp: number;
  level: number;
  title: string;
  stars: { [stageId: string]: number }; // stageId -> stars (1-3)
  bestTime: { [stageId: string]: number }; // stageId -> best time in seconds
  completedStages: string[];
  solvedWordIds: string[];
  usedHintsCount: number;
  totalCorrectWords: number;
  maxCombo: number;
  unlockedAchievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: { current: number; total: number };
}
