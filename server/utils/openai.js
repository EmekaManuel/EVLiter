import OpenAI from "openai";

export function isAiAvailable() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not set");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}
