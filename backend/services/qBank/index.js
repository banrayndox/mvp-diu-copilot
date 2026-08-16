import express from 'express';
import { configDotenv } from 'dotenv';

import router from './routes/qBank.route.js';
import cors from "cors";

configDotenv();



const app = express();
const PORT = process.env.PORT || 8095 ;
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173"
}));
app.use("/question", router);

app.get("/health", (req,res)=>{
    res.send(`Health is okay on qBank server`);
})
app.listen(PORT, (req, res)=>{
    console.log(`Question Bank server started successfully at PORT: ${PORT}`);
})

