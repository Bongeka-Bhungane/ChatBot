import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

export interface Document {
  id: string;
  name: string;
  url: string;
  fileType: string;
  content: string;
  storagePath: string;
  createdAt?: string;
}

interface DocumentState {
  documents: Document[];
  loading: boolean;
  error: string | null;
}

const BACKEND_URL = "https://chatbot-w3ue.onrender.com"; // update if deployed

const initialState: DocumentState = {
  documents: [],
  loading: false,
  error: null,
};

// Fetch all documents
export const fetchDocuments = createAsyncThunk(
  "documents/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/documents/all`);
      if (!res.ok) {
        const text = await res.text();
        return rejectWithValue(text);
      }
      const data: Document[] = await res.json();
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

// Upload document
export const uploadDocument = createAsyncThunk(
  "documents/upload",
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${BACKEND_URL}/api/documents/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        return rejectWithValue(text);
      }

      const newDoc: Document = await res.json();
      return newDoc;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

// Delete document
export const deleteDocument = createAsyncThunk(
  "documents/delete",
  async (
    { id, storagePath }: { id: string; storagePath: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/documents/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storagePath }),
      });

      if (!res.ok) {
        const text = await res.text();
        return rejectWithValue(text);
      }

      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

const documentSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchDocuments.fulfilled,
        (state, action: PayloadAction<Document[]>) => {
          state.loading = false;
          state.documents = action.payload;
        },
      )
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Upload
      .addCase(uploadDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        uploadDocument.fulfilled,
        (state, action: PayloadAction<Document>) => {
          state.loading = false;
          state.documents.unshift(action.payload);
        },
      )
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete
      .addCase(deleteDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteDocument.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.documents = state.documents.filter(
            (doc) => doc.id !== action.payload,
          );
        },
      )
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default documentSlice.reducer;
