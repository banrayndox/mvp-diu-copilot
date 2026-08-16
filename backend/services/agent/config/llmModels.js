import { ChatGroq } from "@langchain/groq"
import {ChatGoogleGenerativeAI} from '@langchain/google-genai'
import { ChatOpenRouter } from "@langchain/openrouter";

const groq = new ChatGroq({
    model: "openai/gpt-oss-120b",
    apiKey: "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"
});

const gemini = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-pro",
    apiKey: "AQ.Ab8RN6KL-_2QsnM9wDpZxMk1guAu_0gAOV5RzwPLdUGB0oD0kQ"
});

const openRouter = new ChatOpenRouter({
  model: "deepseek/deepseek-chat",
  apiKey: "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",
  temperature: 0,
  maxTokens: 2500
});

export const getModel = async (agent) => {
    console.log(`Requested Agent: `,agent);
    switch(agent){
        case "chat":
            return groq;
        case "search":
            return groq;
        case "coding":
            return openRouter;
        case "pdf":
            return groq;
        case "ppt":
            return groq;
        case "mentor":
            return groq;
        case "lostfound":
            return groq;
        default:
            return groq;
    }
}