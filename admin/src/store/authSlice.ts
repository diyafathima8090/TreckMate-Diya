import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
}

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const getInitialAuth = (): { user: AdminUser | null; token: string | null } => {
  if (typeof window !== "undefined") {
    const userJson = localStorage.getItem("admin-user");
    const token = localStorage.getItem("admin-token");
    if (userJson && token) {
      try {
        const user = JSON.parse(userJson);
        if (user.role === "admin") {
          return { user, token };
        }
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }
  }
  return { user: null, token: null };
};

const { user, token } = getInitialAuth();

const initialState: AuthState = {
  user,
  token,
  isAuthenticated: !!user && !!token,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<{ user: AdminUser; token: string }>) {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.setItem("admin-user", JSON.stringify(action.payload.user));
        localStorage.setItem("admin-token", action.payload.token);
      }
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin-user");
        localStorage.removeItem("admin-token");
      }
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
