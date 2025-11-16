
export enum AppState {
  LANDING = 'LANDING',
  ANALYZING = 'ANALYZING',
  WORD_REVIEW = 'WORD_REVIEW',
  GENERATING_PUZZLE = 'GENERATING_PUZZLE',
  PLAYING = 'PLAYING',
  COMPLETED = 'COMPLETED',
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
}

export interface GridCell {
  letter: string;
  isRevealed: boolean;
}

export interface WordPlacement {
  word: string;
  start: { row: number; col: number };
  end: { row: number; col: number };
  direction: 'horizontal' | 'vertical' | 'diagonal_up' | 'diagonal_down';
}

export interface PuzzleData {
  grid: string[][];
  words: WordPlacement[];
  wordList: string[];
}

export interface CellPosition {
  row: number;
  col: number;
}
