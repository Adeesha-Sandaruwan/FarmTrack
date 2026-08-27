import { Link, NavLink } from "react-router-dom";

const DashboardSidebar = ({ user, onLogout }) => {
  const navLinkClass = ({ isActive }) =>
    isActive ? "active" : undefined;

  return (
    <aside className="dashboard-sidebar">
      {/* Brand */}
      <Link className="sidebar-brand" to="/dashboard">
        FarmTrack
      </Link>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <NavLink
          end
          className={navLinkClass}
          to="/dashboard"
        >
          Overview
        </NavLink>

        <NavLink
          className={navLinkClass}
          to="/flocks"
        >
          Flock Management
        </NavLink>

        <NavLink
          className={navLinkClass}
          to="/inventory"
        >
          Feed & Inventory
        </NavLink>

        <NavLink
          className={navLinkClass}
          to="/production-health"
        >
          Production & Health
        </NavLink>

        {/* Finance & Analytics */}
        <NavLink
          className={navLinkClass}
          to="/finance"
        >
          Finance & Analytics
        </NavLink>
      </nav>

      {/* Logged-in User */}
      <div className="sidebar-user">
        <strong>{user?.name || "User"}</strong>

        <span>{user?.role || "Manager"}</span>

        <button
          type="button"
          onClick={onLogout}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;