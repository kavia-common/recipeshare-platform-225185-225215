import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteRecipe, getRecipe, toggleFavorite } from "../lib/api";
import { useAuth } from "../context/AuthContext";

/** Detailed view for a recipe with action buttons. */
export default function RecipeDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await getRecipe(id);
      setRecipe(r);
    })();
  }, [id]);

  if (!recipe) return <div className="container" style={{ padding: 24 }}>Loading...</div>;

  async function onDelete() {
    if (!user) return alert("Sign in required.");
    if (user.id !== recipe.authorId) return alert("Only author can delete.");
    if (!window.confirm("Delete this recipe?")) return;
    setBusy(true);
    try {
      await deleteRecipe(recipe.id, user);
      nav("/");
    } finally {
      setBusy(false);
    }
  }

  async function onFavorite() {
    if (!user) return alert("Sign in required.");
    await toggleFavorite(recipe.id, user);
    alert("Toggled favorite!");
  }

  return (
    <div className="container" style={{ padding: "24px 0 48px" }}>
      <h2 style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span>{recipe.title}</span>
        <span style={{ fontSize: 14, color: "#6b7280" }}>by {recipe.authorName || "Unknown"}</span>
      </h2>
      <div className="detail">
        <div>
          <img src={recipe.imageUrl} alt={recipe.title} />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="btn btn-primary" onClick={onFavorite}>Favorite</button>
            {user && user.id === recipe.authorId && (
              <>
                <Link to={`/edit/${recipe.id}`} className="btn">Edit</Link>
                <button className="btn btn-danger" onClick={onDelete} disabled={busy}>
                  {busy ? "Deleting..." : "Delete"}
                </button>
              </>
            )}
          </div>
        </div>
        <div className="detail-section">
          <div className="section-title">Ingredients</div>
          <ul>
            {(recipe.ingredients || []).map((ing, i) => <li key={i}>{ing}</li>)}
          </ul>
          <div className="section-title" style={{ marginTop: 12 }}>Instructions</div>
          <p style={{ whiteSpace: "pre-wrap" }}>{recipe.instructions}</p>
        </div>
      </div>
    </div>
  );
}
