import { configureStore } from "@reduxjs/toolkit";
import adminsReducer from "./adminSlice";
import documentsReducer from "./documentSlice";
import chatsReducer from "./chatSlice";
import modelsReducer from "./modelSlice"; // ✅ add this
import chatLogsSlice from "./chatlogsSlice";

export const store = configureStore({
  reducer: {
    admins: adminsReducer,
    documents: documentsReducer,
    chats: chatsReducer,
    models: modelsReducer, // ✅ add this
    chatLogs: chatLogsSlice,
  },
});

// ✅ types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
