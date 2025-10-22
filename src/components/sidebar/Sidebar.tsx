import { useNavigationItems } from "@/hooks/useNavigationItems";
import { useSidebar } from "@/hooks/useSidebar";
import { SidebarContent } from "./SidebarContent";

interface SidebarProps {
  isActiveRoute: (href: string) => boolean;
  onNavigate: (href: string) => void;
  onStoreSelect: (storeId: string) => void;
  onLogout: () => void;
}

export function Sidebar({
  isActiveRoute,
  onNavigate,
  onStoreSelect,
  onLogout,
}: SidebarProps) {
  const { sidebarOpen, handleClose } = useSidebar();
  const { navigationItems } = useNavigationItems();

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-black/20"
          onClick={handleClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-white border-r border-gray-100 flex flex-col overflow-y-auto fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent
          navigationItems={navigationItems}
          isActiveRoute={isActiveRoute}
          onNavigate={onNavigate}
          onStoreSelect={onStoreSelect}
          onLogout={onLogout}
        />
      </div>
    </>
  );
}
