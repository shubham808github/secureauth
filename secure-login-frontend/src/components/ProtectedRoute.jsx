import { Navigate } from "react-router-dom";
import { getToken, getUser } from "../services/AuthService";

function ProtectedRoute({ children, role }) {
  if (!getToken()) return <Navigate to="/login" replace />;

  const user = getUser();
  if (role && user?.role !== role) return <Navigate to="/" replace />;

  return children;
}

export default ProtectedRoute;