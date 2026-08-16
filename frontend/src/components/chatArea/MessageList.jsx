import React from 'react'
import { useSelector } from 'react-redux'
import MessageBubble from './MessageBubble';
import CoverPage from '../CoverPage';
import MentorList from './MentorList';
import LostFoundMatchList from './LostFoundMatchList';

const MessageList = () => {
    const {selectedConversation} = useSelector(state=>state.conversation);
    const {messages} = useSelector (state=>state.message);
    console.log(messages);
  return (
    <div className='flex-1 overflow-auto px-6 py-6 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
    {!selectedConversation ? (
        <div className='h-full flex flex-col items-center justify-center gap-4 text-center'>
            <div className='flex flex-col gap-1.5'>
                <h1 className=' text-[20px] font-semibold text-slate-200 tracking-tight'>AI Agent</h1>
                <p className='text-[15px] font-semibold text-slate-400 max-w-[260-px] leading-relaxed'>How Can I Help You ?</p>
                <p className='text-[13px] text-slate-600 max-w-[260-px] leading-relaxed'>Ask me anything - code, ideas,
                {<br/>}
                explaination or just a quick question.</p>
            </div>

            <div className='flex flex-wrap justify-center gap-2 mt-1'>
                {
                ["I lost my wallet near library", "Found Samsung phone", "Find Rakib", "Generate PDF"].map((string,i)=>{
                   return ( <button key={i} className='text-[12px] text-slate-400 bg-white/[0.04] border border-white/[0.07]
                    px-3 py-1.5 rounded-lg hover:bg-white/[0.08] hover:text-slate-200 transition-colors duration-150
                    cursor-pointer'>
                        {string}
                    </button>
                   )
                })
                }
            </div>
        </div>
    ): (
        <div className='space-y-5'>
            {messages.length === 0 && (
                <div className='p-4 rounded-xl bg-white/[0.03] border border-white/10 text-center text-slate-400 text-xs'>
                    Direct conversation opened. Send a message below to start chatting!
                </div>
            )}
{
    messages.map((msg, i) => {

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

        return (
            <div key={msg?._id || i}>

                {parsedContent?.type === "coverPageData" ? (

                    <CoverPage
                        data={parsedContent?.data}
                    />

                ) : parsedContent?.type === "mentorResults" ? (

                    <MentorList
                        data={parsedContent}
                    />

                ) : parsedContent?.type === "lostFoundMatchList" ? (

                    <LostFoundMatchList
                        data={parsedContent}
                    />

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
    })
}
 
        </div>
    )}
    </div>
  )
}

export default MessageList
