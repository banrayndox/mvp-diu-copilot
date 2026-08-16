import api from "../../utils/config";

const getCurrentUser = async () => {
    try {
        const { data } = await api.get("/api/me");
        return data?.user

    } catch (error) {
        console.log(error);
        return null;
    }
}
export default getCurrentUser;