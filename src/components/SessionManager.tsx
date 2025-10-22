import { useSession } from "@/hooks/useSession";
import { useEffect } from "react";

import Icon401 from "@/assets/401.svg";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function SessionManager() {
  const { isSessionExpired, showSessionExpiredModal, hideSessionExpiredModal } =
    useSession();

  useEffect(() => {
    const handleSessionExpired = () => {
      showSessionExpiredModal();
    };

    window.addEventListener("gp:session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("gp:session-expired", handleSessionExpired);
    };
  }, [showSessionExpiredModal]);

  return (
    <SessionExpiredModal
      isOpen={isSessionExpired}
      onClose={hideSessionExpiredModal}
      countdownSeconds={10}
    />
  );
}

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  countdownSeconds?: number;
}

export function SessionExpiredModal({
  isOpen,
  onClose,
  countdownSeconds = 10,
}: SessionExpiredModalProps) {
  const [countdown, setCountdown] = useState(countdownSeconds);

  // Don't show modal if we're already on the auth page
  const isOnAuthPage = window.location.pathname === "/auth/sign-in";

  useEffect(() => {
    if (!isOpen || isOnAuthPage) {
      setCountdown(countdownSeconds);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to login page using window.location
          window.location.href = "/auth/sign-in";
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, countdownSeconds, onClose, isOnAuthPage]);

  const handleRedirectNow = () => {
    window.location.href = "/auth/sign-in";
    onClose();
  };

  if (!isOpen || isOnAuthPage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-50 grid w-full max-w-md gap-4 border bg-white p-6 shadow-lg rounded-lg mx-4">
        {/* Close button */}

        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            Session Expired
          </h2>
          <p className="text-sm text-gray-600">
            Your session has expired for security reasons.
          </p>
        </div>

        {/* Content */}
        <div className="py-4">
          <div className="flex justify-center mb-4">
            <img
              src={Icon401}
              alt="401 Unauthorized"
              className="h-[300px] w-[300px]"
            />
          </div>
          <p className="text-sm text-gray-600 mb-4 text-center">
            You will be automatically redirected to the login page in{" "}
            <span className="font-semibold text-red-600">{countdown}</span>{" "}
            seconds.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
            <Button
              onClick={handleRedirectNow}
              className="w-full sm:w-auto px-6 py-2 text-sm font-medium bg-red-300 hover:bg-red-500 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
            >
              Go to Login Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
