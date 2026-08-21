import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <main className="farm-dashboard">
      <aside className="dashboard-sidebar">
        <Link className="sidebar-brand" to="/dashboard">
          FarmTrack
        </Link>

        <nav className="sidebar-nav">
          <Link className="active" to="/dashboard">
            Overview
          </Link>
          <Link to="/flocks">Flock Management</Link>
          <span>Feed & Inventory</span>
          <Link to="/production-health">Production & Health</Link>
          <span>Finance & Analytics</span>
        </nav>

        <div className="sidebar-user">
          <strong>{user?.name}</strong>
          <span>{user?.role}</span>
          <button type="button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h1>{user?.farmName || "Your FarmTrack dashboard"}</h1>
            <p>
              Build reliable digital records for every layer of your farm.
            </p>
          </div>
        </header>

        <section className="overview-hero">
          <div>
            <p className="eyebrow">First module ready</p>
            <h2>Start managing your flocks and batches.</h2>
            <p>
              Add a batch, track its live population, and record daily
              mortality in one place.
            </p>
            <Link className="primary-link" to="/flocks">
              Open Flock Management
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
};

export default DashboardPage;