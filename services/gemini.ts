import { GoogleGenAI, Type } from "@google/genai";
import { GameEvent, GameChoice, MarketData, PlayerStats, TurnResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TEXT_MODEL_ID = 'gemini-3-flash-preview';

/**
 * Generates a full game turn including news headline and choices.
 * Uses gemini-3-flash-preview for maximum speed and reliability.
 */
export const generateFullGameTurn = async (turn: number, stats: PlayerStats): Promise<GameEvent> => {
  const prompt = `
    Generate a game turn for 'TACO' (Trump Always Chicken Out).
    Turn: ${turn}
    Approval: ${stats.approval}%
    
    Output a JSON block with:
       - headline: A breaking news title.
       - description: A short, funny news summary.
       - impactForecast: A financial market warning.
       - choices: Array of 3 objects {id, label, description, type (AGGRESSIVE, DEFENSIVE, CHAOTIC)}.
    
    The JSON must be valid.
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL_ID,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            description: { type: Type.STRING },
            impactForecast: { type: Type.STRING },
            choices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["AGGRESSIVE", "DEFENSIVE", "CHAOTIC"] }
                },
                required: ["id", "label", "description", "type"]
              }
            }
          },
          required: ["headline", "description", "impactForecast", "choices"]
        }
      }
    });

    const text = response.text || "{}";
    const gameData = JSON.parse(text.trim());

    return {
      headline: gameData.headline || "Teleprompter Glitch",
      description: gameData.description || "The President is just making 'vroom' noises.",
      impactForecast: gameData.impactForecast || "Uncertainty in the toy car market.",
      choices: gameData.choices || [
        { id: '1', label: 'Ignore', description: 'Pretend it is not happening.', type: 'DEFENSIVE' },
        { id: '2', label: 'Blame Media', description: 'They edited the audio!', type: 'AGGRESSIVE' },
        { id: '3', label: 'Buy Twitter', description: 'Again.', type: 'CHAOTIC' }
      ]
    };
  } catch (error) {
    console.error("Gemini Event Error:", error);
    return {
      headline: "Satellite Down",
      description: "Connection to the truth is spotty.",
      impactForecast: "Tech sector is confused.",
      choices: []
    };
  }
};

/**
 * Evaluates the player's choice and calculates market/political impact.
 */
export const evaluateTurn = async (
  event: GameEvent,
  chosenChoice: GameChoice,
  customTweet: string | null,
  currentMarket: MarketData
): Promise<TurnResult> => {
  
  const prompt = `
    Context: ${event.headline} - ${event.description}.
    Player Action: "${chosenChoice.label}" (${chosenChoice.description}).
    Custom Tweet Addendum: "${customTweet || 'N/A'}".
    Current Market Prices: ${JSON.stringify(currentMarket)}.

    Roleplay as a Wall Street Analyst. 
    Analyze how the market logically reacts to this presidential maneuver:
    
    1. Financial Logic: 
       - If AGGRESSIVE/CHAOTIC: High Tech volatility, Crypto might surge.
       - If DEFENSIVE/CHICKEN OUT: Markets stabilize or stagnate.
    
    Return a JSON object analyzing the impacts.
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL_ID,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tweet: { type: Type.STRING },
            marketImpact: {
              type: Type.OBJECT,
              properties: {
                tech: { type: Type.NUMBER },
                energy: { type: Type.NUMBER },
                realEstate: { type: Type.NUMBER },
                crypto: { type: Type.NUMBER },
              }
            },
            approvalChange: { type: Type.NUMBER },
            tacoChange: { type: Type.NUMBER },
            analysis: { type: Type.STRING },
            marketAnalysis: { type: Type.STRING },
          },
          required: ["tweet", "marketImpact", "approvalChange", "tacoChange", "analysis", "marketAnalysis"],
        }
      },
    });

    const text = response.text || "{}";
    return JSON.parse(text.trim()) as TurnResult;
  } catch (error) {
    console.error("Gemini Eval Error:", error);
    return {
      tweet: "I have the best words.",
      marketImpact: { tech: 0, energy: 0, realEstate: 0, crypto: 0 },
      approvalChange: 0,
      tacoChange: 0,
      analysis: "Confusion reigns.",
      marketAnalysis: "Standard market variance."
    };
  }
};