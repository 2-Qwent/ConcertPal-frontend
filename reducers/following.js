import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: []
};

export const followingSlice = createSlice({
  name: "following",
  initialState,
  reducers: {
    newFollow: (state, action) => {
      state.value.push(action.payload);
    },
    unfollow: (state, action) => {
      state.value = state.value.filter((token) => token !== action.payload);
    },
  },
});

export const { newFollow, unfollow } = followingSlice.actions;
export default followingSlice.reducer;
