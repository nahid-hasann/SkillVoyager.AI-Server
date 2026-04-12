const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY_milon || process.env.GEMINI_API_KEY;
    console.log("Using API Key:", apiKey.substring(0, 10) + "...");
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // We can't easily list models with the SDK in a simple way without auth for some methods,
        // but we can try to hit a known simple model.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hi");
        console.log("Success with gemini-1.5-flash:", result.response.text());
    } catch (e) {
        console.error("Failed with gemini-1.5-flash:", e.message);

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
            const result = await model.generateContent("Hi");
            console.log("Success with gemini-1.0-pro:", result.response.text());
        } catch (e2) {
            console.error("Failed with gemini-1.0-pro:", e2.message);
        }
    }
}

listModels();
