import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/diu_mentor";
        await mongoose.connect(uri);
        console.log(`Mentor Service MongoDB connected successfully.`);
    } catch (error) {
        console.log(`Error from Mentor Service connectDB:\nError: `, error);
    }
};

export default connectDB;
