import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const features = [
    [t("auth.feature1Title", "Flock Management"), t("auth.feature1Desc", "Track batches, population, and mortality")],
    [t("auth.feature2Title", "Feed & Inventory"), t("auth.feature2Desc", "Monitor stock levels and usage")],
    [t("auth.feature3Title", "Production & Health"), t("auth.feature3Desc", "Record eggs, weights, and vaccinations")],
    [t("auth.feature4Title", "Finance & Analytics"), t("auth.feature4Desc", "View sales, expenses, and profit")],
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { user: loggedInUser } = await login(formData);
      navigate(loggedInUser?.role === "admin" ? "/users" : "/dashboard");
    } catch {
      setError(t("auth.invalidCredentials", "Invalid email or password. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-layout">
      <section className="brand-panel">
        <Link className="brand-name" to="/">
          FarmTrack
        </Link>
        <h1>{t("auth.brandStory", "Every layer tells a story")}</h1>
        <p className="brand-description">
          {t(
            "auth.brandDesc",
            "Replace disconnected spreadsheets with reliable digital records across flock, inventory, health, and finances."
          )}
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
          <div className="auth-top-actions">
            <LanguageToggle compact />
          </div>

          <h1>{t("auth.signIn", "Sign in")}</h1>
          <p>{t("auth.signInDesc", "Access your FarmTrack dashboard.")}</p>

          {error && <p className="error-message">{error}</p>}

          <label>
            {t("auth.email", "Email")}
            <input
              type="email"
              name="email"
              placeholder={t("auth.emailPlaceholder", "Enter your farm email")}
              value={formData.email}
              onChange={(event) =>
                setFormData({ ...formData, email: event.target.value })
              }
              required
            />
          </label>

          <label>
            {t("auth.password", "Password")}
            <input
              type="password"
              name="password"
              placeholder={t("auth.passwordPlaceholder", "Enter your password")}
              value={formData.password}
              onChange={(event) =>
                setFormData({ ...formData, password: event.target.value })
              }
              required
            />
          </label>

          <p className="text-link">
            {t("auth.forgotPassword", "Forgot password? Coming soon.")}
          </p>

          <button type="submit" disabled={submitting}>
            {submitting
              ? t("auth.signingIn", "Signing in...")
              : t("auth.signIn", "Sign in")}
          </button>

          <p className="form-footer">
            {t("auth.needAccount", "Need an account?")}{" "}
            <Link to="/register">{t("auth.registerHere", "Register here")}</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default LoginPage;