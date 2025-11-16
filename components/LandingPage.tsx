
import React, { useRef, useState } from 'react';

interface LandingPageProps {
  onPhotoUpload: (file: File) => void;
  errorMessage: string | null;
}

const LandingPage: React.FC<LandingPageProps> = ({ onPhotoUpload, errorMessage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onPhotoUpload(event.target.files[0]);
    }
  };
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onPhotoUpload(e.dataTransfer.files[0]);
    }
  };


  return (
    <div className="text-center flex flex-col items-center justify-center min-h-screen p-4">
      <header className="mb-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Photo Word Search
        </h1>
        <p className="mt-2 text-lg text-slate-300 max-w-2xl mx-auto">
          Turn your photos into a playable work of art. Upload an image to generate a word search where finding words reveals your picture.
        </p>
      </header>

      <div 
        className={`w-full max-w-lg p-8 border-2 border-dashed rounded-lg transition-colors duration-300 ${isDragging ? 'border-purple-400 bg-slate-800' : 'border-slate-600 hover:border-slate-500'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          title="Upload your photo"
          placeholder="Choose a file"
        />
        <div className="flex flex-col items-center space-y-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-400">Drag & drop your photo here</p>
            <p className="text-slate-500 text-sm">or</p>
            <button
            onClick={handleButtonClick}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
            >
            Select Photo
            </button>
        </div>
      </div>
      
      {errorMessage && (
        <div className="mt-6 bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative max-w-lg" role="alert">
          <strong className="font-bold">Oops! </strong>
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}

      <footer className="mt-12 text-sm text-slate-500">
        <p>This app uses the free tier of the Gemini API for word generation.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
