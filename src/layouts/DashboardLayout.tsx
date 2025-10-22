import { Outlet, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import { stores, getStoreById } from "@/data/stores";
import { Search, Info, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { uiStore } from "@/store";
import NetworkBanner from "@/components/NetworkBanner";
import { useShallow } from "zustand/react/shallow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Sidebar } from "@/components/sidebar";
import { useSidebar } from "@/hooks/useSidebar";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [, setSelectedStoreId] = React.useState("run2-dineout");
  const { sidebarOpen, handleToggle, handleNavigation } = useSidebar();
  const isOffline = uiStore(useShallow((s) => s.isOffline));

  // Get current store from URL params
  useEffect(() => {
    const pathSegments = location.pathname.split("/");
    const storeIdIndex = pathSegments.findIndex(
      (segment) => segment === "stores"
    );
    if (storeIdIndex !== -1 && pathSegments[storeIdIndex + 1]) {
      const storeId = pathSegments[storeIdIndex + 1];
      const store = getStoreById(storeId);
      if (store) {
        setSelectedStoreId(storeId);
        // Update store active states - set only the current store as active
        stores.forEach((s) => (s.active = s.id === storeId));
      }
    } else {
      // If not on a store page, clear all store active states
      stores.forEach((s) => (s.active = false));
    }
  }, [location.pathname]);

  // Handle navigation
  const handleNavigate = (href: string) => {
    handleNavigation(() => {
      // If navigating to a non-store page, clear store active states immediately
      if (!href.includes("/stores/")) {
        stores.forEach((store) => (store.active = false));
      }
      navigate(href);
    });
  };

  // Handle store selection
  const handleStoreSelection = (storeId: string) => {
    handleNavigation(() => {
      setSelectedStoreId(storeId);
      // Update all stores to inactive
      stores.forEach((store) => (store.active = false));
      // Set selected store as active
      const selectedStoreData = stores.find((store) => store.id === storeId);
      if (selectedStoreData) {
        selectedStoreData.active = true;
      }
      // Navigate to store details page
      navigate(`/dashboard/stores/${storeId}`);
    });
  };

  // Check if current route is active
  const isActiveRoute = (href: string) => {
    // If we're on a store details page, don't highlight any other navigation items
    const pathSegments = location.pathname.split("/");
    const isOnStorePage =
      pathSegments.includes("stores") && pathSegments.length > 2;

    if (isOnStorePage) {
      // When on a store page, only return true for exact matches that aren't store-related
      // This prevents other navigation items from being highlighted
      return false;
    }

    // For other pages, use exact match
    return location.pathname === href;
  };

  // Generate breadcrumbs based on current location
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ label: "Company", href: "/dashboard/company" }];

    // Check if we're on a store details page
    const storeIdIndex = pathSegments.findIndex(
      (segment) => segment === "stores"
    );
    if (storeIdIndex !== -1 && pathSegments[storeIdIndex + 1]) {
      const storeId = pathSegments[storeIdIndex + 1];
      const store = getStoreById(storeId);
      if (store) {
        // breadcrumbs.push({ label: "Run2 Ehf.", href: "/dashboard/company" });
        breadcrumbs.push({ label: store.name, href: location.pathname });
      }
    } else if (
      pathSegments.includes("dashboard") &&
      pathSegments.length === 2
    ) {
      // If we're on a dashboard sub-page but not in store context
      const pageName = pathSegments[1];
      const pageLabels: Record<string, string> = {
        "company-data": "Company Data",
        profile: "Profile",
        home: "Home",
      };
      if (pageLabels[pageName]) {
        breadcrumbs.push({
          label: pageLabels[pageName],
          href: location.pathname,
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Network status banner */}
      <div className="fixed top-0 inset-x-0 z-[60]">
        <NetworkBanner />
      </div>
      {/* Spacer to offset fixed banner height on small screens when offline */}
      {isOffline && <div className="h-12 md:h-0" />}

      {/* Sidebar */}
      <Sidebar
        isActiveRoute={isActiveRoute}
        onNavigate={handleNavigate}
        onStoreSelect={handleStoreSelection}
        onLogout={() => {
          logout();
          navigate("/auth/sign-in", { replace: true });
        }}
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? "md:ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              {/* Sidebar Toggle Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggle}
                className="p-2 hover:bg-gray-100"
              >
                {sidebarOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>

              {/* Breadcrumbs */}
              <Breadcrumb className="hidden sm:block truncate">
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                      <BreadcrumbItem>
                        {index === breadcrumbs.length - 1 ? (
                          <BreadcrumbPage className="text-sm text-gray-900">
                            {crumb.label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            href={crumb.href}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            {crumb.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator className="text-gray-400">
                          &gt;
                        </BreadcrumbSeparator>
                      )}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Press 'Shift+F' to search"
                  className="w-64 pl-10 pr-4 py-2 text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Info Button */}
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-100"
              >
                <Info className="w-4 h-4 text-gray-400" />
              </Button>

              {/* Avatar */}
              <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-gray-300 transition-all">
                <AvatarImage src="/placeholder-avatar.jpg" alt="User Avatar" />
                <AvatarFallback className="bg-yellow-300 text-black font-bold text-xs">
                  AA
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
