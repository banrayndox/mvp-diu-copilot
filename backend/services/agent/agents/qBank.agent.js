import axios from "axios";
import { getModel } from "../config/llmModels.js";

export const qBankAgent = async (state) => {
    try {

        const llm = await getModel("questionbank");

        // -----------------------------------------
        // 1. Extract QBank information from prompt
        // -----------------------------------------

const extractionPrompt = `
You are a DIU Question Bank parameter extractor.

Extract:
- department
- course
- semester
- year
- examType

Rules:
- department must be a string like "CSE"
- course must be a string like "Algorithm"
- semester MUST be a number.
  Example: "4th semester" -> 4
  Example: "4th" -> 4
  Example: "semester 4" -> 4
- year must be a number or null
- examType must be a string or null
- Never invent missing information.
- Return ONLY valid JSON.

Schema:
{
    "department": null,
    "course": null,
    "semester": null,
    "year": null,
    "examType": null
}

User Request:
${state.prompt}
`;

        const extractionResponse =
            await llm.invoke(extractionPrompt);

        const params = JSON.parse(
            extractionResponse.content
        );

        console.log("QBank Parameters:", params);


        // -----------------------------------------
        // 2. Check required fields
        // -----------------------------------------

        const missingFields = [];

        if (!params.department)
            missingFields.push("department");

        if (!params.course)
            missingFields.push("course");

        if (!params.semester)
            missingFields.push("semester");


        // -----------------------------------------
        // 3. Missing information
        // -----------------------------------------

        if (missingFields.length > 0) {

            return {
                ...state,

                aiResponse:
                    `I need the following information to search the question bank:\n\n` +
                    missingFields
                        .map(field => `- ${field}`)
                        .join("\n"),

                artifacts: []
            };
        }


        // -----------------------------------------
        // 4. Call QBank Backend
        // -----------------------------------------

        const response = await axios.post(
            "http://localhost:8095/question/search",
            {
                department: params.department,
                course: params.course,
                semester: params.semester,
                year: params.year,
                examType: params.examType
            }
        );


        const result = response.data;

        console.log("QBank Backend Response:", result);



return {
    ...state,

    aiResponse: result.questions
        ?.map(q =>
            `**${q.courseName} - ${q.year || ""} ${q.examType || ""}**\n` +
            `[Download PDF](http://localhost:8095/question/files/${q.id})`
        )
        .join("\n\n") || "No question papers found.",

    artifacts: []
};

    } catch (error) {

        console.error(
            "Error from agent: qBankAgent",
            error
        );

        return {
            ...state,

            aiResponse:
                "Sorry, I could not search the question bank.",

            artifacts: []
        };
    }
};