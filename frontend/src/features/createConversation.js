import api from "../../utils/config";

export const createConversation = async (payload = {}) => {
    try {
        const { data } = await api.post('/api/chat/create-conversation', payload);
        if (data?._id) {
            return data;
        }
    } catch (error) {
        console.log(`Note: Backend createConversation offline, using local fallback`, error);
    }

    // Local fallback for guest recruiter demo:
    return {
        _id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: payload.title || "New Chat",
        createdAt: new Date().toISOString(),
        ...payload
    };
};