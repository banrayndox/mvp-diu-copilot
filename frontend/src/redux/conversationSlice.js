import { createSlice } from "@reduxjs/toolkit";
import { act } from "react";

const conversationSlice = createSlice({
    name: "conversation",
    initialState: {
        conversations: [],
        selectedConversation: null
    },
    reducers: {
        setConversations : (state, action) => {
            state.conversations = action.payload;
        },
        addConversation : (state, action) => {
            const exists = state.conversations.some(c => c._id === action.payload._id);
            if (!exists) {
                state.conversations.unshift(action.payload);
            }
        },
        setSelectConversation : (state, action) => {
            state.selectedConversation = action.payload;
        },
        setConvTitle: (state, action) => {
            const { title, conversationId } = action.payload;
            state.conversations = state.conversations.map((conv)=>{
                return (
                    conv._id === conversationId ? (
                        {...conv, title }
                    ) : ( conv )
                )
            })
            if(state.selectedConversation._id === conversationId){
                state.selectedConversation = {...state.selectedConversation, title}
            }
        }

    }
});
export const {setConversations, addConversation, setSelectConversation, setConvTitle} = conversationSlice.actions;
export default  conversationSlice.reducer;