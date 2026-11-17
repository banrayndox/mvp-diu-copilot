import { getModel } from "../config/llmModels.js";

export const visionAgent = async (state) => {
    try {
        const llm = await getModel("vision");

        const prompt = `You are the DIU Visual & Architecture Diagram Specialist.
Your task is to analyze the user's technical or academic concept and create an insightful visual explanation with an interactive diagram or flow.

Guidelines:
1. Explain the visual architecture or process clearly.
2. Provide a clean, error-free Mermaid diagram inside a \`\`\`mermaid code block.
3. Also generate an interactive standalone SVG/HTML visual artifact.
4. Keep the visual modern, clean, and styled with high-contrast colors suitable for academic presentation.

User Request:
${state.prompt}`;

        const response = await llm.invoke(prompt);
        const content = response.content || "";
        const title = state.prompt.slice(0, 35) + (state.prompt.length > 35 ? "..." : "");

        return {
            ...state,
            aiResponse: content,
            artifacts: [
                {
                    id: Date.now(),
                    type: "Diagram",
                    title: `Visual: ${title}`,
                    files: [
                        {
                            name: "diagram.md",
                            content: content
                        },
                        {
                            name: "index.html",
                            content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title} - Visual Architecture</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <script>mermaid.initialize({startOnLoad:true, theme: 'dark'});</script>
  <style>
    body { font-family: -apple-system, sans-serif; background: #0b0f19; color: #e2e8f0; padding: 24px; text-align: center; }
    .card { background: #131b2e; border: 1px solid #1e293b; border-radius: 12px; padding: 24px; margin: 20px auto; max-width: 900px; }
  </style>
</head>
<body>
  <h2>DIU Copilot Visual Architecture</h2>
  <div class="card">
    <div style="text-align: left; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
  </div>
</body>
</html>`
                        }
                    ]
                }
            ]
        };
    } catch (error) {
        console.error("Error from visionAgent:", error);
        return {
            ...state,
            aiResponse: "I could not generate the visual diagram. Please try describing your requirement in more detail.",
            artifacts: []
        };
    }
};
