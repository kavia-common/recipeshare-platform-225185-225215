import React, { useEffect, useState } from "react";
import { listFavorites, listMyRecipes } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import RecipeCard from "../components/RecipeCard";

/** Profile page with tabs: My Recipes and Favorites. */
export default function Profile() {
  const { user } = useAuth();
  const [tab, setTab] = useState("mine");
  const [mine, setMine] = useState([]);
  const [favs, setFavs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      if (!user) return;
      setLoading(true);
      setErr("");
      try {
        setMine(await listMyRecipes(user));
        setFavs(await listFavorites(user));
      } catch (e) {
        setErr(e?.message || "Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!user) return <div className="container" style={{ padding: 24 }}>Please sign in to view your profile.</div>;

  return (
    <div className="container" style={{ padding: "24px 0 48px" }}>
      <h2 style={{ marginBottom: 8 }}>{user.name}</h2>
      <div className="tabs">
        <button className={`tab ${tab === "mine" ? "active" : ""}`} onClick={() => setTab("mine")} disabled={loading}>My Recipes</button>
        <button className={`tab ${tab === "favs" ? "active" : ""}`} onClick={() => setTab("favs")} disabled={loading}>Favorites</button>
      </div>
      {err && <div className="banner-error" role="alert">{err}</div>}
      {loading ? (
        <div className="grid">
          {Array.from({ length: 6 }).map((_, i) => (
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
          ))}
        </div>
      ) : tab === "mine" ? (
        mine.length ? <div className="grid">{mine.map(r => <RecipeCard key={r.id} recipe={r} />)}</div>
        : <p>No recipes yet. Create your first!</p>
      ) : (
        favs.length ? <div className="grid">{favs.map(r => <RecipeCard key={r.id} recipe={r} />)}</div>
        : <p>No favorites yet. Explore and add some!</p>
      )}
    </div>
  );
}
