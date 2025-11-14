import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem("adminToken");
  const adminRole = localStorage.getItem("adminRole");

  if (!adminToken || adminRole !== "ROLE_ADMIN") {
    return <Navigate to="/login" />;
  }

  return children;
};

export default AdminRoute;
