import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Import the CSS file
import "../styles/pages/login.css";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page they were trying to visit before being redirected to login
  const from = location.state?.from?.pathname || "/dashboard";
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(credentials);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.message || "Failed to login. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card-container">
        <div className="login-logo-container">
          <svg
            className="login-logo"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <h2 className="login-title">TruckerELD Login</h2>
          <p className="login-subtitle">
            Electronic Logging Device for Commercial Drivers
          </p>
        </div>

        <div className="login-form-container">
          <div className="login-form-card">
            {error && (
              <div className="login-error-alert">
                <div className="login-error-container">
                  <div className="login-error-icon">
                    <svg
                      className="login-error-svg"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="login-error-message">
                    <p className="login-error-text">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="username" className="login-label">
                  Username
                </label>
                <div className="login-input-container">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={credentials.username}
                    onChange={handleChange}
                    className="login-input"
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="password" className="login-label">
                  Password
                </label>
                <div className="login-input-container">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={credentials.password}
                    onChange={handleChange}
                    className="login-input"
                  />
                </div>
              </div>

              <div className="login-button-container">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="login-button"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>

            <div className="login-demo-container">
              <div className="login-divider">
                <div className="login-divider-line">
                  <div className="login-divider-text-container">
                    <span className="login-divider-text">Demo credentials</span>
                  </div>
                </div>
              </div>

              <div className="login-demo-grid">
                <div className="login-demo-item">
                  <p className="login-demo-label">Username</p>
                  <p className="login-demo-value">driver</p>
                </div>
                <div className="login-demo-item">
                  <p className="login-demo-label">Password</p>
                  <p className="login-demo-value">truckerdemo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
