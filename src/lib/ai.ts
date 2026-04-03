import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const aiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

export const getAIResponse = async (prompt: string) => {
  try {
    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};

export const getAIVisionResponse = async (prompt: string, imageData: string, mimeType: string = "image/jpeg") => {
  try {
    const result = await aiModel.generateContent([
      prompt,
      {
        inlineData: {
          data: imageData,
          mimeType,
        },
      },
    ]);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("AI Vision Error:", error);
    throw error;
  }
};
