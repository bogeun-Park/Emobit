import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
    name: 'notification',
    initialState: {
        commentCount: 0,
        notifications: [],
    },
    reducers: {
        setNotifications: (state, action) => {
            state.notifications = action.payload;
            state.commentCount = action.payload.filter(notification => notification.type == "COMMENT" && !notification.read).length;
        },
    },
});

export const notificationAction = notificationSlice.actions;
export default notificationSlice.reducer;