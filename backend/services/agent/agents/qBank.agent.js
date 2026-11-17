import axios from "axios";
import { getModel } from "../config/llmModels.js";

export const qBankAgent = async (state) => {
    try {
        const llm = await getModel("questionbank");

        const extractionPrompt = `You are a DIU Question Bank parameter extractor.
Extract search parameters from the user's question:
- department (e.g. "CSE", "SWE", "EEE", "BBA", or null)
- course (e.g. "Algorithm", "Data Structure", "OOP", or null)
- semester (number like 1, 2, 3, 4 or null)
- year (number like 2022, 2023, 2024 or null)
- examType (e.g. "Mid", "Final", or null)

Rules:
- Never invent missing information.
- Return ONLY valid JSON without markdown fences.

Schema:
{
    "department": null,
    "course": null,
    "semester": null,
    "year": null,
    "examType": null
}

User Request:
${state.prompt}`;

        const extractionResponse = await llm.invoke(extractionPrompt);
        const cleanedContent = extractionResponse.content?.replace(/```json/gi, "").replace(/```/g, "").trim();

        let params = { department: null, course: null, semester: null, year: null, examType: null };
        try {
            params = JSON.parse(cleanedContent);
        } catch (e) {
            console.warn("Could not parse QBank extraction JSON, falling back to query search");
            params.course = state.prompt;
        }

        console.log("QBank Parameters:", params);

        // Call QBank Backend service
        const qBankUrl = process.env.QBANK_SERVICE_URL || "http://localhost:8095";
        let result = { questions: [] };

        try {
            const response = await axios.post(`${qBankUrl}/question/search`, {
                department: params.department,
                course: params.course,
                semester: params.semester,
                year: params.year,
                examType: params.examType
            });
            result = response.data || { questions: [] };
        } catch (apiErr) {
            console.error("QBank backend search API error:", apiErr.message);
        }

        const questions = result.questions || [];

        if (questions.length === 0) {
            return {
                ...state,
                aiResponse: `No past question papers were found matching your query in the DIU Question Bank.\n\n**Search Criteria:**\n- Department: ${params.department || "Any"}\n- Course: ${params.course || "Any"}\n- Semester: ${params.semester || "Any"}\n\n*Tip: Try searching by specific course name like "Algorithm", "Data Structure", or "OOP".*`,
                artifacts: []
            };
        }

        const formattedResults = questions.map((q, idx) => {
            const title = `${q.courseName || q.course || "Exam Paper"} (${q.department || "CSE"})`;
            const meta = [q.year ? `Year: ${q.year}` : null, q.examType ? `Type: ${q.examType}` : null, q.semester ? `Semester: ${q.semester}` : null].filter(Boolean).join(" • ");
            const downloadUrl = `http://localhost:8095/question/files/${q.id}`;
            return `### ${idx + 1}. ${title}\n${meta ? `> ${meta}\n\n` : ""}[📥 Download Official PDF Paper](${downloadUrl})`;
        }).join("\n\n---\n\n");

        return {
            ...state,
            aiResponse: `Here are the official question papers from the **DIU Question Bank**:\n\n${formattedResults}`,
            artifacts: []
        };
    } catch (error) {
        console.error("Error from qBankAgent:", error);
        return {
            ...state,
            aiResponse: "Sorry, I could not search the DIU question bank right now. Please try again.",
            artifacts: []
        };
    }
};
