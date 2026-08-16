import mongoose from "mongoose";
const {Schema, model} = mongoose;
const fileSchema = new Schema({
    name: String,
    content: String
},{
    _id: false
});
const artifactSchema = new Schema({
    id: Number,
    type: String,
    title: String,
    files: [fileSchema]
},{
    _id: false
})
const messageSchema = new Schema({
    conversationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref: "Conversation"
    },
    senderId: {
        type: String
    },
    senderEmail: {
        type: String
    },
    role: {
        type: String,
        enum: ["user", "assistant"]
    },
    content: {
        type: String,
        require: true
    },
    images: [{
        type: String
    }],
    artifacts: [artifactSchema]
},
{
    timestamps: true
});
const Message = model("Message", messageSchema);
export default Message;