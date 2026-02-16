// src/redux/modelSlice.ts
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "./store";
import axios from "axios";


const BASE_URL = "https://chatbot-w3ue.onrender.com";


const API_PATH = "/models";


export type ModelCategory =
  | "Policy & Compliance"
  | "Technical  & Logic"
  | "Navigation & Support";

export interface Model {
  id?: string;
  apiKey: string;
  name: string;
  fullName: string;
  systemPrompt: string;
  category: ModelCategory;
  createdAt?: string; 
  updatedAt?: string; 
  isHidden?: boolean;
}

type ApiError = { error?: string; message?: string };

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${API_PATH}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  
  const text = await res.text();
  const data = text ? (JSON.parse(text) as string) : null;

  if (!res.ok) {
    const errMsg =
      (data as ApiError)?.error ||
      (data as ApiError)?.message ||
      `Request failed (${res.status})`;
    throw new Error(errMsg);
  }

  return data as T;
}

/* =========================
   Thunks (Async Actions)
========================= */

export const fetchModels = createAsyncThunk<Model[]>(
  "models/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const models = await axios
        .get(`${BASE_URL}/api/models`)
        .then((res) => res.data);
      return models;
    } catch (error) {
      rejectWithValue((error as string) || "Failed to fetch models");
    }
  },
);

export const fetchModelById = createAsyncThunk<Model, string>(
  "models/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const model = await axios
        .get(`${BASE_URL}/api/models/${id}`)
        .then((res) => res.data);
      return model;
    } catch (error) {
      rejectWithValue((error as string) || "Failed to fetch model");
    }
  },
);

export const createModel = createAsyncThunk<Model, Omit<Model, "id">>(
  "models/create",
  async (modelData, { rejectWithValue }) => {
    try {
      const newModel = await axios
        .post(`${BASE_URL}/api/models`, modelData)
        .then((res) => res.data);
      return newModel;
    } catch (error) {
      rejectWithValue((error as string) || "Failed to create model");
    }
  },
);

export const updateModel = createAsyncThunk<
  Model,
  { id: string; changes: Partial<Model> }
>("models/update", async ({ id, changes }) => {
  return apiRequest<Model>(`/${id}`, {
    method: "PUT",
    body: JSON.stringify(changes),
  });
});

export const deleteModel = createAsyncThunk<Model, string>(
  "models/delete",
  async (id) => {
    return apiRequest<Model>(`/${id}`, { method: "DELETE" });
  },
);

export const toggleModelHidden = createAsyncThunk<
  Model,
  { id: string; isHidden: boolean }
>("models/toggleHidden", async ({ id, isHidden }) => {
  return apiRequest<Model>(`/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ isHidden }),
  });
});

/* =========================
   Slice
========================= */

type ModelsState = {
  models: Model[];
  selectedModel: Model | null;
  loading: boolean;
  error: string | null;
};

const initialState: ModelsState = {
  models: [],
  selectedModel: null,
  loading: false,
  error: null,
};

const modelsSlice = createSlice({
  name: "models",
  initialState,
  reducers: {
    clearModelError(state) {
      state.error = null;
    },
    clearSelectedModel(state) {
      state.selectedModel = null;
    },
    setSelectedModel(state, action: PayloadAction<Model | null>) {
      state.selectedModel = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchModels
    builder
      .addCase(fetchModels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModels.fulfilled, (state, action) => {
        state.loading = false;
        state.models = action.payload ?? [];
        console.log(101, "Fetched models:", action.payload);
      })
      .addCase(fetchModels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch models.";
        console.log(404, "Failed to fetch models:", state.error);
      });

    // fetchModelById
    builder
      .addCase(fetchModelById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModelById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedModel = action.payload;
      })
      .addCase(fetchModelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch model.";
      });

    // createModel
    builder
      .addCase(createModel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createModel.fulfilled, (state, action) => {
        state.loading = false;
        // add new at top
        state.models = [action.payload, ...state.models];
      })
      .addCase(createModel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to create model.";
      });

    // updateModel
    builder
      .addCase(updateModel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateModel.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        state.models = state.models.map((m) =>
          m.id === updated.id ? updated : m,
        );
        if (state.selectedModel?.id === updated.id) {
          state.selectedModel = updated;
        }
      })
      .addCase(updateModel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to update model.";
      });

    // deleteModel
    builder
      .addCase(deleteModel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteModel.fulfilled, (state, action) => {
        state.loading = false;
        const deleted = action.payload;
        state.models = state.models.filter((m) => m.id !== deleted.id);
        if (state.selectedModel?.id === deleted.id) {
          state.selectedModel = null;
        }
      })
      .addCase(deleteModel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to delete model.";
      });

    // toggleModelHidden (optional)
    builder
      .addCase(toggleModelHidden.fulfilled, (state, action) => {
        const updated = action.payload;
        state.models = state.models.map((m) =>
          m.id === updated.id ? updated : m,
        );
        if (state.selectedModel?.id === updated.id) {
          state.selectedModel = updated;
        }
      })
      .addCase(toggleModelHidden.rejected, (state, action) => {
        state.error =
          action.error.message ?? "Failed to toggle model visibility.";
      });
  },
});

export const { clearModelError, clearSelectedModel, setSelectedModel } =
  modelsSlice.actions;

export default modelsSlice.reducer;

/* =========================
   Selectors
========================= */

export const selectModels = (state: RootState) => state.models.models;
export const selectModelsLoading = (state: RootState) => state.models.loading;
export const selectModelsError = (state: RootState) => state.models.error;
export const selectSelectedModel = (state: RootState) =>
  state.models.selectedModel;
