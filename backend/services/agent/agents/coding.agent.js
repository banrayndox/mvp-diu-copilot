import { getModel } from "../config/llmModels.js";

export const codingAgent = async (state) => {
    try {
        const intentLlm = await getModel("intent");
        const llm = await getModel("coding");
        const subPrompt = 
        `
        You are an intent classifier.
        
        Return only one of these values.
        
        CODE_GENERATION
        CODE_REVIEW
        CODE_EXPLAINATION
        OPTIMIZATION
        CONVERSATION
        DOCUMENTATION

        User Request:
        ${state.prompt}

        `

        const intentResponse = await intentLlm.invoke(subPrompt);
        const intent = intentResponse.content;

        if(intent=="CODE_GENERATION"){
            const prompt = 
            `
            You are senior coding agent.
            Generate the requested project.
            Default stack:
            - HTML
            - CSS
            - JavaScript
            Use React / Next.js / Vue only if explicitly requested.
            Rules:
            - Responsive
            - Modern Ui
            - CSS Variables
            - Flexbox / Grid
            - Smooth Scroll
            - Hover Effect
            - Beautiful spacing
            - Single page unless user asks otherwise
            Return ONLY valid JSON.
            Schema:
            {
            "files" :[
            {
            "name": "index.html",
            "content" : "..."
            },
            {
            "name": "style.css",
            "content":"..."
            },
            {
            "name":"script.js",
            "content":"..."
            }
            ]
            }

            Rules:
            - Output must start with {
            - Output must end with }
            - No markdown
            - No explaination
            - No extra text
            - No \`\`\`
            - Never mention intent

            User Request:
            ${state.prompt}
            `
            const response = await llm.invoke(prompt);
            const data = JSON.parse(response.content)
            return {
                ...state,
                aiResponse : "Code Generated Successfully.",
                artifacts: [
                    {
                        id:  Date.now(),
                        type: "Project",
                        files: data.files || [],
                        title: state.prompt
                    }
                ]
            }
        }else{
        const elsePrompt = 
        `
        This users's request is:
        ${intent}
        Return Markdown only.
        Never Generate project files.
        Use heading like:
        # Overview
        ## Explaination
        ## Problem
        ## Improvement
        ## Best Practices
        ## Optimized Code (if needed)

        User Request:
        ${state.prompt}
        `
        const res = await llm.invoke(elsePrompt);
        const data = res.content;
        return {
            ...state,
            aiResponse : data,
            artifacts: []
        }
        }

        
    } catch (error) {
        console.log(`Error from agent: codingAgent`,error);
    }
}