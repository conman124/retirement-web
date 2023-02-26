import { configureStore } from "@reduxjs/toolkit";
import { simulationSlice, actionCreators } from "./simulator";

const store = configureStore({
  reducer: {
    [simulationSlice.name]: simulationSlice.reducer,
  },
  devTools: process.env.NODE_ENV !== "production" && {
    actionCreators,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
