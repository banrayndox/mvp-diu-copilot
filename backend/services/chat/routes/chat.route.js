import express from 'express';
import { createConversation, getConversations, getMessages, saveMessage, updateConversation, closeConversation } from '../controllers/chat.controller.js';
const router = express.Router();

router.get("/create-conversation", createConversation);
router.post("/create-conversation", createConversation);
router.get("/get-conversations", getConversations);
router.post("/save-message", saveMessage);
router.get("/get-messages/:conversationId", getMessages);
router.post("/update-conversation", updateConversation);
router.post("/close-conversation", closeConversation);
export default router;