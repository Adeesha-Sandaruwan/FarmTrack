import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const features = [
  ["Flock Management", "Track batches, population, and mortality"],
  ["Feed & Inventory", "Monitor stock levels and usage"],
  ["Production & Health", "Record eggs, weights, and vaccinations"],
  ["Finance & Analytics", "View sales, expenses, and profit"],
];

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(formData);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-layout">
      <section className="brand-panel">
        <p className="brand-name">FarmTrack</p>
        <h1>Every layer tells a story</h1>
        <p className="brand-description">
          Replace disconnected spreadsheets with reliable digital records
          across flock, inventory, health, and finances.
        </p>

        <div className="feature-grid">
          {features.map(([title, description]) => (
            <article className="feature-card" key={title}>
              <h2>{title}</h2>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="form-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h1>Sign in</h1>
          <p>Access your FarmTrack dashboard.</p>

          {error && <p className="error-message">{error}</p>}

          <label>
            Email
            <input
              type="email"
              name="email"
              placeholder="Enter your farm email"
              value={formData.email}
              onChange={(event) =>
                setFormData({ ...formData, email: event.target.value })
              }
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(event) =>
                setFormData({ ...formData, password: event.target.value })
              }
              required
            />
          </label>

          <p className="text-link">Forgot password? Coming soon.</p>

          <button type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>

          <p className="form-footer">
            Need an account? <Link to="/register">Register here</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default LoginPage;