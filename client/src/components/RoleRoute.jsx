import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
export default function RoleRoute({ role }) {
  const user = useSelector((s) => s.auth.user);
  return user?.role === role ? (
    <Outlet />
  ) : (
    <Navigate to={user?.role === "staff" ? "/scrap" : "/dashboard"} replace />
  );
}
