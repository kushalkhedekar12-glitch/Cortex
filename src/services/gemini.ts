import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export const SYSTEM_INSTRUCTION = `You are Cortex, a highly efficient AI assistant developed by Kushal. 
Your primary goal is to help users with daily tasks and basic coding.
When helping with code:
- Provide clean, well-commented code snippets.
- Explain the logic briefly.
- Focus on modern, best-practice implementations.
- Be concise but thorough.

When helping with daily tasks:
- Be polite and professional.
- Provide actionable advice.
- Use formatting (bullet points, bold text) to make information scannable.

Always identify yourself as Cortex and mention you were developed by Kushal if asked about your origin.`;

export async function getChatResponse(message: string, history: { role: string; parts: { text: string }[] }[]) {
  const model = "gemini-3-flash-preview";
  
  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
    history: history,
  });

  const result = await chat.sendMessage({ message });
  return result;
}
