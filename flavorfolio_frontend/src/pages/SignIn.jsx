import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib";
import { useAuth } from "../context/AuthContext";
import { setToken, setStoredUser } from "../lib/auth";

/**
 * Sign In page
 * - Validates email/password
 * - Calls api.auth.login(email, password)
 * - Stores token/user to localStorage
 * - Updates AuthContext and navigates to home or profile
 */
export default function SignIn() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { user, login, initializing } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  useEffect(() => {
    // If already authenticated, redirect away from Sign In
    if (!initializing && user) {
      const to = params.get("redirect") || "/";
      try {
        nav(to, { replace: true });
      } catch {
        window.location.href = to;
      }
    }
  }, [user, initializing, nav, params]);

  function validate() {
    const e = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!emailRegex.test(email.trim())) e.email = "Please enter a valid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    setErr("");
    if (!validate()) return;
    setBusy(true);
    try {
      // Use context login to ensure state is updated consistently
      const { user: u, token } = await login(email.trim(), password);
      // Fallback persistence (context already persisted, but keep defensive)
      if (token) setToken(token);
      if (u) setStoredUser(u);
      const to = params.get("redirect") || "/";
      try {
        nav(to, { replace: true });
      } catch {
        window.location.href = to;
      }
    } catch (e) {
      setErr(e?.message || "Invalid email or password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="form" role="form" aria-labelledby="signin-title">
      <h2 id="signin-title" style={{ marginBottom: 8 }}>Sign In</h2>

      {err && (
        <div className="banner-error" role="alert" aria-live="assertive">
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            autoComplete="email"
            required
          />
          {errors.email && (
            <span id="email-error" className="error">{errors.email}</span>
          )}
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            autoComplete="current-password"
            required
          />
          {errors.password && (
            <span id="password-error" className="error">{errors.password}</span>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={busy}
            aria-live="polite"
            autoFocus
          >
            {busy ? "Signing in…" : "Sign In"}
          </button>
          {busy && <span className="muted" style={{ fontSize: 12 }}>Please wait</span>}
        </div>
      </form>
    </div>
  );
}
