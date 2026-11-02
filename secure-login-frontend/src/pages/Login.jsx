import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "./Login.css";

import { loginUser, saveSession } from "../services/AuthService";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Message passed from the Register page after a successful sign-up
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ""
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage(""); // clear the "Registration successful" banner

    try {
      const data = await loginUser(email, password);
      saveSession(data, remember);
      navigate(data.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || "Invalid email or password");
      } else {
        setError("Cannot connect to server. Check Spring Boot and CORS settings.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        {/* Left: branding panel */}
        <div className="login-brand d-none d-md-flex">
          <i className="bi bi-shield-lock-fill brand-icon"></i>
          <h1>SecureAuth</h1>
          <p>Secure, role-based access to your applications, protected with JWT authentication.</p>
          <ul className="brand-points">
            <li><i className="bi bi-check-circle-fill"></i> Encrypted credentials</li>
            <li><i className="bi bi-check-circle-fill"></i> Role-based access control</li>
            <li><i className="bi bi-check-circle-fill"></i> Token-based sessions</li>
          </ul>
        </div>

        {/* Right: form */}
        <div className="login-form-panel">
          <h2>Welcome back</h2>
          <p className="text-muted mb-4">Sign in to continue to your account</p>

          {successMessage && (
            <div className="alert alert-success d-flex align-items-center">
              <i className="bi bi-check-circle-fill me-2"></i>
              {successMessage}. Please sign in.
            </div>
          )}

          {error && (
            <div className="alert alert-danger d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <label className="form-label">Email address</label>
            <div className="input-group mb-3">
              <span className="input-group-text"><i className="bi bi-envelope"></i></span>
              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <label className="form-label">Password</label>
            <div className="input-group mb-3">
              <span className="input-group-text"><i className="bi bi-lock"></i></span>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
              </button>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="remember">
                  Remember me
                </label>
              </div>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>

            <button type="submit" className="btn login-btn w-100" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center mt-4 mb-0 text-muted">
            Don't have an account?{" "}
            <Link to="/register" className="forgot-link">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;