import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/** Navbar with brand, links, a compact search for small screens, and auth buttons. */
export default function Navbar() {
  const { user, logout } = useAuth();
  const [q, setQ] = useState("");
  const nav = useNavigate();

  function onSubmit(e) {
    e.preventDefault();
    const next = q.trim();
    if (next) nav(`/search?q=${encodeURIComponent(next)}`);
  }

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" aria-label="FlavorFolio Home">
          <span className="brand-badge">FF</span>
          <span>FlavorFolio</span>
        </Link>

        <form className="nav-search" onSubmit={onSubmit} role="search" aria-label="Quick search">
          <input
            type="text"
            placeholder="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Quick search input"
          />
          <button type="submit" className="btn btn-primary" aria-label="Submit quick search">Go</button>
        </form>

        <div className="nav-links">
          <NavLink to="/" className="btn">Home</NavLink>
          {user && <NavLink to="/create" className="btn btn-primary">Create</NavLink>}
          {user && <NavLink to="/profile" className="btn">Profile</NavLink>}
          {!user ? (
            <button onClick={() => nav("/signin")} className="btn btn-emerald" aria-label="Sign in">
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
