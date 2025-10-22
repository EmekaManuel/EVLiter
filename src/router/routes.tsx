import { Navigate, createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "@/router/protectedRoutes";
import { UserRole } from "@/utils/roles";
import AdminLayout from "../layouts/AdminLayout";
import BlankLayout from "../layouts/BlankLayout";
import DashboardLayout from "../layouts/DashboardLayout";

// Public pages
import SigninPage from "@/pages/auth/signIn";
import UnauthorizedPage from "@/pages/unauthorizedPage";

// Admin pages
import ApproveOnboardPage from "@/pages/admin/approveOnboard";
import DashboardPage from "@/pages/admin/dashboardPage";

// EV Charging pages
import DashboardOverviewPage from "@/pages/dashboard/dashboardOverviewPage";
import AdminDashboardPage from "@/pages/dashboard/adminDashboardPage";
import AiCarRecognitionPage from "@/pages/dashboard/aiCarRecognitionPage";
import ChargingStationsPage from "@/pages/dashboard/chargingStationsPage";
import MyChargingPage from "@/pages/dashboard/myChargingPage";
import SmartAdvisorPage from "@/pages/dashboard/smartAdvisorPage";
import NotFoundPage from "@/pages/errors/NotFoundPage";
import ServerErrorPage from "@/pages/errors/ServerErrorPage";

export const router = createBrowserRouter([
  // Blank layout (public)
  {
    element: <BlankLayout />,
    children: [
      { path: "/", element: <Navigate to="/auth/sign-in" replace /> },
      { path: "/auth/sign-in", element: <SigninPage /> },
      { path: "/unauthorized", element: <UnauthorizedPage /> },
      { path: "/500", element: <ServerErrorPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },

  // Admin layout with protection
  {
    element: <ProtectedRoute requiredRoles={[UserRole.ADMIN]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/admin", element: <DashboardPage /> },
          { path: "/admin/approve-onboard", element: <ApproveOnboardPage /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },

  // Dashboard layout with protection
  {
    element: <ProtectedRoute requiredRoles={[UserRole.USER]} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/dashboard",
            element: <Navigate to="/dashboard/overview" replace />,
          },
          { path: "/dashboard/overview", element: <DashboardOverviewPage /> },
          // EV Charging Features
          {
            path: "/dashboard/ai-car-recognition",
            element: <AiCarRecognitionPage />,
          },
          {
            path: "/dashboard/charging-stations",
            element: <ChargingStationsPage />,
          },
          { path: "/dashboard/smart-advisor", element: <SmartAdvisorPage /> },
          { path: "/dashboard/my-charging", element: <MyChargingPage /> },
          { path: "/dashboard/admin", element: <AdminDashboardPage /> },

          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

export default router;
