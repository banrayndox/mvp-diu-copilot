import express from 'express';
import { configDotenv } from 'dotenv';
import proxy from 'express-http-proxy';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { getCurrentUser } from './controllers/user.controller.js';
import protect from './middleware/auth.middleware.js';
import proxyWithHeader from './utils/proxyWithHeader.js';
import morgan from 'morgan';


configDotenv();
const PORT = process.env.PORT;
const app = express();

app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());
app.use(cookieParser());

app.use(cors(
    {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
));
app.use(morgan("dev"));

app.use("/api/auth", proxy(process.env.AUTH_SERVICE));
app.use("/api/chat", protect, proxyWithHeader(process.env.CHAT_SERVICE));
app.use("/api/agent",protect, proxy(process.env.AGENT_SERVICE));
app.use("/api/mentor", protect, proxyWithHeader(process.env.MENTOR_SERVICE || "http://localhost:8096"));
app.use("/api/lost-found", protect, proxyWithHeader(process.env.LOST_FOUND_SERVICE || "http://localhost:8097"));
app.get("/api/me", protect,getCurrentUser);
app.get('/', (req, res)=>{
    res.json({message: 'Hello from gateway'})
})


app.listen(PORT, ()=>{
    console.log(`Gateway started at PORT: ${PORT}`)
})
