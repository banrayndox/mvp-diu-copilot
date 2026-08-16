import { TavilySearch } from "@langchain/tavily";
import { configDotenv } from "dotenv";
configDotenv();

export const searchTool = new TavilySearch({
  maxResults: 5,
  topic: "general",
  includeImages: true,
  tavilyApiKey: process.env.TAVILY_API_KEY
});

