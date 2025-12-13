import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export const chatWithGemini = async (message) => {
    // 1. Emergency Bypass (Works Offline)
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('emerg') || lowerMsg.includes('112') || lowerMsg.includes('bombeiros') || lowerMsg.includes('gnr') || lowerMsg.includes('polic') || lowerMsg.includes('help') || lowerMsg.includes('contact')) {
        return `🚨 **EMERGÊNCIA (24h)**
🔴 **112** (Geral / General)
🏥 **808 24 24 24** (SNS 24 - Saúde)

🚒 **BOMBEIROS (Alenquer)**
📞 **263 711 309** (Emergência)
📞 **263 733 110** (Quartel)

👮 **POLÍCIA**
🚓 **263 856 200** (GNR Carregado)
🚓 **263 730 900** (Polícia Municipal)

⚡ **UTILIDADES**
🔌 **800 506 506** (E-Redes / Luz)
💧 **263 730 900** (Águas de Alenquer)`;
    }

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
      You are "Assistente Jovem", a helpful AI for the village of Carregado, Portugal.
      
      KEY INFO:
      - **Emergency**: 112 (General).
      - **Fire/Bombeiros**: 263 711 309 (B.V. Alenquer).
      - **Police**: GNR Carregado (263 856 200), Polícia Municipal (263 730 900).
      - Friendly, respectful, and concise.
      - If user asks in Portuguese, reply in Portuguese.
      - If user asks in English, reply in English.
      
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
