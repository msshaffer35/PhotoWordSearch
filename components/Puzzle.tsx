import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PuzzleData, CellPosition } from '../types';
import Modal from './Modal';

interface PuzzleProps {
  puzzleData: PuzzleData;
  onNewPuzzle: () => void;
  imagePreviewUrl: string;
}

const Puzzle: React.FC<PuzzleProps> = ({ puzzleData, onNewPuzzle, imagePreviewUrl }) => {
  const { grid, wordList } = puzzleData;
  const gridSize = grid.length;
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  const [isImagePreviewToggled, setImagePreviewToggled] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [startCell, setStartCell] = useState<CellPosition | null>(null);
  const [currentSelection, setCurrentSelection] = useState<Set<string>>(new Set());
  
  const gridRef = useRef<HTMLDivElement>(null);

  const getCellKey = (row: number, col: number) => `${row}-${col}`;

  const checkSelection = (start: CellPosition, end: CellPosition) => {
    const selectedCells: CellPosition[] = [];
    let selectedWord = '';
    
    const dr = Math.sign(end.row - start.row);
    const dc = Math.sign(end.col - start.col);

    if (dr !== 0 && dc !== 0 && Math.abs(end.row - start.row) !== Math.abs(end.col - start.col)) {
        return;
    }

    let r = start.row;
    let c = start.col;

    while(true) {
        selectedCells.push({ row: r, col: c });
        selectedWord += grid[r][c];
        if(r === end.row && c === end.col) break;
        r += dr;
        c += dc;
    }

    const reversedWord = selectedWord.split('').reverse().join('');
    
    let matchedWord: string | undefined;
    if (wordList.includes(selectedWord) && !foundWords.has(selectedWord)) {
        matchedWord = selectedWord;
    } else if (wordList.includes(reversedWord) && !foundWords.has(reversedWord)) {
        matchedWord = reversedWord;
    }

    if (matchedWord) {
      setFoundWords(prev => new Set(prev).add(matchedWord!));
      setRevealedCells(prev => {
        const newSet = new Set(prev);
        selectedCells.forEach(cell => newSet.add(getCellKey(cell.row, cell.col)));
        return newSet;
      });
    }
  };
  
  const getCellFromEvent = (e: MouseEvent | TouchEvent): CellPosition | null => {
      if (!gridRef.current) return null;

      const rect = gridRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const col = Math.floor((x / rect.width) * gridSize);
      const row = Math.floor((y / rect.height) * gridSize);

      if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
          return { row, col };
      }
      return null;
  };

  const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isCompleted) return;
    const cell = getCellFromEvent(e.nativeEvent);
    if (cell) {
        setIsDragging(true);
        setStartCell(cell);
        setCurrentSelection(new Set([getCellKey(cell.row, cell.col)]));
    }
  };

  const handleInteractionMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !startCell) return;
    e.preventDefault();
    const endCell = getCellFromEvent(e);

    if (endCell) {
        const newSelection = new Set<string>();
        const dr = Math.sign(endCell.row - startCell.row);
        const dc = Math.sign(endCell.col - startCell.col);

        let r = startCell.row;
        let c = startCell.col;
        
        while (true) {
            newSelection.add(getCellKey(r, c));
            if (r === endCell.row && c === endCell.col) break;

            if (dr !== 0 && dc !== 0 && Math.abs(endCell.row - startCell.row) !== Math.abs(endCell.col - startCell.col)) {
                 newSelection.add(getCellKey(endCell.row, endCell.col));
                 break;
            }
            r += dr;
            c += dc;
        }
        setCurrentSelection(newSelection);
    }
  }, [isDragging, startCell, gridSize]);


  const handleInteractionEnd = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !startCell) return;
    e.preventDefault();
    const endCell = getCellFromEvent(e) || startCell;
    checkSelection(startCell, endCell);
    
    setIsDragging(false);
    setStartCell(null);
    setCurrentSelection(new Set());
  }, [isDragging, startCell]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleInteractionMove);
      window.addEventListener('touchmove', handleInteractionMove, { passive: false });
      window.addEventListener('mouseup', handleInteractionEnd);
      window.addEventListener('touchend', handleInteractionEnd, { passive: false });
    }
    return () => {
      window.removeEventListener('mousemove', handleInteractionMove);
      window.removeEventListener('touchmove', handleInteractionMove);
      window.removeEventListener('mouseup', handleInteractionEnd);
      window.removeEventListener('touchend', handleInteractionEnd);
    };
  }, [isDragging, handleInteractionMove, handleInteractionEnd]);


  useEffect(() => {
    if (foundWords.size > 0 && foundWords.size === wordList.length) {
      // Use a timeout to allow the final word's reveal animation to play
      setTimeout(() => {
        setIsCompleted(true);
      }, 500);
    }
  }, [foundWords, wordList.length]);

  const handleRestart = () => {
    setIsCompleted(false);
    setFoundWords(new Set());
    setRevealedCells(new Set());
    setImagePreviewToggled(false);
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-8 items-start justify-center p-2">
      <div className="w-full md:w-2/3 lg:w-3/5">
        <div 
          ref={gridRef}
          className="grid aspect-square w-full select-none border-2 border-slate-700 rounded-lg overflow-hidden gap-px bg-slate-700" 
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          }}
          onMouseDown={handleInteractionStart}
          onTouchStart={handleInteractionStart}
        >
          {grid.map((row, r) =>
            row.map((letter, c) => {
              const cellKey = getCellKey(r, c);
              const isIndividuallyRevealed = revealedCells.has(cellKey);
              const isSelected = currentSelection.has(cellKey);
              
              const shouldShowImage = isCompleted || isImagePreviewToggled || isIndividuallyRevealed || isSelected;

              return (
                <div
                  key={cellKey}
                  className="relative flex items-center justify-center aspect-square bg-slate-800"
                >
                  <div
                    className="absolute inset-0 transition-opacity duration-300 ease-in-out"
                    style={{
                      backgroundImage: `url(${imagePreviewUrl})`,
                      backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                      backgroundPosition: `${(c / (gridSize - 1)) * 100}% ${(r / (gridSize - 1)) * 100}%`,
                      opacity: shouldShowImage ? 1 : 0,
                    }}
                  />
                  <div className={`absolute inset-0 bg-purple-600/50 transition-opacity duration-150 pointer-events-none ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                  <span
                    className={`relative font-bold text-lg md:text-xl lg:text-2xl uppercase text-white transition-transform duration-200`}
                    style={{
                      transform: isSelected ? 'scale(1.3)' : 'scale(1)',
                      textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,1)',
                      opacity: isCompleted ? 0 : 1, // Hide letters on completion
                      transition: 'opacity 0.5s ease-in-out, transform 0.2s ease',
                    }}
                  >
                    {letter}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="w-full md:w-1/3 lg:w-2/5 space-y-4">
        <h2 className="text-2xl font-bold">Find these words:</h2>
        <div className="p-4 bg-slate-800 rounded-lg max-h-96 overflow-y-auto">
          <p className="mb-2 text-slate-300">{foundWords.size} / {wordList.length} words found</p>
          <ul className="columns-2 gap-4">
            {wordList.map(word => (
              <li
                key={word}
                className={`transition-all duration-300 text-slate-300 ${foundWords.has(word) ? 'line-through text-slate-500' : ''}`}
              >
                {word}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setImagePreviewToggled(!isImagePreviewToggled)} className="w-full text-center px-4 py-2 text-sm text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">
                {isImagePreviewToggled ? 'Hide' : 'Preview'} Image
            </button>
            <button onClick={handleRestart} className="w-full text-center px-4 py-2 text-sm text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">
                Restart Puzzle
            </button>
        </div>
        <button onClick={onNewPuzzle} className="w-full text-center px-4 py-3 font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors">
            Start a New Puzzle
        </button>
      </div>

      <Modal isOpen={isCompleted} onClose={() => setIsCompleted(false)}>
        <div className="text-center p-4">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-blue-400 mb-4">Congratulations!</h2>
          <p className="text-slate-300 mb-6">You've found all the words and revealed the hidden image.</p>
          <img src={imagePreviewUrl} alt="Completed Puzzle" className="rounded-lg mb-6 max-h-64 mx-auto"/>
          <button onClick={onNewPuzzle} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105">
            Create Another Puzzle
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Puzzle;