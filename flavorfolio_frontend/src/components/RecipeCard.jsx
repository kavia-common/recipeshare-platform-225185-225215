import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

/** RecipeCard shows image, title, meta and allows favoriting and viewing via navigation. */
export default function RecipeCard({ recipe }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [faving, setFaving] = useState(false);
  const [error, setError] = useState("");
  const [isFav, setIsFav] = useState(Boolean(recipe.isFavorite));

  async function onFav(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return alert("Please sign in to favorite.");
    try {
      setError("");
      setFaving(true);
      // optimistic toggle
      setIsFav((v) => !v);
      await api.recipes.toggleFavorite(recipe.id);
    } catch (e) {
      // revert on failure
      setIsFav(Boolean(recipe.isFavorite));
      setError(e?.message || "Failed to update favorite.");
    } finally {
      setFaving(false);
    }
  }

  function onView(e) {
    e.preventDefault();
    navigate(`/recipes/${recipe.id}`);
  }

  return (
    <div className="card" role="article" aria-label={`Recipe ${recipe.title}`}>
      <button
        className="btn"
        style={{ padding: 0, border: "none" }}
        onClick={onView}
        aria-label={`Open ${recipe.title}`}
      >
        <img src={recipe.imageUrl} alt={recipe.title} />
      </button>
      <div className="card-body">
        <div className="card-title">{recipe.title}</div>
        <div className="card-meta">
          <span>by {recipe.authorName || "Unknown"}</span>
        </div>
        <div className="card-actions">
          <button
            className="btn btn-primary"
            onClick={onFav}
            disabled={faving}
            aria-live="polite"
          >
            {faving ? "Saving..." : isFav ? "Unfavorite" : "Favorite"}
          </button>
          <button className="btn" onClick={onView}>
            View
          </button>
        </div>
        {error && <div className="banner-error" role="alert">{error}</div>}
      </div>
    </div>
  );
}
