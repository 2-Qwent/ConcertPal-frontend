import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {
    following: [],
    followers: [],
  },
};

export const followingSlice = createSlice({
  name: "following",
  initialState,
  reducers: {
    newFollow: (state, action) => {
      state.value.following.push(action.payload);
    },
    unfollow: (state, action) => {
      state.value.following = state.value.following.filter((person) => person.token !== action.payload.token);
    },
    setFollowing: (state, action) => {
      state.value.following = action.payload;
    },
    setFollowers: (state, action) => {
      state.value.followers = action.payload;
    }
  },
});

export const { newFollow, unfollow, setFollowing, setFollowers } = followingSlice.actions;
export default followingSlice.reducer;
