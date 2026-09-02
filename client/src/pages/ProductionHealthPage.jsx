import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import DashboardSidebar from "../components/DashboardSidebar";

const today = new Date().toISOString().slice(0, 10);

const emptyProductionForm = {
  flock: "",
  date: today,
  eggCount: "",
  damagedEggs: "",
  averageBirdWeight: "",
  notes: "",
};

const emptyHealthForm = {
  flock: "",
  recordType: "vaccination",
  title: "",
  date: today,
  medicineOrVaccine: "",
  dosage: "",
  quantity: "",
  severity: "low",
  nextDueDate: "",
  description: "",
};

const formatNumber = (value) => new Intl.NumberFormat().format(value || 0);

const titleCase = (value) =>
  value.replace("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const ProductionHealthPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const [flocks, setFlocks] = useState([]);
  const [productionRecords, setProductionRecords] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [savingProduction, setSavingProduction] = useState(false);
  const [savingHealth, setSavingHealth] = useState(false);

  const [productionForm, setProductionForm] = useState(emptyProductionForm);
  const [healthForm, setHealthForm] = useState(emptyHealthForm);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [flockResponse, productionResponse, healthResponse] =
        await Promise.all([
          api.get("/flocks?status=active"),
          api.get("/production"),
          api.get("/health-records"),
        ]);

      setFlocks(flockResponse.data.flocks);
      setProductionRecords(productionResponse.data.records);
      setHealthRecords(healthResponse.data.records);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          t("common.error", "Unable to load production and health records.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      api.get("/flocks?status=active"),
      api.get("/production"),
      api.get("/health-records"),
    ])
      .then(([flockResponse, productionResponse, healthResponse]) => {
        if (cancelled) return;

        setFlocks(flockResponse.data.flocks);
        setProductionRecords(productionResponse.data.records);
        setHealthRecords(healthResponse.data.records);
      })
      .catch((requestError) => {
        if (cancelled) return;

        setError(
          requestError.response?.data?.message ||
            "Unable to load production and health records."
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const totalEggs = productionRecords.reduce(
      (total, record) => total + record.eggCount,
      0
    );

    const damagedEggs = productionRecords.reduce(
      (total, record) => total + record.damagedEggs,
      0
    );

    const criticalRecords = healthRecords.filter((record) =>
      ["high", "critical"].includes(record.severity)
    ).length;

    return {
      totalEggs,
      damagedEggs,
      healthyEggs: totalEggs - damagedEggs,
      criticalRecords,
    };
  }, [productionRecords, healthRecords]);

  const handleProductionSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSavingProduction(true);

    try {
      await api.post("/production", {
        ...productionForm,
        eggCount: Number(productionForm.eggCount),
        damagedEggs: Number(productionForm.damagedEggs || 0),
        averageBirdWeight: productionForm.averageBirdWeight
          ? Number(productionForm.averageBirdWeight)
          : undefined,
      });

      setProductionForm(emptyProductionForm);
      setMessage(
        t("common.success", "Daily production record saved.")
      );
      await loadData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          t("common.error", "Unable to save the production record.")
      );
    } finally {
      setSavingProduction(false);
    }
  };

  const handleHealthSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSavingHealth(true);

    try {
      await api.post("/health-records", {
        ...healthForm,
        quantity: healthForm.quantity
          ? Number(healthForm.quantity)
          : undefined,
        nextDueDate: healthForm.nextDueDate || undefined,
      });

      setHealthForm(emptyHealthForm);
      setMessage(t("common.success", "Health record saved."));
      await loadData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          t("common.error", "Unable to save the health record.")
      );
    } finally {
      setSavingHealth(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <main className="farm-dashboard">
      <DashboardSidebar user={user} onLogout={handleLogout} />

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">
              {t("productionHealth.title", "Farm operations")}
            </p>
            <h1>{t("productionHealth.title", "Production & Health")}</h1>
            <p>
              {t(
                "productionHealth.subtitle",
                "Record eggs, monitor weights, and maintain flock health."
              )}
            </p>
          </div>

          <button className="refresh-button" type="button" onClick={loadData}>
            {t("common.refresh", "Refresh data")}
          </button>
        </header>

        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        <section className="summary-grid">
          <article className="summary-card">
            <span>{t("productionHealth.totalEggsLabel", "Total eggs recorded")}</span>
            <strong>{formatNumber(summary.totalEggs)}</strong>
          </article>
          <article className="summary-card">
            <span>{t("productionHealth.goodEggsLabel", "Good eggs")}</span>
            <strong>{formatNumber(summary.healthyEggs)}</strong>
          </article>
          <article className="summary-card mortality-card">
            <span>{t("productionHealth.damagedEggsLabel", "Damaged eggs")}</span>
            <strong>{formatNumber(summary.damagedEggs)}</strong>
          </article>
          <article className="summary-card">
            <span>{t("productionHealth.healthIncidents", "Health alerts")}</span>
            <strong>{summary.criticalRecords}</strong>
          </article>
        </section>

        <section className="production-split">
          <section className="management-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{t("dashboard.title", "Daily operation")}</p>
                <h2>{t("productionHealth.eggModalTitle", "Record production")}</h2>
              </div>
            </div>

            <form className="flock-form" onSubmit={handleProductionSubmit}>
              <label className="form-wide">
                {t("productionHealth.selectFlock", "Flock batch")}
                <select
                  value={productionForm.flock}
                  onChange={(event) =>
                    setProductionForm({
                      ...productionForm,
                      flock: event.target.value,
                    })
                  }
                  required
                >
                  <option value="">
                    {t("productionHealth.selectFlock", "Select an active flock")}
                  </option>
                  {flocks.map((flock) => (
                    <option key={flock._id} value={flock._id}>
                      {flock.batchCode} — {flock.breed}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                {t("productionHealth.collectionDate", "Record date")}
                <input
                  type="date"
                  value={productionForm.date}
                  onChange={(event) =>
                    setProductionForm({
                      ...productionForm,
                      date: event.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                {t("productionHealth.totalEggsLabel", "Total eggs")}
                <input
                  type="number"
                  min="0"
                  placeholder="e.g., 420"
                  value={productionForm.eggCount}
                  onChange={(event) =>
                    setProductionForm({
                      ...productionForm,
                      eggCount: event.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                {t("productionHealth.damagedEggsLabel", "Damaged eggs")}
                <input
                  type="number"
                  min="0"
                  placeholder="e.g., 8"
                  value={productionForm.damagedEggs}
                  onChange={(event) =>
                    setProductionForm({
                      ...productionForm,
                      damagedEggs: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                {t("productionHealth.avgWeightLabel", "Average bird weight (g)")}
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={t("productionHealth.weightPlaceholder", "Optional")}
                  value={productionForm.averageBirdWeight}
                  onChange={(event) =>
                    setProductionForm({
                      ...productionForm,
                      averageBirdWeight: event.target.value,
                    })
                  }
                />
              </label>

              <label className="form-wide">
                {t("common.notes", "Notes")}
                <input
                  placeholder="Optional production notes"
                  value={productionForm.notes}
                  onChange={(event) =>
                    setProductionForm({
                      ...productionForm,
                      notes: event.target.value,
                    })
                  }
                />
              </label>

              <button
                className="form-wide"
                type="submit"
                disabled={savingProduction}
              >
                {savingProduction
                  ? t("productionHealth.loggingEggs", "Saving production...")
                  : t("productionHealth.saveEggRecord", "Save production record")}
              </button>
            </form>
          </section>

          <section className="management-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{t("productionHealth.healthRecordsTitle", "Health log")}</p>
                <h2>{t("productionHealth.healthModalTitle", "Add health record")}</h2>
              </div>
            </div>

            <form className="flock-form" onSubmit={handleHealthSubmit}>
              <label>
                {t("flocks.selectFlockLabel", "Flock batch")}
                <select
                  value={healthForm.flock}
                  onChange={(event) =>
                    setHealthForm({ ...healthForm, flock: event.target.value })
                  }
                  required
                >
                  <option value="">
                    {t("flocks.selectFlockPlaceholder", "Select an active flock")}
                  </option>
                  {flocks.map((flock) => (
                    <option key={flock._id} value={flock._id}>
                      {flock.batchCode} — {flock.breed}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                {t("productionHealth.eventTypeLabel", "Record type")}
                <select
                  value={healthForm.recordType}
                  onChange={(event) =>
                    setHealthForm({
                      ...healthForm,
                      recordType: event.target.value,
                    })
                  }
                >
                  <option value="vaccination">
                    {t("productionHealth.eventVaccination", "Vaccination")}
                  </option>
                  <option value="treatment">
                    {t("productionHealth.eventMedication", "Treatment")}
                  </option>
                  <option value="incident">
                    {t("productionHealth.eventDisease", "Health incident")}
                  </option>
                  <option value="weight-check">
                    {t("productionHealth.logWeight", "Weight check")}
                  </option>
                </select>
              </label>

              <label>
                {t("common.date", "Date")}
                <input
                  type="date"
                  value={healthForm.date}
                  onChange={(event) =>
                    setHealthForm({ ...healthForm, date: event.target.value })
                  }
                  required
                />
              </label>

              <label className="form-wide">
                {t("productionHealth.eventDetailsLabel", "Title")}
                <input
                  placeholder={t(
                    "productionHealth.eventDetailsPlaceholder",
                    "e.g., Newcastle disease vaccination"
                  )}
                  value={healthForm.title}
                  onChange={(event) =>
                    setHealthForm({ ...healthForm, title: event.target.value })
                  }
                  required
                />
              </label>

              <label>
                {t("productionHealth.treatmentLabel", "Medicine / vaccine")}
                <input
                  placeholder="e.g., LaSota vaccine"
                  value={healthForm.medicineOrVaccine}
                  onChange={(event) =>
                    setHealthForm({
                      ...healthForm,
                      medicineOrVaccine: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                {t("productionHealth.treatmentLabel", "Dosage")}
                <input
                  placeholder={t(
                    "productionHealth.treatmentPlaceholder",
                    "e.g., 1 dose per bird"
                  )}
                  value={healthForm.dosage}
                  onChange={(event) =>
                    setHealthForm({ ...healthForm, dosage: event.target.value })
                  }
                />
              </label>

              <label>
                {t("common.quantity", "Quantity")}
                <input
                  type="number"
                  min="0"
                  placeholder="Optional"
                  value={healthForm.quantity}
                  onChange={(event) =>
                    setHealthForm({ ...healthForm, quantity: event.target.value })
                  }
                />
              </label>

              <label>
                {t("common.status", "Severity")}
                <select
                  value={healthForm.severity}
                  onChange={(event) =>
                    setHealthForm({
                      ...healthForm,
                      severity: event.target.value,
                    })
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </label>

              <label>
                {t("common.date", "Next due date")}
                <input
                  type="date"
                  value={healthForm.nextDueDate}
                  onChange={(event) =>
                    setHealthForm({
                      ...healthForm,
                      nextDueDate: event.target.value,
                    })
                  }
                />
              </label>

              <label className="form-wide">
                {t("productionHealth.detailsCol", "Description")}
                <input
                  placeholder="Optional observations or treatment details"
                  value={healthForm.description}
                  onChange={(event) =>
                    setHealthForm({
                      ...healthForm,
                      description: event.target.value,
                    })
                  }
                />
              </label>

              <button
                className="form-wide"
                type="submit"
                disabled={savingHealth}
              >
                {savingHealth
                  ? t("productionHealth.loggingHealth", "Saving health record...")
                  : t("productionHealth.saveHealthRecord", "Save health record")}
              </button>
            </form>
          </section>
        </section>

        <section className="production-split">
          <section className="management-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{t("dashboard.recentActivity", "Recent entries")}</p>
                <h2>{t("productionHealth.eggRecordsTitle", "Production history")}</h2>
              </div>
              <span className="role-note">
                {productionRecords.length} {t("common.units", "records")}
              </span>
            </div>

            {loading ? (
              <p className="loading-text">{t("common.loading", "Loading production records...")}</p>
            ) : (
              <div className="flock-table-wrap">
                <table className="flock-table">
                  <thead>
                    <tr>
                      <th>{t("productionHealth.dateCol", "Date")}</th>
                      <th>{t("productionHealth.batchCol", "Flock")}</th>
                      <th>{t("productionHealth.totalEggsCol", "Total eggs")}</th>
                      <th>{t("productionHealth.damagedEggsCol", "Damaged")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productionRecords.slice(0, 8).map((record) => (
                      <tr key={record._id}>
                        <td>{new Date(record.date).toLocaleDateString()}</td>
                        <td>{record.flock?.batchCode || t("common.other", "Unknown flock")}</td>
                        <td>{formatNumber(record.eggCount)}</td>
                        <td>{formatNumber(record.damagedEggs)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="management-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{t("dashboard.recentActivity", "Recent entries")}</p>
                <h2>{t("productionHealth.healthRecordsTitle", "Health history")}</h2>
              </div>
              <span className="role-note">
                {healthRecords.length} {t("common.units", "records")}
              </span>
            </div>

            {loading ? (
              <p className="loading-text">{t("common.loading", "Loading health records...")}</p>
            ) : (
              <div className="health-list">
                {healthRecords.slice(0, 6).map((record) => (
                  <article className="health-list-item" key={record._id}>
                    <div>
                      <strong>{record.title}</strong>
                      <span>
                        {record.flock?.batchCode || t("common.other", "Unknown flock")} ·{" "}
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`severity-badge ${record.severity}`}>
                      {titleCase(record.severity)}
                    </span>
                  </article>
                ))}

                {!loading && healthRecords.length === 0 && (
                  <p className="loading-text">{t("productionHealth.noHealthRecords", "No health records yet.")}</p>
                )}
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  );
};

export default ProductionHealthPage;