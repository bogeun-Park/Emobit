import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
    name: 'notification',
    initialState: {
        totalCount: 0,
        commentCount: 0,
        likeCount: 0,
        notifications: [],
    },
    reducers: {
        setNotifications: (state, action) => {
            state.notifications = action.payload;
            state.totalCount = action.payload.filter(notification => !notification.read).length;
            state.commentCount = action.payload.filter(notification => notification.type == "COMMENT" && !notification.read).length;
            state.likeCount = action.payload.filter(notification => notification.type == "LIKE" && !notification.read).length;
        },
        readNotifications: (state) => {
            state.notifications = state.notifications.map(notification => ({ ...notification, read: true }));
            state.totalCount = 0;
            state.commentCount = 0;
            state.likeCount = 0;
        },
        clearNotifications: (state) => {
            state.notifications = [];
            state.totalCount = 0;
            state.commentCount = 0;
            state.likeCount = 0;
        },
    },
});

export const notificationAction = notificationSlice.actions;
export default notificationSlice.reducer;