import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import DashboardSidebar from "../components/DashboardSidebar";

const today = new Date().toISOString().slice(0, 10);

const emptyFlockForm = {
  batchCode: "",
  breed: "",
  flockType: "layer",
  source: "",
  placementDate: today,
  initialPopulation: "",
  notes: "",
};

const emptyMortalityForm = {
  flockId: "",
  date: today,
  count: "",
  cause: "",
  notes: "",
};

const formatNumber = (value) => new Intl.NumberFormat().format(value || 0);

const FlocksPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");

  const [flockForm, setFlockForm] = useState(emptyFlockForm);
  const [mortalityForm, setMortalityForm] = useState(emptyMortalityForm);

  const [creatingFlock, setCreatingFlock] = useState(false);
  const [creatingMortality, setCreatingMortality] = useState(false);

  const canManageFlocks = ["admin", "manager"].includes(user?.role);

  const loadFlocks = async () => {
    try {
      setLoading(true);
      setPageError("");

      const { data } = await api.get("/flocks");
      setFlocks(data.flocks);
    } catch (requestError) {
      setPageError(
        requestError.response?.data?.message ||
          t("flocks.noFlocksMatch", "Unable to load flock records. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const loadInitialFlocks = async () => {
      try {
        const { data } = await api.get("/flocks");

        if (!isCancelled) {
          setFlocks(data.flocks);
        }
      } catch (requestError) {
        if (!isCancelled) {
          setPageError(
            requestError.response?.data?.message ||
              "Unable to load flock records. Please try again."
          );
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadInitialFlocks();

    return () => {
      isCancelled = true;
    };
  }, []);

const summary = useMemo(() => {
  const activeFlocks = flocks.filter((flock) => flock.status === "active");

  return {
    totalFlocks: flocks.length,
    activeFlocks: activeFlocks.length,
    totalPopulation: flocks.reduce(
      (sum, flock) => sum + (flock.currentPopulation || 0),
      0
    ),
    totalMortality: flocks.reduce(
      (sum, flock) =>
        sum +
        Math.max(
          0,
          (flock.initialPopulation || 0) -
            (flock.currentPopulation || 0)
        ),
      0
    ),
  };
}, [flocks]);
  const handleFlockChange = (event) => {
    setFlockForm({
      ...flockForm,
      [event.target.name]: event.target.value,
    });
  };

  const handleMortalityChange = (event) => {
    setMortalityForm({
      ...mortalityForm,
      [event.target.name]: event.target.value,
    });
  };

  const handleCreateFlock = async (event) => {
    event.preventDefault();
    setFormError("");
    setMessage("");
    setCreatingFlock(true);

    try {
      await api.post("/flocks", {
        ...flockForm,
        initialPopulation: Number(flockForm.initialPopulation),
      });

      setFlockForm(emptyFlockForm);
      setMessage(t("common.success", "Flock batch created successfully."));
      await loadFlocks();
    } catch (requestError) {
      setFormError(
        requestError.response?.data?.message ||
          t("common.error", "Unable to create flock batch.")
      );
    } finally {
      setCreatingFlock(false);
    }
  };

  const handleCreateMortality = async (event) => {
    event.preventDefault();
    setFormError("");
    setMessage("");
    setCreatingMortality(true);

    try {
      await api.post(`/flocks/${mortalityForm.flockId}/mortality`, {
        date: mortalityForm.date,
        count: Number(mortalityForm.count),
        cause: mortalityForm.cause || "Unknown",
        notes: mortalityForm.notes,
      });

      setMortalityForm(emptyMortalityForm);
      setMessage(t("common.success", "Mortality recorded successfully."));
      await loadFlocks();
    } catch (requestError) {
      setFormError(
        requestError.response?.data?.message ||
          t("common.error", "Unable to record mortality.")
      );
    } finally {
      setCreatingMortality(false);
    }
  };

  const startMortalityRecord = (flockId) => {
    setMortalityForm({
      ...emptyMortalityForm,
      flockId,
    });

    document
      .getElementById("mortality-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getStatusDisplay = (status) => {
    if (status === "active") return t("common.active", "Active");
    if (status === "closed" || status === "culled")
      return t("common.culled", "Culled");
    return status;
  };

  const getFlockTypeDisplay = (type) => {
    if (type === "layer") return t("common.layer", "Layer");
    if (type === "broiler") return t("common.broiler", "Broiler");
    return type;
  };

  return (
    <main className="farm-dashboard">
      <DashboardSidebar user={user} onLogout={handleLogout} />

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">{t("flocks.title", "Flock Management")}</p>
            <h1>{t("flocks.title", "Flock Management")}</h1>
            <p>
              {t(
                "flocks.subtitle",
                "Manage batches, track populations, and record mortality."
              )}
            </p>
          </div>

          <button className="refresh-button" type="button" onClick={loadFlocks}>
            {t("common.refresh", "Refresh data")}
          </button>
        </header>

        {pageError && <p className="error-message">{pageError}</p>}
        {formError && <p className="error-message">{formError}</p>}
        {message && <p className="success-message">{message}</p>}

        <section className="summary-grid">
          <article className="summary-card">
            <span>{t("flocks.allFilter", "Total batches")}</span>
            <strong>{summary.totalFlocks}</strong>
          </article>

          <article className="summary-card">
            <span>{t("flocks.activeBatchesCount", "Active flocks")}</span>
            <strong>{summary.activeFlocks}</strong>
          </article>

          <article className="summary-card">
            <span>{t("flocks.currentCountCol", "Current population")}</span>
            <strong>{formatNumber(summary.totalPopulation)}</strong>
          </article>

          <article className="summary-card mortality-card">
            <span>{t("flocks.totalMortalityCount", "Recorded mortality")}</span>
            <strong>{formatNumber(summary.totalMortality)}</strong>
          </article>
        </section>

        {canManageFlocks && (
          <section className="management-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{t("flocks.addBatch", "New batch")}</p>
                <h2>{t("flocks.addFlockModalTitle", "Add a flock")}</h2>
              </div>

              <span className="role-note">
                {t("userManagement.managerRole", "Manager / Admin access")}
              </span>
            </div>

            <form className="flock-form" onSubmit={handleCreateFlock}>
              <label>
                {t("flocks.batchCodeLabel", "Batch code")}
                <input
                  name="batchCode"
                  placeholder={t(
                    "flocks.batchCodePlaceholder",
                    "e.g., LAY-001"
                  )}
                  value={flockForm.batchCode}
                  onChange={handleFlockChange}
                  required
                />
              </label>

              <label>
                {t("flocks.breedLabel", "Breed")}
                <input
                  name="breed"
                  placeholder={t(
                    "flocks.breedPlaceholder",
                    "e.g., Hy-Line Brown"
                  )}
                  value={flockForm.breed}
                  onChange={handleFlockChange}
                  required
                />
              </label>

              <label>
                {t("flocks.flockTypeLabel", "Flock type")}
                <select
                  name="flockType"
                  value={flockForm.flockType}
                  onChange={handleFlockChange}
                >
                  <option value="layer">{t("common.layer", "Layer")}</option>
                  <option value="broiler">
                    {t("common.broiler", "Broiler")}
                  </option>
                  <option value="breeder">Breeder</option>
                  <option value="other">{t("common.other", "Other")}</option>
                </select>
              </label>

              <label>
                {t("flocks.placementDateLabel", "Placement date")}
                <input
                  type="date"
                  name="placementDate"
                  value={flockForm.placementDate}
                  onChange={handleFlockChange}
                  required
                />
              </label>

              <label>
                {t("flocks.initialPopulationLabel", "Initial population")}
                <input
                  type="number"
                  name="initialPopulation"
                  min="1"
                  placeholder={t(
                    "flocks.initialPopulationPlaceholder",
                    "e.g., 500"
                  )}
                  value={flockForm.initialPopulation}
                  onChange={handleFlockChange}
                  required
                />
              </label>

              <label>
                {t("flocks.sourceLabel", "Hatchery / source")}
                <input
                  name="source"
                  placeholder={t(
                    "flocks.sourcePlaceholder",
                    "e.g., ABC Hatchery"
                  )}
                  value={flockForm.source}
                  onChange={handleFlockChange}
                />
              </label>

              <label className="form-wide">
                {t("flocks.notesLabel", "Notes")}
                <input
                  name="notes"
                  placeholder={t(
                    "flocks.notesPlaceholder",
                    "Optional batch notes"
                  )}
                  value={flockForm.notes}
                  onChange={handleFlockChange}
                />
              </label>

              <button
                className="form-wide"
                type="submit"
                disabled={creatingFlock}
              >
                {creatingFlock
                  ? t("flocks.creatingFlock", "Creating batch...")
                  : t("flocks.createFlockBtn", "Create flock batch")}
              </button>
            </form>
          </section>
        )}

        <section className="management-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{t("flocks.title", "Live records")}</p>
              <h2>{t("flocks.flockListTitle", "Flock batches")}</h2>
            </div>

            <span className="role-note">
              {flocks.length} {t("common.units", "records")}
            </span>
          </div>

          {loading ? (
            <p className="loading-text">
              {t("common.loading", "Loading flock records...")}
            </p>
          ) : flocks.length === 0 ? (
            <div className="empty-state">
              <h3>{t("flocks.noFlocksMatch", "No flock batches yet")}</h3>
              <p>
                {canManageFlocks
                  ? t(
                      "flocks.addFlockModalTitle",
                      "Create your first flock batch using the form above."
                    )
                  : t(
                      "dashboard.noActiveFlocks",
                      "Ask a manager or administrator to create your first flock batch."
                    )}
              </p>
            </div>
          ) : (
            <div className="flock-table-wrap">
              <table className="flock-table">
                <thead>
                  <tr>
                    <th>{t("flocks.batchCodeCol", "Batch")}</th>
                    <th>{t("flocks.breedCol", "Breed / Type")}</th>
                    <th>{t("flocks.currentCountCol", "Population")}</th>
                    <th>{t("flocks.statusCol", "Status")}</th>
                    <th>{t("flocks.placementDateCol", "Placement")}</th>
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {flocks.map((flock) => (
                    <tr key={flock._id}>
                      <td>
                        <strong>{flock.batchCode}</strong>
                        <span>
                          {flock.source ||
                            t("common.noData", "No source recorded")}
                        </span>
                      </td>

                      <td>
                        <strong>{flock.breed}</strong>
                        <span className="capitalize">
                          {getFlockTypeDisplay(flock.flockType)}
                        </span>
                      </td>

                      <td>
                        <strong>{formatNumber(flock.currentPopulation)}</strong>
                        <span>
                          of {formatNumber(flock.initialPopulation)}{" "}
                          {t("common.units", "birds")}
                        </span>
                      </td>

                      <td>
                        <span className={`status-badge ${flock.status}`}>
                          {getStatusDisplay(flock.status)}
                        </span>
                      </td>

                      <td>
                        {new Date(flock.placementDate).toLocaleDateString()}
                      </td>

                      <td>
                        {flock.status === "active" && (
                          <button
                            className="table-action"
                            type="button"
                            onClick={() => startMortalityRecord(flock._id)}
                          >
                            {t("flocks.logMortality", "Record mortality")}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section id="mortality-form" className="management-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">
                {t("dashboard.title", "Daily operation")}
              </p>
              <h2>{t("flocks.logMortalityModalTitle", "Record mortality")}</h2>
            </div>

            <span className="role-note">
              {t("userManagement.workerRole", "Available to all farm users")}
            </span>
          </div>

          <form className="flock-form" onSubmit={handleCreateMortality}>
            <label>
              {t("flocks.selectFlockLabel", "Flock batch")}
              <select
                name="flockId"
                value={mortalityForm.flockId}
                onChange={handleMortalityChange}
                required
              >
                <option value="">
                  {t("flocks.selectFlockPlaceholder", "Select an active flock")}
                </option>

                {flocks
                  .filter((flock) => flock.status === "active")
                  .map((flock) => (
                    <option key={flock._id} value={flock._id}>
                      {flock.batchCode} — {flock.breed}
                    </option>
                  ))}
              </select>
            </label>

            <label>
              {t("flocks.mortalityDateLabel", "Date")}
              <input
                type="date"
                name="date"
                value={mortalityForm.date}
                onChange={handleMortalityChange}
                required
              />
            </label>

            <label>
              {t("flocks.mortalityCountLabel", "Number of birds")}
              <input
                type="number"
                name="count"
                min="1"
                placeholder={t("flocks.mortalityCountPlaceholder", "e.g., 2")}
                value={mortalityForm.count}
                onChange={handleMortalityChange}
                required
              />
            </label>

            <label>
              {t("flocks.causeLabel", "Cause")}
              <input
                name="cause"
                placeholder={t(
                  "flocks.causePlaceholder",
                  "e.g., Heat stress"
                )}
                value={mortalityForm.cause}
                onChange={handleMortalityChange}
              />
            </label>

            <label className="form-wide">
              {t("flocks.notesLabel", "Notes")}
              <input
                name="notes"
                placeholder={t(
                  "flocks.notesPlaceholder",
                  "Optional inspection notes"
                )}
                value={mortalityForm.notes}
                onChange={handleMortalityChange}
              />
            </label>

            <button
              className="form-wide"
              type="submit"
              disabled={creatingMortality}
            >
              {creatingMortality
                ? t("flocks.recordingMortality", "Saving record...")
                : t("flocks.recordMortalityBtn", "Save mortality record")}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
};

export default FlocksPage;