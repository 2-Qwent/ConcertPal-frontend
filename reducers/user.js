import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: { token: null },
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateToken: (state, action) => {
      state.value.token = action.payload;
    },
  },
});

export const { updateToken } = userSlice.actions;
export default userSlice.reducer;