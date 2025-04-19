import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  id: null,
  displayName: null,
  username: null,
  role: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
        state.isAuthenticated = true;
        state.id = action.payload.id;
        state.displayName = action.payload.displayName;
        state.username = action.payload.username;
        state.role = action.payload.role;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.id = null;
      state.displayName = null;
      state.username = null;
      state.role = null;
    },
  }
});

export const authAction = authSlice.actions;
export default authSlice.reducer;
