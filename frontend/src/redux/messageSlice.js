import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
    name: "message",
    initialState: {
        messages: [],
        artifacts: []
    },
    reducers: {
        setMessages: (state, action) => {
            const incoming = Array.isArray(action.payload) ? action.payload : [];
            const seen = new Set();
            const deduplicated = [];

            for (const msg of incoming) {
                if (!msg) continue;
                const key = msg._id || msg.tempId;
                if (key) {
                    if (!seen.has(key)) {
                        seen.add(key);
                        deduplicated.push(msg);
                    }
                } else {
                    deduplicated.push(msg);
                }
            }
            state.messages = deduplicated;
        },

        addMessage: (state, action) => {
            const newMsg = action.payload;
            if (!newMsg) return;

            // 1. Existing message with same persistent MongoDB _id -> update in-place
            if (newMsg._id) {
                const existingIdx = state.messages.findIndex(m => m?._id && String(m._id) === String(newMsg._id));
                if (existingIdx !== -1) {
                    state.messages[existingIdx] = { ...state.messages[existingIdx], ...newMsg };
                    return;
                }
            }

            // 2. Existing optimistic message with same tempId -> reconcile with server data
            if (newMsg.tempId) {
                const tempIdx = state.messages.findIndex(m => m?.tempId && m.tempId === newMsg.tempId);
                if (tempIdx !== -1) {
                    state.messages[tempIdx] = { ...state.messages[tempIdx], ...newMsg };
                    return;
                }
            }

            // 3. User message reconciliation: matching content, role, and conversation without _id
            if (newMsg._id && newMsg.conversationId) {
                const optimisticIdx = state.messages.findIndex(m =>
                    !m?._id &&
                    m?.role === newMsg.role &&
                    m?.content === newMsg.content &&
                    String(m?.conversationId) === String(newMsg.conversationId)
                );
                if (optimisticIdx !== -1) {
                    state.messages[optimisticIdx] = { ...state.messages[optimisticIdx], ...newMsg };
                    return;
                }
            }

            // 4. Assistant message duplicate protection (handles simultaneous HTTP response & Socket.IO broadcast)
            if (newMsg.role === "assistant" && newMsg.conversationId) {
                const assistantIdx = state.messages.findIndex(m =>
                    m?.role === "assistant" &&
                    m?.content === newMsg.content &&
                    String(m?.conversationId) === String(newMsg.conversationId)
                );
                if (assistantIdx !== -1) {
                    state.messages[assistantIdx] = { ...state.messages[assistantIdx], ...newMsg };
                    return;
                }
            }

            // 5. Genuinely new message -> push to state
            state.messages.push(newMsg);
        },

        updateMessage: (state, action) => {
            const { id, tempId, ...updates } = action.payload || {};
            const index = state.messages.findIndex(m =>
                (id && m?._id && String(m._id) === String(id)) ||
                (tempId && m?.tempId === tempId)
            );
            if (index !== -1) {
                state.messages[index] = { ...state.messages[index], ...updates };
            }
        },

        setArtifacts: (state, action) => {
            state.artifacts = action.payload || [];
        }
    }
});

export const { setMessages, addMessage, updateMessage, setArtifacts } = messageSlice.actions;
export default messageSlice.reducer;
