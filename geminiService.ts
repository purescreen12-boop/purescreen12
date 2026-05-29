
import { GoogleGenAI, Type } from "@google/genai";


const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;

// Only initialize if API key is valid (not placeholder or empty)
if (apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey !== 'YOUR_API_KEY') {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.warn('Failed to initialize Gemini AI:', error);
    ai = null;
  }
}

export const getAIsuggestions = async (prompt: string) => {
  if (!ai) {
    return "Explore our library of inspiring movies that will bless you.";
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `You are a movie recommendation assistant for a Christian streaming platform. Based on this request: "${prompt}", provide a short, encouraging 2-sentence recommendation summary for watching films that build faith.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Explore our library of inspiring movies that will bless you.";
  }
};
