import { createStore } from "@reduxjs/toolkit";
import { mainReducer } from "./reducers";

export const reduxStore = createStore(mainReducer.reducer);
