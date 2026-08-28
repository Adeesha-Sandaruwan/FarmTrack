```jsx
import { Link, NavLink } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import LanguageToggle from "./LanguageToggle";

const DashboardSidebar = ({ user, onLogout }) => {
  const { t } = useLanguage();

  const navLinkClass = ({ isActive }) =>
    isActive ? "active" : undefined;

  const getRoleDisplay = (role) => {
    if (role === "admin") return t("userManagement.admins", "Admin");
    if (role === "manager") return t("userManagement.managers", "Manager");
    if (role === "worker") return t("userManagement.workers", "Worker");
    return role || "";
  };

  return (
    <aside className="dashboard-sidebar">
      {/* Brand */}
      <Link className="sidebar-brand" to="/dashboard">
        {t("nav.brand", "FarmTrack")}
      </Link>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <NavLink end className={navLinkClass} to="/dashboard">
          {t("nav.overview", "Overview")}
        </NavLink>

        <NavLink className={navLinkClass} to="/flocks">
          {t("nav.flocks", "Flock Management")}
        </NavLink>

        <NavLink className={navLinkClass} to="/inventory">
          {t("nav.inventory", "Feed & Inventory")}
        </NavLink>

        <NavLink className={navLinkClass} to="/production-health">
          {t("nav.productionHealth", "Production & Health")}
        </NavLink>

        {/* User Management - Admin only */}
        {user?.role === "admin" && (
          <NavLink className={navLinkClass} to="/users">
            {t("nav.userManagement", "User Management")}
          </NavLink>
        )}

        {/* Finance & Analytics - from finance branch */}
        <NavLink className={navLinkClass} to="/finance">
          {t("nav.financeAnalytics", "Finance & Analytics")}
        </NavLink>
      </nav>

      {/* Logged-in User */}
      <div className="sidebar-user">
        <strong>{user?.name || "User"}</strong>

        <span>{getRoleDisplay(user?.role)}</span>

        <button type="button" onClick={onLogout}>
          {t("common.signOut", "Sign out")}
        </button>

        <div className="sidebar-lang-box">
          <LanguageToggle compact />
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
```
