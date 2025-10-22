import { Outlet } from "react-router-dom";
import NetworkBanner from "@/components/NetworkBanner";

export default function AdminLayout() {
  return (
    <div>
      <NetworkBanner />
      <Outlet />
    </div>
  );
}
