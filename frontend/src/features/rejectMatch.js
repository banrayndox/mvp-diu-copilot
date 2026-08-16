import api from "../../utils/config";

export const rejectMatch = async (matchId) => {
    try {
        const { data } = await api.post(`/api/lost-found/matches/${matchId}/reject`);
        return data;
    } catch (error) {
        console.error("Error rejecting match:", error);
        return { success: false, message: error.message };
    }
};

export default rejectMatch;
