import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { configDotenv } from 'dotenv';
import proxy from 'express-http-proxy';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { getCurrentUser } from './controllers/user.controller.js';
import protect from './middleware/auth.middleware.js';
import proxyWithHeader from './utils/proxyWithHeader.js';
import morgan from 'morgan';
import redis from '../shared/redis/redis.js';
import Redis from 'ioredis';

configDotenv();
const PORT = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

// Helper to parse cookies from handshake headers
const parseCookies = (cookieHeader) => {
    const list = {};
    if (!cookieHeader) return list;
    cookieHeader.split(";").forEach((cookie) => {
        let [name, ...rest] = cookie.split("=");
        name = name?.trim();
        if (!name) return;
        list[name] = decodeURIComponent(rest.join("=").trim());
    });
    return list;
};

// Socket.IO Authentication Middleware
io.use(async (socket, next) => {
    try {
        const cookieHeader = socket.handshake.headers?.cookie;
        const cookies = parseCookies(cookieHeader);
        const sessionId = cookies.session || socket.handshake.auth?.sessionId;

        if (sessionId) {
            const rawSession = await redis.get(`session-${sessionId}`);
            if (rawSession) {
                socket.user = JSON.parse(rawSession);
            }
        }
        return next();
    } catch (err) {
        console.warn("[Socket Auth] Middleware error:", err.message);
        return next();
    }
});

// Socket.IO Connection Handler
io.on("connection", (socket) => {
    const user = socket.user;
    console.log(`[Socket.IO] Client connected: ${socket.id} (User: ${user?.name || "Guest"})`);

    if (user?.userId) {
        socket.join(`user:${user.userId}`);
    }
    if (user?.email) {
        socket.join(`user:${user.email}`);
    }

    // Join specific conversation room
    socket.on("join_conversation", (conversationId) => {
        if (conversationId) {
            socket.join(`conversation:${conversationId}`);
            console.log(`[Socket.IO] Socket ${socket.id} joined conversation:${conversationId}`);
        }
    });

    // Leave conversation room
    socket.on("leave_conversation", (conversationId) => {
        if (conversationId) {
            socket.leave(`conversation:${conversationId}`);
            console.log(`[Socket.IO] Socket ${socket.id} left conversation:${conversationId}`);
        }
    });

    // User typing event
    socket.on("typing", ({ conversationId, isTyping }) => {
        if (conversationId) {
            socket.to(`conversation:${conversationId}`).emit("user_typing", {
                conversationId,
                isTyping,
                userId: user?.userId,
                userName: user?.name || "Someone"
            });
        }
    });

    // Client disconnection
    socket.on("disconnect", (reason) => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
    });
});

// Redis Pub/Sub Subscriber for cross-service events
try {
    const redisSub = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
    redisSub.subscribe("chat:messages", "agent:status", "chat:conversations", (err, count) => {
        if (err) {
            console.warn("[Redis Sub] Failed to subscribe:", err.message);
        } else {
            console.log(`[Redis Sub] Subscribed to ${count} channels`);
        }
    });

    redisSub.on("message", (channel, rawMessage) => {
        try {
            const data = JSON.parse(rawMessage);
            if (channel === "chat:messages") {
                if (data.conversationId) {
                    io.to(`conversation:${data.conversationId}`).emit("receive_message", data);
                }
                io.emit("message_broadcast", data);
            } else if (channel === "agent:status") {
                if (data.conversationId) {
                    io.to(`conversation:${data.conversationId}`).emit("agent_status", data);
                }
            } else if (channel === "chat:conversations") {
                io.emit("conversation_updated", data);
            }
        } catch (e) {
            console.error("[Redis Sub] Error parsing broadcast message:", e.message);
        }
    });
} catch (e) {
    console.warn("[Redis Sub] Initialization warning:", e.message);
}

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use(morgan("dev"));

// Internal Broadcast Endpoint
app.post("/api/internal/broadcast", (req, res) => {
    const { event, room, data } = req.body;
    if (!event) return res.status(400).json({ error: "Event name required" });

    if (room) {
        io.to(room).emit(event, data);
    } else {
        io.emit(event, data);
    }
    return res.json({ success: true });
});

// Service Proxies
app.use("/api/auth", proxy(process.env.AUTH_SERVICE || "http://localhost:8090"));
app.use("/api/chat", protect, proxyWithHeader(process.env.CHAT_SERVICE || "http://localhost:8091"));
app.use("/api/agent", protect, proxy(process.env.AGENT_SERVICE || "http://localhost:8092"));
app.use("/api/mentor", protect, proxyWithHeader(process.env.MENTOR_SERVICE || "http://localhost:8096"));
app.use("/api/lost-found", protect, proxyWithHeader(process.env.LOST_FOUND_SERVICE || "http://localhost:8097"));
app.use("/api/qbank", proxy("http://localhost:8095"));
app.use("/api/student-portal", proxy("http://localhost:6000"));

app.get("/api/me", protect, getCurrentUser);

app.get('/', (req, res) => {
    res.json({ message: 'DIU Copilot API Gateway & Real-time Server is Running' });
});

app.get('/health', (req, res) => {
    res.json({ status: "healthy", service: "gateway", socketio: true });
});

server.listen(PORT, () => {
    console.log(`DIU Copilot Gateway with Socket.IO started at PORT: ${PORT}`);
});
