
import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_PROMPT } from '../constants';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

export const generateWordsFromImage = async (file: File): Promise<string[]> => {
  if (!import.meta.env.VITE_API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

  const base64Data = await fileToBase64(file);
  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: file.type,
    },
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: GEMINI_PROMPT }, imagePart] },
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING
            }
        }
    }
  });

  try {
    const text = response.text.trim();
    const words = JSON.parse(text);
    if (Array.isArray(words) && words.every(w => typeof w === 'string')) {
      return words.map(word => word.toUpperCase().replace(/[^A-Z]/g, '')).filter(word => word.length > 2);
    }
    throw new Error('Invalid response format from Gemini API.');
  } catch (e) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error('Could not understand the response from the AI. Please try a different image.');
  }
};
