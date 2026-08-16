import api from "../../utils/config";

export const createConversation = async (payload = {}) => {
    try {
        const { data } = await api.post('/api/chat/create-conversation', payload);
        return data;
    } catch (error) {
        console.log(`Error from frontend: createConversation`, error);
        return null;
    }
};