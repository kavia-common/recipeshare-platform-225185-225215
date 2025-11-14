import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { searchRecipes } from "../lib/api";
import RecipeCard from "../components/RecipeCard";

/**
 * Search page to display results from backend /api/recipes/search endpoint.
 * Uses query param (?q=...) and supports loading skeletons and friendly errors.
 */
export default function Search() {
  const loc = useLocation();
  const nav = useNavigate();
  const params = new URLSearchParams(loc.search);
  const qParam = params.get("q") || "";

  const [q, setQ] = useState(qParam);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setQ(qParam);
  }, [qParam]);

  useEffect(() => {
    async function run() {
      if (!qParam) {
        setResults([]);
        return;
      }
      setLoading(true);
      setErr("");
      try {
        const data = await searchRecipes(qParam, { skip: 0, take: 24 });
        setResults(Array.isArray(data) ? data : (data?.items ?? []));
      } catch (e) {
        setErr(e?.message || "Unable to search right now.");
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [qParam]);

  function onSubmit(e) {
    e.preventDefault();
    const next = q.trim();
    nav(`/search?q=${encodeURIComponent(next)}`);
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

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Search Recipes</h1>
          <p>Find dishes by title, ingredient, or tags.</p>
          <form className="search-bar" onSubmit={onSubmit} role="search" aria-label="Search recipes">
            <input
              type="text"
              placeholder="Try: salmon, pasta, vegan"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search input"
            />
            <button type="submit" className="filter-pill" aria-label="Submit search">
              Search
            </button>
          </form>
          {err && (
            <div className="banner-error" role="alert">
              {err}
            </div>
          )}
        </div>
      </section>

      <section className="container">
        {loading ? (
          skeletons
        ) : results.length ? (
          <div className="grid">
            {results.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        ) : (
          <p style={{ padding: "24px 0" }}>
            {qParam ? `No results for "${qParam}". Try different keywords.` : "Start by entering a search above."}
          </p>
        )}
      </section>
    </>
  );
}
