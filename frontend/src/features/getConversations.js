import api from "../../utils/config"

export const getConversations = async () => {
    try {
        const {data} = await api.get('/api/chat/get-conversations');
        return data ;
    } catch (error) {
        console.log(`Error from frontend: getConversations`, error);
        return [];
    }
}