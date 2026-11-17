import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MessageBubble from './MessageBubble';
import CoverPage from '../CoverPage';
import MentorList from './MentorList';
import LostFoundMatchList from './LostFoundMatchList';
import { 
    GraduationCap, Sparkles, BookOpen, Search, UserCheck, Calendar, 
    FileCheck, Code2, Bus, ArrowRight, Play, CheckCircle2 
} from 'lucide-react';
import SendMessage from '../../features/sendMessage';
import { createConversation } from '../../features/createConversation';
import { addConversation, setConvTitle, setSelectConversation } from '../../redux/conversationSlice';
import { addMessage, setArtifacts } from '../../redux/messageSlice';

const FEATURE_TEMPLATES = [
    {
        category: "routine",
        categoryLabel: "Routine",
        badge: "Live Schedule DB",
        badgeColor: "bg-blue-500/15 text-blue-300 border-blue-500/30",
        icon: Calendar,
        iconBg: "from-blue-600/20 to-indigo-600/20 text-blue-400 border-blue-500/30",
        agent: "routine",
        title: "CSE 221 Routine & Room",
        prompt: "Show me CSE 221 routine and classroom for section 60_A"
    },
    {
        category: "coverpage",
        categoryLabel: "Cover Page",
        badge: "Interactive Canvas & PDF",
        badgeColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
        icon: FileCheck,
        iconBg: "from-indigo-600/20 to-violet-600/20 text-indigo-400 border-indigo-500/30",
        agent: "coverpage",
        title: "DIU Assignment Cover Page",
        prompt: "Generate a DIU assignment cover page for CSE 221 Object Oriented Programming"
    },
    {
        category: "mentor",
        categoryLabel: "Mentors",
        badge: "Vector Profile Matching",
        badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        icon: UserCheck,
        iconBg: "from-emerald-600/20 to-teal-600/20 text-emerald-400 border-emerald-500/30",
        agent: "mentor",
        title: "Find React & AI Faculty Mentor",
        prompt: "Find a mentor for React, Node.js and AI Agent systems"
    },
    {
        category: "lostfound",
        categoryLabel: "Lost & Found",
        badge: "Automated Case Resolver",
        badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        icon: Search,
        iconBg: "from-amber-600/20 to-orange-600/20 text-amber-400 border-amber-500/30",
        agent: "lostfound",
        title: "Laptop Charger Match Lookup",
        prompt: "Check Lost & Found for Black Dell Laptop Charger in Room 402"
    },
    {
        category: "coding",
        categoryLabel: "Algorithms",
        badge: "Monaco Artifact Sandbox",
        badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
        icon: Code2,
        iconBg: "from-purple-600/20 to-pink-600/20 text-purple-400 border-purple-500/30",
        agent: "coding",
        title: "Dijkstra Algorithm in C++",
        prompt: "Write an optimized Dijkstra Shortest Path algorithm in C++"
    },
    {
        category: "qbank",
        categoryLabel: "Question Bank",
        badge: "Library Archives",
        badgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/30",
        icon: BookOpen,
        iconBg: "from-rose-600/20 to-red-600/20 text-rose-400 border-rose-500/30",
        agent: "questionbank",
        title: "Algorithms Past Midterm Papers",
        prompt: "Find past midterm question paper for Data Structures CSE 215"
    },
    {
        category: "academic",
        categoryLabel: "Academic Rules",
        badge: "Tuition Waiver & CGPA",
        badgeColor: "bg-teal-500/15 text-teal-300 border-teal-500/30",
        icon: GraduationCap,
        iconBg: "from-teal-600/20 to-emerald-600/20 text-teal-400 border-teal-500/30",
        agent: "auto",
        title: "CGPA & Waiver Calculator",
        prompt: "How is tuition waiver calculated at DIU for SGPA above 3.8?"
    },
    {
        category: "transport",
        categoryLabel: "Campus Transport",
        badge: "DSC Bus Schedule",
        badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
        icon: Bus,
        iconBg: "from-cyan-600/20 to-blue-600/20 text-cyan-400 border-cyan-500/30",
        agent: "auto",
        title: "Mirpur & Uttara Campus Buses",
        prompt: "What are the morning DIU campus bus routes and pickup times from Mirpur?"
    }
];

const CATEGORIES = [
    { id: "all", label: "All Highlights" },
    { id: "routine", label: "Routine" },
    { id: "coverpage", label: "Cover Page" },
    { id: "mentor", label: "Mentors" },
    { id: "lostfound", label: "Lost & Found" },
    { id: "coding", label: "Coding" },
    { id: "qbank", label: "QBank" },
    { id: "academic", label: "Waiver & Fees" }
];

const MessageList = () => {
    const dispatch = useDispatch();
    const { selectedConversation } = useSelector(state => state.conversation);
    const { messages } = useSelector(state => state.message);
    const { userData } = useSelector(state => state.user);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [executingPrompt, setExecutingPrompt] = useState(null);

    const handleQuickQuery = async (queryText, agent = "auto") => {
        try {
            setExecutingPrompt(queryText);
            let conv = selectedConversation;
            if (!conv) {
                conv = await createConversation({ title: queryText.slice(0, 35) });
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
                    senderId: userData?.userId || "recruiter_guest",
                    senderEmail: userData?.email || "recruiter.guest@diu.edu.bd",
                    createdAt: new Date().toISOString()
                }));

                const data = await SendMessage({
                    prompt: queryText,
                    conversationId: conv._id,
                    agent: agent || "auto",
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
        } finally {
            setExecutingPrompt(null);
        }
    };

    const filteredTemplates = selectedCategory === "all"
        ? FEATURE_TEMPLATES
        : FEATURE_TEMPLATES.filter(t => t.category === selectedCategory);

    return (
        <div className="flex-1 px-4 md:px-8 py-6 space-y-6">
            {!selectedConversation || messages.length === 0 ? (
                <div className="min-h-[60vh] flex flex-col items-center text-center px-2 py-4">
                    {/* Header Showcase Badge */}
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500/25 via-violet-500/20 to-emerald-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 shadow-2xl shadow-indigo-500/20">
                        <GraduationCap size={32} />
                    </div>

                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
                            DIU Copilot
                        </h1>
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                            Recruiter Showcase
                        </span>
                    </div>

                    <p className="text-sm font-medium text-slate-300 max-w-lg mt-2 leading-relaxed">
                        Intelligent AI-Powered Digital Campus Assistant for Daffodil International University.
                    </p>

                    <p className="text-xs text-slate-400 max-w-md mt-1 leading-relaxed">
                        Click any feature template below to immediately evaluate agent routing, interactive canvas artifacts, real-time responses, and campus databases without manual typing.
                    </p>

                    {/* Category Filter Tabs */}
                    <div className="flex flex-wrap justify-center gap-1.5 mt-6 mb-5 max-w-2xl">
                        {CATEGORIES.map(cat => {
                            const active = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                                        active
                                            ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-md shadow-indigo-500/20"
                                            : "bg-white/[0.03] text-slate-400 border-white/[0.08] hover:text-slate-200 hover:bg-white/[0.06]"
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Feature Showcase Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full max-w-5xl text-left">
                        {filteredTemplates.map((item, idx) => {
                            const Icon = item.icon;
                            const isRunning = executingPrompt === item.prompt;
                            return (
                                <div
                                    key={idx}
                                    onClick={() => !isRunning && handleQuickQuery(item.prompt, item.agent)}
                                    className="group relative flex flex-col justify-between p-4 rounded-2xl bg-[#121520]/80 hover:bg-[#161a29] border border-white/[0.08] hover:border-indigo-500/40 transition-all duration-200 shadow-lg hover:shadow-indigo-500/10 cursor-pointer"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-3">
                                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.iconBg} border flex items-center justify-center`}>
                                                <Icon size={18} />
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.badgeColor}`}>
                                                {item.badge}
                                            </span>
                                        </div>

                                        <h3 className="text-[13.5px] font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                                            {item.title}
                                        </h3>

                                        <p className="text-[11.5px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                            "{item.prompt}"
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.05]">
                                        <span className="text-[10.5px] font-medium text-slate-400">
                                            {item.categoryLabel}
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 group-hover:text-indigo-300">
                                            {isRunning ? "Running..." : "Run Prompt"}
                                            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                        </span>
                                    </div>
                                </div>
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
