import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

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
          "Unable to load production and health records."
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

    const criticalRecords = healthRecords.filter(
      (record) => ["high", "critical"].includes(record.severity)
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
      setMessage("Daily production record saved.");
      await loadData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to save the production record."
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
      setMessage("Health record saved.");
      await loadData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to save the health record."
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
      <aside className="dashboard-sidebar">
        <Link className="sidebar-brand" to="/dashboard">
          FarmTrack
        </Link>

        <nav className="sidebar-nav">
          <Link to="/dashboard">Overview</Link>
          <Link to="/flocks">Flock Management</Link>
          <Link to="/inventory">Feed & Inventory</Link>
          <Link className="active" to="/production-health">
            Production & Health
          </Link>
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
            <p className="eyebrow">Farm operations</p>
            <h1>Production & Health</h1>
            <p>Record eggs, monitor weights, and maintain flock health.</p>
          </div>

          <button className="refresh-button" type="button" onClick={loadData}>
            Refresh data
          </button>
        </header>

        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        <section className="summary-grid">
          <article className="summary-card">
            <span>Total eggs recorded</span>
            <strong>{formatNumber(summary.totalEggs)}</strong>
          </article>
          <article className="summary-card">
            <span>Good eggs</span>
            <strong>{formatNumber(summary.healthyEggs)}</strong>
          </article>
          <article className="summary-card mortality-card">
            <span>Damaged eggs</span>
            <strong>{formatNumber(summary.damagedEggs)}</strong>
          </article>
          <article className="summary-card">
            <span>Health alerts</span>
            <strong>{summary.criticalRecords}</strong>
          </article>
        </section>

        <section className="production-split">
          <section className="management-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Daily operation</p>
                <h2>Record production</h2>
              </div>
            </div>

            <form className="flock-form" onSubmit={handleProductionSubmit}>
              <label className="form-wide">
                Flock batch
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
                  <option value="">Select an active flock</option>
                  {flocks.map((flock) => (
                    <option key={flock._id} value={flock._id}>
                      {flock.batchCode} — {flock.breed}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Record date
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
                Total eggs
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
                Damaged eggs
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
                Average bird weight (g)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Optional"
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
                Notes
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
                  ? "Saving production..."
                  : "Save production record"}
              </button>
            </form>
          </section>

          <section className="management-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Health log</p>
                <h2>Add health record</h2>
              </div>
            </div>

            <form className="flock-form" onSubmit={handleHealthSubmit}>
              <label>
                Flock batch
                <select
                  value={healthForm.flock}
                  onChange={(event) =>
                    setHealthForm({ ...healthForm, flock: event.target.value })
                  }
                  required
                >
                  <option value="">Select an active flock</option>
                  {flocks.map((flock) => (
                    <option key={flock._id} value={flock._id}>
                      {flock.batchCode} — {flock.breed}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Record type
                <select
                  value={healthForm.recordType}
                  onChange={(event) =>
                    setHealthForm({
                      ...healthForm,
                      recordType: event.target.value,
                    })
                  }
                >
                  <option value="vaccination">Vaccination</option>
                  <option value="treatment">Treatment</option>
                  <option value="incident">Health incident</option>
                  <option value="weight-check">Weight check</option>
                </select>
              </label>

              <label>
                Date
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
                Title
                <input
                  placeholder="e.g., Newcastle disease vaccination"
                  value={healthForm.title}
                  onChange={(event) =>
                    setHealthForm({ ...healthForm, title: event.target.value })
                  }
                  required
                />
              </label>

              <label>
                Medicine / vaccine
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
                Dosage
                <input
                  placeholder="e.g., 1 dose per bird"
                  value={healthForm.dosage}
                  onChange={(event) =>
                    setHealthForm({ ...healthForm, dosage: event.target.value })
                  }
                />
              </label>

              <label>
                Quantity
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
                Severity
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
                Next due date
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
                Description
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
                {savingHealth ? "Saving health record..." : "Save health record"}
              </button>
            </form>
          </section>
        </section>

        <section className="production-split">
          <section className="management-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Recent entries</p>
                <h2>Production history</h2>
              </div>
              <span className="role-note">{productionRecords.length} records</span>
            </div>

            {loading ? (
              <p className="loading-text">Loading production records...</p>
            ) : (
              <div className="flock-table-wrap">
                <table className="flock-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Flock</th>
                      <th>Total eggs</th>
                      <th>Damaged</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productionRecords.slice(0, 8).map((record) => (
                      <tr key={record._id}>
                        <td>{new Date(record.date).toLocaleDateString()}</td>
                        <td>{record.flock?.batchCode || "Unknown flock"}</td>
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
                <p className="eyebrow">Recent entries</p>
                <h2>Health history</h2>
              </div>
              <span className="role-note">{healthRecords.length} records</span>
            </div>

            {loading ? (
              <p className="loading-text">Loading health records...</p>
            ) : (
              <div className="health-list">
                {healthRecords.slice(0, 6).map((record) => (
                  <article className="health-list-item" key={record._id}>
                    <div>
                      <strong>{record.title}</strong>
                      <span>
                        {record.flock?.batchCode || "Unknown flock"} ·{" "}
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`severity-badge ${record.severity}`}>
                      {titleCase(record.severity)}
                    </span>
                  </article>
                ))}

                {!loading && healthRecords.length === 0 && (
                  <p className="loading-text">No health records yet.</p>
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