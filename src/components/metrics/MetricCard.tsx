import type { ReactNode } from "react";

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  className?: string;
}

export function MetricCard({
  icon,
  label,
  value,
  subtitle,
  className = "",
}: MetricCardProps) {
  return (
    <div className={`p-6 border border-gray-200 rounded-lg ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-100 rounded-lg">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-light text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
