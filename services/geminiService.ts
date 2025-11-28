import { GoogleGenAI } from "@google/genai";

// Declare process to fix Vercel build error TS2580
declare const process: any;

// Ensure API Key is available
const apiKey = process.env.API_KEY || '';

// Initialize the Google GenAI client
// Note: Actual implementation of specific AI features will occur in future steps.
// This file serves as the architecture root for Gemini integration.
export const ai = new GoogleGenAI({ apiKey });

export const models = {
  flash: 'gemini-2.5-flash',
  pro: 'gemini-3-pro-preview',
};

// Placeholder for future function to analyze inventory data
export const analyzeInventoryTrends = async (data: any) => {
  if (!apiKey) {
    console.warn("Gemini API Key missing");
    return "AI Unavailable";
  }
  // Logic to be implemented
};