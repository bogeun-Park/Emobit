import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    id: null,
    displayName: null,
    username: null,
    role: null,
    imageUrl: null,
  },
  reducers: {
    login: (state, action) => {
        state.isAuthenticated = true;
        state.id = action.payload.id;
        state.displayName = action.payload.displayName;
        state.username = action.payload.username;
        state.role = action.payload.role;
        state.imageUrl = action.payload.imageUrl;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.id = null;
      state.displayName = null;
      state.username = null;
      state.role = null;
      state.imageUrl = null;
    },
  }
});

export const authAction = authSlice.actions;
export default authSlice.reducer;
