import mongoose from "mongoose";
const {Schema, model} = mongoose;
const conversationSchema = new Schema({
    title: {
        type: String,
        default: "New Chat"
    },
    userId: {
        type: String,
        require: true
    },
    participants: [{
        type: String
    }],
    targetUserId: {
        type: String
    },
    targetEmail: {
        type: String
    },
    isDirectChat: {
        type: Boolean,
        default: false
    },
    matchId: {
        type: String
    },
    isClosed: {
        type: Boolean,
        default: false
    },
    closedAt: {
        type: Date
    },
    closedReason: {
        type: String
    }
},
{
    timestamps: true
});
const Conversation = model("Conversation", conversationSchema);
export default Conversation;