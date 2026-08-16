import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/diu_lost_found";
        await mongoose.connect(uri);
        console.log("Lost & Found Service MongoDB connected successfully.");
    } catch (error) {
        console.log("Error connecting to Lost & Found MongoDB:", error);
    }
};

export default connectDB;
