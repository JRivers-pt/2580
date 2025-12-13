import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export const chatWithGemini = async (message) => {
    if (!apiKey) {
        console.warn("Gemini API Key missing. Using mock response.");
        await new Promise(r => setTimeout(r, 1000)); // Simulate delay
        return "I am a demo AI (add VITE_GEMINI_API_KEY to use real AI). I can help you find bus times or local news!";
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Context injection for better answers
        const context = `
      You are a helpful assistant for the village of Carregado, Portugal.
      You help elderly people find bus times (Boa Viagem), train times (CP), and local news.
      Be concise, polite, and use simple Portuguese or English depending on the user.
      Current Context: User is asking: "${message}"
    `;

        const result = await model.generateContent(context);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Sorry, I am having trouble connecting to the internet right now.";
    }
};
