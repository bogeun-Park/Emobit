import { createSlice } from '@reduxjs/toolkit';

const messageSlice = createSlice({
    name: 'message',
    initialState: {
        totalUnreadCount: 0,
        chatRooms: [],
    },
    reducers: {
        setChatRooms: (state, action) => {
            state.chatRooms = action.payload;
            state.totalUnreadCount = action.payload.reduce((sum, chatRoom) => sum + (chatRoom.unreadCount || 0), 0);
        },
        exitChatRoom: (state, action) => {
            state.chatRooms = state.chatRooms.filter(chatRoom => chatRoom.id !== action.payload);
        },
        addChatRoom: (state, action) => {
            const exists = state.chatRooms.some(chatRoom => chatRoom.id === action.payload.id);
            if (!exists) state.chatRooms.push(action.payload);
        },
    }
});

export const messageAction = messageSlice.actions;
export default messageSlice.reducer;