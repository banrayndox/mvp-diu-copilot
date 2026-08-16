import express from 'express';
import { configDotenv } from 'dotenv';
import connectDB from '../chat/config/db.js';
import router from './routes/agent.route.js';



configDotenv();
const PORT = process.env.PORT;
const app = express();


app.use(express.json());
app.use("/", router);
app.get('/', (req, res)=>{
    res.json({message: 'Hello from agent service'})
});

connectDB();
app.listen(PORT, ()=>{
    console.log(`agent service started at PORT: ${PORT}`)

});
