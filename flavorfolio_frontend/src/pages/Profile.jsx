import React, { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import RecipeCard from "../components/RecipeCard";

/**
 * Profile page
 * - Loads current user via api.auth.getCurrentUser()
 * - Displays tabs for "My Recipes" and "Favorites"
 * - Fetches data from api.users.getMyRecipes() and api.users.getMyFavorites()
 */
export default function Profile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState("myRecipes");
  const [myRecipes, setMyRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingUser(true);
      try {
        const me = await (api.auth?.getCurrentUser?.() ?? Promise.resolve(null));
        if (!active) return;
        setCurrentUser(me);
      } catch (e) {
        if (!active) return;
        setCurrentUser(null);
      } finally {
        if (active) setLoadingUser(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!currentUser) {
        setMyRecipes([]);
        setFavorites([]);
        setLoadingData(false);
        return;
      }
      setLoadingData(true);
      setErr("");
      try {
        const [mine, favs] = await Promise.all([
          api.users?.getMyRecipes?.() ?? Promise.resolve([]),
          api.users?.getMyFavorites?.() ?? Promise.resolve([]),
        ]);
        if (!active) return;
        setMyRecipes(Array.isArray(mine) ? mine : []);
        setFavorites(Array.isArray(favs) ? favs : []);
      } catch (e) {
        if (!active) return;
        setErr(e?.message || "Failed to load your profile data.");
      } finally {
        if (active) setLoadingData(false);
      }
    })();
    return () => { active = false; };
  }, [currentUser]);

  const skeletons = useMemo(() => (
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
  ), []);

  if (loadingUser) {
    return (
      <div className="container" style={{ padding: 24 }}>
        <div className="skeleton-line w-1/3" />
        {skeletons}
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container" style={{ padding: 24 }}>
        Please sign in to view your profile.
      </div>
    );
  }

  const content = tab === "myRecipes"
    ? (myRecipes.length ? (
        <div className="grid">{myRecipes.map(r => <RecipeCard key={r.id} recipe={r} />)}</div>
      ) : (
        <p>No recipes yet. Create your first!</p>
      ))
    : (favorites.length ? (
        <div className="grid">{favorites.map(r => <RecipeCard key={r.id} recipe={r} />)}</div>
      ) : (
        <p>No favorites yet. Explore and add some!</p>
      ));

  return (
    <div className="container" style={{ padding: "24px 0 48px" }}>
      <h2 style={{ marginBottom: 8 }}>{currentUser?.name || "My Profile"}</h2>

      <div className="tabs">
        <button
          className={`tab ${tab === "myRecipes" ? "active" : ""}`}
          onClick={() => setTab("myRecipes")}
          disabled={loadingData}
        >
          My Recipes
        </button>
        <button
          className={`tab ${tab === "favorites" ? "active" : ""}`}
          onClick={() => setTab("favorites")}
          disabled={loadingData}
        >
          Favorites
        </button>
      </div>

      {err && <div className="banner-error" role="alert">{err}</div>}
      {loadingData ? skeletons : content}
    </div>
  );
}
