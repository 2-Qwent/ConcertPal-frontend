import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: {
    token: null,
  },
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateToken: (state, action) => {
      state.value = action.payload;
    },
    login: (state, action) => {
      state.value = action.payload;
    },
    logout: (state) => {
      state.value = null;
    },

},
});

export const { updateToken, login, logout } = userSlice.actions;
export default userSlice.reducer;