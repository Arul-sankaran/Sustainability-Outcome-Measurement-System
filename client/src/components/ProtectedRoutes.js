import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoutes({ children, roles }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  /* Not logged in → send to login */
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  /* Logged in but wrong role → send to dashboard */
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}