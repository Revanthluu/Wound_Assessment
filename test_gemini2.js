import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({apiKey: process.env.VITE_GEMINI_API_KEY});
ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: 'test'
}).then(r => console.log(r)).catch(console.error);
