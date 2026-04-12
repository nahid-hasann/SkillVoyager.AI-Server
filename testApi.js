const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const fs = require('fs');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
model.generateContent('Hi').then(r => console.log('SUCCESS:', r.response.text())).catch(e => {
  fs.writeFileSync('err.txt', e.message);
});
