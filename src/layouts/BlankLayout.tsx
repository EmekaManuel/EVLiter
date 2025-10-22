import { Outlet } from "react-router-dom";
import NetworkBanner from "@/components/NetworkBanner";

export default function BlankLayout() {
  return (
    <>
      <NetworkBanner />
      <Outlet />
    </>
  );
}
