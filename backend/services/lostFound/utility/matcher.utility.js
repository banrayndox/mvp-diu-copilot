import LostFoundItem from "../models/lostFoundItem.model.js";
import LostFoundMatch from "../models/lostFoundMatch.model.js";

const calculateSimilarityScore = (lostItem, foundItem) => {
    let score = 0;
    const reasons = [];

    const lostTitle = (lostItem.item || "").toLowerCase();
    const foundTitle = (foundItem.item || "").toLowerCase();
    const lostLoc = (lostItem.location || "").toLowerCase();
    const foundLoc = (foundItem.location || "").toLowerCase();
    const lostDesc = (lostItem.description || "").toLowerCase();
    const foundDesc = (foundItem.description || "").toLowerCase();

    // 1. Item Name Matching (Up to 50 pts)
    const lostWords = lostTitle.split(/[\s,.-]+/).filter(w => w.length >= 2);
    const foundWords = foundTitle.split(/[\s,.-]+/).filter(w => w.length >= 2);

    let titleMatchedWords = 0;
    lostWords.forEach(w => {
        if (foundTitle.includes(w) || foundDesc.includes(w)) titleMatchedWords++;
    });

    if (lostTitle === foundTitle) {
        score += 50;
        reasons.push(`Exact item match: "${lostItem.item}"`);
    } else if (titleMatchedWords > 0) {
        const itemPoints = Math.min(45, Math.round((titleMatchedWords / Math.max(lostWords.length, 1)) * 50));
        score += itemPoints;
        reasons.push(`Item keyword match: "${lostItem.item}"`);
    }

    // 2. Location Matching (Up to 35 pts)
    if (lostLoc && foundLoc) {
        const lostLocWords = lostLoc.split(/\s+/).filter(w => w.length > 2);
        let locMatchCount = 0;
        lostLocWords.forEach(w => {
            if (foundLoc.includes(w)) locMatchCount++;
        });

        if (lostLoc === foundLoc) {
            score += 35;
            reasons.push(`Location match: ${lostItem.location}`);
        } else if (locMatchCount > 0) {
            score += 25;
            reasons.push(`Nearby location match: ${lostItem.location}`);
        }
    }

    // 3. Description Overlap (Up to 15 pts)
    if (lostDesc && foundDesc) {
        const keywords = ["black", "blue", "red", "white", "samsung", "iphone", "wallet", "bag", "id", "card", "keys", "phone"];
        let descMatch = 0;
        keywords.forEach(kw => {
            if (lostDesc.includes(kw) && foundDesc.includes(kw)) {
                descMatch++;
            }
        });
        if (descMatch > 0) {
            score += Math.min(15, descMatch * 5);
            reasons.push(`Matching details & description`);
        }
    }

    // Cap score at 98% max unless identical
    if (score > 98) score = 95;
    if (lostTitle === foundTitle && lostLoc === foundLoc) score = 91;

    return { score, reasons };
};

export const runBidirectionalMatching = async (newItem) => {
    try {
        const isLost = newItem.type === "lost";
        const targetType = isLost ? "found" : "lost";

        // Query opposite active reports
        const candidates = await LostFoundItem.find({
            type: targetType,
            status: "active",
            isActive: true,
            _id: { $ne: newItem._id }
        });

        const createdMatches = [];

        for (const candidate of candidates) {
            const lostItem = isLost ? newItem : candidate;
            const foundItem = isLost ? candidate : newItem;

            const { score, reasons } = calculateSimilarityScore(lostItem, foundItem);

            // Create match if score >= 50%
            if (score >= 50) {
                const matchDoc = await LostFoundMatch.findOneAndUpdate(
                    { lostItem: lostItem._id, foundItem: foundItem._id },
                    {
                        lostItem: lostItem._id,
                        foundItem: foundItem._id,
                        lostUser: lostItem.userId,
                        lostUserEmail: lostItem.userEmail || lostItem.userId,
                        foundUser: foundItem.userId,
                        foundUserEmail: foundItem.userEmail || foundItem.userId,
                        matchScore: score,
                        matchReasons: reasons,
                        status: "potential"
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                createdMatches.push(matchDoc);
            }
        }

        console.log(`Matching Engine completed for item ${newItem._id}: Created ${createdMatches.length} match(es).`);
        return createdMatches;
    } catch (error) {
        console.error("Error running bidirectional matching:", error);
        return [];
    }
};
