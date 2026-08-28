import { useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";

import DashboardPage from "./pages/DashboardPage";
import FlocksPage from "./pages/FlocksPage";
import HomePage from "./pages/HomePage";
import InventoryPage from "./pages/InventoryPage";
import LoginPage from "./pages/LoginPage";
import ProductionHealthPage from "./pages/ProductionHealthPage";
import RegisterPage from "./pages/RegisterPage";
import UserManagementPage from "./pages/UserManagementPage";
import FinancePage from "./pages/FinancePage";

const App = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, [location.pathname]);

  return (
    <div
      className="route-transition"
      key={location.pathname}
    >
      <Routes>
        {/* =================================================
            PUBLIC ROUTES
        ================================================= */}

        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        {/* =================================================
            PROTECTED ROUTES
        ================================================= */}

        <Route element={<ProtectedRoute />}>
          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          {/* Flock Management */}
          <Route
            path="/flocks"
            element={<FlocksPage />}
          />

          {/* Feed & Inventory */}
          <Route
            path="/inventory"
            element={<InventoryPage />}
          />

          {/* Production & Health */}
          <Route
            path="/production-health"
            element={<ProductionHealthPage />}
          />

          {/* Finance & Analytics */}
          <Route
            path="/finance"
            element={<FinancePage />}
          />

          {/* =================================================
              ADMIN ONLY ROUTES
          ================================================= */}

          <Route element={<AdminRoute />}>
            <Route
              path="/users"
              element={<UserManagementPage />}
            />
          </Route>
        </Route>

        {/* =================================================
            FALLBACK
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
      </Routes>
    </div>
  );
};

export default App;