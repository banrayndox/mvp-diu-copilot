import axios from "axios";
import { getModel } from "../config/llmModels.js";

export const lostFoundAgent = async (state) => {
    try {
        const userPrompt = state.prompt || state.messages?.[state.messages.length - 1]?.content || "";
        const llm = await getModel("lostfound");

        const extractionPrompt = `
You are a DIU Lost & Found parameter and intent extractor.
Analyze the user request and determine intent and parameters.

Available intents:
1. report_lost (User lost an item e.g. "I lost my wallet near library")
2. report_found (User found an item e.g. "Found Samsung phone at CSE building")
3. view_matches (User wants to see matches e.g. "Show my matches", "Check lost found matches")

Rules:
- item: Name/title of item (e.g. "Black Wallet", "Samsung Phone", "Student ID Card")
- location: Location mentioned (e.g. "DIU Library", "CSE Building", "Cafeteria")
- description: Detailed description of item
- Return ONLY valid JSON.

Schema:
{
    "intent": "report_lost",
    "item": null,
    "location": null,
    "description": null
}

User Request:
${userPrompt}
`;

        let parsedQuery = { intent: "report_lost", item: null, location: null, description: null };

        try {
            const response = await llm.invoke(extractionPrompt);
            const content = response.content?.replace(/```json/gi, "").replace(/```/g, "").trim();
            parsedQuery = JSON.parse(content);
        } catch (e) {
            console.log("LLM extraction failed for lostFoundAgent, using fallback");
            const lower = userPrompt.toLowerCase();
            if (lower.includes("found")) {
                parsedQuery.intent = "report_found";
            } else if (lower.includes("match")) {
                parsedQuery.intent = "view_matches";
            }
            parsedQuery.item = userPrompt;
        }

        console.log("LostFound Extracted Query:", parsedQuery);

        const lostFoundServiceUrl = process.env.LOST_FOUND_SERVICE_URL || "http://localhost:8097";
        const userId = state.userId || state.user?.userId || "user_default";

        if (parsedQuery.intent === "view_matches") {
            const response = await axios.get(`${lostFoundServiceUrl}/api/lost-found/matches`, {
                headers: { "x-user-id": userId }
            });

            return {
                ...state,
                aiResponse: JSON.stringify({
                    type: "lostFoundMatchList",
                    action: "view_matches",
                    matches: response.data?.matches || []
                }),
                artifacts: []
            };
        } else {
            // Report lost or found item
            const reportPayload = {
                type: parsedQuery.intent === "report_found" ? "found" : "lost",
                item: parsedQuery.item || userPrompt,
                location: parsedQuery.location || "DIU Campus",
                description: parsedQuery.description || userPrompt
            };

            const response = await axios.post(`${lostFoundServiceUrl}/api/lost-found/report`, reportPayload, {
                headers: { "x-user-id": userId }
            });

            const result = response.data;

            return {
                ...state,
                aiResponse: JSON.stringify({
                    type: "lostFoundMatchList",
                    action: "report_created",
                    item: result.item,
                    matches: result.matches || []
                }),
                artifacts: []
            };
        }

    } catch (error) {
        console.error("Error from lostFoundAgent:", error);
        return {
            ...state,
            aiResponse: JSON.stringify({
                type: "lostFoundMatchList",
                action: "error",
                matches: [],
                error: "Sorry, I could not complete your Lost & Found request right now."
            }),
            artifacts: []
        };
    }
};
