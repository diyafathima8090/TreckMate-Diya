import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ThemeState {
  theme: "light" | "dark";
  sidebarOpen: boolean;
}

const getInitialTheme = (): "light" | "dark" => {
  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem("admin-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return systemTheme ? "dark" : "light";
  }
  return "dark"; 
};

const initialState: ThemeState = {
  theme: getInitialTheme(),
  sidebarOpen: true,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === "light" ? "dark" : "light";
      if (typeof window !== "undefined") {
        localStorage.setItem("admin-theme", state.theme);
        if (state.theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    },
    setTheme(state, action: PayloadAction<"light" | "dark">) {
      state.theme = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("admin-theme", action.payload);
        if (action.payload === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
  },
});

export const { toggleTheme, setTheme, toggleSidebar, setSidebarOpen } = themeSlice.actions;
export default themeSlice.reducer;
