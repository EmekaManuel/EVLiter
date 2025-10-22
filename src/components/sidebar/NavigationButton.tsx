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
          className={`w-full flex items-center justify-between px-3 py-3 text-sm font-light rounded-lg transition-colors ${
            isActive
              ? "bg-gray-50 text-gray-900"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <div className="flex items-center space-x-3">
            <item.icon className="w-4 h-4 text-gray-400" />
            <span>{item.label}</span>
            {item.count && (
              <span className="text-xs text-gray-400">({item.count})</span>
            )}
          </div>
          {item.expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {item.expanded && (
          <div className="ml-6 mt-1 space-y-1">
            {item.children.map((child, childIndex) => (
              <button
                key={childIndex}
                onClick={() => onStoreSelect(child.id)}
                className={`w-full text-left px-3 py-2 text-sm font-light rounded-lg transition-colors ${
                  child.active
                    ? "bg-gray-50 text-gray-900"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="font-light">{child.name}</div>
                {child.onboarded && (
                  <div className="text-xs text-gray-400 mt-1">
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
      className={`flex items-center space-x-3 px-3 py-3 text-sm font-light rounded-lg transition-colors w-full text-left ${
        isActive
          ? "bg-gray-50 text-gray-900"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <item.icon className="w-4 h-4 text-gray-400" />
      <span>{item.label}</span>
    </button>
  );
}
