import mongoose from "mongoose";
const { Schema, model } = mongoose;

const lostFoundItemSchema = new Schema(
    {
        userId: {
            type: String,
            required: true
        },
        userEmail: {
            type: String
        },
        userName: {
            type: String
        },
        type: {
            type: String,
            enum: ["lost", "found"],
            required: true
        },
        item: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            default: "General"
        },
        description: {
            type: String,
            trim: true
        },
        location: {
            type: String,
            required: true,
            trim: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ["active", "returned", "resolved", "deleted"],
            default: "active"
        },
        isActive: {
            type: Boolean,
            default: true
        },
        returnedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

const LostFoundItem = model("LostFoundItem", lostFoundItemSchema);

export default LostFoundItem;
