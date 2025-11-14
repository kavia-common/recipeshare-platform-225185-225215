import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { supabase } from "../lib";
import { getStoredUser, setStoredUser, getToken, setToken, hydrateCurrentUser } from "../lib/auth";

/**
 * AuthContext provides authentication state and actions.
 * It listens to Supabase auth state changes if configured,
 * and falls back to mock API-based auth when Supabase is not available.
 */
const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** This is a public provider exposing user state and auth actions. */
  const [user, setUser] = useState(getStoredUser());
  const [initializing, setInitializing] = useState(true);

  // Subscribe to Supabase auth state changes
  useEffect(() => {
    let active = true;

    async function init() {
      try {
        // Try to get Supabase session user first
        const { data: { session } = {} } = await supabase.auth.getSession();
        if (session?.user) {
          const u = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
            email: session.user.email || "",
          };
          setStoredUser(u);
          setUser(u);
          return;
        }

        // Fallback: hydrate from mock API/local
        const u2 = await hydrateCurrentUser(api);
        if (u2) {
          setUser(u2);
        }
      } finally {
        if (active) setInitializing(false);
      }
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session?.user) {
        const u = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
          email: session.user.email || "",
        };
        setStoredUser(u);
        setUser(u);
      } else {
        setStoredUser(null);
        setUser(null);
      }
    });

    return () => {
      active = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  async function loginWithCredentials(email, password) {
    /**
     * Attempts to log in using Supabase password auth.
     * If Supabase fails (e.g., env not provided), falls back to mock API login.
     */
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // user is set by onAuthStateChange
      return { user: getStoredUser(), token: getToken() };
    } catch {
      // fallback to mock api
      try {
        const res = await api.auth.login(email, password);
        const token = res?.token;
        const u = res?.user || null;
        if (!token || !u) throw new Error("Invalid login response");
        setToken(token);
        setStoredUser(u);
        setUser(u);
        return { user: u, token };
      } catch {
        throw new Error("Invalid email or password");
      }
    }
  }

  function logout() {
    /**
     * Sign out from Supabase if active, else clear mock session.
     */
    try {
      supabase.auth.signOut().catch(() => {});
    } catch {
      // ignore
    }
    try {
      if (api?.auth?.logout) {
        api.auth.logout().catch(() => {});
      }
    } finally {
      setToken(null);
      setStoredUser(null);
      setUser(null);
    }
  }

  const value = useMemo(
    () => ({
      user,
      initializing,
      // PUBLIC_INTERFACE
      login: loginWithCredentials,
      // PUBLIC_INTERFACE
      logout,
    }),
    [user, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access auth context. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
