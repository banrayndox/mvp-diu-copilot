import axios from "axios"


// have to make new api for exact last 20 message get

export const getMessages = async (conversationId) => {
    try {
        const {data} = await axios.get(`${process.env.CHAT_SERVICE_URL}/get-messages/${conversationId}`);
        return data;
    } catch (error) {
        console.log(`Error from agent:getMessages`, error)
        return null;
    }
}