import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8080";

// Singleton socket instance
let socket = null;

export const getSocket = () => {
    if (!socket) {
        socket = io(SERVER_URL, {
            withCredentials: true,
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            transports: ["websocket", "polling"]
        });

        socket.on("connect", () => {
            console.log("[Socket.IO Client] Connected to gateway:", socket.id);
        });

        socket.on("connect_error", (err) => {
            console.warn("[Socket.IO Client] Connection error:", err.message);
        });

        socket.on("disconnect", (reason) => {
            console.log("[Socket.IO Client] Disconnected:", reason);
        });
    }

    return socket;
};

export const joinConversation = (conversationId) => {
    const s = getSocket();
    if (s && conversationId) {
        s.emit("join_conversation", conversationId);
    }
};

export const leaveConversation = (conversationId) => {
    const s = getSocket();
    if (s && conversationId) {
        s.emit("leave_conversation", conversationId);
    }
};

export const emitTyping = (conversationId, isTyping) => {
    const s = getSocket();
    if (s && conversationId) {
        s.emit("typing", { conversationId, isTyping });
    }
};

export default getSocket;
