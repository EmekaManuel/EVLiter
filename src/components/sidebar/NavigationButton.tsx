import { ChevronUp, ChevronDown } from "lucide-react";
import type { NavigationItem } from "@/hooks/useNavigationItems";

interface NavigationButtonProps {
  item: NavigationItem;
  isActive: boolean;
  onNavigate: (href: string) => void;
  onStoreSelect: (storeId: string) => void;
}

export function NavigationButton({
  item,
  isActive,
  onNavigate,
  onStoreSelect,
}: NavigationButtonProps) {
  if (item.children) {
    return (
      <div>
        <button
          onClick={item.onToggle}
          className={`w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-md transition-colors touch-manipulation ${
            isActive
              ? "bg-yellow-100 text-gray-900"
              : "text-gray-700 hover:bg-yellow-100"
          }`}
        >
          <div className="flex items-center space-x-3">
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
            <span className="text-xs text-gray-500">({item.count})</span>
          </div>
          {item.expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {item.expanded && (
          <div className="ml-6 mt-1 space-y-1">
            {item.children.map((child, childIndex) => (
              <button
                key={childIndex}
                onClick={() => onStoreSelect(child.id)}
                className={`w-full text-left px-3 py-3 text-sm rounded-md transition-colors touch-manipulation ${
                  child.active
                    ? "bg-yellow-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="font-medium">{child.name}</div>
                {child.onboarded && (
                  <div className="text-xs text-gray-500 mt-1">
                    Onboarded: {child.onboarded}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => item.href && onNavigate(item.href)}
      className={`flex items-center space-x-3 px-3 py-3 text-sm font-medium rounded-md transition-colors w-full text-left touch-manipulation ${
        isActive
          ? "bg-yellow-100 text-gray-900"
          : "text-gray-700 hover:bg-yellow-100"
      }`}
    >
      <item.icon className="w-4 h-4" />
      <span>{item.label}</span>
    </button>
  );
}
