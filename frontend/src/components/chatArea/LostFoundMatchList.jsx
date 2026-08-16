import React, { useState } from 'react';
import { Search, MessageSquare, MapPin, CheckCircle, Tag } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addConversation, setConvTitle, setSelectConversation } from '../../redux/conversationSlice';
import { setMessages } from '../../redux/messageSlice';
import { createConversation } from '../../features/createConversation';
import saveDirectMessage from '../../features/saveDirectMessage';
import getMessages from '../../features/getMessages';

const LostFoundMatchList = ({ data }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector(state => state.user || {});
    const matches = data?.matches || [];
    const reportedItem = data?.item;
    const [openingMatchId, setOpeningMatchId] = useState(null);

    const handleOpenChat = async (match) => {
        try {
            setOpeningMatchId(match._id);

            const lostItem = match.lostItem || {};
            const foundItem = match.foundItem || {};
            const isMyLost = match.lostUser === userData?.userId || match.lostUser === userData?.email;

            // Counterparty info — same logic as MentorList uses targetEmail/targetUserId
            const counterpartyUserId = isMyLost ? foundItem.userId : lostItem.userId;
            const counterpartyEmail = isMyLost ? (foundItem.userEmail || foundItem.userId) : (lostItem.userEmail || lostItem.userId);
            const itemTitle = lostItem.item || foundItem.item || "Lost & Found Item";
            const convTitle = `Lost & Found: ${itemTitle}`;

            // 1. Create or retrieve conversation — directly through gateway → chat service
            //    Exactly like MentorList does it
            const conv = await createConversation({
                targetEmail: counterpartyEmail,
                targetUserId: counterpartyUserId,
                title: convTitle,
                isDirectChat: true,
                matchId: match?._id
            });

            if (!conv || !conv._id) return;

            const updatedConv = {
                ...conv,
                title: convTitle,
                isDirectChat: true,
                matchId: match?._id,
                targetEmail: counterpartyEmail
            };

            dispatch(addConversation(updatedConv));
            dispatch(setSelectConversation(updatedConv));
            dispatch(setConvTitle({ conversationId: conv._id, title: convTitle }));

            // 2. Load existing messages
            const msgs = await getMessages(conv._id);
            dispatch(setMessages(msgs || []));

        } catch (error) {
            console.error("Failed to open match chat:", error);
        } finally {
            setOpeningMatchId(null);
        }
    };

    return (
        <div className="w-full max-w-2xl my-4 space-y-4">
            {/* Header Summary */}
            <div className="p-4 rounded-2xl bg-[#131622] border border-white/10 shadow-lg">
                <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-sm">
                    <Search size={18} />
                    <span>DIU Lost & Found Matching Engine</span>
                </div>
                {reportedItem && (
                    <div className="mt-2 pt-2 border-t border-white/[0.06] text-xs text-slate-300 flex items-center justify-between flex-wrap gap-2">
                        <div>
                            <span className="text-slate-400">Report Registered: </span>
                            <span className="font-semibold text-slate-100 uppercase">{reportedItem.type}</span> - "{reportedItem.item}"
                        </div>
                        <span className="inline-flex items-center gap-1 text-slate-400">
                            <MapPin size={12} className="text-slate-500" /> {reportedItem.location}
                        </span>
                    </div>
                )}
            </div>

            {/* Match Cards List */}
            {matches.length === 0 ? (
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-slate-400 text-sm leading-relaxed">
                    <div className="flex items-center gap-2 text-slate-300 font-medium mb-1">
                        <CheckCircle size={16} className="text-indigo-400" />
                        <span>Report Saved Successfully</span>
                    </div>
                    <p className="text-xs text-slate-400">
                        No matching reports found in the system right now. We will automatically maintain this report in our engine and notify you when a match is found!
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Possible Matches ({matches.length})
                        </span>
                    </div>

                    {matches.map((match, idx) => {
                        const lostItem = match.lostItem || {};
                        const foundItem = match.foundItem || {};
                        const isMyLost = match.lostUser === userData?.userId || match.lostUser === userData?.email;
                        
                        const displayItem = isMyLost ? foundItem : lostItem;
                        const matchScore = match.matchScore || 85;
                        const partnerRole = isMyLost ? "Finder" : "Possible Owner";

                        return (
                            <div
                                key={match._id || idx}
                                className="p-4 rounded-2xl bg-[#141721] border border-white/10 hover:border-emerald-500/30 shadow-xl transition-all duration-200 space-y-3"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                                            {displayItem.type === "found" ? "👜" : "🔍"}
                                        </div>
                                        <div>
                                            <h4 className="text-base font-semibold text-slate-100">
                                                {displayItem.item || lostItem.item || "Matched Item"}
                                            </h4>
                                            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                                                <MapPin size={13} className="text-emerald-400 shrink-0" />
                                                <span>{displayItem.location || lostItem.location || "DIU Campus"}</span>
                                            </p>
                                            {displayItem.description && (
                                                <p className="text-xs text-slate-300 italic mt-1 bg-white/[0.03] px-2 py-1 rounded border border-white/[0.05]">
                                                    "{displayItem.description}"
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Match Score Badge */}
                                    <div className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs shrink-0 shadow-sm shadow-emerald-500/10">
                                        {matchScore}% Match
                                    </div>
                                </div>

                                {/* Reasons */}
                                {match.matchReasons && match.matchReasons.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {match.matchReasons.map((reason, rIdx) => (
                                            <span
                                                key={rIdx}
                                                className="inline-flex items-center gap-1 text-[11px] text-slate-300 bg-white/[0.05] border border-white/[0.08] px-2.5 py-0.5 rounded-md"
                                            >
                                                <Tag size={11} className="text-emerald-400" />
                                                {reason}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Action Bar */}
                                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                                    <span className="text-xs text-slate-400">
                                        Matched with <strong className="text-slate-200">{partnerRole}</strong>
                                    </span>

                                    <button
                                        onClick={() => handleOpenChat(match)}
                                        disabled={openingMatchId === match._id}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 border border-emerald-500/30 shadow-md shadow-emerald-500/20 transition-all duration-150 cursor-pointer disabled:opacity-50"
                                    >
                                        <MessageSquare size={14} />
                                        {openingMatchId === match._id ? "Opening Chat..." : `Chat with ${partnerRole}`}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LostFoundMatchList;
