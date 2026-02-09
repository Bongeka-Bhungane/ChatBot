import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface Admin {
  id?: string;
  fullName: string;
  email: string;
  password: string;
  createdAt?: Date;
}

interface AdminState {
  admins: Admin[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  admins: [],
  loading: false,
  error: null,
};

const API_URL = "https://chatbot-w3ue.onrender.com/api/admins";

// ------------------- ASYNC ACTIONS -------------------

// GET ADMINS
export const fetchAdmins = createAsyncThunk("admins/fetch", async () => {
  const res = await fetch(API_URL);
  return res.json();
});

// ADD ADMIN
export const addAdmin = createAsyncThunk("admins/add", async (admin: Admin) => {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(admin),
  });

  return res.json();
});

// ------------------- SLICE -------------------

const adminSlice = createSlice({
  name: "admins",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // FETCH ADMINS
      .addCase(fetchAdmins.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = action.payload;
      })
      .addCase(fetchAdmins.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to fetch admins";
      })

      // ADD ADMIN
      .addCase(addAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(addAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admins.push(action.meta.arg);
      })
      .addCase(addAdmin.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to add admin";
      });
  },
});

export default adminSlice.reducer;
