import { configureStore } from '@reduxjs/toolkit';
import authReducer from './Slice/authSlice';
import menuReducer from './Slice/menuSlice';
import searchReducer from './Slice/searchSlice';
import messageReducer from './Slice/messageSlice';
import notificationReducer from './Slice/notificationSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        menu: menuReducer,
        search: searchReducer,
        message: messageReducer,
        notification: notificationReducer,
    }
});