import { useState, useCallback, type ReactNode } from "react";
import { SessionContext } from "./SessionContext";

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  const showSessionExpiredModal = useCallback(() => {
    setIsSessionExpired(true);
  }, []);

  const hideSessionExpiredModal = useCallback(() => {
    setIsSessionExpired(false);
  }, []);

  const value = {
    isSessionExpired,
    showSessionExpiredModal,
    hideSessionExpiredModal,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
