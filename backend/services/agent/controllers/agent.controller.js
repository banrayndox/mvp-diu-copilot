import { addMessage } from "../config/memory.js";
import { graph } from "../graph/graph.js";
import axios from "axios";
import redis from "../../../shared/redis/redis.js";

export const agent = async (req, res) => {
    try {
        const { prompt, conversationId, agent, tempId } = req.body;
        const userId = req.headers["x-user-id"];
        const userEmail = req.headers["x-user-email"];

        if (!prompt || !conversationId) {
            return res.status(400).json({
                error: "Prompt and conversationId are required."
            });
        }

        // Save User Message to Chat Service
        try {
            await axios.post(`${process.env.CHAT_SERVICE_URL}/save-message`, {
                content: prompt,
                conversationId,
                role: "user",
                senderId: userId,
                senderEmail: userEmail,
                tempId
            });
        } catch (e) {
            console.warn("Could not save initial user message to chat service:", e.message);
        }

        // Publish status event to Redis for real-time Socket.IO streaming
        try {
            await redis.publish("agent:status", JSON.stringify({
                conversationId,
                status: "thinking",
                message: "DIU Copilot is thinking..."
            }));
        } catch (e) {}

        console.log(`[Agent Invocation] conversationId: ${conversationId}, agent: ${agent || "auto"}, user: ${userId}`);

        const result = await graph.invoke({
            prompt,
            conversationId,
            agent: agent || "auto",
            userId,
            userEmail
        });

        const aiResponse = result.aiResponse || "I am here to help you.";
        const artifacts = result.artifacts || [];
        const images = result.images || [];

        // Save to Redis fast memory
        await addMessage(conversationId, "user", prompt);
        await addMessage(conversationId, "assistant", aiResponse);

        // Save Assistant Message to Chat Service
        let savedAssistantMsg = null;
        try {
            const saveRes = await axios.post(`${process.env.CHAT_SERVICE_URL}/save-message`, {
                content: aiResponse,
                conversationId,
                role: "assistant",
                images,
                artifacts
            });
            savedAssistantMsg = saveRes.data;
        } catch (e) {
            console.warn("Could not save assistant message to chat service:", e.message);
        }

        // Publish completed event to Redis
        try {
            await redis.publish("agent:status", JSON.stringify({
                conversationId,
                status: "completed",
                message: null,
                messageDoc: savedAssistantMsg
            }));
        } catch (e) {}

        return res.status(200).json({
            answer: aiResponse,
            images,
            artifacts,
            message: savedAssistantMsg
        });

    } catch (error) {
        console.error("Error from agent: agent", error);
        return res.status(500).json({
            error: "Failed to process request through DIU Copilot engine.",
            details: error.message
        });
    }
};
