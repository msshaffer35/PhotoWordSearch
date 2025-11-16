import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { PuzzleData, CellPosition } from '../types';
import Modal from './Modal';

interface PuzzleProps {
  puzzleData: PuzzleData;
  onNewPuzzle: () => void;
  imagePreviewUrl: string;
}

interface PuzzleCellProps {
  letter: string;
  row: number;
  col: number;
  gridSize: number;
  isRevealed: boolean;
  isCompleted: boolean;
  isImagePreviewToggled: boolean;
  imagePreviewUrl: string;
}

const PuzzleCell: React.FC<PuzzleCellProps> = memo(({
  letter, row, col, gridSize, isRevealed, isCompleted, isImagePreviewToggled, imagePreviewUrl
}) => {
  const shouldShowImage = isCompleted || isImagePreviewToggled || isRevealed;
  
  return (
    <div 
      className="relative flex items-center justify-center aspect-square bg-slate-800 select-none puzzle-cell"
      data-row={row}
      data-col={col}
    >
      <div
        className="absolute inset-0 transition-opacity duration-300 ease-in-out"
        style={{
          backgroundImage: `url(${imagePreviewUrl})`,
          backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
          backgroundPosition: `${(col / (gridSize - 1)) * 100}% ${(row / (gridSize - 1)) * 100}%`,
          opacity: shouldShowImage ? 1 : 0,
        }}
      />
      <span
        className="relative font-bold text-lg md:text-xl lg:text-2xl uppercase letter"
        style={{
          textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,1)',
          opacity: isCompleted ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out, transform 0.1s ease, color 0.1s ease',
        }}
      >
        {letter}
      </span>
    </div>
  );
});

const Puzzle: React.FC<PuzzleProps> = ({ puzzleData, onNewPuzzle, imagePreviewUrl }) => {
  const { grid, wordList } = puzzleData;
  const gridSize = grid.length;
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  const [isImagePreviewToggled, setImagePreviewToggled] = useState(false);

  // Refs for high-performance interaction, bypassing React's render cycle for drag highlighting
  const isDraggingRef = useRef(false);
  const startCellRef = useRef<CellPosition | null>(null);
  const currentSelectedElementsRef = useRef<Set<HTMLElement>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);

  const getCellKey = useCallback((row: number, col: number) => `${row}-${col}`, []);

  const checkSelection = useCallback((start: CellPosition, end: CellPosition) => {
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
  }, [grid, wordList, foundWords, getCellKey]);
  
  const getCellFromEvent = useCallback((e: MouseEvent | TouchEvent): CellPosition | null => {
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
  }, [gridSize]);

  // High-performance move handler that does NOT trigger React re-renders
  const handleInteractionMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current || !startCellRef.current) return;
    e.preventDefault();

    const endCell = getCellFromEvent(e);
    if (!endCell) return;

    const newSelectedElements = new Set<HTMLElement>();
    const startCell = startCellRef.current;
    
    const dr = Math.sign(endCell.row - startCell.row);
    const dc = Math.sign(endCell.col - startCell.col);

    if (dr === 0 || dc === 0 || Math.abs(endCell.row - startCell.row) === Math.abs(endCell.col - startCell.col)) {
        let r = startCell.row;
        let c = startCell.col;
        while (true) {
            const el = gridRef.current?.querySelector(`[data-row="${r}"][data-col="${c}"]`) as HTMLElement | null;
            if (el) newSelectedElements.add(el);
            if (r === endCell.row && c === endCell.col) break;
            r += dr;
            c += dc;
        }
    } else {
        const el = gridRef.current?.querySelector(`[data-row="${startCell.row}"][data-col="${startCell.col}"]`) as HTMLElement | null;
        if (el) newSelectedElements.add(el);
    }
    
    // Efficiently add/remove highlight class
    currentSelectedElementsRef.current.forEach(el => {
        if (!newSelectedElements.has(el)) {
            el.classList.remove('is-selected');
        }
    });
    newSelectedElements.forEach(el => {
        if (!currentSelectedElementsRef.current.has(el)) {
            el.classList.add('is-selected');
        }
    });

    currentSelectedElementsRef.current = newSelectedElements;

  }, [getCellFromEvent]);

  // Handler for when interaction ends - this is when we update React state
  const handleInteractionEnd = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current || !startCellRef.current) return;
    e.preventDefault();
    
    const endCell = getCellFromEvent(e) || startCellRef.current;
    checkSelection(startCellRef.current, endCell);
    
    // Cleanup
    isDraggingRef.current = false;
    startCellRef.current = null;
    currentSelectedElementsRef.current.forEach(el => el.classList.remove('is-selected'));
    currentSelectedElementsRef.current.clear();

  }, [getCellFromEvent, checkSelection]);

  // Handler to start the interaction
  const handleInteractionStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isCompleted) return;
    const cell = getCellFromEvent(e.nativeEvent);
    if (cell) {
        isDraggingRef.current = true;
        startCellRef.current = cell;
        const el = gridRef.current?.querySelector(`[data-row="${cell.row}"][data-col="${cell.col}"]`) as HTMLElement | null;
        if (el) {
          el.classList.add('is-selected');
          currentSelectedElementsRef.current.add(el);
        }
    }
  }, [isCompleted, getCellFromEvent]);

  // Effect to manage global event listeners
  useEffect(() => {
    const gridEl = gridRef.current;
    if (!gridEl) return;
    
    // Add listeners
    window.addEventListener('mousemove', handleInteractionMove);
    window.addEventListener('touchmove', handleInteractionMove, { passive: false });
    window.addEventListener('mouseup', handleInteractionEnd);
    window.addEventListener('touchend', handleInteractionEnd, { passive: false });
    
    // Cleanup function
    return () => {
      window.removeEventListener('mousemove', handleInteractionMove);
      window.removeEventListener('touchmove', handleInteractionMove);
      window.removeEventListener('mouseup', handleInteractionEnd);
      window.removeEventListener('touchend', handleInteractionEnd);
    };
  }, [handleInteractionMove, handleInteractionEnd]);


  useEffect(() => {
    if (foundWords.size > 0 && foundWords.size === wordList.length) {
      setTimeout(() => setIsCompleted(true), 500);
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
          className="grid aspect-square w-full border-2 border-slate-700 rounded-lg overflow-hidden gap-px bg-slate-700" 
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
          onMouseDown={handleInteractionStart}
          onTouchStart={handleInteractionStart}
        >
          {grid.map((row, r) =>
            row.map((letter, c) => (
              <PuzzleCell
                key={getCellKey(r, c)}
                letter={letter}
                row={r}
                col={c}
                gridSize={gridSize}
                isRevealed={revealedCells.has(getCellKey(r, c))}
                isCompleted={isCompleted}
                isImagePreviewToggled={isImagePreviewToggled}
                imagePreviewUrl={imagePreviewUrl}
              />
            ))
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