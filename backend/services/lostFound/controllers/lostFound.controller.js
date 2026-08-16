import axios from "axios";
import LostFoundItem from "../models/lostFoundItem.model.js";
import LostFoundMatch from "../models/lostFoundMatch.model.js";
import { runBidirectionalMatching } from "../utility/matcher.utility.js";

export const createReport = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        const userEmail = req.headers["x-user-email"];

        const { type, item, description, location, category } = req.body;

        if (!type || !item || !location) {
            return res.status(400).json({
                success: false,
                message: "type (lost/found), item, and location are required."
            });
        }

        const newItem = await LostFoundItem.create({
            userId: userId,
            userEmail: userEmail || "",
            type: type.toLowerCase(),
            item: item.trim(),
            description: description ? description.trim() : "",
            location: location.trim(),
            category: category || "General",
            status: "active"
        });

        // Run bidirectional matching against opposite reports
        const matches = await runBidirectionalMatching(newItem);

        // Fetch populated matches for output
        let populatedMatches = await LostFoundMatch.find({
            _id: { $in: matches.map(m => m._id) }
        }).populate("lostItem").populate("foundItem");

        // Fallback: If no exact score match was created, query existing active opposite items in DB
        if (populatedMatches.length === 0) {
            const oppositeType = newItem.type === "lost" ? "found" : "lost";
            const oppositeItems = await LostFoundItem.find({
                type: oppositeType,
                status: "active",
                isActive: true,
                _id: { $ne: newItem._id }
            }).sort({ createdAt: -1 }).limit(5);

            for (const oppItem of oppositeItems) {
                const lostItem = newItem.type === "lost" ? newItem : oppItem;
                const foundItem = newItem.type === "lost" ? oppItem : newItem;

                const matchDoc = await LostFoundMatch.findOneAndUpdate(
                    { lostItem: lostItem._id, foundItem: foundItem._id },
                    {
                        lostItem: lostItem._id,
                        foundItem: foundItem._id,
                        lostUser: lostItem.userId,
                        lostUserEmail: lostItem.userEmail || lostItem.userId,
                        foundUser: foundItem.userId,
                        foundUserEmail: foundItem.userEmail || foundItem.userId,
                        matchScore: 75,
                        matchReasons: [`Recent ${oppositeType.toUpperCase()} item in system: "${oppItem.item}"`],
                        status: "potential"
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                ).populate("lostItem").populate("foundItem");

                populatedMatches.push(matchDoc);
            }
        }

        return res.status(201).json({
            success: true,
            item: newItem,
            count: populatedMatches.length,
            matches: populatedMatches
        });

    } catch (error) {
        console.error("Error creating lost/found report:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create report",
            error: error.message
        });
    }
};

export const getUserMatches = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        const userEmail = req.headers["x-user-email"];

        const userIdentifiers = [userId];
        if (userEmail) userIdentifiers.push(userEmail);

        const matches = await LostFoundMatch.find({
            $or: [
                { lostUser: { $in: userIdentifiers } },
                { foundUser: { $in: userIdentifiers } }
            ]
        })
        .populate("lostItem")
        .populate("foundItem")
        .sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            count: matches.length,
            matches
        });

    } catch (error) {
        console.error("Error fetching user matches:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch matches",
            error: error.message
        });
    }
};

export const openMatchChat = async (req, res) => {
    try {
          console.log("===== OPEN MATCH CHAT HIT =====");
    console.log("matchId:", req.params.matchId);
    console.log("userId:", req.headers["x-user-id"]);
    console.log("userEmail:", req.headers["x-user-email"]);

        const userId = req.headers["x-user-id"];
        const userEmail = req.headers["x-user-email"];
        const { matchId } = req.params;

        const match = await LostFoundMatch.findById(matchId)
            .populate("lostItem")
            .populate("foundItem");

        if (!match) {
            return res.status(404).json({
                success: false,
                message: "Match record not found"
            });
        }

        // Return existing conversation if already created for this match
        if (match.conversationId) {
            let existingConv = null;
            try {
                const chatServiceUrl = process.env.CHAT_SERVICE_URL || "http://localhost:8091";
                const convRes = await axios.get(`${chatServiceUrl}/get-conversations`, {
                    headers: { "x-user-id": userId, "x-user-email": userEmail }
                });
                const userConvs = convRes.data || [];
                existingConv = userConvs.find(c => c._id.toString() === match.conversationId.toString());
            } catch (e) {
                console.error("Could not fetch conversation from chat service:", e.message);
            }

            const itemTitle = match.lostItem?.item || match.foundItem?.item || "Lost & Found Item";

            return res.status(200).json({
                success: true,
                conversationId: match.conversationId,
                conversation: existingConv || {
                    _id: match.conversationId,
                    title: `Lost & Found: ${itemTitle}`,
                    isDirectChat: true,
                    matchId: match._id
                },
                match
            });
        }

        // Determine counterparty details from stored email fields on match
        const isLostUser = (userId && (match.lostUser === userId || match.lostUserEmail === userId)) ||
                           (userEmail && (match.lostUser === userEmail || match.lostUserEmail === userEmail));

        const counterpartyUserId = isLostUser ? match.foundUser : match.lostUser;
        const counterpartyUserEmail = isLostUser
            ? (match.foundUserEmail || match.foundUser)
            : (match.lostUserEmail || match.lostUser);

        console.log(`openMatchChat -> isLostUser: ${isLostUser}, counterpartyUserId: ${counterpartyUserId}, counterpartyEmail: ${counterpartyUserEmail}`);

        const itemTitle = match.lostItem?.item || match.foundItem?.item || "Lost & Found Item";

        // Call Chat service to create 1-on-1 private conversation
        const chatServiceUrl = process.env.CHAT_SERVICE_URL || "http://localhost:8091";
        const chatResponse = await axios.post(`${chatServiceUrl}/create-conversation`, {
            targetUserId: counterpartyUserId,
            targetEmail: counterpartyUserEmail,
            title: `Lost & Found: ${itemTitle}`,
            isDirectChat: true,
            matchId: match._id.toString()
        }, {
            headers: {
                "x-user-id": userId,
                "x-user-email": userEmail
            }
        });

        const conversation = chatResponse.data;

        // Save conversation ID to match record & update status
        match.conversationId = conversation._id;
        match.status = "chat_started";
        await match.save();

        return res.status(200).json({
            success: true,
            conversationId: conversation._id,
            conversation,
            match
        });

    } catch (error) {
        console.error("Error opening match chat:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to open match chat",
            error: error.message
        });
    }
};

export const getMyReports = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        const reports = await LostFoundItem.find({ userId }).sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: reports.length,
            reports
        });
    } catch (error) {
        console.error("Error fetching my reports:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch reports",
            error: error.message
        });
    }
};

export const confirmReturn = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        const userEmail = req.headers["x-user-email"];
        const { matchId } = req.params;

        const match = await LostFoundMatch.findById(matchId);
        if (!match) {
            return res.status(404).json({ success: false, message: "Match not found" });
        }

        const isLostUser = (userId && match.lostUser === userId) || (userEmail && match.lostUser === userEmail);
        const isFoundUser = (userId && match.foundUser === userId) || (userEmail && match.foundUser === userEmail);

        if (isLostUser) {
            match.lostUserConfirmed = true;
        }
        if (isFoundUser) {
            match.foundUserConfirmed = true;
        }

        if (match.lostUserConfirmed && match.foundUserConfirmed) {
            // BOTH users confirmed return!
            match.status = "returned";
            match.returnedAt = new Date();
            await match.save();

            // Deactivate and archive reports
            await LostFoundItem.updateMany(
                { _id: { $in: [match.lostItem, match.foundItem] } },
                { status: "returned", isActive: false, returnedAt: new Date() }
            );

            // Cancel any OTHER active matches linked to either report
            await LostFoundMatch.updateMany(
                {
                    _id: { $ne: match._id },
                    $or: [
                        { lostItem: match.lostItem },
                        { foundItem: match.foundItem }
                    ],
                    status: { $nin: ["returned", "rejected"] }
                },
                { status: "cancelled" }
            );

            // Close chat conversation if linked
            if (match.conversationId) {
                const chatServiceUrl = process.env.CHAT_SERVICE_URL || "http://localhost:8091";
                try {
                    await axios.post(`${chatServiceUrl}/close-conversation`, {
                        conversationId: match.conversationId,
                        closedReason: "Item Returned"
                    }, {
                        headers: { "x-user-id": userId, "x-user-email": userEmail }
                    });
                } catch (e) {
                    console.error("Failed to call close-conversation on chat service:", e.message);
                }
            }

            return res.status(200).json({
                success: true,
                isFullyResolved: true,
                message: "Item return fully confirmed by both users! Reports deactivated.",
                match
            });
        } else {
            match.status = "return_pending";
            await match.save();

            return res.status(200).json({
                success: true,
                isFullyResolved: false,
                message: "Return confirmation saved. Waiting for partner confirmation.",
                match
            });
        }
    } catch (error) {
        console.error("Error in confirmReturn:", error);
        return res.status(500).json({ success: false, message: "Failed to confirm return", error: error.message });
    }
};

export const rejectMatch = async (req, res) => {
    try {
        const { matchId } = req.params;
        const match = await LostFoundMatch.findByIdAndUpdate(
            matchId,
            { status: "rejected" },
            { new: true }
        );
        return res.status(200).json({
            success: true,
            message: "Match rejected. Items remain active.",
            match
        });
    } catch (error) {
        console.error("Error rejecting match:", error);
        return res.status(500).json({ success: false, message: "Failed to reject match", error: error.message });
    }
};

