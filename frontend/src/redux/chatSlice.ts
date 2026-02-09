import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Chat, ChatResponse } from "../types/Chat";
import axios from "axios";

interface ChatState {
  chats: ChatResponse[];
  currentChat: { answer: string } | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  currentChat: null,
  loading: false,
  error: null,
};

const BASE_URL = "https://chatbot-w3ue.onrender.com/api/chat"; // update if deployed

export const sendChat = createAsyncThunk(
  "chat/send",
  async (chat: Chat, { rejectWithValue }) => {
    try {
      console.log("Sending chat to backend:", chat);
      const response = await axios.post(BASE_URL, chat);
      console.log("Received response from backend:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
      console.error("Error sending chat:", error);
    }
  },
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(sendChat.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(sendChat.fulfilled, (state, action) => {
      state.loading = false;
      state.chats.push(action.payload);
      state.currentChat = action.payload;
      console.log("Chat added to state:", action.payload);
    });
    builder.addCase(sendChat.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.log(404, "Chat send failed:", state.error);
    });
  },
});

export default chatSlice.reducer;
