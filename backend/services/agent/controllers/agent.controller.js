import { addMessage } from "../config/memory.js";
import { graph } from "../graph/graph.js";

import axios from "axios";
export const agent = async (req, res) => {
    try {
        const { prompt, conversationId, agent } = req.body;

        await axios.post(`${process.env.CHAT_SERVICE_URL}/save-message`,{
            content: prompt,
            conversationId,
            role:"user"
        });
        console.log('agent calling:',agent);
        const result = await graph.invoke({
            prompt,
            conversationId, agent
        });

        
        await addMessage(conversationId, "user", prompt);
        await addMessage(conversationId, "assistant", result.aiResponse);

        await axios.post(`${process.env.CHAT_SERVICE_URL}/save-message`,{
        content: result?.aiResponse,
        conversationId,
        role:"assistant",
        images: result?.images,
        artifacts: result?.artifacts
         });

        return res.status(200).json({
            answer: result?.aiResponse,
            images: result?.images,
            artifacts: result?.artifacts
        });

    } catch (error) {
        console.log(`Error from agent: agent`, error);
    }
}