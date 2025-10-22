import Logo from "@/components/logo";
import type { NavigationItem } from "@/hooks/useNavigationItems";
import { NavigationButton } from "./NavigationButton";
import { SidebarFooter } from "./SidebarFooter";

interface SidebarContentProps {
  navigationItems: NavigationItem[];
  isActiveRoute: (href: string) => boolean;
  onNavigate: (href: string) => void;
  onStoreSelect: (storeId: string) => void;
  onLogout: () => void;
}

export function SidebarContent({
  navigationItems,
  isActiveRoute,
  onNavigate,
  onStoreSelect,
  onLogout,
}: SidebarContentProps) {
  return (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <Logo size="md" className="mb-0" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item, index) => (
          <div key={index}>
            <NavigationButton
              item={item}
              isActive={isActiveRoute(item.href || "")}
              onNavigate={onNavigate}
              onStoreSelect={onStoreSelect}
            />
          </div>
        ))}
      </nav>

      {/* Footer */}
      <SidebarFooter onLogout={onLogout} />
    </>
  );
}
