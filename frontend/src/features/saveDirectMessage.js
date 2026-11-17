import api from "../../utils/config";

export const saveDirectMessage = async (payload) => {
    try {
        const { data } = await api.post("/api/chat/save-message", payload);
        if (data && data._id) {
            return data;
        }
    } catch (error) {
        console.log("Note: Backend saveDirectMessage offline, using local fallback", error);
    }
    return {
        _id: `msg_direct_${Date.now()}`,
        ...payload
    };
};

export default saveDirectMessage;
