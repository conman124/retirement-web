import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";

export function makeStore() {
  return configureStore({
    reducer: {
      //[slice.name]: slice.reducer,
    },
    devTools: true,
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore["getState"]>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>;

export default makeStore();
