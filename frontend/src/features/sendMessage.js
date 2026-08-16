import { Truck } from "lucide-react";
import api from "../../utils/config";

const SendMessage = async(payload) => {
        try {
            const {data} = await api.post("/api/agent/chat",payload);
            return data;
        } catch (error) {
            console.log(`Error from sendmessage`, error)
            return null;
        }
}

export default SendMessage;
