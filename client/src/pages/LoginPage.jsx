import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(formData);
      navigate("/dashboard");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <div className="auth-atmosphere" aria-hidden="true">
        <span className="mist mist-left" />
        <span className="mist mist-right" />
        <span className="mist mist-bottom" />
        <span className="leaf-haze leaf-haze-left" />
        <span className="leaf-haze leaf-haze-right" />
      </div>

      <header className="auth-topbar">
        <span className="brand-mark">farmtrack</span>
        <nav className="pill-nav" aria-label="Primary">
          <a href="#">Home</a>
          <a href="#">About Us</a>
          <a href="#">Contact Us</a>
          <a href="#">Farm Journal</a>
        </nav>
        <button type="button" className="menu-pill">
          coop menu
        </button>
      </header>

      <section className="auth-stage">
        <article className="auth-story">
          <h1 className="story-title">
            <span className="story-script">Every layer</span>
            <span className="story-sans">tells a story</span>
          </h1>
          <p className="story-caption">
            Turn flock records, feed cycles, and coop activity into clear daily
            decisions.
          </p>
          <div className="farm-highlights">
            <span>Flock health timeline</span>
            <span>Feed and water alerts</span>
            <span>Egg and weight insights</span>
          </div>
          <div className="story-metrics">
            <article>
              <strong>24/7</strong>
              <span>Coop monitoring</span>
            </article>
            <article>
              <strong>98%</strong>
              <span>Task completion</span>
            </article>
            <article>
              <strong>6 zones</strong>
              <span>Farm sections synced</span>
            </article>
          </div>
          <div className="organic-ridge" aria-hidden="true" />
        </article>

        <form className="auth-panel" onSubmit={handleSubmit}>
          <h2>Welcome back</h2>
          <p className="panel-subtitle">Sign in to continue to FarmTrack.</p>

          {error && <p className="error-message">{error}</p>}

          <label className="field-label">
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field-label">
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit" className="auth-button" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>

          <p className="switch-text">
            Need an account? <Link to="/register">Register here</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default LoginPage;