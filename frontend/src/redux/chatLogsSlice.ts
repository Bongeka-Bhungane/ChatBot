// src/redux/chatLogsSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "./store";

const BASE_URL = "https://chatbot-w3ue.onrender.com";
const LOGS_PATH = "/api/admins/logs"; // router.get("/logs", getChatLogs)

export type ChatLog = {
  id: string;
  question: string | null;
  answer: string | null;
  source: string | null;

  inscope: boolean | null;
  incontext: boolean | null; // ✅ from your table
  appropriate: boolean | null;

  modelused: string | null;

  createdAt: string | null; // ✅ from your table

  language_env: string | null;
  question_type: string | null;
  framework: string | null;

  has_code: boolean | null;
};

export type FetchChatLogsArgs = {
  search?: string;
  lang?: string;
  type?: string;
  framework?: string;
  code?: boolean;
};

function toQueryString(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") q.set(k, v);
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

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

export const selectChatLogs = (state: RootState) => state.chatLogs.logs;
export const selectChatLogsLoading = (state: RootState) =>
  state.chatLogs.loading;
export const selectChatLogsError = (state: RootState) => state.chatLogs.error;
