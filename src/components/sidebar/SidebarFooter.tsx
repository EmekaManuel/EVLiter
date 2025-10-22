import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface SidebarFooterProps {
  onLogout: () => void;
}

export function SidebarFooter({ onLogout }: SidebarFooterProps) {
  return (
    <div className="p-4 border-t border-gray-200">
      <Button
        variant="ghost"
        className="w-full bg-red-500 justify-start text-white hover:bg-red-700 touch-manipulation py-3"
        onClick={onLogout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}
