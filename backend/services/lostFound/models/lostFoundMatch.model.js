import mongoose from "mongoose";
const { Schema, model } = mongoose;

const lostFoundMatchSchema = new Schema(
    {
        lostItem: {
            type: Schema.Types.ObjectId,
            ref: "LostFoundItem",
            required: true
        },
        foundItem: {
            type: Schema.Types.ObjectId,
            ref: "LostFoundItem",
            required: true
        },
        lostUser: {
            type: String,
            required: true
        },
        lostUserEmail: {
            type: String
        },
        foundUser: {
            type: String,
            required: true
        },
        foundUserEmail: {
            type: String
        },
        matchScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        matchReasons: [{
            type: String
        }],
        status: {
            type: String,
            enum: ["potential", "chat_started", "confirmed", "return_pending", "returned", "rejected", "cancelled"],
            default: "potential"
        },
        lostUserConfirmed: {
            type: Boolean,
            default: false
        },
        foundUserConfirmed: {
            type: Boolean,
            default: false
        },
        returnedAt: {
            type: Date
        },
        conversationId: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

// Ensure unique match per (lostItem, foundItem) pair
lostFoundMatchSchema.index({ lostItem: 1, foundItem: 1 }, { unique: true });

const LostFoundMatch = model("LostFoundMatch", lostFoundMatchSchema);

export default LostFoundMatch;
