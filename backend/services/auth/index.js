import express from 'express';
import { configDotenv } from 'dotenv';
import connectDB from './config/db.js';
import router from './routes/auth.route.js';
import cors from "cors";

configDotenv();
const PORT = process.env.PORT;
const app = express();



app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);


app.use(express.json());
app.use("/", router)
app.get('/', (req, res)=>{
    res.json({message: 'Hello from auth service'})
});

    connectDB();
app.listen(PORT, ()=>{
    console.log(`auth service started at PORT: ${PORT}`)

});
