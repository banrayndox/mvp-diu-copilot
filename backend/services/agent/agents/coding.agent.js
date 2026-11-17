import { getModel } from "../config/llmModels.js";

export const codingAgent = async (state) => {
    try {
        const intentLlm = await getModel("intent");
        const llm = await getModel("coding");

        const subPrompt = `You are a software engineering intent classifier.
Classify the user query into strictly ONE of these categories:
- CODE_GENERATION (User wants to build or generate a project, app, web component, or script)
- CODE_REVIEW (User provided code and wants feedback or review)
- CODE_EXPLANATION (User wants to understand code or algorithm)
- OPTIMIZATION (User wants code optimized or made faster)
- DEBUGGING (User wants to fix a bug or error)
- DOCUMENTATION (User wants docstrings, architecture, or documentation)

Return ONLY the category name.

User Request:
${state.prompt}`;

        const intentResponse = await intentLlm.invoke(subPrompt);
        const intent = intentResponse.content?.trim().toUpperCase();

        if (intent.includes("CODE_GENERATION")) {
            const prompt = `You are a Senior Full-Stack Software Engineer for DIU Copilot.
Generate the requested software project or component.

Standard Web Stack:
- index.html (Clean HTML5, modern semantics)
- style.css (Modern CSS, flex/grid, CSS variables, dark/light theme, clean spacing)
- script.js (Modern ES6+, interactive, bug-free)

If the user explicitly asked for React, Python, C++, Java, or another specific language, provide files appropriate for that language.

Return ONLY a valid JSON object with the following schema:
{
  "files": [
    {
      "name": "index.html",
      "content": "..."
    },
    {
      "name": "style.css",
      "content": "..."
    },
    {
      "name": "script.js",
      "content": "..."
    }
  ]
}

Rules:
- Output MUST be valid JSON only.
- Do not add markdown code blocks like \`\`\`json.
- Do not add explanations before or after.
- Ensure all quotes and newlines in code strings are properly escaped.

User Request:
${state.prompt}`;

            const response = await llm.invoke(prompt);
            let cleaned = response.content?.replace(/```json/gi, "").replace(/```/g, "").trim();

            let data = { files: [] };
            try {
                data = JSON.parse(cleaned);
            } catch (err) {
                console.warn("JSON parse failed on code generation, attempting regex extraction", err);
                const firstBrace = cleaned.indexOf("{");
                const lastBrace = cleaned.lastIndexOf("}");
                if (firstBrace !== -1 && lastBrace !== -1) {
                    try {
                        data = JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
                    } catch (e2) {
                        data = {
                            files: [
                                {
                                    name: "solution.txt",
                                    content: cleaned
                                }
                            ]
                        };
                    }
                }
            }

            return {
                ...state,
                aiResponse: `I have generated the code project for you based on your request. You can inspect the files and view the live preview in the **Artifact panel** on the right.`,
                artifacts: [
                    {
                        id: Date.now(),
                        type: "Project",
                        files: data.files || [],
                        title: state.prompt.slice(0, 45) + (state.prompt.length > 45 ? "..." : "")
                    }
                ]
            };
        } else {
            const prompt = `You are an expert software engineer and computer science mentor at DIU.
User Request Category: ${intent}

Provide a comprehensive, clear, and well-structured response:
# Analysis
## Explanation & Architecture
## Proposed Solution / Code Implementation
## Best Practices & DIU Academic Context

Ensure all code blocks are tagged with syntax highlighting (e.g. \`\`\`javascript, \`\`\`python, \`\`\`cpp).

User Request:
${state.prompt}`;

            const res = await llm.invoke(prompt);
            return {
                ...state,
                aiResponse: res.content || "Code analysis completed.",
                artifacts: []
            };
        }
    } catch (error) {
        console.error("Error from codingAgent:", error);
        return {
            ...state,
            aiResponse: "I encountered an error generating or reviewing your code. Please refine your query and try again.",
            artifacts: []
        };
    }
};
