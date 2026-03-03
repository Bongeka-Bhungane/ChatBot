/*-------------------------------- IMPORTS --------------------------------*/
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ChatLog, FetchChatLogsArgs } from "../types/ChatLog";

/*-------------------------------- STATES --------------------------------*/
type ChatLogsState = {
  logs: ChatLog[];
  loading: boolean;
  error: string | null;
};

const initialState: ChatLogsState = {
  logs: [],
  loading: false,
  error: null,
};

const BASE_URL = "https://chatbot-w3ue.onrender.com";
const LOGS_PATH = "/api/admins/logs";

/*-------------------------------- THUNKS --------------------------------*/

// function that convert params to query string
function toQueryString(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") q.set(k, v);
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

// [GET] fetchChatLogs -> get all chat logs
export const fetchChatLogs = createAsyncThunk<ChatLog[], FetchChatLogsArgs>(
  "chatLogs/fetch",
  async (args, { rejectWithValue }) => {
    try {
      const qs = toQueryString({
        search: args.search?.trim(),
        lang: args.lang,
        type: args.type,
        framework: args.framework,
        code: args.code === undefined ? undefined : String(args.code),
      });

      const res = await fetch(`${BASE_URL}${LOGS_PATH}${qs}`);
      const text = await res.text();
      const data: unknown = text ? JSON.parse(text) : [];

      if (!res.ok) {
        const msg =
          (data as { error?: string; message?: string })?.error ||
          (data as { error?: string; message?: string })?.message ||
          `Request failed (${res.status})`;
        return rejectWithValue(msg);
      }

      return Array.isArray(data) ? (data as ChatLog[]) : [];
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch logs";
      return rejectWithValue(msg);
    }
  },
);

/*-------------------------------- SLICE --------------------------------*/
const chatLogsSlice = createSlice({
  name: "chatLogs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload ?? [];
      })
      .addCase(fetchChatLogs.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Failed to fetch logs.";
      });
  },
});

export default chatLogsSlice.reducer;
