import api from "../../utils/config";

export const confirmReturn = async (matchId) => {
    try {
        const { data } = await api.post(`/api/lost-found/matches/${matchId}/confirm-return`);
        return data;
    } catch (error) {
        console.error("Error confirming item return:", error);
        return { success: false, message: error.message };
    }
};

export default confirmReturn;
