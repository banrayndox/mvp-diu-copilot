import api from "../../utils/config";

export const openMatchChat = async (matchId) => {
    try {
       
        const { data } = await api.post(`/api/lost-found/matches/${matchId}/chat`);
        return data;
    } catch (error) {
        console.error("Error from openMatchChat:", error);
        return null;
    }
};

export default openMatchChat;
