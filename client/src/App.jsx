import { Navigate, Route, Routes } from "react-router-dom";

import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import FlocksPage from "./pages/FlocksPage";
import InventoryPage from "./pages/InventoryPage";
import LoginPage from "./pages/LoginPage";
import ProductionHealthPage from "./pages/ProductionHealthPage";
import RegisterPage from "./pages/RegisterPage";
import UserManagementPage from "./pages/UserManagementPage";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/flocks" element={<FlocksPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/production-health" element={<ProductionHealthPage />} />

        <Route element={<AdminRoute />}>
          <Route path="/users" element={<UserManagementPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;