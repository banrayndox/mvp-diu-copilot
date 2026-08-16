import { getModel } from "../config/llmModels.js";

import {
    executeRoutineQuery,
    formatRoutineResult,
} from "../utils/routineParse.js";


export const routineAgent = async (state) => {

    try {

        // ========================================================
        // GET ROUTINE MODEL
        // ========================================================

        const llm = await getModel("routine");


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
You are a university class routine query parser.

Your job is ONLY to understand the user's routine-related
question and return structured JSON.

DO NOT answer the question.

Available intents:

1. course_schedule
2. section_schedule
3. teacher_schedule
4. room_schedule
5. day_schedule
6. general_routine

Available days:

Saturday
Sunday
Monday
Tuesday
Wednesday
Thursday
Friday


Rules:

- Course must be normalized like CSE221.
- Section should be returned exactly if possible.
- Teacher should be returned exactly as mentioned.
- Room should be returned like KT-218.
- If the user asks for the complete routine, use general_routine.
- Return ONLY valid JSON.
- Do not use markdown.
- Do not add explanations.


Examples:


User:
CSE 221 er class kobe?

Output:
{
  "intent": "course_schedule",
  "course": "CSE221"
}


User:
68_M er routine dao

Output:
{
  "intent": "section_schedule",
  "section": "68_M"
}


User:
MRC sir er class gula dao

Output:
{
  "intent": "teacher_schedule",
  "teacher": "MRC"
}


User:
Saturday er routine dao

Output:
{
  "intent": "day_schedule",
  "day": "Saturday"
}


User:
KT-218 e ki class hoy?

Output:
{
  "intent": "room_schedule",
  "room": "KT-218"
}


User:
routine ta dao

Output:
{
  "intent": "general_routine"
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
            "Routine Query:",
            parsedQuery
        );


        // ========================================================
        // EXECUTE ROUTINE QUERY
        // ========================================================

        const result =
            executeRoutineQuery(
                parsedQuery
            );


        console.log(
            "Routine Result:",
            result
        );


        // ========================================================
        // FORMAT ROUTINE RESULT
        // ========================================================

        const answer =
            formatRoutineResult(
                parsedQuery,
                result
            );


        console.log(
            "Routine Answer:",
            answer
        );


        // ========================================================
        // RETURN
        // ========================================================

        return {

            ...state,

            aiResponse: answer,

            routineQuery: parsedQuery,

            routineResult: result,

            artifacts: [],

        };


    } catch (error) {

        console.error(
            "Routine Agent Error:",
            error
        );


        return {

            ...state,

            aiResponse:
                "Sorry, I couldn't find the routine information.",

            artifacts: [],

        };

    }

};


// ============================================================
// CLEAN LLM JSON
// ============================================================

function cleanJson(content) {

    return content
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

}