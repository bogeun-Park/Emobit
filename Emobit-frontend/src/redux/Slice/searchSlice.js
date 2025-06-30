import { createSlice } from '@reduxjs/toolkit';

const searchSlice = createSlice({
    name: 'search',
    initialState: {
        keyword: '',
        resultList: [],
    },
    reducers: {
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

export const searchAction = searchSlice.actions;
export default searchSlice.reducer;