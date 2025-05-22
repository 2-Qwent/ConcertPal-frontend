import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: null,
};

export const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    addPost: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { addPost } = postSlice.actions;
export default postSlice.reducer;