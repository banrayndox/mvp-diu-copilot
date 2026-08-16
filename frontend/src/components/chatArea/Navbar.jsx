import React, { useState } from 'react';
import { MessageSquare, CheckCircle, PackageCheck, AlertCircle, XCircle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { confirmReturn } from '../../features/confirmReturn';
import { rejectMatch } from '../../features/rejectMatch';
import { setSelectConversation } from '../../redux/conversationSlice';

const Navbar = () => {
    const dispatch = useDispatch();
    const { selectedConversation } = useSelector(state => state.conversation);
    const { messages } = useSelector(state => state.message);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState(null);

    const isLostFoundChat = selectedConversation?.title?.toLowerCase().includes("lost & found") || selectedConversation?.matchId;
    const isClosed = selectedConversation?.isClosed;

    const handleConfirmReturn = async () => {
        try {
            setLoading(true);
            const matchId = selectedConversation?.matchId;
            if (!matchId) return;

            const res = await confirmReturn(matchId);
            if (res?.success) {
                if (res.isFullyResolved) {
                    setStatusMsg("✓ Item Returned! Both users confirmed and case is now resolved.");
                    dispatch(setSelectConversation({
                        ...selectedConversation,
                        isClosed: true
                    }));
                } else {
                    setStatusMsg("Return confirmation saved! Waiting for partner confirmation.");
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setShowConfirmModal(false);
        }
    };

    const handleRejectMatch = async () => {
        try {
            const matchId = selectedConversation?.matchId;
            if (!matchId) return;
            await rejectMatch(matchId);
            setStatusMsg("Match rejected. Items remain active in Lost & Found.");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            {selectedConversation && (
                <div className="flex flex-col border-b border-white/[0.06] bg-[#0d0f14]">
                    <div className="h-14 flex items-center justify-between px-5">
                        <div className="flex items-center gap-2.5">
                            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                <MessageSquare size={13} className="text-indigo-400" />
                            </div>
                            <div className="text-[14px] font-semibold text-slate-100 tracking-tight">
                                {selectedConversation?.title || "New Chat"}
                            </div>
                            <div className="text-[10px] font-medium text-slate-600 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full">
                                {messages?.length} messages
                            </div>
                        </div>

                        {/* Lost & Found Actions */}
                        {isLostFoundChat && !isClosed && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowConfirmModal(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 border border-emerald-500/30 shadow-md cursor-pointer transition"
                                >
                                    <PackageCheck size={14} />
                                    Mark Item as Returned
                                </button>
                                <button
                                    onClick={handleRejectMatch}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-white/[0.05] border border-white/[0.06] cursor-pointer transition"
                                >
                                    <XCircle size={13} />
                                    Reject Match
                                </button>
                            </div>
                        )}

                        {isClosed && (
                            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-xs flex items-center gap-1.5">
                                <CheckCircle size={13} />
                                Case Resolved & Closed
                            </div>
                        )}
                    </div>

                    {/* Status Message Banner */}
                    {statusMsg && (
                        <div className="px-5 py-2 bg-emerald-500/10 border-t border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
                            <span>{statusMsg}</span>
                            <button onClick={() => setStatusMsg(null)} className="text-emerald-400 hover:text-emerald-200">×</button>
                        </div>
                    )}
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-[#131622] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center gap-3 text-emerald-400">
                            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <AlertCircle size={22} />
                            </div>
                            <h3 className="text-base font-semibold text-slate-100">Confirm Item Return</h3>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                            Are you sure the item has been returned to its owner?
                            <br /><br />
                            <span className="text-slate-400 italic">
                                Both users must confirm. Once confirmed by both sides, the case will be permanently closed and removed from active search.
                            </span>
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/[0.08]">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-white/[0.06] border border-white/[0.08]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmReturn}
                                disabled={loading}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-md"
                            >
                                {loading ? "Confirming..." : "Yes, Item Returned"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
