import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Loading...",
  className = "",
}: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}
