import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema(
    {
        firebaseUID: {
            type: String
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        avatar: {
            type: String
        },
        skills: [{
            type: String
        }],
        department: {
            type: String,
            default: "CSE"
        },
        batch: {
            type: String
        },
        semester: {
            type: String
        },
        bio: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

// Map to Auth DB "User" model and "users" collection
const User = mongoose.models.User || model("User", userSchema, "users");

export default User;
