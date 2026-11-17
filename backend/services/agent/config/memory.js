import redis from '../../../shared/redis/redis.js';
import { getMessages } from '../utils/getMessages.js';

export const getMemory = async (conversationId) => {
    try {
        if (!conversationId) return [];
        const key = `messages-${conversationId}`;
        const cached = await redis.get(key);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed)) return parsed;
            } catch (e) {
                console.warn("Invalid cached messages JSON, falling back to DB");
            }
        }
        const messages = await getMessages(conversationId);
        const safeMessages = Array.isArray(messages) ? messages : [];
        try {
            await redis.set(key, JSON.stringify(safeMessages), "EX", 24 * 60 * 60);
        } catch (e) {
            console.warn("Redis caching error:", e.message);
        }
        return safeMessages;
    } catch (error) {
        console.error(`Error from agent:getMemory:`, error.message);
        return [];
    }
};

export const addMessage = async (conversationId, role, content) => {
    try {
        if (!conversationId || !content) return null;
        const key = `messages-${conversationId}`;
        let messages = [];
        try {
            const rawMessages = await redis.get(key);
            messages = rawMessages ? JSON.parse(rawMessages) : [];
            if (!Array.isArray(messages)) messages = [];
        } catch (e) {
            messages = [];
        }

        messages.push({
            role,
            content
        });

        if (messages.length > 20) {
            messages.splice(0, messages.length - 20);
        }

        await redis.set(key, JSON.stringify(messages), "EX", 24 * 60 * 60);
        return messages;
    } catch (error) {
        console.error(`Error from agent:addMessage:`, error.message);
        return null;
    }
};
