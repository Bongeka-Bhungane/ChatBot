import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "../redux/adminSlice";
import documentReducer from "../redux/documentSlice";
import ChatReducer from "../redux/chatSlice";

export const store = configureStore({
  reducer: {
    admins: adminReducer,
    documents: documentReducer,
    chats: ChatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
