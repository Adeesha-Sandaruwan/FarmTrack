import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import DashboardSidebar from "../components/DashboardSidebar";

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
  const { t } = useLanguage();

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/dashboard/overview");
      setOverview(data.overview);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          t("dashboard.subtitle", "Unable to load your farm dashboard.")
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
      <DashboardSidebar user={user} onLogout={handleLogout} />

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">
              {t("dashboard.title", "Farm overview")}
            </p>

            <h1>
              {user?.farmName ||
                t("dashboard.welcomeBack", "Your FarmTrack dashboard")}
            </h1>

            <p>
              {t(
                "dashboard.subtitle",
                "Monitor your flock, stock, production, and health records in one place."
              )}
            </p>
          </div>

          <button
            className="refresh-button"
            type="button"
            onClick={loadDashboard}
            disabled={loading}
          >
            {loading
              ? t("common.loading", "Refreshing...")
              : t("common.refresh", "Refresh data")}
          </button>
        </header>

        {error && <p className="error-message">{error}</p>}

        {loading && !overview ? (
          <section className="management-panel">
            <p className="loading-text">
              {t("common.loading", "Loading your farm dashboard...")}
            </p>
          </section>
        ) : (
          <>
            <section className="overview-kpi-grid">
              <article className="overview-kpi-card">
                <span>
                  {t("dashboard.activeFlocks", "Active flocks")}
                </span>

                <strong>
                  {formatNumber(kpis?.activeFlocks)}
                </strong>

                <p>
                  {formatNumber(kpis?.currentPopulation)}{" "}
                  {t("common.units", "birds currently")}
                </p>
              </article>

              <article className="overview-kpi-card">
                <span>
                  {t("dashboard.eggProductionToday", "Eggs today")}
                </span>

                <strong>
                  {formatNumber(kpis?.totalEggsToday)}
                </strong>

                <p>
                  {formatNumber(kpis?.goodEggsToday)}{" "}
                  {t(
                    "productionHealth.goodEggsCol",
                    "good eggs recorded"
                  )}
                </p>
              </article>

              <article className="overview-kpi-card alert">
                <span>
                  {t("dashboard.dailyMortality", "Mortality this week")}
                </span>

                <strong>
                  {formatNumber(kpis?.mortalityThisWeek)}
                </strong>

                <p>
                  {kpis?.mortalityRate || 0}%{" "}
                  {t("flocks.mortalityCol", "mortality rate")}
                </p>
              </article>

              <article className="overview-kpi-card">
                <span>
                  {t("dashboard.lowStockAlerts", "Low-stock alerts")}
                </span>

                <strong>
                  {formatNumber(kpis?.lowStockCount)}
                </strong>

                <p>
                  {t(
                    "dashboard.feedSuppliesWarning",
                    "Items at or below reorder level"
                  )}
                </p>
              </article>
            </section>

            <section className="overview-two-column">
              <section className="management-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">
                      {t("dashboard.quickActions", "Quick actions")}
                    </p>

                    <h2>
                      {t("dashboard.title", "Farm operations")}
                    </h2>
                  </div>
                </div>

                <div className="quick-action-grid">
                  <Link
                    className="quick-action-card"
                    to="/flocks"
                  >
                    <span>
                      {t("nav.flocks", "Flock Management")}
                    </span>

                    <strong>
                      {t(
                        "flocks.subtitle",
                        "Add batches and mortality records"
                      )}
                    </strong>
                  </Link>

                  <Link
                    className="quick-action-card"
                    to="/inventory"
                  >
                    <span>
                      {t("nav.inventory", "Feed & Inventory")}
                    </span>

                    <strong>
                      {t(
                        "inventory.subtitle",
                        "Record feed usage and stock movement"
                      )}
                    </strong>
                  </Link>

                  <Link
                    className="quick-action-card"
                    to="/production-health"
                  >
                    <span>
                      {t(
                        "nav.productionHealth",
                        "Production & Health"
                      )}
                    </span>

                    <strong>
                      {t(
                        "productionHealth.subtitle",
                        "Record eggs, vaccinations, and treatments"
                      )}
                    </strong>
                  </Link>

                  <Link
                    className="quick-action-card"
                    to="/finance"
                  >
                    <span>
                      {t(
                        "nav.financeAnalytics",
                        "Finance & Analytics"
                      )}
                    </span>

                    <strong>
                      {t(
                        "dashboard.financeAnalyticsDescription",
                        "View farm financial records and analytics"
                      )}
                    </strong>
                  </Link>
                </div>
              </section>

              <section className="management-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">
                      {t(
                        "productionHealth.title",
                        "Health monitoring"
                      )}
                    </p>

                    <h2>
                      {t(
                        "productionHealth.healthRecordsTitle",
                        "Health alerts"
                      )}
                    </h2>
                  </div>

                  <span className="role-note">
                    {formatNumber(kpis?.healthAlertCount)}{" "}
                    {t("common.pending", "urgent")}
                  </span>
                </div>

                {overview?.healthAlerts?.length ? (
                  <div className="health-list">
                    {overview.healthAlerts.map((record) => (
                      <article
                        className="health-list-item"
                        key={record._id}
                      >
                        <div>
                          <strong>{record.title}</strong>

                          <span>
                            {record.flock?.batchCode ||
                              t("common.other", "Unknown flock")}{" "}
                            · {formatDate(record.date)}
                          </span>
                        </div>

                        <span
                          className={`severity-badge ${record.severity}`}
                        >
                          {record.severity}
                        </span>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="loading-text">
                    {t(
                      "dashboard.allStockHealthy",
                      "No high-priority health alerts."
                    )}
                  </p>
                )}
              </section>
            </section>

            <section className="overview-two-column">
              <section className="management-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">
                      {t("inventory.title", "Stock control")}
                    </p>

                    <h2>
                      {t(
                        "inventory.lowStockItems",
                        "Low-stock items"
                      )}
                    </h2>
                  </div>

                  <Link
                    className="small-page-link"
                    to="/inventory"
                  >
                    {t(
                      "inventory.inventoryListTitle",
                      "Open inventory"
                    )}
                  </Link>
                </div>

                {overview?.lowStockItems?.length ? (
                  <div className="dashboard-list">
                    {overview.lowStockItems.map((item) => (
                      <article
                        className="dashboard-list-item"
                        key={item._id}
                      >
                        <div>
                          <strong>{item.name}</strong>
                          <span className="capitalize">
                            {item.category}
                          </span>
                        </div>

                        <div className="stock-amount">
                          <strong>
                            {formatNumber(item.currentStock)}{" "}
                            {item.unit}
                          </strong>

                          <span>
                            {t(
                              "inventory.minAlertCol",
                              "Reorder at"
                            )}{" "}
                            {formatNumber(item.reorderLevel)}{" "}
                            {item.unit}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="loading-text">
                    {t(
                      "dashboard.allStockHealthy",
                      "All inventory items are above their reorder levels."
                    )}
                  </p>
                )}
              </section>

              <section className="management-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">
                      {t(
                        "productionHealth.eventVaccination",
                        "Vaccination planner"
                      )}
                    </p>

                    <h2>
                      {t(
                        "productionHealth.healthRecordsTitle",
                        "Due in the next 7 days"
                      )}
                    </h2>
                  </div>

                  <Link
                    className="small-page-link"
                    to="/production-health"
                  >
                    {t(
                      "productionHealth.title",
                      "Open health records"
                    )}
                  </Link>
                </div>

                {overview?.upcomingVaccinations?.length ? (
                  <div className="dashboard-list">
                    {overview.upcomingVaccinations.map((record) => (
                      <article
                        className="dashboard-list-item"
                        key={record._id}
                      >
                        <div>
                          <strong>{record.title}</strong>

                          <span>
                            {record.flock?.batchCode ||
                              t("common.other", "Unknown flock")}
                          </span>
                        </div>

                        <div className="stock-amount">
                          <strong>
                            {formatDate(record.nextDueDate)}
                          </strong>

                          <span>
                            {t("common.date", "Next due date")}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="loading-text">
                    {t(
                      "productionHealth.noHealthRecords",
                      "No vaccinations or treatments are due in the next 7 days."
                    )}
                  </p>
                )}
              </section>
            </section>

            <section className="management-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">
                    {t("dashboard.title", "Farm timeline")}
                  </p>

                  <h2>
                    {t(
                      "dashboard.recentActivity",
                      "Recent activity"
                    )}
                  </h2>
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
                  <h3>
                    {t("common.noData", "No farm activity yet")}
                  </h3>

                  <p>
                    {t(
                      "dashboard.noActiveFlocks",
                      "Create a flock, add inventory, or record production to see activity here."
                    )}
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
