import React, { useEffect, useMemo, useState } from "react";
import { listRecipes } from "../lib/api";
import RecipeCard from "../components/RecipeCard";

/** Home page showing hero, search, and recipes grid. */
export default function Home() {
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await listRecipes(query);
    setRecipes(data);
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  // simple debounced search
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [query]);

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
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search recipes (e.g., salmon, pasta, vegan)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search recipes"
            />
            <button className="filter-pill">Quick</button>
            <button className="filter-pill">Healthy</button>
            <button className="filter-pill">Vegan</button>
          </div>
        </div>
      </section>

      <section className="container">
        {loading ? <p>Loading...</p> : grid}
      </section>
    </>
  );
}
