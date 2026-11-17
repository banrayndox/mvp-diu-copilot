import React, { useEffect, useState, useRef } from 'react';
import Navbar from './chatArea/Navbar';
import MessageList from './chatArea/MessageList';
import ChatInput from './chatArea/ChatInput';
import { useDispatch, useSelector } from 'react-redux';
import getMessages from '../features/getMessages';
import { setArtifacts, setMessages, addMessage } from '../redux/messageSlice';
import { getSocket, joinConversation, leaveConversation } from '../utils/socket';
import { Loader2 } from 'lucide-react';

const ChatArea = () => {
    const { selectedConversation } = useSelector(state => state.conversation);
    const { messages } = useSelector(state => state.message);
    const { userData } = useSelector(state => state.user);
    const dispatch = useDispatch();

    const [agentStatus, setAgentStatus] = useState(null);
    const [typingUser, setTypingUser] = useState(null);
    const messagesEndRef = useRef(null);

    // Initial message fetch when switching conversations
    useEffect(() => {
        if (!selectedConversation?._id || selectedConversation.title === "New Chat") {
            dispatch(setMessages([]));
            dispatch(setArtifacts([]));
            return;
        }

        let isMounted = true;
        const fetchChat = async () => {
            const data = await getMessages(selectedConversation._id);
            if (isMounted && Array.isArray(data)) {
                dispatch(setMessages(data));
                const latestArtifactMessage = [...data].reverse().find(m => m.artifacts && m.artifacts.length > 0);
                if (latestArtifactMessage?.artifacts) {
                    dispatch(setArtifacts(latestArtifactMessage.artifacts));
                }
            }
        };

        fetchChat();

        return () => {
            isMounted = false;
        };
    }, [selectedConversation?._id]);

    // Real-Time Socket.IO Integration
    useEffect(() => {
        if (!selectedConversation?._id) return;

        const convId = selectedConversation._id;
        joinConversation(convId);

        const socket = getSocket();

        // Real-Time message listener (idempotently handled by messageSlice)
        const handleReceiveMessage = (msg) => {
            if (msg?.conversationId && String(msg.conversationId) === String(convId)) {
                dispatch(addMessage(msg));

                if (msg.artifacts && msg.artifacts.length > 0) {
                    dispatch(setArtifacts(msg.artifacts));
                }

                if (msg.role === "assistant") {
                    setAgentStatus(null);
                }
            }
        };

        // Agent status updates (thinking, processing)
        const handleAgentStatus = (statusData) => {
            if (statusData?.conversationId && String(statusData.conversationId) === String(convId)) {
                if (statusData.status === "thinking") {
                    setAgentStatus(statusData.message || "DIU Copilot is thinking...");
                } else if (statusData.status === "completed") {
                    setAgentStatus(null);
                }
            }
        };

        // User typing updates in direct chats
        const handleUserTyping = (data) => {
            if (data?.conversationId && String(data.conversationId) === String(convId) && data.userId !== userData?.userId) {
                if (data.isTyping) {
                    setTypingUser(data.userName || "User");
                } else {
                    setTypingUser(null);
                }
            }
        };

        if (socket) {
            socket.on("receive_message", handleReceiveMessage);
            socket.on("agent_status", handleAgentStatus);
            socket.on("user_typing", handleUserTyping);
        }

        // On window focus, gently re-sync messages if needed
        const handleFocus = () => {
            if (convId && selectedConversation?.title !== "New Chat") {
                getMessages(convId).then((data) => {
                    if (Array.isArray(data) && data.length > 0) {
                        dispatch(setMessages(data));
                    }
                }).catch(() => {});
            }
        };
        window.addEventListener("focus", handleFocus);

        return () => {
            leaveConversation(convId);
            if (socket) {
                socket.off("receive_message", handleReceiveMessage);
                socket.off("agent_status", handleAgentStatus);
                socket.off("user_typing", handleUserTyping);
            }
            window.removeEventListener("focus", handleFocus);
        };
    }, [selectedConversation?._id, userData?.userId]);

    // Auto-scroll on new message or status change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length, agentStatus, typingUser]);

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-[#0d0f14] relative">
            <Navbar />

            {/* Scrollable message container */}
            <div className="flex-1 overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex flex-col justify-between">
                <div>
                    <MessageList />

                    {/* Real-time Agent Status indicator */}
                    {agentStatus && (
                        <div className="px-6 py-2">
                            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs shadow-sm">
                                <Loader2 size={14} className="animate-spin text-indigo-400" />
                                <span>{agentStatus}</span>
                            </div>
                        </div>
                    )}

                    {/* Direct Chat Typing indicator */}
                    {typingUser && (
                        <div className="px-6 py-1">
                            <span className="text-xs text-slate-500 italic">
                                {typingUser} is typing...
                            </span>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            <ChatInput />
        </div>
    );
};

export default ChatArea;
