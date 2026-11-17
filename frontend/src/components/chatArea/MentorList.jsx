import React, { useState } from 'react';
import { UserCheck, MessageSquare, Mail, GraduationCap, Award, CheckCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createConversation } from '../../features/createConversation';
import { addConversation, setConvTitle, setSelectConversation } from '../../redux/conversationSlice';
import { addMessage } from '../../redux/messageSlice';
import { updateConversation } from '../../features/updateConversation';
import SendMessage from '../../features/sendMessage';
import saveDirectMessage from '../../features/saveDirectMessage';

const MentorList = ({ data }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector(state => state.user);
    const mentors = data?.mentors || [];
    const query = data?.query || "";
    const [startingChatId, setStartingChatId] = useState(null);

    const handleStartChat = async (mentor) => {
        try {
            setStartingChatId(mentor._id || mentor.email);

            // 1. Create or retrieve conversation with mentor as participant
            const conv = await createConversation({
                targetEmail: mentor.email,
                targetUserId: mentor._id,
                title: `Chat with ${mentor.name}`,
                isDirectChat: true
            });

            if (!conv || !conv._id) return;

            const convTitle = `Chat with ${mentor.name}`;
            const updatedConv = { ...conv, title: convTitle, isDirectChat: true, targetEmail: mentor.email };

            dispatch(addConversation(updatedConv));
            dispatch(setSelectConversation(updatedConv));
            dispatch(setConvTitle({ conversationId: conv._id, title: convTitle }));

            // 2. Send initial greeting message directly (No AI Agent)
            const greetingPrompt = `Hello ${mentor.name}, I found your profile on DIU Mentor Finder and would like to connect regarding mentorship!`;
            const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            
            const messagePayload = {
                tempId,
                conversationId: conv._id,
                content: greetingPrompt,
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

        } catch (error) {
            console.error("Failed to start mentor chat:", error);
        } finally {
            setStartingChatId(null);
        }
    };

    if (!mentors || mentors.length === 0) {
        return (
            <div className="w-full max-w-xl my-3 p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-300">
                <div className="flex items-center gap-2 mb-2 text-indigo-400 font-semibold text-sm">
                    <UserCheck size={18} />
                    <span>DIU Mentor Finder</span>
                </div>
                <p className="text-sm text-slate-400">
                    No mentor found matching "<span className="text-slate-200">{query}</span>". Try searching by name or email (e.g. "Rakib" or "rakib@diu.edu.bd").
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl my-4 space-y-3">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm tracking-wide">
                    <UserCheck size={18} />
                    <span>Top Matching DIU Mentors</span>
                </div>
                <span className="text-xs text-slate-400 bg-white/[0.06] px-2.5 py-1 rounded-full border border-white/[0.08]">
                    {mentors.length} result{mentors.length > 1 ? 's' : ''}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {mentors.map((mentor, index) => (
                    <div
                        key={mentor._id || index}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-[#141721] border border-white/10 hover:border-indigo-500/30 shadow-lg shadow-black/20 transition-all duration-200 gap-4"
                    >
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            {/* Avatar / Initials */}
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-lg shrink-0">
                                {mentor.name ? mentor.name.charAt(0).toUpperCase() : 'M'}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-base font-semibold text-slate-100 truncate">
                                        {mentor.name}
                                    </h3>
                                    {mentor.department && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-300 bg-indigo-500/15 border border-indigo-500/25 px-2 py-0.5 rounded-full">
                                            <GraduationCap size={12} />
                                            {mentor.department} {mentor.batch ? `(${mentor.batch})` : ''}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                    <Mail size={13} className="text-slate-500 shrink-0" />
                                    <span className="truncate">{mentor.email}</span>
                                </div>

                                {mentor.bio && (
                                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pt-0.5">
                                        {mentor.bio}
                                    </p>
                                )}

                                {mentor.skills && mentor.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                                        {mentor.skills.map((skill, sIdx) => (
                                            <span
                                                key={sIdx}
                                                className="text-[11px] text-slate-300 bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 rounded-md"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Chat Button */}
                        <button
                            onClick={() => handleStartChat(mentor)}
                            disabled={startingChatId === (mentor._id || mentor.email)}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 active:from-indigo-600 active:to-violet-700 border border-indigo-500/30 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-150 cursor-pointer shrink-0 disabled:opacity-50"
                        >
                            <MessageSquare size={14} />
                            {startingChatId === (mentor._id || mentor.email) ? "Opening..." : "Chat"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MentorList;
