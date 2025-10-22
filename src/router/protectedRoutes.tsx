import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type ProtectedRouteProps = {
  requiredRoles?: string[];
};

export default function ProtectedRoute({
  requiredRoles = [],
}: ProtectedRouteProps) {
  const location = useLocation();
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  if (!hasRole(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
