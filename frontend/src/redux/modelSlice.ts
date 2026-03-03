/*-------------------------------- IMPORTS --------------------------------*/
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import type { Model } from "../types/Model";

/*-------------------------------- STATES --------------------------------*/

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

type ApiError = { error?: string; message?: string };
const BASE_URL = "https://chatbot-w3ue.onrender.com";
const API_PATH = "/models";

/*-------------------------------- THUNKS --------------------------------*/
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

export const deleteModel = createAsyncThunk<string, string>(
  "models/delete",
  async (id, { rejectWithValue }) => {
    try {
      // Use the same pattern as fetchModels
      await axios.delete(`${BASE_URL}/api/models/${id}`);
      return id; // Return the ID so the reducer knows which one to remove
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to delete model";
      return rejectWithValue(message);
    }
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

/*-------------------------------- SLICE --------------------------------*/

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
        const deletedId = action.payload;
        state.models = state.models.filter((m) => m.id !== deletedId);
        if (state.selectedModel?.id === deletedId) {
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
