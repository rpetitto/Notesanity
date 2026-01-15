import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage } from "../types";

// Always initialize GoogleGenAI with API key directly from process.env.API_KEY as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const sendMessageToGemini = async (
  history: ChatMessage[],
  currentContext: string, // Content of the currently open file or folder description
  userPrompt: string
): Promise<string> => {
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

    // Access .text property directly as per @google/genai guidelines.
    const result: GenerateContentResponse = await chat.sendMessage({ message: userPrompt });
    return result.text || "I couldn't generate a response.";
    
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I encountered an error while processing your request.";
  }
};

export const generateSummary = async (content: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Summarize the following document for a student in 3 bullet points:\n\n${content}`,
    });
    // Access .text property directly as per @google/genai guidelines.
    return response.text || "No summary available.";
  } catch (error) {
    return "Error generating summary.";
  }
};