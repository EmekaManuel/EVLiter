import { useEffect, useState } from "react";
import { uiStore } from "@/store";
import { useShallow } from "zustand/react/shallow";

const MOBILE_BREAKPOINT = 768;

export function useSidebar() {
  const [userToggledSidebar, setUserToggledSidebar] = useState(false);
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = uiStore(
    useShallow((s) => ({
      sidebarOpen: s.sidebarOpen,
      setSidebarOpen: s.setSidebarOpen,
      toggleSidebar: s.toggleSidebar,
    }))
  );

  const isMobile = () => window.innerWidth < MOBILE_BREAKPOINT;

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (!userToggledSidebar) {
        setSidebarOpen(!isMobile());
      }
    };

    // Set initial state
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarOpen, userToggledSidebar]);

  // Reset user toggle flag after resize with debounce
  useEffect(() => {
    let timeoutId: number;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setUserToggledSidebar(false);
      }, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen, setSidebarOpen]);

  const handleToggle = () => {
    setUserToggledSidebar(true);
    toggleSidebar();
  };

  const handleClose = () => {
    setUserToggledSidebar(true);
    setSidebarOpen(false);
  };

  const handleNavigation = (callback: () => void) => {
    callback();
    // Close sidebar on mobile after navigation
    if (isMobile()) {
      setSidebarOpen(false);
    }
  };

  return {
    sidebarOpen,
    isMobile: isMobile(),
    handleToggle,
    handleClose,
    handleNavigation,
  };
}
