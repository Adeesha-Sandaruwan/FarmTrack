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
      <section className="dashboard-card">
        <p className="brand-name dashboard-brand">FarmTrack</p>
        <h1>Welcome, {user?.name}</h1>

        <p>
          {user?.farmName
            ? `You are managing ${user.farmName}.`
            : "Your FarmTrack account is ready."}
        </p>

        <div className="dashboard-details">
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>Role:</strong>{" "}
            <span className="role-badge">{user?.role}</span>
          </p>
          {user?.flockSize && (
            <p>
              <strong>Flock size:</strong> {user.flockSize}
            </p>
          )}
        </div>

        <h2>Your dashboard is ready</h2>
        <p>
          Flock, feed, production, health, finance, and analytics modules will
          be added here next.
        </p>

        <button onClick={handleLogout}>Sign out</button>
      </section>
    </main>
  );
};

export default DashboardPage;