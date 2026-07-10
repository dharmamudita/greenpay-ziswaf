require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
  try {
    console.log('Testing with key:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    const result = await model.generateContent('Halo!');
    console.log("Success:", result.response.text());
  } catch (error) {
    console.error('ERROR:', error.message);
  }
}
run();
