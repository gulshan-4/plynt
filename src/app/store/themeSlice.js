// app/store/themeSlice.js
"use client";

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  darkMode:
    typeof window !== "undefined"
      ? localStorage.getItem("theme") === "dark"
      : false,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.darkMode = !state.darkMode;
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", state.darkMode ? "dark" : "light");
      }
    },
    setTheme: (state, action) => {
      state.darkMode = action.payload === "dark";
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", action.payload);
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;