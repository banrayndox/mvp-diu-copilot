import { getModel } from "../config/llmModels.js";

export const pptAgent = async (state) => {
    try {
        const llm = await getModel("ppt");

        const prompt = `You are the DIU Presentation & PPT Specialist.
Your task is to create a complete, professional, multi-slide academic presentation deck for DIU university students/faculty based on the user's topic.

Structure your response into clean slides:
# Slide 1: [Title Slide with Topic, Course, and DIU Affiliation]
- Subtitle / Presenter details
- Presentation Objective

# Slide 2: [Introduction & Problem Statement]
- Bullet point 1
- Bullet point 2
- Bullet point 3

# Slide 3: [Core Concepts / Methodology]
- Key mechanisms
- Real-world application

# Slide 4: [Analysis & Findings]
- Data points / comparison table
- Key insights

# Slide 5: [Conclusion & Future Scope]
- Summary
- Q&A invitation

For each slide, also provide brief Speaker Notes:
> Speaker Note: What the student should say during this slide.

User Request:
${state.prompt}`;

        const response = await llm.invoke(prompt);
        const pptContent = response.content || "";
        const title = state.prompt.slice(0, 35) + (state.prompt.length > 35 ? "..." : "");

        return {
            ...state,
            aiResponse: pptContent,
            artifacts: [
                {
                    id: Date.now(),
                    type: "Presentation",
                    title: `Slides: ${title}`,
                    files: [
                        {
                            name: "presentation.md",
                            content: pptContent
                        },
                        {
                            name: "index.html",
                            content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title} - Slides</title>
  <style>
    body { font-family: -apple-system, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
    .deck { display: flex; flex-direction: column; gap: 24px; max-width: 800px; margin: 0 auto; }
    .slide { background: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 32px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); }
    h1, h2 { color: #818cf8; margin-top: 0; }
    ul { padding-left: 20px; line-height: 1.8; color: #cbd5e1; }
    blockquote { border-left: 3px solid #6366f1; margin: 20px 0 0 0; padding-left: 16px; color: #94a3b8; font-style: italic; }
  </style>
</head>
<body>
  <div class="deck">
    <div style="text-align: center; margin-bottom: 12px;">
      <h2 style="color: #6366f1; margin: 0;">DIU Academic Presentation Deck</h2>
      <p style="color: #94a3b8; font-size: 14px;">Daffodil International University</p>
    </div>
    <div class="slide">
      <div style="white-space: pre-wrap; font-size: 15px;">${pptContent.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
    </div>
  </div>
</body>
</html>`
                        }
                    ]
                }
            ]
        };
    } catch (error) {
        console.error("Error from pptAgent:", error);
        return {
            ...state,
            aiResponse: "I encountered an error preparing your presentation slides. Please try again.",
            artifacts: []
        };
    }
};
