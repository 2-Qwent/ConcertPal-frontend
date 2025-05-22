import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: [], 
};

export const concertSlice = createSlice({
  name: "concerts",
  initialState,
  reducers: {
    addConcert: (state, action) => {
      state.value.push(action.payload); // Ajoute un concert au tableau
    },
    removeConcert: (state, action) => {
      // Supprime un concert par son id 
      state.value = state.value.filter(
        (concert) => concert.id !== action.payload
      );
    },
    setConcerts: (state, action) => {
      // Remplace tout le tableau par ceux de la db
      state.value = action.payload;
    },
  },
});

export const { addConcert, removeConcert, setConcerts } = concertSlice.actions;
export default concertSlice.reducer;