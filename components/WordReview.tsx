
import React, { useState, useEffect } from 'react';
import { Difficulty } from '../types';
import { REQUIRED_WORDS } from '../constants';

interface WordReviewProps {
  initialWords: string[];
  onGeneratePuzzle: (words: string[], difficulty: Difficulty) => void;
  imagePreviewUrl: string;
  onBack: () => void;
  errorMessage: string | null;
}

const WordReview: React.FC<WordReviewProps> = ({ initialWords, onGeneratePuzzle, imagePreviewUrl, onBack, errorMessage }) => {
  const [words, setWords] = useState<string[]>(initialWords);
  const [newWord, setNewWord] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);

  const required = REQUIRED_WORDS[difficulty];

  const handleRemoveWord = (wordToRemove: string) => {
    setWords(words.filter(word => word !== wordToRemove));
  };

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedWord = newWord.toUpperCase().trim().replace(/[^A-Z]/g, '');
    if (formattedWord && !words.includes(formattedWord)) {
      setWords([formattedWord, ...words]);
      setNewWord('');
    }
  };

  const wordCount = words.length;
  const isReady = wordCount >= required.min && wordCount <= required.max;

  let buttonText = 'Generate Puzzle';
  if (!isReady) {
    if (wordCount < required.min) {
        const diff = required.min - wordCount;
        buttonText = `Add ${diff} more word${diff > 1 ? 's' : ''}`;
    } else { // wordCount > required.max
        const diff = wordCount - required.max;
        buttonText = `Remove ${diff} word${diff > 1 ? 's' : ''}`;
    }
  }


  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 items-start justify-center p-4">
      <div className="w-full lg:w-1/3 space-y-4 sticky top-4">
        <h1 className="text-3xl font-bold text-slate-100">Review Your Words</h1>
        <p className="text-slate-400">Gemini found these words in your photo. Add, remove, or edit them before creating your puzzle.</p>
        <img src={imagePreviewUrl} alt="Preview" className="rounded-lg object-cover w-full aspect-square" />
        <button onClick={onBack} className="w-full text-center px-4 py-2 text-sm text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">
            &larr; Use a different photo
        </button>
      </div>

      <div className="w-full lg:w-2/3 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Difficulty</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setDifficulty(Difficulty.EASY)}
              className={`flex-1 px-4 py-3 rounded-md transition-all ${difficulty === Difficulty.EASY ? 'bg-purple-600 text-white font-bold ring-2 ring-purple-300' : 'bg-slate-800 hover:bg-slate-700'}`}
            >
              Easy (10x10)
            </button>
            <button
              onClick={() => setDifficulty(Difficulty.MEDIUM)}
              className={`flex-1 px-4 py-3 rounded-md transition-all ${difficulty === Difficulty.MEDIUM ? 'bg-purple-600 text-white font-bold ring-2 ring-purple-300' : 'bg-slate-800 hover:bg-slate-700'}`}
            >
              Medium (15x15)
            </button>
          </div>
        </div>

        <div>
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">Word List</h2>
                <p className={`text-sm font-medium ${isReady ? 'text-green-400' : 'text-yellow-400'}`}>
                    {wordCount} / {required.min}-{required.max} words
                </p>
            </div>
            <form onSubmit={handleAddWord} className="flex gap-2 mb-4">
            <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder="Add a custom word"
                className="flex-grow bg-slate-800 border border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button type="submit" className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-4 py-2 rounded-md transition-colors">
                Add
            </button>
            </form>
            <div className="max-h-80 overflow-y-auto bg-slate-900/50 p-3 rounded-md flex flex-wrap gap-2">
            {words.map(word => (
                <div key={word} className="flex items-center bg-slate-800 rounded-full px-3 py-1 text-sm">
                <span>{word}</span>
                <button onClick={() => handleRemoveWord(word)} className="ml-2 text-slate-500 hover:text-red-400">&times;</button>
                </div>
            ))}
            </div>
        </div>
        
        {errorMessage && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg" role="alert">
                <strong className="font-bold">Error: </strong>
                <span>{errorMessage}</span>
            </div>
        )}

        <button
            onClick={() => onGeneratePuzzle(words, difficulty)}
            disabled={!isReady}
            className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default WordReview;
