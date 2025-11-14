import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/** Navbar with brand, links, and auth buttons using Ocean Professional theme. */
export default function Navbar() {
  const { user, login, logout } = useAuth();
  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" aria-label="FlavorFolio Home">
          <span className="brand-badge">FF</span>
          <span>FlavorFolio</span>
        </Link>

        <div className="nav-links">
          <NavLink to="/" className="btn">Home</NavLink>
          {user && <NavLink to="/create" className="btn btn-primary">Create</NavLink>}
          {user && <NavLink to="/profile" className="btn">Profile</NavLink>}
          {!user ? (
            <button onClick={() => login()} className="btn btn-emerald" aria-label="Sign in">
              Sign in
            </button>
          ) : (
            <button onClick={logout} className="btn" aria-label="Sign out">
              Sign out ({user.name})
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
