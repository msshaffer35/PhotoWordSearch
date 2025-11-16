
import React, { useState, useCallback } from 'react';
import { AppState, Difficulty, PuzzleData } from './types';
import { generateWordsFromImage } from './services/geminiService';
import { generatePuzzle } from './services/puzzleService';
import LandingPage from './components/LandingPage';
import WordReview from './components/WordReview';
import Puzzle from './components/Puzzle';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  
  const [generatedWords, setGeneratedWords] = useState<string[]>([]);
  const [puzzleData, setPuzzleData] = useState<PuzzleData | null>(null);

  const handleReset = () => {
    setAppState(AppState.LANDING);
    setErrorMessage(null);
    setImageFile(null);
    if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl('');
    setGeneratedWords([]);
    setPuzzleData(null);
  };

  const handlePhotoUpload = useCallback(async (file: File) => {
    if (!file) return;

    setImageFile(file);
    if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(URL.createObjectURL(file));
    setAppState(AppState.ANALYZING);
    setErrorMessage(null);

    try {
      const words = await generateWordsFromImage(file);
      setGeneratedWords(words);
      setAppState(AppState.WORD_REVIEW);
    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to generate words from the image. Please try another photo or check your connection.');
      setAppState(AppState.LANDING);
    }
  }, [imagePreviewUrl]);

  const handleGeneratePuzzle = useCallback(async (words: string[], difficulty: Difficulty) => {
    if (!imageFile) {
        setErrorMessage('Image file is missing.');
        setAppState(AppState.LANDING);
        return;
    }

    setAppState(AppState.GENERATING_PUZZLE);
    setErrorMessage(null);

    try {
      const size = difficulty === Difficulty.EASY ? 10 : 15;
      
      const newPuzzleData = generatePuzzle(words, size, difficulty !== Difficulty.EASY);
      if (!newPuzzleData) {
        throw new Error("Could not generate puzzle with the given words. Try removing long words or adding more.");
      }
      setPuzzleData(newPuzzleData);
      setAppState(AppState.PLAYING);
    } catch (error: any) {
        console.error(error);
        setErrorMessage(error.message || 'Failed to generate the puzzle. Please adjust your words or try again.');
        setAppState(AppState.WORD_REVIEW);
    }
  }, [imageFile]);


  const renderContent = () => {
    switch (appState) {
      case AppState.LANDING:
        return <LandingPage onPhotoUpload={handlePhotoUpload} errorMessage={errorMessage} />;
      case AppState.ANALYZING:
        return <Spinner text="Analyzing your photo with Gemini..." />;
      case AppState.WORD_REVIEW:
        return (
          <WordReview
            initialWords={generatedWords}
            onGeneratePuzzle={handleGeneratePuzzle}
            imagePreviewUrl={imagePreviewUrl}
            onBack={handleReset}
            errorMessage={errorMessage}
          />
        );
      case AppState.GENERATING_PUZZLE:
        return <Spinner text="Building your photo puzzle..." />;
      case AppState.PLAYING:
        if (puzzleData) {
            return <Puzzle puzzleData={puzzleData} onNewPuzzle={handleReset} imagePreviewUrl={imagePreviewUrl} />;
        }
        // Fallback if data is missing
        handleReset();
        return null;
      default:
        return <LandingPage onPhotoUpload={handlePhotoUpload} errorMessage={errorMessage} />;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-900 text-slate-100">
      <main className="w-full max-w-7xl mx-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
