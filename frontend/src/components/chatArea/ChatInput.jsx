import React, { useState, useRef } from 'react';
import {
    Code2, FileText, Globe, ImageIcon, MessageSquare,
    Paperclip, Presentation, Search, Send, UserCheck, Zap,
    Calendar, BookOpen, FileCheck, Loader2, Sparkles, ArrowRight
} from 'lucide-react';
import SendMessage from '../../features/sendMessage';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, setArtifacts } from '../../redux/messageSlice';
import { createConversation } from '../../features/createConversation';
import { addConversation, setConvTitle, setSelectConversation } from '../../redux/conversationSlice';
import { updateConversation } from '../../features/updateConversation';
import saveDirectMessage from '../../features/saveDirectMessage';
import { emitTyping } from '../../utils/socket';

const AGENT_QUICK_TEMPLATES = {
    "Auto": [
        "Show me CSE 221 routine and classroom for section 60_A",
        "Generate a DIU assignment cover page for CSE 221",
        "Find a mentor for React, Node.js and AI Agent systems",
        "Check Lost & Found for Black Dell Laptop Charger in Room 402"
    ],
    "Routine": [
        "Show me CSE 221 routine and classroom for section 60_A",
        "What is the schedule for Algorithm Lab on Thursday?",
        "When is the final exam period for Spring 2026?"
    ],
    "Cover Page": [
        "Generate a DIU assignment cover page for CSE 221 Object Oriented Programming",
        "Create a DIU lab report cover page for CSE 322 Computer Networks",
        "Generate assignment cover for Data Structures Assignment 02"
    ],
    "Mentor": [
        "Find a mentor for React, Node.js and AI Agent systems",
        "I need a faculty advisor in Machine Learning and Computer Vision",
        "Connect me with competitive programming mentors"
    ],
    "Lost & Found": [
        "Check Lost & Found for Black Dell Laptop Charger in Room 402",
        "Report a found DIU Student ID Card at Main Canteen",
        "I lost my scientific calculator in Academic Building 4 Room 302"
    ],
    "Coding": [
        "Write an optimized Dijkstra Shortest Path algorithm in C++",
        "Implement a dynamic Fibonacci DP solution in Python",
        "Create a clean React custom hook for WebSocket connection"
    ],
    "QBank": [
        "Find past midterm question paper for Data Structures CSE 215",
        "Show previous semester final questions for Algorithms CSE 221",
        "Download Operating Systems midterm papers"
    ],
    "Chat": [
        "What are the DIU academic probation and retake rules?",
        "How is tuition waiver calculated at DIU for SGPA above 3.8?",
        "What are the morning DIU campus bus routes from Mirpur?"
    ],
    "PDF": [
        "Summarize syllabus for Computer Networks CSE 322",
        "Generate PDF checklist for DIU graduation clearance"
    ],
    "PPT": [
        "Create 5 slide outline on Agentic AI Systems in University Campuses"
    ],
    "Web Search": [
        "Search DIU Daffodil Smart City campus notices and upcoming events"
    ]
};

const ChatInput = () => {
    const dispatch = useDispatch();
    const { selectedConversation } = useSelector(state => state.conversation);
    const { userData } = useSelector(state => state.user);
    const [value, setValue] = useState("");
    const [selectedAgent, setSelectedAgent] = useState("Auto");
    const [isSending, setIsSending] = useState(false);
    const typingTimeoutRef = useRef(null);

    const handleTypingChange = (e) => {
        setValue(e.target.value);
        if (selectedConversation?._id) {
            emitTyping(selectedConversation._id, true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                emitTyping(selectedConversation._id, false);
            }, 1500);
        }
    };

    const handleSendMessageWithText = async (textToSend) => {
        const promptText = (textToSend !== undefined ? textToSend : value).trim();
        if (!promptText || isSending || selectedConversation?.isClosed) return;

        try {
            setIsSending(true);
            if (textToSend === undefined) {
                setValue("");
            }

            let conversation = selectedConversation;
            if (!conversation) {
                const conv = await createConversation({ title: promptText.slice(0, 35) });
                if (conv) {
                    dispatch(setSelectConversation(conv));
                    dispatch(addConversation(conv));
                    conversation = conv;
                }
            }

            if (conversation?.title === "New Chat") {
                const truncatedTitle = promptText.slice(0, 40);
                await updateConversation({ id: conversation?._id, title: truncatedTitle });
                dispatch(setConvTitle({ conversationId: conversation._id, title: truncatedTitle }));
            }

            const isDirect = conversation?.isDirectChat ||
                conversation?.targetEmail ||
                conversation?.targetUserId ||
                conversation?.matchId ||
                conversation?.title?.startsWith("Chat with") ||
                conversation?.title?.includes("Lost & Found");

            const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

            if (isDirect) {
                const messagePayload = {
                    tempId,
                    conversationId: conversation?._id,
                    content: promptText,
                    role: "user",
                    senderId: userData?.userId || "recruiter_guest",
                    senderEmail: userData?.email || "recruiter.guest@diu.edu.bd",
                    createdAt: new Date().toISOString()
                };

                dispatch(addMessage(messagePayload));
                const saved = await saveDirectMessage(messagePayload);
                if (saved && saved._id) {
                    dispatch(addMessage(saved));
                }
            } else {
                const agentKey = selectedAgent.toLowerCase().replace(/\s+/g, "");
                const payload = {
                    prompt: promptText,
                    conversationId: conversation?._id,
                    agent: agentKey === "auto" ? "auto" : agentKey,
                    tempId
                };

                dispatch(addMessage({
                    tempId,
                    conversationId: conversation?._id,
                    role: "user",
                    content: promptText,
                    senderId: userData?.userId || "recruiter_guest",
                    senderEmail: userData?.email || "recruiter.guest@diu.edu.bd",
                    createdAt: new Date().toISOString()
                }));

                const data = await SendMessage(payload);
                if (data) {
                    if (data.artifacts && data.artifacts.length > 0) {
                        dispatch(setArtifacts(data.artifacts));
                    }
                    if (data.message) {
                        dispatch(addMessage(data.message));
                    } else if (data.answer) {
                        dispatch(addMessage({
                            role: "assistant",
                            content: data.answer,
                            images: data.images || [],
                            conversationId: conversation?._id,
                            createdAt: new Date().toISOString()
                        }));
                    }
                }
            }

            if (selectedConversation?._id) {
                emitTyping(selectedConversation._id, false);
            }

        } catch (error) {
            console.error("Error in handleSendMessage:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessageWithText();
        }
    };

    const agents = [
        { id: "auto", icon: Zap, label: "Auto" },
        { id: "chat", icon: MessageSquare, label: "Chat" },
        { id: "routine", icon: Calendar, label: "Routine" },
        { id: "mentor", icon: UserCheck, label: "Mentor" },
        { id: "lostfound", icon: Search, label: "Lost & Found" },
        { id: "coverpage", icon: FileCheck, label: "Cover Page" },
        { id: "questionbank", icon: BookOpen, label: "QBank" },
        { id: "coding", icon: Code2, label: "Coding" },
        { id: "pdf", icon: FileText, label: "PDF" },
        { id: "ppt", icon: Presentation, label: "PPT" },
        { id: "search", icon: Globe, label: "Web Search" }
    ];

    const currentTemplates = AGENT_QUICK_TEMPLATES[selectedAgent] || AGENT_QUICK_TEMPLATES["Auto"];

    return (
        <div className="w-full px-3 md:px-5 py-3 border-t border-white/[0.06] bg-[#0d0f14]">
            <div className="flex flex-col gap-2.5 bg-[#12151f] border border-white/[0.08] rounded-2xl px-4 pt-3 pb-3 focus-within:border-indigo-500/40 transition-colors shadow-lg">

                {/* Agent Selector Pills */}
                <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
                    {agents.map((agent) => {
                        const isActive = selectedAgent === agent.label;
                        const Icon = agent.icon;
                        return (
                            <button
                                key={agent.id}
                                type="button"
                                onClick={() => setSelectedAgent(agent.label)}
                                className={`flex-shrink-0 cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                    isActive
                                        ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-[0_1px_8px_rgba(99,102,241,.35)]"
                                        : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.06] hover:text-slate-200"
                                }`}
                            >
                                <Icon size={13} className={isActive ? "text-white" : "text-slate-400"} />
                                <span>{agent.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Quick Feature Template Chips (One-click execution, no typing required) */}
                <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-0.5 pb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                        <Sparkles size={11} className="text-amber-400" />
                        Templates:
                    </span>
                    {currentTemplates.map((templateText, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessageWithText(templateText)}
                            title="Click to run this template prompt immediately"
                            className="flex-shrink-0 cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-300 bg-white/[0.04] hover:bg-indigo-500/15 border border-white/[0.07] hover:border-indigo-500/35 hover:text-white transition-all shadow-sm"
                        >
                            <span className="truncate max-w-[210px] md:max-w-[280px]">{templateText}</span>
                            <ArrowRight size={10} className="text-indigo-400" />
                        </button>
                    ))}
                </div>

                {/* Input Textarea */}
                <textarea
                    value={value}
                    onChange={handleTypingChange}
                    onKeyDown={handleKeyDown}
                    disabled={selectedConversation?.isClosed || isSending}
                    className="w-full bg-transparent outline-none resize-none text-[14px] text-slate-100 placeholder:text-slate-500 leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden disabled:opacity-50 min-h-[50px] max-h-[160px]"
                    placeholder={
                        selectedConversation?.isClosed
                            ? "This conversation is resolved and closed."
                            : `Message DIU Copilot (${selectedAgent} Mode)... Click any template above or type here`
                    }
                    rows={2}
                />

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-medium">DIU Copilot Multi-Agent Engine</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-[11px] text-emerald-400 font-semibold">1-Click Demo Ready</span>
                    </div>

                    <button
                        onClick={() => handleSendMessageWithText()}
                        disabled={!value.trim() || isSending || selectedConversation?.isClosed}
                        className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-150 cursor-pointer ${
                            value.trim() && !isSending && !selectedConversation?.isClosed
                                ? "bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-md shadow-indigo-500/25"
                                : "cursor-not-allowed text-slate-600 bg-white/[0.04]"
                        }`}
                        title="Send message"
                    >
                        {isSending ? (
                            <Loader2 size={15} className="animate-spin text-indigo-400" />
                        ) : (
                            <Send size={15} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInput;
