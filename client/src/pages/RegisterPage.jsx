import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";

const RegisterPage = () => {
  const { register } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    farmName: "",
    name: "",
    email: "",
    phoneNumber: "",
    flockSize: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError(t("auth.passwordsDoNotMatch", "Passwords do not match."));
      return;
    }

    if (!formData.acceptedTerms) {
      setError(
        t(
          "auth.mustAgreeTerms",
          "You must agree to the Terms of Service and Privacy Policy."
        )
      );
      return;
    }

    setSubmitting(true);

    try {
      await register({
        farmName: formData.farmName,
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        flockSize: formData.flockSize,
        password: formData.password,
      });

      setSuccess(
        t(
          "auth.registrationSuccess",
          "Registration successful! You can now log in to manage your flock records, inventory, health, and finances."
        )
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          t("auth.registrationFailed", "Registration failed. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-layout register-layout">
      <section className="brand-panel">
        <Link className="brand-name" to="/">
          FarmTrack
        </Link>
        <h1>
          {t("auth.createAccount", "Create your FarmTrack account")}
        </h1>
        <p className="brand-description">
          {t(
            "auth.createAccountDesc",
            "Set up your farm profile to start managing flocks, inventory, production, and finances."
          )}
        </p>
      </section>

      <section className="form-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-top-actions">
            <LanguageToggle compact />
          </div>

          <h1>
            {t("auth.createAccount", "Create your FarmTrack account")}
          </h1>

          {error && <p className="error-message">{error}</p>}

          {success && (
            <div className="success-message">
              <p>{success}</p>
              <Link to="/login">{t("auth.signInHere", "Sign in here")}</Link>
            </div>
          )}

          <label>
            {t("auth.farmName", "Farm / Flock Name")}
            <input
              type="text"
              name="farmName"
              placeholder={t(
                "auth.farmNamePlaceholder",
                "e.g., Green Valley Layers"
              )}
              value={formData.farmName}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            {t("auth.fullName", "Full Name")}
            <input
              type="text"
              name="name"
              placeholder={t(
                "auth.fullNamePlaceholder",
                "Enter your full name"
              )}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            {t("auth.emailAddress", "Email Address")}
            <input
              type="email"
              name="email"
              placeholder={t(
                "auth.emailAddressPlaceholder",
                "Enter your email address"
              )}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            {t("auth.phoneNumber", "Phone Number")}
            <input
              type="tel"
              name="phoneNumber"
              placeholder={t(
                "auth.phoneNumberPlaceholder",
                "Enter your phone number"
              )}
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            {t("auth.flockSize", "Flock Size")}
            <select
              name="flockSize"
              value={formData.flockSize}
              onChange={handleChange}
              required
            >
              <option value="">
                {t("auth.selectFlockSize", "Select your flock size")}
              </option>
              <option value="under-500">
                {t("auth.sizeUnder500", "Under 500 hens")}
              </option>
              <option value="500-2000">
                {t("auth.size500To2000", "500 – 2,000 hens")}
              </option>
              <option value="2000-10000">
                {t("auth.size2000To10000", "2,000 – 10,000 hens")}
              </option>
              <option value="over-10000">
                {t("auth.sizeOver10000", "Over 10,000 hens")}
              </option>
            </select>
          </label>

          <label>
            {t("auth.password", "Password")}
            <input
              type="password"
              name="password"
              placeholder={t(
                "auth.createPasswordPlaceholder",
                "Create a password (min. 8 characters)"
              )}
              value={formData.password}
              onChange={handleChange}
              minLength="8"
              required
            />
          </label>

          <label>
            {t("auth.confirmPassword", "Confirm Password")}
            <input
              type="password"
              name="confirmPassword"
              placeholder={t(
                "auth.confirmPasswordPlaceholder",
                "Re-enter your password"
              )}
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength="8"
              required
            />
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="acceptedTerms"
              checked={formData.acceptedTerms}
              onChange={handleChange}
            />
            <span>
              {t(
                "auth.agreeTerms",
                "I agree to the Terms of Service and Privacy Policy."
              )}
            </span>
          </label>

          <button type="submit" disabled={submitting || Boolean(success)}>
            {submitting
              ? t("auth.creatingAccount", "Creating account...")
              : t("auth.createDashboardBtn", "Create My Farm Dashboard")}
          </button>

          <p className="form-footer">
            {t("auth.alreadyHaveAccount", "Already have an account?")}{" "}
            <Link to="/login">{t("auth.signInHere", "Sign in here")}</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default RegisterPage;