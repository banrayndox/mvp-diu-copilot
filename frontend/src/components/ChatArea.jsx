import React from 'react'
import Navbar from './chatArea/Navbar'
import MessageList from './chatArea/MessageList'
import ChatInput from './chatArea/ChatInput'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import getMessages from '../features/getMessages'
import { setArtifacts, setMessages } from '../redux/messageSlice'

const ChatArea = () => {
    const {selectedConversation} = useSelector(state=>state.conversation);
    const dispatch = useDispatch();
    useEffect(() => {
        let intervalId = null;

        const getMsg = async () => {
            if (selectedConversation) {
                if (selectedConversation.title === "New Chat") return;
                const data = await getMessages(selectedConversation?._id);

                if (Array.isArray(data)) {
                    dispatch(setMessages(data));
                    const latestArtifactMessage = [...data].reverse().find(msg => msg.artifacts && msg.artifacts.length > 0);
                    dispatch(setArtifacts(latestArtifactMessage?.artifacts || []));
                }
            }
        };

        getMsg();

        // Poll every 3 seconds for active conversation to auto-load incoming messages
        if (selectedConversation?._id && selectedConversation?.title !== "New Chat") {
            intervalId = setInterval(() => {
                getMsg();
            }, 3000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [selectedConversation?._id]);

  return (
    <div className='flex-1 flex flex-col min-w-0'>
        <Navbar />
      <MessageList />
      <ChatInput />
    </div>
  )
}

export default ChatArea
