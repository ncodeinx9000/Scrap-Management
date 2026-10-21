import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      return (await api.get("/auth/me")).data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "No active session",
      );
    }
  },
  { condition: (_, { getState }) => !getState().auth.meRequested },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      return (await api.post("/auth/login", credentials)).data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to sign in",
      );
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await api.post("/auth/logout");
  } catch {
    /* Clear the local session even if the server is unavailable. */
  }
  return true;
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, loading: true, meRequested: false },
  reducers: {
    clearUser(state) {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
        state.meRequested = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.loading = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      });
  },
});
export const { clearUser } = authSlice.actions;
export default authSlice.reducer;
