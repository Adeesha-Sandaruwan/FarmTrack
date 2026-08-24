import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const { register } = useAuth();

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
      setError("Passwords do not match.");
      return;
    }

    if (!formData.acceptedTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
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
        "Registration successful! You can now log in to manage your flock records, inventory, health, and finances."
      );
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
    <main className="auth-layout register-layout">
      <section className="brand-panel">
        <Link className="brand-name" to="/">FarmTrack</Link>
        <h1>Create your FarmTrack account</h1>
        <p className="brand-description">
          Set up your farm profile to start managing flocks, inventory,
          production, and finances.
        </p>
      </section>

      <section className="form-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h1>Create your FarmTrack account</h1>

          {error && <p className="error-message">{error}</p>}

          {success && (
            <div className="success-message">
              <p>{success}</p>
              <Link to="/login">Sign in here</Link>
            </div>
          )}

          <label>
            Farm / Flock Name
            <input
              type="text"
              name="farmName"
              placeholder="e.g., Green Valley Layers"
              value={formData.farmName}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Full Name
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email Address
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Phone Number
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Flock Size
            <select
              name="flockSize"
              value={formData.flockSize}
              onChange={handleChange}
              required
            >
              <option value="">Select your flock size</option>
              <option value="under-500">Under 500 hens</option>
              <option value="500-2000">500 – 2,000 hens</option>
              <option value="2000-10000">2,000 – 10,000 hens</option>
              <option value="over-10000">Over 10,000 hens</option>
            </select>
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              placeholder="Create a password (min. 8 characters)"
              value={formData.password}
              onChange={handleChange}
              minLength="8"
              required
            />
          </label>

          <label>
            Confirm Password
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
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
              I agree to the Terms of Service and Privacy Policy.
            </span>
          </label>

          <button type="submit" disabled={submitting || Boolean(success)}>
            {submitting ? "Creating account..." : "Create My Farm Dashboard"}
          </button>

          <p className="form-footer">
            Already have an account? <Link to="/login">Sign in here</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default RegisterPage;