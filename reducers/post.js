import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: [],
};

export const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    //ajout d'un post au tableau
    addPost: (state, action) => {
      state.value.push(action.payload);
    },
    //set le reducer avec tous les posts en BDD
    setPosts: (state, action) => {
      state.value = action.payload;
    },
    //suppression d'un post du tableau
    deletePost: (state, action) => {
      state.value = state.value.filter((post) => post._id !== action.payload);
    },
  },
});

export const { addPost, setPosts, deletePost } = postSlice.actions;
export default postSlice.reducer;
