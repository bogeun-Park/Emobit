import { createSlice } from '@reduxjs/toolkit';

const menuSlice = createSlice({
    name: 'menu',
    initialState: {
        active: 'home',
        panelMenu: null,
        keyword: '',
        resultList: [],
    },
    reducers: {
        setActiveMenu: (state, action) => {
            state.active = action.payload;
            state.panelMenu = null;
        },
        setPanelMenu: (state, action) => {
            state.panelMenu = (state.panelMenu === action.payload) ? null : action.payload;
        },
        setKeyword: (state, action) => {
            state.keyword = action.payload;
        },
        setResultList: (state, action) => {
            state.resultList = action.payload;
        },
        clearSearchState: (state) => {
            state.keyword = '';
            state.resultList = [];
        },
    },
});

export const menuAction = menuSlice.actions;
export default menuSlice.reducer;
