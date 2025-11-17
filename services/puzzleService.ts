
import { PuzzleData, WordPlacement } from '../types';

export const generatePuzzle = (
  words: string[],
  size: number,
  allowDiagonals: boolean
): PuzzleData | null => {
  const grid: string[][] = Array(size).fill(null).map(() => Array(size).fill(''));
  const wordPlacements: WordPlacement[] = [];
  const placedWords: string[] = [];

  const directions = [
    { name: 'horizontal', dr: 0, dc: 1 },
    { name: 'vertical', dr: 1, dc: 0 },
  ];

  if (allowDiagonals) {
    directions.push({ name: 'diagonal_down', dr: 1, dc: 1 });
    directions.push({ name: 'diagonal_up', dr: -1, dc: 1 });
  }

  // Sort words from longest to shortest to make placement easier
  const sortedWords = [...words].sort((a, b) => b.length - a.length);

  for (const word of sortedWords) {
    if (word.length > size) continue;

    let placed = false;
    const attempts = 100; // Try 100 times to place a word

    for (let i = 0; i < attempts; i++) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const startRow = Math.floor(Math.random() * size);
      const startCol = Math.floor(Math.random() * size);

      const endRow = startRow + (word.length - 1) * dir.dr;
      const endCol = startCol + (word.length - 1) * dir.dc;

      // Check if the word fits within the grid boundaries
      if (endRow >= 0 && endRow < size && endCol >= 0 && endCol < size && startRow >= 0 && startCol >= 0) {
        let canPlace = true;
        // Check for conflicts. If a cell is not empty, we cannot place there.
        for (let j = 0; j < word.length; j++) {
          const row = startRow + j * dir.dr;
          const col = startCol + j * dir.dc;
          if (grid[row][col] !== '') {
            canPlace = false;
            break;
          }
        }

        if (canPlace) {
          // Place the word
          for (let j = 0; j < word.length; j++) {
            const row = startRow + j * dir.dr;
            const col = startCol + j * dir.dc;
            grid[row][col] = word[j];
          }
          wordPlacements.push({
            word: word,
            start: { row: startRow, col: startCol },
            end: { row: endRow, col: endCol },
            direction: dir.name as WordPlacement['direction'],
          });
          placedWords.push(word);
          placed = true;
          break;
        }
      }
    }
  }

  // Fill empty cells with random letters
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }
  
  if (placedWords.length === 0 && words.length > 0) return null;

  return { grid, words: wordPlacements, wordList: placedWords };
};
