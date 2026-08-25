import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import DashboardSidebar from "../components/DashboardSidebar";

const emptyUserForm = {
  name: "",
  email: "",
  password: "",
  role: "worker",
};

const UserManagementPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState(emptyUserForm);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/users");
      setUsers(data.users);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          t("userManagement.noUsersFound", "Unable to load user accounts.")
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
      setMessage(t("common.success", "User account created successfully."));
      await loadUsers();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          t("common.error", "Unable to create the user account.")
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
          t("common.error", "Unable to update this user.")
      );
    }
  };

  const handleRoleChange = (event, selectedUser) => {
    updateUser(
      selectedUser.id,
      { role: event.target.value },
      t("userManagement.roleUpdated", `${selectedUser.name}'s role was updated.`)
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
        t("userManagement.deleteConfirm", `Delete ${selectedUser.name}'s account permanently?`)
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
          t("common.error", "Unable to delete this user.")
      );
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
              {t("userManagement.adminRole", "Administrator access")}
            </p>
            <h1>{t("userManagement.title", "Team Management")}</h1>
            <p>
              {t(
                "userManagement.subtitle",
                "Create and manage FarmTrack user accounts."
              )}
            </p>
          </div>

          <button
            className="refresh-button"
            type="button"
            onClick={loadUsers}
            disabled={loading}
          >
            {loading
              ? t("common.loading", "Refreshing...")
              : t("common.refresh", "Refresh users")}
          </button>
        </header>

        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        <section className="overview-kpi-grid">
          <article className="overview-kpi-card">
            <span>{t("userManagement.totalUsers", "Total users")}</span>
            <strong>{summary.total}</strong>
            <p>{t("userManagement.userListTitle", "All FarmTrack accounts")}</p>
          </article>

          <article className="overview-kpi-card">
            <span>{t("userManagement.admins", "Administrators")}</span>
            <strong>{summary.admins}</strong>
            <p>{t("userManagement.adminRole", "Full system access")}</p>
          </article>

          <article className="overview-kpi-card">
            <span>{t("userManagement.managers", "Farm managers")}</span>
            <strong>{summary.managers}</strong>
            <p>{t("userManagement.managerRole", "Operational management")}</p>
          </article>

          <article className="overview-kpi-card">
            <span>{t("userManagement.workers", "Farm workers")}</span>
            <strong>{summary.workers}</strong>
            <p>{t("userManagement.workerRole", "Daily record access")}</p>
          </article>
        </section>

        <section className="management-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{t("userManagement.addUser", "New team member")}</p>
              <h2>{t("userManagement.addUserModalTitle", "Create user account")}</h2>
            </div>

            <span className="role-note">
              {t("userManagement.adminRole", "Administrator only")}
            </span>
          </div>

          <form className="flock-form" onSubmit={handleCreateUser}>
            <label>
              {t("userManagement.fullNameLabel", "Full name")}
              <input
                name="name"
                placeholder={t(
                  "auth.fullNamePlaceholder",
                  "e.g., Nimal Perera"
                )}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              {t("userManagement.emailLabel", "Email address")}
              <input
                type="email"
                name="email"
                placeholder={t(
                  "auth.emailAddressPlaceholder",
                  "e.g., nimal@farmtrack.com"
                )}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              {t("userManagement.roleLabel", "Role")}
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="worker">{t("userManagement.workers", "Worker")}</option>
                <option value="manager">{t("userManagement.managers", "Manager")}</option>
                <option value="admin">{t("userManagement.admins", "Administrator")}</option>
              </select>
            </label>

            <label className="form-wide">
              {t("userManagement.passwordLabel", "Temporary password")}
              <input
                type="password"
                name="password"
                minLength="8"
                placeholder={t(
                  "auth.createPasswordPlaceholder",
                  "At least 8 characters"
                )}
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
              {saving
                ? t("userManagement.creatingUser", "Creating account...")
                : t("userManagement.createUserBtn", "Create team member")}
            </button>
          </form>
        </section>

        <section className="management-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{t("userManagement.userListTitle", "All accounts")}</p>
              <h2>{t("userManagement.userListTitle", "Team users")}</h2>
            </div>

            <span className="role-note">
              {users.length} {t("userManagement.totalUsers", "users")}
            </span>
          </div>

          {loading ? (
            <p className="loading-text">
              {t("common.loading", "Loading user accounts...")}
            </p>
          ) : (
            <div className="flock-table-wrap">
              <table className="flock-table">
                <thead>
                  <tr>
                    <th>{t("userManagement.nameCol", "User")}</th>
                    <th>{t("userManagement.roleCol", "Role")}</th>
                    <th>{t("userManagement.statusCol", "Status")}</th>
                    <th>{t("common.date", "Created")}</th>
                    <th>{t("userManagement.actionsCol", "Actions")}</th>
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
                            <option value="admin">{t("userManagement.admins", "Administrator")}</option>
                            <option value="manager">{t("userManagement.managers", "Manager")}</option>
                            <option value="worker">{t("userManagement.workers", "Worker")}</option>
                          </select>
                        </td>

                        <td>
                          <span
                            className={`status-badge ${
                              selectedUser.isActive ? "active" : "closed"
                            }`}
                          >
                            {selectedUser.isActive
                              ? t("userManagement.activeStatus", "Active")
                              : t("userManagement.inactiveStatus", "Inactive")}
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
                                ? t("userManagement.deactivate", "Deactivate")
                                : t("userManagement.activate", "Activate")}
                            </button>

                            <button
                              className="table-action danger-action"
                              type="button"
                              onClick={() => handleDelete(selectedUser)}
                              disabled={isCurrentUser}
                            >
                              {t("userManagement.deleteUser", "Delete")}
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