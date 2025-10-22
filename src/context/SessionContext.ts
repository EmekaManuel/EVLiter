import { createContext } from "react";

interface SessionContextValue {
  isSessionExpired: boolean;
  showSessionExpiredModal: () => void;
  hideSessionExpiredModal: () => void;
}

export const SessionContext = createContext<SessionContextValue | undefined>(
  undefined
);
