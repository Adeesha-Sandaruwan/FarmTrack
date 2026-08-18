import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      navigate("/dashboard");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Registration failed. Please try again."
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
            <span className="story-script">Build your team</span>
            <span className="story-sans">for every season</span>
          </h1>
          <p className="story-caption">
            Add your farm team, assign barn responsibilities, and keep every
            chicken-care routine on schedule.
          </p>
          <div className="farm-highlights">
            <span>Role-based worker access</span>
            <span>Vaccination reminders</span>
            <span>Broiler and layer tracking</span>
          </div>
          <div className="story-metrics">
            <article>
              <strong>1 dashboard</strong>
              <span>All barns connected</span>
            </article>
            <article>
              <strong>Daily</strong>
              <span>Health and feed logs</span>
            </article>
            <article>
              <strong>Fast setup</strong>
              <span>Ready in minutes</span>
            </article>
          </div>
          <div className="organic-ridge" aria-hidden="true" />
        </article>

        <form className="auth-panel" onSubmit={handleSubmit}>
          <h2>Create account</h2>
          <p className="panel-subtitle">Set up your worker profile securely.</p>

          {error && <p className="error-message">{error}</p>}

          <label className="field-label">
            Full name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              minLength="2"
              required
            />
          </label>

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
              minLength="8"
              required
            />
          </label>

          <label className="field-label">
            Confirm password
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength="8"
              required
            />
          </label>

          <button type="submit" className="auth-button" disabled={submitting}>
            {submitting ? "Creating account..." : "Register"}
          </button>

          <p className="switch-text">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default RegisterPage;