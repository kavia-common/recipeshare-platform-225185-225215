import React, { createContext, useContext, useMemo, useState } from "react";

/**
 * AuthContext provides a lightweight stub for authentication state.
 * Replace with NextAuth in future; API is kept minimal and similar to session hooks.
 */
const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** This is a public provider exposing user state and auth actions. */
  const [user, setUser] = useState(null);

  const value = useMemo(() => ({
    user,
    // PUBLIC_INTERFACE
    login: (name = "Chef Ada") => setUser({ id: "u_demo", name }),
    // PUBLIC_INTERFACE
    logout: () => setUser(null),
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access auth context. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
