import api from "../../utils/config"

export const updateConversation = async (payload) => {
    try {
        const {data} = await api.post('/api/chat/update-conversation', payload);
        return data;
    } catch (error) {
        console.log(`Error from frontend: updateConversation`)
        return [];
    }
}