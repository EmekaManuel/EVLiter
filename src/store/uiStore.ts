import { createAppStore } from "./createAppStore";

export type ThemeMode = "light" | "dark";

type UiState = {
  sidebarOpen: boolean;
  theme: ThemeMode;
  isOffline: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (mode: ThemeMode) => void;
  setOffline: (offline: boolean) => void;
};

export const uiStore = createAppStore<UiState>(
  (set) => ({
    sidebarOpen: true,
    theme: "light",
    isOffline: typeof navigator !== "undefined" ? !navigator.onLine : false,
    setSidebarOpen: (open: boolean) =>
      set((state) => {
        state.sidebarOpen = open;
      }),
    toggleSidebar: () =>
      set((state) => {
        state.sidebarOpen = !state.sidebarOpen;
      }),
    setTheme: (mode: ThemeMode) =>
      set((state) => {
        state.theme = mode;
      }),
    setOffline: (offline: boolean) =>
      set((state) => {
        state.isOffline = offline;
      }),
  }),
  { name: "ui", persist: true, persistKey: "ui-store", version: 1 }
);
