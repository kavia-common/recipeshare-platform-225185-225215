import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { getStoredUser, setStoredUser, getToken, setToken, hydrateCurrentUser } from "../lib/auth";

/**
 * AuthContext provides authentication state and actions.
 * It supports async login via api.auth.login and persists token/user to localStorage.
 */
const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** This is a public provider exposing user state and auth actions. */
  const [user, setUser] = useState(getStoredUser());
  const [initializing, setInitializing] = useState(true);

  // Hydrate user on mount using token + API if available
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const u = await hydrateCurrentUser(api);
        if (active && u) setUser(u);
      } finally {
        if (active) setInitializing(false);
      }
    })();
    return () => { active = false; };
  }, []);

  async function loginWithCredentials(email, password) {
    /**
     * Attempts to log in using provided credentials via api.auth.login.
     * On success, stores token and user, updates context user, and returns {user, token}.
     * Throws on failure with a friendly message.
     */
    try {
      const res = await api.auth.login(email, password);
      const token = res?.token;
      const u = res?.user || null;
      if (!token || !u) throw new Error("Invalid login response");
      setToken(token);
      setStoredUser(u);
      setUser(u);
      return { user: u, token };
    } catch (e) {
      // do not surface raw error details
      throw new Error("Invalid email or password");
    }
  }

  function logout() {
    /**
     * Clears auth storage and user state. Calls api.auth.logout if available.
     */
    try {
      if (api?.auth?.logout) {
        // fire and forget; mock returns immediately
        api.auth.logout().catch(() => {});
      }
    } finally {
      setToken(null);
      setStoredUser(null);
      setUser(null);
    }
  }

  const value = useMemo(() => ({
    user,
    initializing,
    // PUBLIC_INTERFACE
    login: loginWithCredentials,
    // PUBLIC_INTERFACE
    logout,
  }), [user, initializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access auth context. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
