import { createSlice } from '@reduxjs/toolkit';

const messageSlice = createSlice({
    name: 'message',
    initialState: {
        senderCount: 0,
        chatRooms: [],
    },
    reducers: {
        setChatRooms: (state, action) => {
            state.chatRooms = action.payload;
            state.senderCount = action.payload.filter(chatRoom => chatRoom.unreadCount > 0).length;
        },
        exitChatRoom: (state, action) => {
            state.chatRooms = state.chatRooms.filter(chatRoom => chatRoom.id !== action.payload);
        },
        addChatRoom: (state, action) => {
            const exists = state.chatRooms.some(chatRoom => chatRoom.id === action.payload.id);
            if (!exists) state.chatRooms.unshift(action.payload);
        },
    }
});

export const messageAction = messageSlice.actions;
export default messageSlice.reducer;