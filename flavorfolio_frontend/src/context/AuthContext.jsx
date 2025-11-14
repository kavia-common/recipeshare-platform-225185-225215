import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import supabase from "../lib";
import { getStoredUser, setStoredUser, hydrateCurrentUser } from "../lib/auth";

/**
 * AuthContext provides authentication state and actions.
 * It listens to Supabase auth state changes and exposes user and actions.
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
        // Prefer Supabase session
        const { data: { session } = {} } = await supabase.auth.getSession();
        if (session?.user) {
          const u = {
            id: session.user.id,
            name:
              session.user.user_metadata?.full_name ||
              session.user.email?.split("@")[0] ||
              "User",
            email: session.user.email || "",
          };
          setStoredUser(u);
          setUser(u);
          return;
        }

        // Fallback: hydrate from api shim or local mock if any
        const u2 = await hydrateCurrentUser(api);
        if (u2) {
          setUser(u2);
        }
      } finally {
        if (active) setInitializing(false);
      }
    }

    init();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session?.user) {
        const u = {
          id: session.user.id,
          name:
            session.user.user_metadata?.full_name ||
            session.user.email?.split("@")[0] ||
            "User",
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
      subscription?.subscription?.unsubscribe?.();
    };
  }, []);

  async function loginWithCredentials(email, password) {
    /**
     * Attempts to log in using Supabase password auth.
     * Fallbacks are intentionally minimal to avoid storing secrets.
     */
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(error.message || "Authentication failed");
    }
    // user is set by onAuthStateChange
    return { user: getStoredUser() };
  }

  function logout() {
    /**
     * Sign out from Supabase and clear local state.
     */
    try {
      supabase.auth.signOut().catch(() => {});
    } catch {
      /* ignore */
    } finally {
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
