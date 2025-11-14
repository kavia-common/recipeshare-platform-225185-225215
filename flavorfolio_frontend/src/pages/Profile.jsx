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

  useEffect(() => {
    (async () => {
      setMine(await listMyRecipes(user));
      setFavs(await listFavorites(user));
    })();
  }, [user]);

  if (!user) return <div className="container" style={{ padding: 24 }}>Please sign in to view your profile.</div>;

  return (
    <div className="container" style={{ padding: "24px 0 48px" }}>
      <h2 style={{ marginBottom: 8 }}>{user.name}</h2>
      <div className="tabs">
        <button className={`tab ${tab === "mine" ? "active" : ""}`} onClick={() => setTab("mine")}>My Recipes</button>
        <button className={`tab ${tab === "favs" ? "active" : ""}`} onClick={() => setTab("favs")}>Favorites</button>
      </div>

      {tab === "mine" ? (
        mine.length ? <div className="grid">{mine.map(r => <RecipeCard key={r.id} recipe={r} />)}</div>
        : <p>No recipes yet. Create your first!</p>
      ) : (
        favs.length ? <div className="grid">{favs.map(r => <RecipeCard key={r.id} recipe={r} />)}</div>
        : <p>No favorites yet. Explore and add some!</p>
      )}
    </div>
  );
}
