import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMe } from "./features/auth/authSlice";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import RegisterOrganisation from "./pages/RegisterOrganisation";
import Categories from "./pages/Categories";
import ScrapList from "./pages/ScrapList";
import ScrapForm from "./pages/ScrapForm";
import ScrapDetail from "./pages/ScrapDetail";
import NotFound from "./pages/NotFound";
import Transactions from "./pages/Transactions";
import Users from "./pages/Users";
import { Recycle } from "lucide-react";
import { Toaster } from "react-hot-toast";
const Dashboard = lazy(() => import("./pages/Dashboard"));
function Startup() {
  const dispatch = useDispatch();
  const loading = useSelector((s) => s.auth.loading);
  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);
  if (loading)
    return (
      <div className="grid min-h-screen place-items-center bg-gray-50">
        <div className="text-center">
          <Recycle
            className="mx-auto animate-pulse text-emerald-600"
            size={34}
          />
          <p className="mt-3 text-sm text-gray-500">Loading your workspace…</p>
        </div>
      </div>
    );
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterOrganisation />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<RoleRoute role="admin" />}>
              <Route
                index
                element={
                  <Suspense
                    fallback={
                      <div className="rounded-2xl border bg-white p-12 text-center text-sm text-gray-500">
                        Loading dashboard…
                      </div>
                    }
                  >
                    <Dashboard />
                  </Suspense>
                }
              />
            </Route>
            <Route path="/scrap" element={<ScrapList />} />
            <Route path="/scrap/new" element={<ScrapForm />} />
            <Route path="/scrap/:id/edit" element={<ScrapForm mode="edit" />} />
            <Route path="/scrap/:id" element={<ScrapDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route element={<RoleRoute role="admin" />}>
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/users" element={<Users />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default function App() {
  return <Startup />;
}
