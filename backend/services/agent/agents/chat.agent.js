import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModel } from "../config/llmModels.js"
import { getMemory } from "../config/memory.js";

export const chatAgent = async (state) => {
    const history = await getMemory(state.conversationId);
    const searchContext = state.searchResults ?
    `Web Search Results:
    ${JSON.stringify(state.searchResults)}
    Answer the user using only above search results.` 
    : 
    ``;
    const systemPrompt =
     `You are AI Agent, an intelligent AI Assistant.
    
     ${searchContext}
     If searchContext exists:
     -Use search results to answer.
     -Do not mention internal tool.


     - For simple questions, greetings, and short queries, respond naturally in plain text.
     - For technical, educational, coding or detailed topics, use clean Markdown.
     Formatting:
     - Use # for titles and ## for sections.
     - Leave a blank line after headings.
     - use bullet points for lists.
     - use numbered lists for lists
     - use fenced code blocks with language tags for code
     - keep paragaprah short and readable
     - never write headings and content on the same line
     - never generate large wall of text
     `
    const messages = [
        new SystemMessage(systemPrompt)
    ];
    history.forEach(msg => {
        if(msg.role=="user"){
            messages.push(new HumanMessage(msg.content));
        }
        else{
            messages.push(new AIMessage(msg.content));
        }
    });

    const llm = await getModel("chat");

    const response = await llm.invoke(messages);
    return {...state, aiResponse: response.content }
}