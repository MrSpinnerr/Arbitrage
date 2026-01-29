
import { GoogleGenAI, Type } from "@google/genai";
import { SureBet, Sport, UK_BOOKMAKERS } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const findSureBets = async (selectedSports: Sport[], excludedBookmakers: string[]): Promise<SureBet[]> => {
  const sportsList = selectedSports.length > 0 ? selectedSports.join(", ") : "major sports";
  const today = new Date().toLocaleDateString('en-GB');
  const availableBookies = UK_BOOKMAKERS.filter(b => !excludedBookmakers.includes(b));
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Today's Date: ${today}. 
    Analyze the current UK sporting calendar (Premier League, Championship, major Horse Racing at Cheltenham/Aintree, etc.).
    Simulate realistic "Sure Bet" opportunities for ${sportsList}.
    ONLY use these bookmakers: ${availableBookies.join(", ")}.
    A sure bet occurs when the sum of the inverse of the best odds for all outcomes is less than 1.
    Generate 5-8 opportunities. Ensure profit margins are between 1% and 7%.
    Include at least one "Hot" opportunity over 4%.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            sport: { type: Type.STRING },
            event: { type: Type.STRING },
            commenceTime: { type: Type.STRING },
            profitPercentage: { type: Type.NUMBER },
            lastUpdated: { type: Type.STRING },
            outcomes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  bookmaker: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  label: { type: Type.STRING },
                  link: { type: Type.STRING }
                },
                required: ["bookmaker", "price", "label"]
              }
            }
          },
          required: ["id", "sport", "event", "profitPercentage", "outcomes"]
        }
      }
    }
  });

  try {
    const text = response.text.trim();
    return JSON.parse(text) as SureBet[];
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    return [];
  }
};
