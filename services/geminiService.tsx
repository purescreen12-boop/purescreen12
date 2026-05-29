
import { GoogleGenAI, Type } from "@google/genai";
import { AIInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getMovieInsights = async (movieTitle: string, description: string): Promise<AIInsight> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a faith-based cinematic insight for the movie titled "${movieTitle}" with description: "${description}". Focus on spiritual themes, a relevant scripture reference, and a reflection for the audience.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            theme: { type: Type.STRING },
            scriptureReference: { type: Type.STRING },
            reflection: { type: Type.STRING }
          },
          required: ["theme", "scriptureReference", "reflection"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching AI insights:", error);
    return {
      theme: "Universal Redemption",
      scriptureReference: "John 3:16",
      reflection: "This story reminds us that no journey is too long for grace to reach us."
    };
  }
};
