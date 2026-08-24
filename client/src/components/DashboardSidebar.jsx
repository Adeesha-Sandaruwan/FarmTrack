import { Link, NavLink } from "react-router-dom";

const DashboardSidebar = ({ user, onLogout }) => {
  const navLinkClass = ({ isActive }) => (isActive ? "active" : undefined);

  return (
    <aside className="dashboard-sidebar">
      <Link className="sidebar-brand" to="/dashboard">
        FarmTrack
      </Link>

      <nav className="sidebar-nav">
        <NavLink end className={navLinkClass} to="/dashboard">
          Overview
        </NavLink>

        <NavLink className={navLinkClass} to="/flocks">
          Flock Management
        </NavLink>

        <NavLink className={navLinkClass} to="/inventory">
          Feed & Inventory
        </NavLink>

        <NavLink className={navLinkClass} to="/production-health">
          Production & Health
        </NavLink>

        <span title="This module is coming soon">Finance & Analytics</span>
      </nav>

      <div className="sidebar-user">
        <strong>{user?.name}</strong>
        <span>{user?.role}</span>

        <button type="button" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;