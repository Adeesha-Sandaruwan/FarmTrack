import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import FlocksPage from "./pages/FlocksPage";
import HomePage from "./pages/HomePage";
import InventoryPage from "./pages/InventoryPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserManagementPage from "./pages/UserManagementPage";

const App = () => {
  const location = useLocation();

  return (
    <div className="route-transition" key={location.pathname}>
      <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/flocks" element={<FlocksPage />} />
        <Route path="/inventory" element={<InventoryPage />} />

        <Route element={<AdminRoute />}>
          <Route path="/users" element={<UserManagementPage />} />
        </Route>
      </Route>

      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default App;