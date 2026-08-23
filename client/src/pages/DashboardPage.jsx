import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

const formatNumber = (value) => new Intl.NumberFormat().format(value || 0);

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navLinkClass = ({ isActive }) => (isActive ? "active" : undefined);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/dashboard/overview");
      setOverview(data.overview);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load your farm dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    api
      .get("/dashboard/overview")
      .then(({ data }) => {
        if (!cancelled) {
          setOverview(data.overview);
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load your farm dashboard."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const kpis = overview?.kpis;

  return (
    <main className="farm-dashboard">
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

          <span title="Waiting for Finance module integration">
            Finance & Analytics
          </span>
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
            <p className="eyebrow">Farm overview</p>
            <h1>{user?.farmName || "Your FarmTrack dashboard"}</h1>
            <p>
              Monitor your flock, stock, production, and health records in one
              place.
            </p>
          </div>

          <button
            className="refresh-button"
            type="button"
            onClick={loadDashboard}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh data"}
          </button>
        </header>

        {error && <p className="error-message">{error}</p>}

        {loading && !overview ? (
          <section className="management-panel">
            <p className="loading-text">Loading your farm dashboard...</p>
          </section>
        ) : (
          <>
            <section className="overview-kpi-grid">
              <article className="overview-kpi-card">
                <span>Active flocks</span>
                <strong>{formatNumber(kpis?.activeFlocks)}</strong>
                <p>{formatNumber(kpis?.currentPopulation)} birds currently</p>
              </article>

              <article className="overview-kpi-card">
                <span>Eggs today</span>
                <strong>{formatNumber(kpis?.totalEggsToday)}</strong>
                <p>{formatNumber(kpis?.goodEggsToday)} good eggs recorded</p>
              </article>

              <article className="overview-kpi-card alert">
                <span>Mortality this week</span>
                <strong>{formatNumber(kpis?.mortalityThisWeek)}</strong>
                <p>{kpis?.mortalityRate || 0}% of initial population</p>
              </article>

              <article className="overview-kpi-card">
                <span>Low-stock alerts</span>
                <strong>{formatNumber(kpis?.lowStockCount)}</strong>
                <p>Items at or below reorder level</p>
              </article>
            </section>

            <section className="overview-two-column">
              <section className="management-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Quick actions</p>
                    <h2>Farm operations</h2>
                  </div>
                </div>

                <div className="quick-action-grid">
                  <Link className="quick-action-card" to="/flocks">
                    <span>Flock Management</span>
                    <strong>Add batches and mortality records</strong>
                  </Link>

                  <Link className="quick-action-card" to="/inventory">
                    <span>Feed & Inventory</span>
                    <strong>Record feed usage and stock movement</strong>
                  </Link>

                  <Link className="quick-action-card" to="/production-health">
                    <span>Production & Health</span>
                    <strong>Record eggs, vaccinations, and treatments</strong>
                  </Link>

                  <div className="quick-action-card disabled">
                    <span>Finance & Analytics</span>
                    <strong>Coming soon from your finance team</strong>
                  </div>
                </div>
              </section>

              <section className="management-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Health monitoring</p>
                    <h2>Health alerts</h2>
                  </div>

                  <span className="role-note">
                    {formatNumber(kpis?.healthAlertCount)} urgent
                  </span>
                </div>

                {overview?.healthAlerts?.length ? (
                  <div className="health-list">
                    {overview.healthAlerts.map((record) => (
                      <article className="health-list-item" key={record._id}>
                        <div>
                          <strong>{record.title}</strong>
                          <span>
                            {record.flock?.batchCode || "Unknown flock"} ·{" "}
                            {formatDate(record.date)}
                          </span>
                        </div>

                        <span className={`severity-badge ${record.severity}`}>
                          {record.severity}
                        </span>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="loading-text">No high-priority health alerts.</p>
                )}
              </section>
            </section>

            <section className="overview-two-column">
              <section className="management-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Stock control</p>
                    <h2>Low-stock items</h2>
                  </div>

                  <Link className="small-page-link" to="/inventory">
                    Open inventory
                  </Link>
                </div>

                {overview?.lowStockItems?.length ? (
                  <div className="dashboard-list">
                    {overview.lowStockItems.map((item) => (
                      <article className="dashboard-list-item" key={item._id}>
                        <div>
                          <strong>{item.name}</strong>
                          <span className="capitalize">{item.category}</span>
                        </div>

                        <div className="stock-amount">
                          <strong>
                            {formatNumber(item.currentStock)} {item.unit}
                          </strong>
                          <span>
                            Reorder at {formatNumber(item.reorderLevel)}{" "}
                            {item.unit}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="loading-text">
                    All inventory items are above their reorder levels.
                  </p>
                )}
              </section>

              <section className="management-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Vaccination planner</p>
                    <h2>Due in the next 7 days</h2>
                  </div>

                  <Link className="small-page-link" to="/production-health">
                    Open health records
                  </Link>
                </div>

                {overview?.upcomingVaccinations?.length ? (
                  <div className="dashboard-list">
                    {overview.upcomingVaccinations.map((record) => (
                      <article className="dashboard-list-item" key={record._id}>
                        <div>
                          <strong>{record.title}</strong>
                          <span>{record.flock?.batchCode || "Unknown flock"}</span>
                        </div>

                        <div className="stock-amount">
                          <strong>{formatDate(record.nextDueDate)}</strong>
                          <span>Next due date</span>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="loading-text">
                    No vaccinations or treatments are due in the next 7 days.
                  </p>
                )}
              </section>
            </section>

            <section className="management-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Farm timeline</p>
                  <h2>Recent activity</h2>
                </div>
              </div>

              {overview?.recentActivity?.length ? (
                <div className="activity-list">
                  {overview.recentActivity.map((activity) => (
                    <article
                      className={`activity-item ${activity.type}`}
                      key={`${activity.type}-${activity.id}`}
                    >
                      <span className="activity-dot" />

                      <div>
                        <strong>{activity.title}</strong>
                        <p>{activity.description}</p>
                      </div>

                      <time>{formatDate(activity.date)}</time>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <h3>No farm activity yet</h3>
                  <p>
                    Create a flock, add inventory, or record production to see
                    activity here.
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  );
};

export default DashboardPage;