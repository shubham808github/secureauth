import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

import { registerUser } from "../services/AuthService";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await registerUser(form);

      // Go to login and show the success message there
      navigate("/login", {
        state: {
          message: res.message || "Registration successful",
          email: form.email,
        },
      });
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || "Registration failed");
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
          <p>Create your account to get secure, role-based access to your applications.</p>
          <ul className="brand-points">
            <li><i className="bi bi-check-circle-fill"></i> Free to register</li>
            <li><i className="bi bi-check-circle-fill"></i> Passwords stored encrypted</li>
            <li><i className="bi bi-check-circle-fill"></i> Ready in a few seconds</li>
          </ul>
        </div>

        {/* Right: form */}
        <div className="login-form-panel">
          <h2>Create account</h2>
          <p className="text-muted mb-4">Join SecureAuth in a few seconds</p>

          {error && (
            <div className="alert alert-danger d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label className="form-label">Username</label>
            <div className="input-group mb-3">
              <span className="input-group-text"><i className="bi bi-person"></i></span>
              <input
                name="username"
                className="form-control"
                placeholder="Your name"
                value={form.username}
                onChange={handleChange}
                minLength={3}
                autoComplete="username"
                required
              />
            </div>

            <label className="form-label">Email address</label>
            <div className="input-group mb-3">
              <span className="input-group-text"><i className="bi bi-envelope"></i></span>
              <input
                name="email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <label className="form-label">Password</label>
            <div className="input-group mb-4">
              <span className="input-group-text"><i className="bi bi-lock"></i></span>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                minLength={6}
                autoComplete="new-password"
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

            <button type="submit" className="btn login-btn w-100" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Creating account...
                </>
              ) : (
                "Register"
              )}
            </button>
          </form>

          <p className="text-center mt-4 mb-0 text-muted">
            Already have an account?{" "}
            <Link to="/login" className="forgot-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;