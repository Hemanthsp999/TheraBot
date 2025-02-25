import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const User = localStorage.getItem("userEmail");

  return User ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
