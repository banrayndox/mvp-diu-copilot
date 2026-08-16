import axios from "axios";
import { getModel } from "../config/llmModels.js";

export const mentorAgent = async (state) => {
    try {
        const userPrompt = state.prompt || state.messages?.[state.messages.length - 1]?.content || "";

        const llm = await getModel("mentor");

        const extractionPrompt = `
You are a DIU Mentor Finder parameter extractor.
Your job is ONLY to extract mentor search criteria from user prompt.

Extract:
- name (string or null)
- email (string or null)
- query (string or null)

Rules:
- If user mentions a name (e.g. "Find Rakib", "Rakib Biswash", "Rakib কে চাই"), extract name.
- If user mentions an email (e.g. "rakib@diu.edu.bd", "find person with email x@diu.edu.bd"), extract email.
- If generic search query, extract query.
- Do NOT invent information.
- Return ONLY valid JSON.

Schema:
{
    "name": null,
    "email": null,
    "query": null
}

User Request:
${userPrompt}
`;

        let searchParams = { name: null, email: null, query: null };

        try {
            const extractionResponse = await llm.invoke(extractionPrompt);
            const content = extractionResponse.content?.replace(/```json/gi, "").replace(/```/g, "").trim();
            searchParams = JSON.parse(content);
        } catch (e) {
            console.log("LLM extraction failed, using fallback regex extraction");
            // Fallback simple regex extraction for email and name
            const emailMatch = userPrompt.match(/[\w.-]+@[\w.-]+\.\w+/);
            if (emailMatch) {
                searchParams.email = emailMatch[0];
            } else {
                const cleaned = userPrompt.replace(/find|search|কে|খুঁজে|দাও|চাই|mentor|person|with|email/gi, "").trim();
                searchParams.name = cleaned || userPrompt;
            }
        }

        console.log("Extracted Mentor Search Params:", searchParams);

        // Call Mentor Finder Server Backend
        const mentorServerUrl = process.env.MENTOR_SERVICE_URL || "http://localhost:8096";
        const response = await axios.get(`${mentorServerUrl}/api/mentor/search`, {
            params: {
                name: searchParams.name,
                email: searchParams.email,
                query: searchParams.query
            }
        });

        const mentors = response.data?.mentors || [];
        console.log("Mentor Finder Response:", mentors);

        const responsePayload = {
            type: "mentorResults",
            query: searchParams.name || searchParams.email || searchParams.query || userPrompt,
            mentors: mentors
        };

        return {
            ...state,
            aiResponse: JSON.stringify(responsePayload),
            artifacts: []
        };

    } catch (error) {
        console.error("Error from mentorAgent:", error);
        return {
            ...state,
            aiResponse: JSON.stringify({
                type: "mentorResults",
                query: state.prompt,
                mentors: [],
                error: "Sorry, I could not complete the mentor search at this moment."
            }),
            artifacts: []
        };
    }
};
