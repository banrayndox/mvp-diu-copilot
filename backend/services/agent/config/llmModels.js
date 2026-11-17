import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenRouter } from "@langchain/openrouter";
import { configDotenv } from "dotenv";

configDotenv();

// Reliable OpenRouter instance (DeepSeek V3 / Chat)
const openRouter = new ChatOpenRouter({
    model: "deepseek/deepseek-chat",
    apiKey: process.env.OPENROUTER_API_KEY || "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",
    temperature: 0.3,
    maxTokens: 3000
});

// Groq instance (used when valid key is provided)
let groq = null;
if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.startsWith("gsk_placeholder")) {
    try {
        groq = new ChatGroq({
            model: "openai/gpt-oss-120b",
            apiKey: process.env.GROQ_API_KEY,
            temperature: 0.2
        });
    } catch (e) {
        console.warn("Could not initialize Groq:", e.message);
    }
}

// Gemini instance (used when valid key is provided)
let gemini = null;
if (process.env.GOOGLE_API_KEY && !process.env.GOOGLE_API_KEY.startsWith("AQ_placeholder")) {
    try {
        gemini = new ChatGoogleGenerativeAI({
            model: "gemini-1.5-flash",
            apiKey: process.env.GOOGLE_API_KEY,
            temperature: 0.3
        });
    } catch (e) {
        console.warn("Could not initialize Gemini:", e.message);
    }
}

/**
 * Returns the best available LLM for the requested agent role.
 * Always falls back to OpenRouter to ensure 100% uptime without 401 crashes.
 */
export const getModel = async (agent) => {
    console.log(`[LLM Router] Requested model for agent: ${agent}`);

    // Fast-path using Groq (openai/gpt-oss-120b) for ultra-fast latency, with OpenRouter DeepSeek as solid fallback
    switch (agent) {
        case "router":
        case "intent":
            return groq || openRouter;
        case "coding":
            return openRouter;
        case "academic":
        case "routine":
        case "studentPortal":
            return groq || openRouter;
        case "mentor":
        case "lostfound":
        case "questionbank":
        case "coverPageAgent":
            return groq || openRouter;
        case "pdf":
        case "ppt":
        case "vision":
            return openRouter;
        case "chat":
        case "search":
        default:
            return groq || openRouter;
    }
};

export default getModel;
