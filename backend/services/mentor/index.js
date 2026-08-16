import express from "express";
import { configDotenv } from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import mentorRoutes from "./routes/mentor.route.js";

configDotenv();

const app = express();
const PORT = process.env.PORT || 8096;

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

connectDB();

app.use("/api/mentor", mentorRoutes);
app.use("/", mentorRoutes);

app.get("/health", (req, res) => {
    res.send("Health is okay on Mentor Finder server");
});

app.listen(PORT, () => {
    console.log(`Mentor Finder server started successfully at PORT: ${PORT}`);
});
