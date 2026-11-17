import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import redis from "../../../shared/redis/redis.js";

export const createConversation = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        const userEmail = req.headers["x-user-email"];
        const { targetUserId, targetEmail, title, isDirectChat, matchId } = { ...req.query, ...req.body };

        console.log(`createConversation -> userId: ${userId}, targetEmail: ${targetEmail}, isDirectChat: ${isDirectChat}`);

        const participants = [];
        if (userId) participants.push(userId);
        if (userEmail && !participants.includes(userEmail)) participants.push(userEmail);
        if (targetUserId && !participants.includes(targetUserId)) participants.push(targetUserId);
        if (targetEmail && !participants.includes(targetEmail)) participants.push(targetEmail);

        // Check if existing conversation with these participants or matchId already exists
        let existingConv = null;
        if (matchId) {
            existingConv = await Conversation.findOne({ matchId });
        }
        if (!existingConv && (targetUserId || targetEmail)) {
            existingConv = await Conversation.findOne({
                $or: [
                    { userId: userId, targetEmail: targetEmail },
                    { userId: userId, targetUserId: targetUserId },
                    { participants: { $all: [userId, targetEmail || targetUserId] } },
                    { participants: { $all: [userId, targetUserId || targetEmail] } }
                ]
            });
        }

        if (existingConv) {
            let updated = false;
            participants.forEach(p => {
                if (p && !existingConv.participants.includes(p)) {
                    existingConv.participants.push(p);
                    updated = true;
                }
            });
            if (updated) await existingConv.save();
            return res.status(200).json(existingConv);
        }

        const conversation = await Conversation.create({
            userId: userId,
            title: title || "New Chat",
            participants: participants,
            targetUserId: targetUserId,
            targetEmail: targetEmail,
            isDirectChat: Boolean(isDirectChat || targetUserId || targetEmail),
            matchId: matchId
        });

        try {
            await redis.publish("chat:conversations", JSON.stringify(conversation));
        } catch (e) {}

        return res.status(200).json(conversation);
    } catch (error) {
        console.error(`Error from chat:createConversation`, error);
        return res.status(500).json({ success: false, message: 'Error from chat: createConversation' });
    }
};

export const getConversations = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        const userEmail = req.headers["x-user-email"];

        const userIdentifiers = [];
        if (userId) userIdentifiers.push(userId);
        if (userEmail && !userIdentifiers.includes(userEmail)) userIdentifiers.push(userEmail);

        const conversations = await Conversation.find({
            $or: [
                { userId: { $in: userIdentifiers } },
                { targetUserId: { $in: userIdentifiers } },
                { targetEmail: { $in: userIdentifiers } },
                { participants: { $in: userIdentifiers } }
            ]
        }).sort({ updatedAt: -1 });

        return res.status(200).json(conversations);
    } catch (error) {
        console.error(`Error from chat: getConversations`, error);
        return res.status(500).json({ success: false, message: 'Error from chat: getConversations' });
    }
};

export const updateConversation = async (req, res) => {
    try {
        const { id, title } = req.body;
        const conversation = await Conversation.findByIdAndUpdate(id, {
            title
        }, { new: true });

        try {
            await redis.publish("chat:conversations", JSON.stringify(conversation));
        } catch (e) {}

        return res.status(200).json(conversation);
    } catch (error) {
        console.error(`Error from chat: updateConversation`, error);
        return res.status(500).json({ success: false, message: 'Error from chat: updateConversation' });
    }
};

export const saveMessage = async (req, res) => {
    try {
        const { conversationId, role, content, images, artifacts, tempId } = req.body;
        const senderId = req.body.senderId || req.headers["x-user-id"];
        const senderEmail = req.body.senderEmail || req.headers["x-user-email"];

        // Idempotency check: if message with this tempId was already saved for this conversation, return it
        if (tempId && conversationId) {
            const existing = await Message.findOne({ conversationId, tempId });
            if (existing) {
                return res.status(200).json(existing);
            }
        }

        const message = await Message.create({
            conversationId,
            senderId,
            senderEmail,
            content,
            role: role || "user",
            images,
            artifacts,
            tempId
        });

        // Touch conversation's updatedAt timestamp
        if (conversationId && mongoose.isValidObjectId(conversationId)) {
            await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });
        }

        // Real-time broadcast through Redis Pub/Sub
        try {
            await redis.publish("chat:messages", JSON.stringify(message));
        } catch (e) {
            console.warn("Could not publish message to Redis:", e.message);
        }

        return res.status(200).json(message);

    } catch (error) {
        console.error(`Error from chat: saveMessage`, error);
        return res.status(500).json({ success: false, message: 'Error from chat: saveMessage' });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        if (!conversationId || !mongoose.isValidObjectId(conversationId)) {
            return res.status(200).json([]);
        }

        const messages = await Message.find({
            conversationId
        }).sort({ createdAt: 1 });
        return res.status(200).json(messages);

    } catch (error) {
        console.error(`Error from chat: getMessages`, error);
        return res.status(500).json({ success: false, message: 'Error from chat: getMessages' });
    }
};

export const closeConversation = async (req, res) => {
    try {
        const { conversationId, closedReason } = req.body;
        const conversation = await Conversation.findByIdAndUpdate(
            conversationId,
            {
                isClosed: true,
                closedAt: new Date(),
                closedReason: closedReason || "Case Resolved"
            },
            { new: true }
        );

        if (conversation) {
            const systemMsg = await Message.create({
                conversationId: conversationId,
                role: "assistant",
                content: `✓ Item Returned - This Lost & Found case has been successfully resolved. Conversation is now closed.`,
                senderId: "system"
            });
            try {
                await redis.publish("chat:messages", JSON.stringify(systemMsg));
                await redis.publish("chat:conversations", JSON.stringify(conversation));
            } catch (e) {}
        }

        return res.status(200).json(conversation);
    } catch (error) {
        console.error(`Error from chat: closeConversation`, error);
        return res.status(500).json({ success: false, message: 'Error closing conversation' });
    }
};
