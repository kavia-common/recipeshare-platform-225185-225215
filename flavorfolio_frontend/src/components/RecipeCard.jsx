import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toggleFavorite } from "../lib/api";
import { useAuth } from "../context/AuthContext";

/** RecipeCard shows image, title, meta and allows favoriting. */
export default function RecipeCard({ recipe }) {
  const { user } = useAuth();
  const [faving, setFaving] = useState(false);

  async function onFav(e) {
    e.preventDefault();
    if (!user) return alert("Please sign in to favorite.");
    try {
      setFaving(true);
      await toggleFavorite(recipe.id, user);
    } finally {
      setFaving(false);
    }
  }

  return (
    <Link to={`/recipes/${recipe.id}`} className="card" aria-label={`Open ${recipe.title}`}>
      <img src={recipe.imageUrl} alt={recipe.title} />
      <div className="card-body">
        <div className="card-title">{recipe.title}</div>
        <div className="card-meta">
          <span>by {recipe.authorName || "Unknown"}</span>
        </div>
        <div className="card-actions">
          <button className="btn btn-primary" onClick={onFav} disabled={faving}>
            {faving ? "Saving..." : "Favorite"}
          </button>
          <span className="btn">View</span>
        </div>
      </div>
    </Link>
  );
}
