import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MessageBubble from './MessageBubble';
import CoverPage from '../CoverPage';
import MentorList from './MentorList';
import LostFoundMatchList from './LostFoundMatchList';
import { GraduationCap, Sparkles, BookOpen, Search, UserCheck, Calendar, FileCheck } from 'lucide-react';
import SendMessage from '../../features/sendMessage';
import { createConversation } from '../../features/createConversation';
import { addConversation, setConvTitle, setSelectConversation } from '../../redux/conversationSlice';
import { addMessage, setArtifacts } from '../../redux/messageSlice';

const MessageList = () => {
    const dispatch = useDispatch();
    const { selectedConversation } = useSelector(state => state.conversation);
    const { messages } = useSelector(state => state.message);
    const { userData } = useSelector(state => state.user);

    const starterQueries = [
        { label: "CSE 221 Routine", icon: Calendar, query: "Show me CSE 221 routine" },
        { label: "DIU Cover Page", icon: FileCheck, query: "Generate a DIU assignment cover page for CSE 221 Object Oriented Programming" },
        { label: "Algorithm Questions", icon: BookOpen, query: "Find question paper for Algorithm CSE semester 4" },
        { label: "Find Mentor", icon: UserCheck, query: "Find a mentor for React and Python" },
        { label: "Report Lost Item", icon: Search, query: "I lost my student ID card near library" }
    ];

    const handleQuickQuery = async (queryText) => {
        try {
            let conv = selectedConversation;
            if (!conv) {
                conv = await createConversation();
                if (conv) {
                    dispatch(setSelectConversation(conv));
                    dispatch(addConversation(conv));
                }
            }

            if (conv) {
                const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
                dispatch(setConvTitle({ conversationId: conv._id, title: queryText.slice(0, 35) }));
                dispatch(addMessage({
                    tempId,
                    conversationId: conv._id,
                    role: "user",
                    content: queryText,
                    senderId: userData?.userId,
                    senderEmail: userData?.email,
                    createdAt: new Date().toISOString()
                }));

                const data = await SendMessage({
                    prompt: queryText,
                    conversationId: conv._id,
                    agent: "auto",
                    tempId
                });

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
                            conversationId: conv._id,
                            createdAt: new Date().toISOString()
                        }));
                    }
                }
            }
        } catch (e) {
            console.error("Quick query error:", e);
        }
    };

    return (
        <div className="flex-1 px-4 md:px-8 py-6 space-y-5">
            {!selectedConversation || messages.length === 0 ? (
                <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 py-8">
                    {/* Hero Badge */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 shadow-xl shadow-indigo-500/10">
                        <GraduationCap size={28} />
                    </div>

                    <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
                        <span>DIU Copilot</span>
                        <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/15 border border-indigo-500/25 px-2 py-0.5 rounded-full">
                            Campus AI
                        </span>
                    </h1>

                    <p className="text-sm font-medium text-slate-400 max-w-md mt-1.5 leading-relaxed">
                        Your official intelligent assistant for Daffodil International University.
                    </p>

                    <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                        Ask about course routines, past question papers, assignment cover pages, mentors, or report lost items.
                    </p>

                    {/* Quick Suggestion Pills */}
                    <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-xl">
                        {starterQueries.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleQuickQuery(item.query)}
                                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 bg-white/[0.04] border border-white/[0.08] hover:bg-indigo-500/15 hover:border-indigo-500/30 hover:text-white transition-all duration-150 cursor-pointer shadow-sm"
                                >
                                    <Icon size={13} className="text-indigo-400" />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="space-y-5">
                    {messages.map((msg, i) => {
                        let parsedContent = null;

                        if (typeof msg?.content === "object" && msg?.content !== null) {
                            parsedContent = msg.content;
                        } else if (typeof msg?.content === "string") {
                            try {
                                const cleaned = msg.content.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();
                                parsedContent = JSON.parse(cleaned);
                            } catch (error) {
                                parsedContent = null;
                            }
                        }

                        const stableKey = msg?._id || msg?.tempId || `msg_${i}_${msg?.createdAt || ""}`;
                        return (
                            <div key={stableKey}>
                                {parsedContent?.type === "coverPageData" ? (
                                    <CoverPage data={parsedContent?.data} />
                                ) : parsedContent?.type === "mentorResults" ? (
                                    <MentorList data={parsedContent} />
                                ) : parsedContent?.type === "lostFoundMatchList" ? (
                                    <LostFoundMatchList data={parsedContent} />
                                ) : (
                                    <MessageBubble
                                        role={msg?.role}
                                        content={msg?.content}
                                        images={msg?.images || []}
                                        senderId={msg?.senderId}
                                        senderEmail={msg?.senderEmail}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MessageList;
