import React, { useState, useEffect } from 'react';
import { 
    Coins, 
    LogOut, 
    MessageSquare, 
    PanelLeftIcon, 
    PanelRightIcon, 
    PenSquare, 
    Plus, 
    User, 
    GraduationCap, 
    SearchCheck, 
    Sparkles, 
    Wifi
} from 'lucide-react';
import { getConversations } from '../features/getConversations';
import { useDispatch, useSelector } from 'react-redux';
import { addConversation, setConversations, setSelectConversation } from '../redux/conversationSlice';
import { createConversation } from '../features/createConversation';
import Logout from '../features/logout';
import { setUserData } from '../redux/userSlice';
import { setMessages } from '../redux/messageSlice';
import { getSocket } from '../utils/socket';

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const dispatch = useDispatch();
    const { conversations = [], selectedConversation } = useSelector(state => state.conversation);
    const { userData } = useSelector(state => state?.user);

    const handleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    const fetchConversations = async () => {
        const data = await getConversations();
        if (Array.isArray(data)) {
            dispatch(setConversations(data));
        }
    };

    useEffect(() => {
        fetchConversations();

        // Connect real-time socket events for conversation updates
        const socket = getSocket();
        if (socket) {
            setSocketConnected(socket.connected);
            const onConnect = () => setSocketConnected(true);
            const onDisconnect = () => setSocketConnected(false);
            const onConvUpdate = () => fetchConversations();

            socket.on("connect", onConnect);
            socket.on("disconnect", onDisconnect);
            socket.on("conversation_updated", onConvUpdate);
            socket.on("receive_message", onConvUpdate);

            return () => {
                socket.off("connect", onConnect);
                socket.off("disconnect", onDisconnect);
                socket.off("conversation_updated", onConvUpdate);
                socket.off("receive_message", onConvUpdate);
            };
        }

        // Gentle polling fallback
        const intervalId = setInterval(fetchConversations, 15000);
        return () => clearInterval(intervalId);
    }, [userData?.userId]);

    const handleCreateConversation = async () => {
        try {
            const data = await createConversation();
            if (data?._id) {
                dispatch(addConversation(data));
                dispatch(setSelectConversation(data));
                dispatch(setMessages([]));
            }
        } catch (error) {
            console.error("Error creating conversation:", error);
        }
    };

    const getConvIcon = (conv) => {
        const title = (conv?.title || "").toLowerCase();
        if (title.includes("lost") || title.includes("found") || conv?.matchId) {
            return <SearchCheck size={13} className="text-amber-400" />;
        }
        if (title.includes("mentor") || title.includes("faculty") || title.includes("dr.")) {
            return <GraduationCap size={13} className="text-emerald-400" />;
        }
        return <MessageSquare size={13} className="text-indigo-400" />;
    };

    if (collapsed) {
        return (
            <div className='hidden lg:flex flex-col items-center w-[60px] h-screen bg-[#0d0f14] border-r border-white/[0.06] py-4 gap-2 shrink-0'>
                <button
                    onClick={handleCollapsed}
                    title="Expand sidebar"
                    className='flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-colors duration-150 bg-transparent border-none cursor-pointer'>
                    <PanelRightIcon size={18} />
                </button>

                <button 
                    onClick={handleCreateConversation}
                    title="New Chat"
                    className='flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-700 text-white shadow-md hover:opacity-90 transition-opacity duration-150 border-none cursor-pointer'>
                    <Plus size={18} />
                </button>

                <div className='flex-1 overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-3 flex flex-col items-center gap-1.5 w-full px-2'>
                    {conversations.map((conv, i) => {
                        const isActive = selectedConversation?._id === conv?._id;
                        return (
                            <button 
                                key={conv?._id || i}
                                onClick={() => dispatch(setSelectConversation(conv))}
                                title={conv?.title || "Conversation"}
                                className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150 border cursor-pointer ${
                                    isActive 
                                        ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300" 
                                        : "bg-white/[0.03] border-transparent text-slate-400 hover:bg-white/[0.08] hover:text-slate-200"
                                }`}>
                                {getConvIcon(conv)}
                            </button>
                        );
                    })}
                </div>

                <div className='relative shrink-0 pt-2 border-t border-white/[0.06] w-full flex justify-center'>
                    {userData?.avatar && !imageError ? (
                        <img 
                            className='w-8 h-8 rounded-lg object-cover border border-indigo-500/30'
                            src={userData?.avatar} 
                            alt={userData?.name || "User"} 
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className='w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-300'>
                            <User size={16} />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <aside className='fixed lg:static inset-y-0 left-0 z-50 w-[290px] h-screen shrink-0 bg-[#0d0f14] border-r border-white/[0.06] flex flex-col select-none'>
            {/* Header / Brand */}
            <div className='flex items-center gap-2.5 px-4 h-16 border-b border-white/[0.06] shrink-0'>
                <div 
                    onClick={handleCollapsed}
                    title="Collapse sidebar"
                    className='hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 cursor-pointer'>
                    <PanelLeftIcon size={18} />
                </div>

                <div className='flex items-center gap-2 flex-1 min-w-0'>
                    <div className='w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0'>
                        <GraduationCap size={18} />
                    </div>
                    <div className='flex flex-col min-w-0'>
                        <div className='flex items-center gap-1.5'>
                            <span className='text-[15px] font-bold text-slate-100 tracking-tight truncate'>DIU Copilot</span>
                            <span className='inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 tracking-wider uppercase'>
                                AI
                            </span>
                        </div>
                        <div className='flex items-center gap-1.5 text-[10.5px] text-slate-500 truncate'>
                            <span className={`w-1.5 h-1.5 rounded-full ${socketConnected ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                            <span>{socketConnected ? "Campus Realtime" : "DIU Smart Assistant"}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        dispatch(setSelectConversation(null));
                        dispatch(setMessages([]));
                    }}
                    title="New Empty Canvas"
                    className='flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer'>
                    <PenSquare size={16} />
                </button>
            </div>

            {/* Action Button: New Chat */}
            <div className='px-3 pt-3.5 pb-2 shrink-0'>
                <button
                    onClick={() => {
                        dispatch(setSelectConversation(null));
                        dispatch(setMessages([]));
                    }}
                    className='w-full flex items-center justify-center gap-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl py-2.5 shadow-md shadow-indigo-600/20 border border-indigo-400/20 cursor-pointer transition-all duration-150'>
                    <Plus size={16} /> 
                    New Consultation
                </button>
            </div>

            {/* Conversations Section Header */}
            <div className='px-4 pt-3 pb-1.5 flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase text-slate-400 shrink-0'>
                <span>Conversations</span>
                <span className='text-[10px] text-slate-500 font-mono'>{conversations.length}</span>
            </div>

            {/* Conversations List */}
            <div className='flex-1 overflow-y-auto px-2.5 pb-2 space-y-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]'>
                {conversations.length === 0 ? (
                    <div className='px-3 py-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2'>
                        <Sparkles size={20} className='text-slate-600' />
                        <p>No conversations yet.</p>
                        <p className='text-[11px] text-slate-600'>Ask DIU Copilot about courses, routines, mentors, or campus notices.</p>
                    </div>
                ) : (
                    conversations.map((conv, i) => {
                        const isActive = selectedConversation?._id === conv?._id;
                        return (
                            <div 
                                key={conv?._id || i}
                                onClick={() => dispatch(setSelectConversation(conv))}
                                className={`group flex items-center gap-2.5 cursor-pointer px-3 py-2.5 rounded-xl border transition-all duration-150 ${
                                    isActive 
                                        ? "bg-indigo-500/15 border-indigo-500/30 text-slate-100 shadow-sm shadow-indigo-500/10" 
                                        : "bg-transparent border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                                }`}>
                                <div className={`flex items-center justify-center shrink-0 w-7 h-7 rounded-lg transition-colors duration-150 ${
                                    isActive 
                                        ? "bg-indigo-500/20 text-indigo-300" 
                                        : "bg-white/[0.04] text-slate-500 group-hover:text-slate-400"
                                }`}>
                                    {getConvIcon(conv)}
                                </div>
                                <div className='flex-1 min-w-0 flex flex-col'>
                                    <span className={`text-[12.5px] font-medium truncate ${isActive ? "text-slate-100" : "text-slate-300"}`}>
                                        {conv?.title || "New Consultation"}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* User Profile & Footer */}
            <div className='border-t border-white/[0.06] p-3 shrink-0 bg-[#0a0c10]'>
                {userData ? (
                    <div className='flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]'>
                        <div className='relative shrink-0'>
                            {userData?.avatar && !imageError ? (
                                <img 
                                    className='w-9 h-9 rounded-xl object-cover border border-indigo-500/30'
                                    src={userData?.avatar} 
                                    alt={userData?.name || "Student Profile"} 
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className='w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center'>
                                    <User size={18} />
                                </div>
                            )}
                            <span className='absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0a0c10] rounded-full' />
                        </div>
                        <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-1.5'>
                                <p className='text-[13px] font-semibold text-slate-100 truncate'>
                                    {userData?.name || "DIU Student"}
                                </p>
                                {userData?.role === 'recruiter_guest' && (
                                    <span className='px-1.5 py-0.2 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded'>
                                        GUEST
                                    </span>
                                )}
                            </div>
                            <p className='text-[10.5px] text-slate-400 truncate'>
                                {userData?.email || "student@diu.edu.bd"}
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                Logout();
                                localStorage.removeItem('diu_guest_user');
                                dispatch(setUserData(null));
                                dispatch(setConversations([]));
                                dispatch(setSelectConversation(null));
                            }}
                            title="Sign out"
                            className='flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors duration-150 bg-transparent border-none cursor-pointer'>
                            <LogOut size={16} />
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={() => window.location.reload()}
                        className='w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-200 bg-white/[0.05] border border-white/[0.08] rounded-xl py-2.5 cursor-pointer hover:bg-white/[0.08] transition-colors duration-150'>
                        Sign In
                    </button>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
