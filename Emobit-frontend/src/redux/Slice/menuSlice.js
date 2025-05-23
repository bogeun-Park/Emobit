import { createSlice } from '@reduxjs/toolkit';

const menuSlice = createSlice({
    name: 'menu',
    initialState: {
        active: 'home',
    },
    reducers: {
        setActiveMenu: (state, action) => {
            state.active = action.payload;
        },
    },
});

export const menuAction = menuSlice.actions;
export default menuSlice.reducer;
