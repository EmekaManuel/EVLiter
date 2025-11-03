import Logo from "@/components/logo";
import type { NavigationItem } from "@/hooks/useNavigationItems";
import { NavigationButton } from "./NavigationButton";
import { SidebarFooter } from "./SidebarFooter";

interface SidebarContentProps {
  navigationItems: NavigationItem[];
  isActiveRoute: (href: string) => boolean;
  onNavigate: (href: string) => void;
  onStoreSelect: (storeId: string) => void;
}

export function SidebarContent({
  navigationItems,
  isActiveRoute,
  onNavigate,
  onStoreSelect,
}: SidebarContentProps) {
  return (
    <>
      {/* Logo */}
      <Logo />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
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
      <SidebarFooter />
    </>
  );
}
