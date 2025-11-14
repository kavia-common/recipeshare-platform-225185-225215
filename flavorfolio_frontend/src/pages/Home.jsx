import React, { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import RecipeCard from "../components/RecipeCard";
import { useNavigate } from "react-router-dom";

/** Home page showing hero, search, and recipes grid. */
export default function Home() {
  const nav = useNavigate();
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await api.recipes.getAll();
      const items = Array.isArray(data) ? data : (data?.items ?? []);
      setRecipes(items);
    } catch (e) {
      setErr(e?.message || "Failed to load recipes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  function onSearchSubmit(e) {
    e.preventDefault();
    const next = query.trim();
    if (next) nav(`/search?q=${encodeURIComponent(next)}`);
  }

  const skeletons = useMemo(() => {
    const nodes = [];
    for (let i = 0; i < 8; i++) {
      nodes.push(
        <div key={i} className="card" aria-hidden="true">
          <div className="skeleton-img" />
          <div className="card-body">
            <div className="skeleton-line w-3/4" />
            <div className="skeleton-line w-1/2" />
            <div className="skeleton-row">
              <div className="skeleton-btn" />
              <div className="skeleton-btn" />
            </div>
          </div>
        </div>
      );
    }
    return <div className="grid">{nodes}</div>;
  }, []);

  const grid = useMemo(() => (
    <div className="grid">
      {recipes.map(r => <RecipeCard key={r.id} recipe={r} />)}
    </div>
  ), [recipes]);

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Discover, Share, and Savor</h1>
          <p>Ocean Professional vibes with warm amber and emerald accents.</p>
          <form className="search-bar" onSubmit={onSearchSubmit} role="search" aria-label="Search recipes">
            <input
              type="text"
              placeholder="Search recipes (e.g., salmon, pasta, vegan)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search recipes"
            />
            <button className="filter-pill" type="submit">Search</button>
            <button className="filter-pill" type="button" onClick={() => nav('/search?q=quick')}>Quick</button>
            <button className="filter-pill" type="button" onClick={() => nav('/search?q=healthy')}>Healthy</button>
            <button className="filter-pill" type="button" onClick={() => nav('/search?q=vegan')}>Vegan</button>
          </form>
          {err && <div className="banner-error" role="alert">{err}</div>}
        </div>
      </section>

      <section className="container">
        {loading ? skeletons : grid}
      </section>
    </>
  );
}
