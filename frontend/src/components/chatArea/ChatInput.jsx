import React from 'react'
import Navbar from './Navbar'
import MessageList from './MessageList'
import { Code2, FileText, Globe, ImageIcon, MessageSquare, Mic, Paperclip, Presentation, Search, Send, UserCheck, Zap } from 'lucide-react'
import { useState } from 'react'
import SendMessage from '../../features/sendMessage'
import { useDispatch, useSelector } from 'react-redux'
import { addMessage, setArtifacts } from '../../redux/messageSlice'
import { createConversation } from '../../features/createConversation'
import { addConversation, setConvTitle, setSelectConversation } from '../../redux/conversationSlice'
import { updateConversation } from '../../features/updateConversation'



import saveDirectMessage from '../../features/saveDirectMessage'

const ChatInput = () => {
    const dispatch = useDispatch();
    const { selectedConversation } = useSelector(state=>state.conversation); 
    const { messages } = useSelector(state=>state.message);
    const { userData } = useSelector(state=>state.user);
    const [value, setValue] = useState("");
    const [selectedAgent, setSelectedAgent] = useState("Auto");

    const handleSendMessage = async ()=>{
        try {
            let conversation = selectedConversation;
            if(!conversation){
                const conv = await createConversation();
                dispatch(setSelectConversation(conv));
                dispatch(addConversation(conv));
                conversation = conv;
            }

            if(conversation?.title == "New Chat"){
                await updateConversation({id: conversation?._id, title: value.trim() });
                dispatch(setConvTitle({conversationId: conversation._id, title: value.slice(0,40) }));
            }

            const isDirect = conversation?.isDirectChat ||
                             conversation?.targetEmail ||
                             conversation?.targetUserId ||
                             conversation?.matchId ||
                             conversation?.title?.startsWith("Chat with") ||
                             conversation?.title?.includes("Lost & Found");

            if (isDirect) {
                // Direct P2P Messaging - NO AI Agent
                const messagePayload = {
                    conversationId: conversation?._id,
                    content: value,
                    role: "user",
                    senderId: userData?.userId,
                    senderEmail: userData?.email
                };

                dispatch(addMessage(messagePayload));
                const textToSend = value;
                setValue("");

                await saveDirectMessage({
                    ...messagePayload,
                    content: textToSend
                });
            } else {
                // AI Agent Chat
                const payload = {
                    prompt: value,
                    conversationId: conversation?._id,
                    agent: selectedAgent.toLowerCase()
                };
                dispatch(addMessage({
                    role: "user",
                    content: value,
                    senderId: userData?.userId,
                    senderEmail: userData?.email
                }));

                setValue("");

                const data = await SendMessage(payload);
                dispatch(setArtifacts(data.artifacts || []));
                dispatch(addMessage({ role: "assistant", content: data.answer, images: data.images }));
            }

        } catch (error) {
            console.log(error);
        }
    }


    const agents = [
        {
            id: "auto",
            icon: Zap,
            label: "Auto"
        },
        {
            id: "chat",
            icon: MessageSquare,
            label: "Chat"
        },
        {
            id: "lostfound",
            icon: Search,
            label: "LostFound"
        },
        {
            id: "mentor",
            icon: UserCheck,
            label: "Mentor"
        },
        {
            id: "coding",
            icon: Code2,
            label: "Coding"
        },
        {
            id: "pdf",
            icon: FileText,
            label: "PDF"
        },
        {
            id: "ppt",
            icon: Presentation,
            label: "PPT"
        },
        {
            id: "image",
            icon: ImageIcon,
            label: "Image"
        },
        {
            id: "search",
            icon: Globe,
            label: "Search"
        },
    ];
  return (
    <div className='w-full overflow-hidden px-3 md:px-5 py-5 border-t border-white/[0.06] bg-[#0d0r14]'>
        <div className='flex flex-col gap-2 bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 pt-3.5 pb-3'>

            <div className='flex w-[80%] gap-2 pr-2 flex-wrap'>
                {
                    agents.map((agent)=>{
                        const isActive = selectedAgent===agent.label;
                        const Icon = agent.icon;
                        return(
                            <div
                            onClick={()=>setSelectedAgent(agent.label)}
                             className={`flex-shrink-0 cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-all
                            ${
                                isActive ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-[0_1px_8px_rgba(99,102,241,.35)]" : "bg-white/-[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.07]"
                            }`}>
                                <Icon size={14}
                                className={
                                    isActive ? "text-white" : "text-slate-500"
                                } />
                                {agent.label}
                            </div>
                        )
                    })
                }
            </div>

            <textarea 
            value={value}
            onChange={(e)=>setValue(e.target.value)}
            disabled={selectedConversation?.isClosed}
            className='w-full bg-transparent outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-600 leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden disabled:opacity-50'
            placeholder={selectedConversation?.isClosed ? 'Conversation closed (Item returned)' : 'Ask anything...'}
            rows={3}
            />
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-1'>
                    <button disabled={selectedConversation?.isClosed} className='flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400
                    hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06]
                    transition-all duration-150 bg-transparent cursor-pointer disabled:opacity-50'>
                        <Paperclip size={16}/>
                    </button>
                    <button disabled={selectedConversation?.isClosed} className='flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400
                    hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06]
                    transition-all duration-150 bg-transparent cursor-pointer disabled:opacity-50'>
                        <Mic size={16} />
                    </button>
                </div>
                <button 
                onClick={handleSendMessage}
                disabled={!value || selectedConversation?.isClosed}
                className={`flex items-center justify-center w-8 h-8 border-none cursor-pointer rounded-lg transition-all duration-150 ${ value.trim() && !selectedConversation?.isClosed ?"bg-linear-to-br from-indigo-500 to-violet-700 hover:opacity-90 text-white" :"cursor-not-allowed text-slate-600 bg-white/[0.05]"}`}>
                    <Send size={15} />
                </button>
            </div>
        </div>
    </div>
  )
}

export default ChatInput
