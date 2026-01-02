
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function test() {
    console.log(`API Key present: ${!!GEMINI_API_KEY}`);
    if (!GEMINI_API_KEY) return;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    // Test current model
    const models = ["gemini-3-flash-preview", "gemini-1.5-flash", "gemini-2.0-flash-exp"];

    for (const modelName of models) {
        console.log(`\nTesting model: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Translate 'Hola mundo' to English.");
            console.log(`Response: ${result.response.text()}`);
        } catch (error) {
            console.error(`Error with ${modelName}:`, error instanceof Error ? error.message : error);
        }
    }
}

test();
