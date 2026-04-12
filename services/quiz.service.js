const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY_quiz || process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const systemInstruction = `
You are an AI Quiz Generator and Examiner.
Your job is to generate high quality quizzes for users and return the output strictly in JSON format.
Rules:
1. Always generate quiz questions based on the topic provided by the user.
2. The user can choose the number of questions (5 or 10).
3. Each question must contain:
   - question
   - 4 options
   - correct_answer
   - explanation
4. The correct answer MUST be included in the JSON but clearly marked so the system can evaluate user submissions later.
5. Difficulty should be balanced and suitable for learning.
6. Questions must be unique and non-repetitive.
7. The response MUST be valid JSON only. Do not add extra text, no markdown block syntax.

JSON structure:
{
  "quiz_title": "string",
  "total_questions": number,
  "questions": [
    {
      "id": number,
      "question": "string",
      "options": {
        "A": "string",
        "B": "string",
        "C": "string",
        "D": "string"
      },
      "correct_answer": "A/B/C/D",
      "explanation": "short explanation of the correct answer"
    }
  ]
}
`;

const generateQuizWithAI = async (topic, skillLevel = "Intermediate", numQuestions = 5) => {
  const modelName = "gemini-2.5-flash-lite";
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction,
  });

  const prompt = `Generate a ${skillLevel} level quiz about "${topic}" containing ${numQuestions} questions. Return ONLY valid JSON as requested.`;

  let lastError;
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      // Clean up markdown block if the AI returns it by mistake
      text = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
      return JSON.parse(text);
    } catch (error) {
      lastError = error;
      const isRetryable = error.message.includes("503") || error.message.includes("high demand") || error.message.includes("429") || error.name === "SyntaxError";

      if (isRetryable && attempt < maxRetries) {
        const delay = attempt * 2000;
        console.warn(`Quiz Gemini API (Attempt ${attempt}) failed: ${error.message}. Retrying...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      break;
    }
  }

  throw lastError;
};

module.exports = {
  generateQuizWithAI
};
