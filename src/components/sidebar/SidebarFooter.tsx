import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface SidebarFooterProps {
  onLogout: () => void;
}

export function SidebarFooter({ onLogout }: SidebarFooterProps) {
  return (
    <div className="p-4 border-t border-gray-100">
      <Button
        variant="ghost"
        className="w-full justify-start text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-light py-3"
        onClick={onLogout}
      >
        <LogOut className="w-4 h-4 mr-3 text-gray-400" />
        Logout
      </Button>
    </div>
  );
}
