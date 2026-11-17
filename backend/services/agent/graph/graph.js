import { StateGraph } from "@langchain/langgraph";
import { agentState } from "./state.js";
import { router } from "./router.js";
import { chatAgent } from "../agents/chat.agent.js";
import { codingAgent } from "../agents/coding.agent.js";
import { visionAgent } from "../agents/vision.agent.js";
import { searchAgent } from "../agents/search.agent.js";
import { pdfAgent } from "../agents/pdf.agent.js";
import { pptAgent } from "../agents/ppt.agent.js";
import { qBankAgent } from "../agents/qBank.agent.js";
import { coverPageAgent } from "../agents/coverPage.agent.js";
import { routineAgent } from "../agents/routine.agent.js";
import { mentorAgent } from "../agents/mentor.agent.js";
import { lostFoundAgent } from "../agents/lostFound.agent.js";
import { studentPortalAgent } from "../agents/studentPortal.agent.js";
const workflow = new StateGraph(agentState)
workflow.addNode("router", router);
workflow.addNode("chat",chatAgent);
workflow.addNode("search", searchAgent);
workflow.addNode("pdf", pdfAgent);
workflow.addNode("ppt", pptAgent);
workflow.addNode("coding", codingAgent);
workflow.addNode("vision", visionAgent);
workflow.addNode("questionbank", qBankAgent);
workflow.addNode("coverpage", coverPageAgent);
workflow.addNode("routine", routineAgent);
workflow.addNode("mentor", mentorAgent);
workflow.addNode("lostfound", lostFoundAgent);
workflow.addNode("studentPortal",studentPortalAgent
);
workflow.addEdge("__start__", "router");

workflow.addConditionalEdges("router", (state)=>{
        switch(state.agent){
            case "chat":
                return "chat"
            case "search":
                return "search"
            case "coding":
                return "coding"
            case "pdf":
                return "pdf"
            case "ppt":
                return "ppt"
            case "vision":
                return "vision"
            case "questionbank":
                return "questionbank"
            case "coverpage":
                return "coverpage"
            case "routine":
                return "routine"
            case "mentor":
                return "mentor"
            case "lostfound":
                return "lostfound"
            case "studentPortal":
                return "studentPortal"
            default:
                return "chat"
        }
}, {
    chat: "chat",
    search: "search",
    coding: "coding",
    pdf: "pdf",
    ppt: "ppt",
    vision: "vision",
    questionbank: "questionbank",
    coverpage: "coverpage",
    routine: "routine",
    mentor: "mentor",
    lostfound: "lostfound",
    studentPortal: "studentPortal"
});
workflow.addEdge("search","chat");
workflow.addEdge("chat", "__end__");
workflow.addEdge("coding", "__end__");
workflow.addEdge("pdf", "__end__");
workflow.addEdge("ppt", "__end__");
workflow.addEdge("vision", "__end__");
workflow.addEdge("questionbank", "__end__");
workflow.addEdge("coverpage", "__end__");
workflow.addEdge("routine", "__end__");
workflow.addEdge("mentor", "__end__");
workflow.addEdge("lostfound", "__end__");
workflow.addEdge("studentPortal","__end__");
export const graph = workflow.compile();
