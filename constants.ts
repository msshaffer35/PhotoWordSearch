
import { Difficulty } from './types';

export const GRID_SIZES: Record<Difficulty, number> = {
  [Difficulty.EASY]: 10,
  [Difficulty.MEDIUM]: 15,
};

export const REQUIRED_WORDS: Record<Difficulty, { min: number, max: number }> = {
    [Difficulty.EASY]: { min: 5, max: 10 },
    [Difficulty.MEDIUM]: { min: 10, max: 20 },
}

export const GEMINI_PROMPT = `Analyze this image and provide 15-25 relevant words that describe objects, colors, themes, emotions, and concepts in the image. The words should be suitable for a word search puzzle, so prefer single words between 3 and 10 letters long. Return the result as a JSON array of strings, like ["word1", "word2", "word3"].`;
