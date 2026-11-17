import axios from "axios";

import { getModel } from "../config/llmModels.js";


// ============================================================
// STUDENT PORTAL SERVER
// ============================================================

const STUDENT_PORTAL_URL =
    process.env.STUDENT_PORTAL_URL ||
    "http://localhost:6000";


// ============================================================
// STUDENT PORTAL AGENT
// ============================================================

export const studentPortalAgent = async (state) => {

    try {

        // ========================================================
        // GET ACADEMIC MODEL
        // ========================================================

        const llm =
            await getModel("academic");


        // ========================================================
        // GET USER MESSAGE
        // ========================================================

        const userMessage =
            state.prompt ||
            state.messages?.[
                state.messages.length - 1
            ]?.content ||
            "";


        // ========================================================
        // LLM = QUERY UNDERSTANDING ONLY
        // ========================================================

        const prompt = `
You are a university student portal query parser.

Your job is ONLY to understand the user's academic
question and return structured JSON.

DO NOT answer the question.

Available intents:

1. student_info
2. cgpa
3. attendance
4. semester_results
5. completed_credits
6. registered_courses

Available semester examples:

- Spring 2026
- Fall 2025
- Summer 2025
- Spring 2025

Rules:

- If the user asks about CGPA, use "cgpa".
- If the user asks about attendance, use "attendance".
- If the user asks about result, grades, SGPA or semester result,
  use "semester_results".
- If a specific semester is mentioned, extract it.
- If the user asks how many credits they completed,
  use "completed_credits".
- If the user asks which courses they registered for,
  use "registered_courses".
- If the user asks about name, ID, department, university,
  program or current semester, use "student_info".
- If multiple academic information types are requested,
  use "multiple".
- Return ONLY valid JSON.
- Do not use markdown.
- Do not add explanations.


Examples:


User:
amar CGPA koto?

Output:
{
  "intent": "cgpa"
}


User:
amar attendance kemon?

Output:
{
  "intent": "attendance"
}


User:
amar attendance ar CGPA koto?

Output:
{
  "intent": "multiple",
  "queries": [
    {
      "intent": "attendance"
    },
    {
      "intent": "cgpa"
    }
  ]
}


User:
Spring 2026 er result dao

Output:
{
  "intent": "semester_results",
  "semester": "Spring 2026"
}


User:
Fall 2025 e amar result kemon chilo?

Output:
{
  "intent": "semester_results",
  "semester": "Fall 2025"
}


User:
ami koy credit complete korchi?

Output:
{
  "intent": "completed_credits"
}


User:
amar registered course gula ki?

Output:
{
  "intent": "registered_courses"
}


User:
amar information dao

Output:
{
  "intent": "student_info"
}


User message:

${userMessage}
`;


        // ========================================================
        // LLM QUERY UNDERSTANDING
        // ========================================================

        const response =
            await llm.invoke(prompt);


        const content =
            response.content?.trim() || "";


        // ========================================================
        // PARSE LLM JSON
        // ========================================================

        const parsedQuery =
            JSON.parse(
                cleanJson(content)
            );


        console.log(
            "Student Portal Query:",
            parsedQuery
        );


        // ========================================================
        // CALL STUDENT PORTAL API
        // ========================================================

        const result =
            await executeStudentPortalQuery(
                parsedQuery
            );


        console.log(
            "Student Portal Result:",
            result
        );


        // ========================================================
        // FORMAT RESULT USING LLM
        // ========================================================

        const answer =
            await formatStudentPortalResult(
                llm,
                userMessage,
                result
            );


        console.log(
            "Student Portal Answer:",
            answer
        );


        // ========================================================
        // RETURN STATE
        // ========================================================

        return {

            ...state,

            aiResponse: answer,

            studentPortalQuery:
                parsedQuery,

            studentPortalResult:
                result,

            artifacts: [],

        };


    } catch (error) {

        console.error(
            "Student Portal Agent Error:",
            error
        );


        return {

            ...state,

            aiResponse:
                "Sorry, I couldn't retrieve your academic information.",

            artifacts: [],

        };

    }
};


// ============================================================
// EXECUTE STUDENT PORTAL QUERY
// ============================================================

async function executeStudentPortalQuery(
    parsedQuery
) {

    // ========================================================
    // MULTIPLE QUERIES
    // ========================================================

    if (
        parsedQuery.intent === "multiple"
    ) {

        const queries =
            parsedQuery.queries || [];


        const results = {};


        for (
            const query of queries
        ) {

            results[query.intent] =
                await callStudentPortalAPI(
                    query
                );
        }


        return results;
    }


    // ========================================================
    // SINGLE QUERY
    // ========================================================

    return await callStudentPortalAPI(
        parsedQuery
    );
}


// ============================================================
// CALL STUDENT PORTAL SERVER
// ============================================================

async function callStudentPortalAPI(
    query
) {

    let url = "";


    switch (query.intent) {

        // ====================================================
        // STUDENT INFO
        // ====================================================

        case "student_info":

            url =
                `${STUDENT_PORTAL_URL}/api/student`;

            break;


        // ====================================================
        // CGPA
        // ====================================================

        case "cgpa":

            url =
                `${STUDENT_PORTAL_URL}/api/student/cgpa`;

            break;


        // ====================================================
        // ATTENDANCE
        // ====================================================

        case "attendance":

            url =
                `${STUDENT_PORTAL_URL}/api/student/attendance`;

            break;


        // ====================================================
        // SEMESTER RESULTS
        // ====================================================

        case "semester_results":

            url =
                `${STUDENT_PORTAL_URL}/api/student/results`;

            break;


        // ====================================================
        // COMPLETED CREDITS
        // ====================================================

        case "completed_credits":

            url =
                `${STUDENT_PORTAL_URL}/api/student/credits`;

            break;


        // ====================================================
        // REGISTERED COURSES
        // ====================================================

        case "registered_courses":

            url =
                `${STUDENT_PORTAL_URL}/api/student/courses`;

            break;


        default:

            throw new Error(
                `Unknown student portal intent: ${query.intent}`
            );
    }


    // ========================================================
    // API REQUEST
    // ========================================================

    const response =
        await axios.get(
            url,
            {
                params:
                    query.intent === "semester_results"
                        ? {
                            semester:
                                query.semester || undefined
                        }
                        : undefined,

                timeout: 10000
            }
        );


    return response.data?.data;
}


// ============================================================
// FORMAT RESULT
// ============================================================

async function formatStudentPortalResult(
    llm,
    userMessage,
    result
) {

    const prompt = `
You are a university Academic Assistant.

Answer the student's question using ONLY the
student portal data provided below.

Do not invent any information.

Keep the answer concise and natural.

If multiple information types are provided,
answer all of them.

Use bullet points when useful.

Student question:

${userMessage}


Student portal data:

${JSON.stringify(
    result,
    null,
    2
)}
`;


    const response =
        await llm.invoke(prompt);


    return (
        response.content?.trim() ||
        "I couldn't generate an answer."
    );
}


// ============================================================
// CLEAN LLM JSON
// ============================================================

function cleanJson(content) {

    return content
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

}