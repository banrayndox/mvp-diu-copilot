import express from 'express';
import { configDotenv } from 'dotenv';
import connectDB from './config/db.js';
import router from './routes/chat.route.js';



configDotenv();
const PORT = process.env.PORT;
const app = express();


app.use(express.json());
app.use("/", router);
app.get('/', (req, res)=>{
    res.json({message: 'Hello from chat service'})
});

    connectDB();
app.listen(PORT, ()=>{
    console.log(`chat service started at PORT: ${PORT}`)

});
