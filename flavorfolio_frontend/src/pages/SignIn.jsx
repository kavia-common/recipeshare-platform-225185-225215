import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib";
import { useAuth } from "../context/AuthContext";

/**
 * Sign In / Sign Up page (Supabase)
 * - Email/password sign-in and sign-up using Supabase auth if configured.
 * - Falls back to context mock login if Supabase credentials are not provided or fail.
 */
export default function SignIn() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { user, initializing, login: mockLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'

  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  useEffect(() => {
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

  async function handleSupabaseAuth() {
    const redirectTo = process.env.REACT_APP_SITE_URL || window.location.origin;
    if (mode === "signin") {
      return await supabase.auth.signInWithPassword({ email: email.trim(), password });
    }
    // Sign up
    return await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: `${redirectTo}/signin` },
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!validate()) return;
    setBusy(true);
    try {
      // Try Supabase first
      const { data, error } = await handleSupabaseAuth();
      if (error) throw error;

      // If sign up, inform user to verify email (Supabase may require confirmation)
      if (mode === "signup") {
        setErr("Sign up successful. Please check your email to confirm your account.");
        setBusy(false);
        return;
      }

      // On sign in, we have a session. AuthContext will pick it up via onAuthStateChange.
      const to = params.get("redirect") || "/";
      try {
        nav(to, { replace: true });
      } catch {
        window.location.href = to;
      }
    } catch (_e) {
      // Fallback to mock login (keeps template usable without Supabase envs)
      try {
        await mockLogin(email.trim(), password);
        const to = params.get("redirect") || "/";
        try {
          nav(to, { replace: true });
        } catch {
          window.location.href = to;
        }
      } catch (e2) {
        setErr(_e?.message || e2?.message || "Authentication failed");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="form" role="form" aria-labelledby="signin-title">
      <h2 id="signin-title" style={{ marginBottom: 8 }}>
        {mode === "signin" ? "Sign In" : "Create an account"}
      </h2>

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
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
          />
          {errors.password && (
            <span id="password-error" className="error">{errors.password}</span>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={busy}
            aria-live="polite"
            autoFocus
          >
            {busy ? (mode === "signin" ? "Signing in…" : "Creating…") : (mode === "signin" ? "Sign In" : "Create Account")}
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
          {busy && <span className="muted" style={{ fontSize: 12 }}>Please wait</span>}
        </div>
      </form>
    </div>
  );
}
