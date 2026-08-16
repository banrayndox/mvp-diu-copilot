import api from "../../utils/config";

export const saveDirectMessage = async (payload) => {
    try {
        const { data } = await api.post("/api/chat/save-message", payload);
        return data;
    } catch (error) {
        console.log("Error from saveDirectMessage", error);
        return null;
    }
};

export default saveDirectMessage;
