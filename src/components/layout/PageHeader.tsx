import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({
  icon: Icon,
  title,
  description,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`border-b border-gray-100 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center space-x-3">
          <Icon className="h-6 w-6 text-gray-400" />
          <div>
            <h1 className="text-2xl font-light text-gray-900">{title}</h1>
            {description && (
              <p className="text-gray-500 font-light mt-2">{description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
