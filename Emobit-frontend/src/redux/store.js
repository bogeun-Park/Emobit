import { configureStore } from '@reduxjs/toolkit';
import authReducer from './Slice/authSlice';
import menuReducer from './Slice/menuSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        menu: menuReducer,
    }
});