import { Car, MapPin, Brain, BarChart3, Settings, Zap } from "lucide-react";
import { useState } from "react";

export interface NavigationItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  key: string;
  count?: number;
  expanded?: boolean;
  onToggle?: () => void;
  children?: Array<{
    id: string;
    name: string;
    active: boolean;
    onboarded?: string;
  }>;
}

export function useNavigationItems() {
  const [storesExpanded, setStoresExpanded] = useState(true);

  const navigationItems: NavigationItem[] = [
    {
      icon: BarChart3,
      label: "Dashboard",
      href: "/dashboard/overview",
      key: "dashboard",
    },
    {
      icon: Car,
      label: "AI Car Recognition",
      href: "/dashboard/ai-car-recognition",
      key: "ai-car-recognition",
    },
    {
      icon: MapPin,
      label: "Charging Stations",
      href: "/dashboard/charging-stations",
      key: "charging-stations",
    },
    {
      icon: Brain,
      label: "Smart Advisor",
      href: "/dashboard/smart-advisor",
      key: "smart-advisor",
    },
    {
      icon: Zap,
      label: "My Charging",
      href: "/dashboard/my-charging",
      key: "my-charging",
    },
    {
      icon: Settings,
      label: "Admin Dashboard",
      href: "/dashboard/admin",
      key: "admin-dashboard",
    },
  ];

  return {
    navigationItems,
    storesExpanded,
    setStoresExpanded,
  };
}
