import { configureStore } from "@reduxjs/toolkit";
import pixifyReducer from "../features/pixify/pixifySlice";

export const store = configureStore({
  reducer: {
    pixify: pixifyReducer,
  },
});
