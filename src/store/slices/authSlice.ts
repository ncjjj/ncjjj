import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: SessionUser | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<SessionUser | null>) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setUser, clearUser, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;
