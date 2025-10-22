import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AuthProvider } from "@/context/AuthContext";
import { SessionProvider } from "@/context/SessionProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/services/queryClient";
import { authStore } from "@/store";
import { Toaster } from "sonner";
import { uiStore } from "@/store";
import { App } from "@/App";
import { SessionManager } from "@/components/SessionManager";

async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import("@/mocks/browser");
    await worker.start({ serviceWorker: { url: "/mockServiceWorker.js" } });
  }
}

// Hydrate auth store from persisted token on startup
authStore.getState().hydrateFromStorage();

await enableMocking();

// Wire global online/offline listeners
window.addEventListener("online", () => uiStore.getState().setOffline(false));
window.addEventListener("offline", () => uiStore.getState().setOffline(true));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SessionProvider>
          <Toaster expand richColors position="bottom-right" />
          <App />
          <SessionManager />
        </SessionProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
