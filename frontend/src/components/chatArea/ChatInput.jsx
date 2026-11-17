import React, { useState, useRef } from 'react';
import {
    Code2, FileText, Globe, ImageIcon, MessageSquare,
    Paperclip, Presentation, Search, Send, UserCheck, Zap,
    Calendar, BookOpen, FileCheck, Loader2
} from 'lucide-react';
import SendMessage from '../../features/sendMessage';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, setArtifacts } from '../../redux/messageSlice';
import { createConversation } from '../../features/createConversation';
import { addConversation, setConvTitle, setSelectConversation } from '../../redux/conversationSlice';
import { updateConversation } from '../../features/updateConversation';
import saveDirectMessage from '../../features/saveDirectMessage';
import { emitTyping } from '../../utils/socket';

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

    const handleSendMessage = async () => {
        if (!value.trim() || isSending || selectedConversation?.isClosed) return;

        try {
            setIsSending(true);
            const promptText = value.trim();
            setValue("");

            let conversation = selectedConversation;
            if (!conversation) {
                const conv = await createConversation();
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
                // Direct P2P 1-on-1 Message (No AI Agent)
                const messagePayload = {
                    tempId,
                    conversationId: conversation?._id,
                    content: promptText,
                    role: "user",
                    senderId: userData?.userId,
                    senderEmail: userData?.email,
                    createdAt: new Date().toISOString()
                };

                dispatch(addMessage(messagePayload));
                const saved = await saveDirectMessage(messagePayload);
                if (saved && saved._id) {
                    dispatch(addMessage(saved));
                }
            } else {
                // AI Agent Query
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
                    senderId: userData?.userId,
                    senderEmail: userData?.email,
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
            handleSendMessage();
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
                            : `Message DIU Copilot (${selectedAgent} Mode)... (Press Enter to send, Shift+Enter for newline)`
                    }
                    rows={2}
                />

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span>Powered by DIU Copilot Engine</span>
                    </div>

                    <button
                        onClick={handleSendMessage}
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
