import { createSlice } from '@reduxjs/toolkit';

const menuSlice = createSlice({
    name: 'menu',
    initialState: {
        active: 'home',
        panelMenu: null,
    },
    reducers: {
        setActiveMenu: (state, action) => {
            state.active = action.payload;
            state.panelMenu = null;
        },
        setPanelMenu: (state, action) => {
            state.panelMenu = (state.panelMenu === action.payload) ? null : action.payload;
        },
    },
});

export const menuAction = menuSlice.actions;
export default menuSlice.reducer;
