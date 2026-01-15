import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage } from "../types";

// In a real app, this key comes from a secure backend or strict environment config
const API_KEY = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

export const sendMessageToGemini = async (
  history: ChatMessage[],
  currentContext: string, // Content of the currently open file or folder description
  userPrompt: string
): Promise<string> => {
  if (!ai) {
    return "API Key is missing. Please check your configuration.";
  }

  try {
    const model = 'gemini-3-flash-preview';
    
    // Construct a prompt that includes context
    const systemInstruction = `You are a helpful study assistant inside a student's digital binder. 
    You have access to the content of the document the student is currently viewing.
    Answer questions based on the provided context if available. Be concise and encouraging.
    
    Current Document Context:
    ${currentContext}
    `;

    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: systemInstruction,
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }))
    });

    const result: GenerateContentResponse = await chat.sendMessage({ message: userPrompt });
    return result.text || "I couldn't generate a response.";
    
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I encountered an error while processing your request.";
  }
};

export const generateSummary = async (content: string): Promise<string> => {
  if (!ai) return "API Key missing.";

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Summarize the following document for a student in 3 bullet points:\n\n${content}`,
    });
    return response.text || "No summary available.";
  } catch (error) {
    return "Error generating summary.";
  }
};
