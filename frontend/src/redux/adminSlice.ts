import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface Admin {
  id?: string;
  fullName: string;
  email: string;
  password: string;
  createdAt?: Date | string;
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
  if (!res.ok) throw new Error("Failed to fetch admins");
  return res.json();
});

// ADD ADMIN
export const addAdmin = createAsyncThunk("admins/add", async (admin: Admin) => {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(admin),
  });

  if (!res.ok) throw new Error("Failed to add admin");
  return res.json();
});

// ✅ DELETE ADMIN
export const deleteAdmin = createAsyncThunk(
  "admins/delete",
  async (adminId: string) => {
    const res = await fetch(`${API_URL}/${adminId}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete admin");

    // some APIs return deleted doc, some return message
    // we just need the id to remove it from state:
    return adminId;
  },
);

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
        state.error = null;
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
        state.error = null;
      })
      .addCase(addAdmin.fulfilled, (state, action) => {
        state.loading = false;

        // Prefer the API response (likely includes id), fallback to arg
        const created = action.payload ?? action.meta.arg;
        state.admins.push(created);
      })
      .addCase(addAdmin.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to add admin";
      })

      // ✅ DELETE ADMIN
      .addCase(deleteAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = state.admins.filter((a) => a.id !== action.payload);
      })
      .addCase(deleteAdmin.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to delete admin";
      });
  },
});

export default adminSlice.reducer;
