import { getModel } from "../config/llmModels.js";

export const coverPageAgent = async (state) => {
    try {
        const llm = await getModel("coverPageAgent");

        const extractionPrompt = `
You are a DIU Assignment Cover Page parameter extractor.

Extract the following information from the user's request:

- courseCode
- courseTitle
- topicName
- teacherName
- teacherDesignation
- teacherDept
- name
- id
- section
- semester
- department
- date

Rules:

1. Never invent missing information.
2. If a field is not present in the user's request, return null.
3. courseCode should be a string.
   Example: "CSE 221" -> "CSE 221"
4. courseTitle should contain the course name.
   Example: "Object Oriented Programming" -> "Object Oriented Programming"
5. topicName should contain the assignment/lab/report topic.
6. teacherName should contain the teacher's name.
7. teacherDesignation should contain values such as:
   "Lecturer", "Senior Lecturer", "Assistant Professor", etc.
8. teacherDept should contain the teacher's department.
9. name should contain the student's name.
10. id should contain the student's ID.
11. section should contain the student's section.
12. semester MUST be a number if available.
    Example: "4th semester" -> 4
    Example: "semester 4" -> 4
13. department should be a string such as "CSE".
14. date should be returned as a string if provided.
15. Do not infer or calculate the date.
16. Return ONLY valid JSON.
17. Do not use markdown.
18. Do not add any explanation.

Schema:

{
    "courseCode": null,
    "courseTitle": null,
    "topicName": null,
    "teacherName": null,
    "teacherDesignation": null,
    "teacherDept": null,
    "name": null,
    "id": null,
    "section": null,
    "semester": null,
    "department": null,
    "date": null
}

User Request:
${state.prompt}
`;

        const extractionResponse = await llm.invoke(extractionPrompt);

        const content = extractionResponse.content;

        // In case LLM returns ```json ... ```
        const cleanedContent = content
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const params = JSON.parse(cleanedContent);

        console.log("Cover Page Parameters:", params);

        return {
            ...state,

            aiResponse: JSON.stringify(
                {
                    type: "coverPageData",
                    data: params
                },
                null,
                2
            ),

            artifacts: []
        };

    } catch (error) {

        console.error(
            "Error from agent: coverPageAgent",
            error
        );

        return {
            ...state,

            aiResponse: JSON.stringify({
                type: "coverPageData",
                data: {
                    courseCode: null,
                    courseTitle: null,
                    topicName: null,
                    teacherName: null,
                    teacherDesignation: null,
                    teacherDept: null,
                    name: null,
                    id: null,
                    section: null,
                    semester: null,
                    department: null,
                    date: null
                }
            }),

            artifacts: []
        };
    }
};