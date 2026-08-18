import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <main className="dashboard">
      <div className="dashboard-card">
        <h1>Welcome to FarmTrack</h1>
        <p>
          Signed in as <strong>{user?.name}</strong>
        </p>
        <p>
          Role: <span className="role-badge">{user?.role}</span>
        </p>

        <h2>Authentication complete</h2>
        <p>
          Your account is connected to the FarmTrack API and MongoDB database.
        </p>

        {user?.role === "admin" && (
          <p className="admin-note">
            As an administrator, you can use the user-management API to create
            and manage managers and workers.
          </p>
        )}

        <button onClick={handleLogout}>Sign out</button>
      </div>
    </main>
  );
};

export default DashboardPage;