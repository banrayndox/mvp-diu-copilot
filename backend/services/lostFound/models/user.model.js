import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        avatar: { type: String },
        department: { type: String }
    },
    { timestamps: true }
);

const User = mongoose.models.User || model("User", userSchema, "users");
export default User;
