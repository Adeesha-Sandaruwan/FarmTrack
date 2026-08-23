import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

const emptyUserForm = {
  name: "",
  email: "",
  password: "",
  role: "worker",
};

const UserManagementPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState(emptyUserForm);

  const navLinkClass = ({ isActive }) => (isActive ? "active" : undefined);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/users");
      setUsers(data.users);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load user accounts."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    api
      .get("/users")
      .then(({ data }) => {
        if (!cancelled) {
          setUsers(data.users);
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load user accounts."
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

  const summary = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((item) => item.role === "admin").length,
      managers: users.filter((item) => item.role === "manager").length,
      workers: users.filter((item) => item.role === "worker").length,
    }),
    [users]
  );

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      await api.post("/users", formData);

      setFormData(emptyUserForm);
      setMessage("User account created successfully.");
      await loadUsers();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to create the user account."
      );
    } finally {
      setSaving(false);
    }
  };

  const updateUser = async (userId, updates, successMessage) => {
    setError("");
    setMessage("");

    try {
      await api.patch(`/users/${userId}`, updates);
      setMessage(successMessage);
      await loadUsers();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to update this user."
      );
    }
  };

  const handleRoleChange = (event, selectedUser) => {
    updateUser(
      selectedUser.id,
      { role: event.target.value },
      `${selectedUser.name}'s role was updated.`
    );
  };

  const handleToggleActive = (selectedUser) => {
    updateUser(
      selectedUser.id,
      { isActive: !selectedUser.isActive },
      selectedUser.isActive
        ? `${selectedUser.name}'s account was deactivated.`
        : `${selectedUser.name}'s account was activated.`
    );
  };

  const handleDelete = async (selectedUser) => {
    if (
      !window.confirm(
        `Delete ${selectedUser.name}'s account permanently?`
      )
    ) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await api.delete(`/users/${selectedUser.id}`);
      setMessage(`${selectedUser.name}'s account was deleted.`);
      await loadUsers();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to delete this user."
      );
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
          <NavLink end className={navLinkClass} to="/dashboard">
            Overview
          </NavLink>

          <NavLink className={navLinkClass} to="/flocks">
            Flock Management
          </NavLink>

          <NavLink className={navLinkClass} to="/inventory">
            Feed & Inventory
          </NavLink>

          <NavLink className={navLinkClass} to="/users">
            Team Management
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
            <p className="eyebrow">Administrator access</p>
            <h1>Team Management</h1>
            <p>Create and manage FarmTrack user accounts.</p>
          </div>

          <button
            className="refresh-button"
            type="button"
            onClick={loadUsers}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh users"}
          </button>
        </header>

        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        <section className="overview-kpi-grid">
          <article className="overview-kpi-card">
            <span>Total users</span>
            <strong>{summary.total}</strong>
            <p>All FarmTrack accounts</p>
          </article>

          <article className="overview-kpi-card">
            <span>Administrators</span>
            <strong>{summary.admins}</strong>
            <p>Full system access</p>
          </article>

          <article className="overview-kpi-card">
            <span>Farm managers</span>
            <strong>{summary.managers}</strong>
            <p>Operational management</p>
          </article>

          <article className="overview-kpi-card">
            <span>Farm workers</span>
            <strong>{summary.workers}</strong>
            <p>Daily record access</p>
          </article>
        </section>

        <section className="management-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">New team member</p>
              <h2>Create user account</h2>
            </div>

            <span className="role-note">Administrator only</span>
          </div>

          <form className="flock-form" onSubmit={handleCreateUser}>
            <label>
              Full name
              <input
                name="name"
                placeholder="e.g., Nimal Perera"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Email address
              <input
                type="email"
                name="email"
                placeholder="e.g., nimal@farmtrack.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Role
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="worker">Worker</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </label>

            <label className="form-wide">
              Temporary password
              <input
                type="password"
                name="password"
                minLength="8"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </label>

            <button
              className="form-wide"
              type="submit"
              disabled={saving}
            >
              {saving ? "Creating account..." : "Create team member"}
            </button>
          </form>
        </section>

        <section className="management-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">All accounts</p>
              <h2>Team users</h2>
            </div>

            <span className="role-note">{users.length} users</span>
          </div>

          {loading ? (
            <p className="loading-text">Loading user accounts...</p>
          ) : (
            <div className="flock-table-wrap">
              <table className="flock-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((selectedUser) => {
                    const isCurrentUser = selectedUser.id === user?.id;

                    return (
                      <tr key={selectedUser.id}>
                        <td>
                          <strong>{selectedUser.name}</strong>
                          <span>{selectedUser.email}</span>
                        </td>

                        <td>
                          <select
                            className="inline-select"
                            value={selectedUser.role}
                            onChange={(event) =>
                              handleRoleChange(event, selectedUser)
                            }
                            disabled={isCurrentUser}
                          >
                            <option value="admin">Administrator</option>
                            <option value="manager">Manager</option>
                            <option value="worker">Worker</option>
                          </select>
                        </td>

                        <td>
                          <span
                            className={`status-badge ${
                              selectedUser.isActive ? "active" : "closed"
                            }`}
                          >
                            {selectedUser.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td>
                          {new Date(
                            selectedUser.createdAt
                          ).toLocaleDateString()}
                        </td>

                        <td>
                          <div className="user-actions">
                            <button
                              className="table-action"
                              type="button"
                              onClick={() => handleToggleActive(selectedUser)}
                              disabled={isCurrentUser}
                            >
                              {selectedUser.isActive
                                ? "Deactivate"
                                : "Activate"}
                            </button>

                            <button
                              className="table-action danger-action"
                              type="button"
                              onClick={() => handleDelete(selectedUser)}
                              disabled={isCurrentUser}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
};

export default UserManagementPage;