const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY_roadmap || process.env.GEMINI_API_KEY_milon || process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Robustly calls Gemini with retry logic for 503 errors.
 * @param {string} prompt - The main prompt.
 * @param {string} systemInstruction - Optional system instruction.
 * @param {Array} history - Optional chat history.
 */
const callGemini = async (prompt, systemInstruction = "", history = []) => {
  const modelName = "gemini-2.5-flash-lite";

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemInstruction || undefined,
  });

  let lastError;
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (history.length > 0) {
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(prompt);
        return result.response.text();
      } else {
        const result = await model.generateContent(prompt);
        return result.response.text();
      }
    } catch (error) {
      lastError = error;
      const isRetryable = error.message.includes("503") || error.message.includes("high demand") || error.message.includes("429");

      if (isRetryable && attempt < maxRetries) {
        const delay = attempt * 2000; // 2s, 4s, 6s
        console.warn(`Gemini API ${modelName} (Attempt ${attempt}) failed: ${error.message}. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      break;
    }
  }

  throw lastError;
};

module.exports = callGemini;