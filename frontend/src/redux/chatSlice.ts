import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Chat, ChatResponse } from "../types/Chat";
import axios from "axios";

interface ChatState {
  chats: ChatResponse[];
  currentChat: ChatResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  currentChat: null,
  loading: false,
  error: null,
};

// Use localhost for your local testing environment
const BASE_URL = "https://chatbot-w3ue.onrender.com/api/chat"; 

export const sendChat = createAsyncThunk(
  "chat/send",
  async (chat: Chat, { rejectWithValue }) => {
    try {
      console.log("Sending chat to backend:", chat);
      const response = await axios.post(BASE_URL, chat);
      console.log("Received response from backend:", response.data);
      return response.data;
    } catch (error: any) {
      // Logic Fix: Extract the error message before returning
      const errorMessage = error.response?.data?.error || error.message || "Something went wrong";
      console.error("Error sending chat:", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // Optional: Add a reducer to clear chat history if needed
    clearChat: (state) => {
      state.chats = [];
      state.currentChat = null;
    }
  },
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
      // action.payload now contains the string message from rejectWithValue
      state.error = action.payload as string;
    });
  },
});

export const { clearChat } = chatSlice.actions;
export default chatSlice.reducer;