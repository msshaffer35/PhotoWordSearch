
import { GridColorData } from '../types';

export const processImageForGrid = (file: File, gridSize: number): Promise<GridColorData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = gridSize;
        canvas.height = gridSize;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return reject(new Error('Could not get canvas context.'));
        }

        // Draw the image onto the small canvas, effectively pixelating it
        ctx.drawImage(img, 0, 0, gridSize, gridSize);

        const colors: GridColorData[] = [];
        const imageData = ctx.getImageData(0, 0, gridSize, gridSize);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          const fullColor = `rgb(${r}, ${g}, ${b})`;
          
          // Using luminosity method for better grayscale conversion
          const gray = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
          const grayColor = `rgb(${gray}, ${gray}, ${gray})`;
          
          colors.push({ fullColor, grayColor });
        }
        resolve(colors);
      };
      img.onerror = () => reject(new Error('Failed to load image.'));
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
  });
};
