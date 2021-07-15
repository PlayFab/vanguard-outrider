import { createStore } from "redux";
import { mainReducer } from "./reducers";

export const reduxStore = createStore(
    mainReducer
);