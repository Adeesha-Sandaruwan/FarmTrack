import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

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
          "Unable to load flock records. Please try again."
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
        (total, flock) => total + flock.currentPopulation,
        0
      ),
      totalMortality: flocks.reduce(
        (total, flock) =>
          total + (flock.initialPopulation - flock.currentPopulation),
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
      setMessage("Flock batch created successfully.");
      await loadFlocks();
    } catch (requestError) {
      setFormError(
        requestError.response?.data?.message ||
          "Unable to create the flock batch."
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
      setMessage("Mortality record added. Flock population was updated.");
      await loadFlocks();
    } catch (requestError) {
      setFormError(
        requestError.response?.data?.message ||
          "Unable to record mortality."
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

  return (
    <main className="farm-dashboard">
      <aside className="dashboard-sidebar">
        <Link className="sidebar-brand" to="/dashboard">
          FarmTrack
        </Link>

        <nav className="sidebar-nav">
          <Link to="/dashboard">Overview</Link>

          <Link className="active" to="/flocks">
            Flock Management
          </Link>

          <Link to="/inventory">Feed & Inventory</Link>

          {user?.role === "admin" && (
  <Link to="/users">User Management</Link>
)}

          <span>Production & Health</span>
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
            <h1>Flock Management</h1>
            <p>Manage batches, track populations, and record mortality.</p>
          </div>

          <button className="refresh-button" type="button" onClick={loadFlocks}>
            Refresh data
          </button>
        </header>

        {pageError && <p className="error-message">{pageError}</p>}
        {formError && <p className="error-message">{formError}</p>}
        {message && <p className="success-message">{message}</p>}

        <section className="summary-grid">
          <article className="summary-card">
            <span>Total batches</span>
            <strong>{summary.totalFlocks}</strong>
          </article>

          <article className="summary-card">
            <span>Active flocks</span>
            <strong>{summary.activeFlocks}</strong>
          </article>

          <article className="summary-card">
            <span>Current population</span>
            <strong>{formatNumber(summary.totalPopulation)}</strong>
          </article>

          <article className="summary-card mortality-card">
            <span>Recorded mortality</span>
            <strong>{formatNumber(summary.totalMortality)}</strong>
          </article>
        </section>

        {canManageFlocks && (
          <section className="management-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">New batch</p>
                <h2>Add a flock</h2>
              </div>

              <span className="role-note">Manager / Admin access</span>
            </div>

            <form className="flock-form" onSubmit={handleCreateFlock}>
              <label>
                Batch code
                <input
                  name="batchCode"
                  placeholder="e.g., LAY-001"
                  value={flockForm.batchCode}
                  onChange={handleFlockChange}
                  required
                />
              </label>

              <label>
                Breed
                <input
                  name="breed"
                  placeholder="e.g., Hy-Line Brown"
                  value={flockForm.breed}
                  onChange={handleFlockChange}
                  required
                />
              </label>

              <label>
                Flock type
                <select
                  name="flockType"
                  value={flockForm.flockType}
                  onChange={handleFlockChange}
                >
                  <option value="layer">Layer</option>
                  <option value="broiler">Broiler</option>
                  <option value="breeder">Breeder</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label>
                Placement date
                <input
                  type="date"
                  name="placementDate"
                  value={flockForm.placementDate}
                  onChange={handleFlockChange}
                  required
                />
              </label>

              <label>
                Initial population
                <input
                  type="number"
                  name="initialPopulation"
                  min="1"
                  placeholder="e.g., 500"
                  value={flockForm.initialPopulation}
                  onChange={handleFlockChange}
                  required
                />
              </label>

              <label>
                Hatchery / source
                <input
                  name="source"
                  placeholder="e.g., ABC Hatchery"
                  value={flockForm.source}
                  onChange={handleFlockChange}
                />
              </label>

              <label className="form-wide">
                Notes
                <input
                  name="notes"
                  placeholder="Optional batch notes"
                  value={flockForm.notes}
                  onChange={handleFlockChange}
                />
              </label>

              <button
                className="form-wide"
                type="submit"
                disabled={creatingFlock}
              >
                {creatingFlock ? "Creating batch..." : "Create flock batch"}
              </button>
            </form>
          </section>
        )}

        <section className="management-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Live records</p>
              <h2>Flock batches</h2>
            </div>

            <span className="role-note">{flocks.length} records</span>
          </div>

          {loading ? (
            <p className="loading-text">Loading flock records...</p>
          ) : flocks.length === 0 ? (
            <div className="empty-state">
              <h3>No flock batches yet</h3>
              <p>
                {canManageFlocks
                  ? "Create your first flock batch using the form above."
                  : "Ask a manager or administrator to create your first flock batch."}
              </p>
            </div>
          ) : (
            <div className="flock-table-wrap">
              <table className="flock-table">
                <thead>
                  <tr>
                    <th>Batch</th>
                    <th>Breed / Type</th>
                    <th>Population</th>
                    <th>Status</th>
                    <th>Placement</th>
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {flocks.map((flock) => (
                    <tr key={flock._id}>
                      <td>
                        <strong>{flock.batchCode}</strong>
                        <span>{flock.source || "No source recorded"}</span>
                      </td>

                      <td>
                        <strong>{flock.breed}</strong>
                        <span className="capitalize">{flock.flockType}</span>
                      </td>

                      <td>
                        <strong>{formatNumber(flock.currentPopulation)}</strong>
                        <span>
                          of {formatNumber(flock.initialPopulation)} birds
                        </span>
                      </td>

                      <td>
                        <span className={`status-badge ${flock.status}`}>
                          {flock.status}
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
                            Record mortality
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
              <p className="eyebrow">Daily operation</p>
              <h2>Record mortality</h2>
            </div>

            <span className="role-note">Available to all farm users</span>
          </div>

          <form className="flock-form" onSubmit={handleCreateMortality}>
            <label>
              Flock batch
              <select
                name="flockId"
                value={mortalityForm.flockId}
                onChange={handleMortalityChange}
                required
              >
                <option value="">Select an active flock</option>

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
              Date
              <input
                type="date"
                name="date"
                value={mortalityForm.date}
                onChange={handleMortalityChange}
                required
              />
            </label>

            <label>
              Number of birds
              <input
                type="number"
                name="count"
                min="1"
                placeholder="e.g., 2"
                value={mortalityForm.count}
                onChange={handleMortalityChange}
                required
              />
            </label>

            <label>
              Cause
              <input
                name="cause"
                placeholder="e.g., Heat stress"
                value={mortalityForm.cause}
                onChange={handleMortalityChange}
              />
            </label>

            <label className="form-wide">
              Notes
              <input
                name="notes"
                placeholder="Optional inspection notes"
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
                ? "Saving record..."
                : "Save mortality record"}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
};

export default FlocksPage;