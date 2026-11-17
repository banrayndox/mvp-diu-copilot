import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModel } from "../config/llmModels.js";
import { getMemory } from "../config/memory.js";

export const chatAgent = async (state) => {
    try {
        const history = (await getMemory(state.conversationId)) || [];
        const searchContext = state.searchResults?.results
            ? `\n\nVerified Web Search Results:\n${JSON.stringify(state.searchResults.results, null, 2)}\nUse these search results to answer accurately. Cite sources where helpful.`
            : ``;

        const systemPrompt = `You are DIU Copilot, the official intelligent university AI assistant for Daffodil International University (DIU), Bangladesh.
Your mission is to help DIU students, faculty, and campus members with coursework, coding, campus routines, student portal queries, question papers, assignment cover pages, mentor finding, and general academic inquiries.

${searchContext}

Guidelines:
- Maintain a helpful, friendly, respectful, and academically sound tone.
- When answering campus-related questions, align with Daffodil International University practices (Daffodil Smart City, Ashulia, departments like CSE, SWE, EEE, BBA, etc.).
- For casual or short greetings, respond warmly and concisely.
- For technical, academic, or coding explanations, use structured GitHub-flavored Markdown:
  * Clear headings (##, ###)
  * Bullet points and numbered steps
  * Syntax-highlighted code blocks with language identifiers
  * Tables for comparisons or schedules
  * Bold text for important concepts
- Keep answers informative, readable, and free of unnecessary fluff.`;

        const messages = [new SystemMessage(systemPrompt)];

        // Append recent memory history
        history.forEach((msg) => {
            if (msg.role === "user" || msg.role === "human") {
                messages.push(new HumanMessage(msg.content));
            } else if (msg.role === "assistant" || msg.role === "ai") {
                // Ignore raw JSON control messages
                if (typeof msg.content === "string" && !msg.content.trim().startsWith('{"type":')) {
                    messages.push(new AIMessage(msg.content));
                }
            }
        });

        // CRITICAL FIX: Ensure the current user prompt is always appended!
        if (state.prompt) {
            messages.push(new HumanMessage(state.prompt));
        }

        const llm = await getModel("chat");
        const response = await llm.invoke(messages);

        return {
            ...state,
            aiResponse: response.content || "I am here to help you with your DIU queries."
        };
    } catch (error) {
        console.error("Error from chatAgent:", error);
        return {
            ...state,
            aiResponse: "I encountered an issue processing your request. Please try asking again."
        };
    }
};
