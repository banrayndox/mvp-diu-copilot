import express from "express";
import { configDotenv } from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import lostFoundRoutes from "./routes/lostFound.route.js";

configDotenv();

const app = express();
const PORT = process.env.PORT || 8097;

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

connectDB();

app.use("/api/lost-found", lostFoundRoutes);
app.use("/", lostFoundRoutes);

app.get("/health", (req, res) => {
    res.send("Health is okay on Lost & Found Match server");
});

app.listen(PORT, () => {
    console.log(`Lost & Found Match server started successfully at PORT: ${PORT}`);
});
