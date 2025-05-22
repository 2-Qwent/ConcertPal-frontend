import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: [],
};

export const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    addPost: (state, action) => {
      state.value.push(action.payload);
    },
    setPosts: (state, action) => {
      state.value = action.payload
    }
  },
});

export const { addPost, setPosts } = postSlice.actions;
export default postSlice.reducer;