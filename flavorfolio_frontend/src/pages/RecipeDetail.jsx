import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

/** Detailed view for a recipe with action buttons. */
export default function RecipeDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const r = await api.recipes.getById(id);
        if (!r) {
          setErr("Recipe not found");
        }
        setRecipe(r);
      } catch (e) {
        setErr(e?.message || "Failed to load recipe");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: 24 }}>
        <div className="skeleton-detail">
          <div className="skeleton-img lg" />
          <div className="skeleton-line w-1/2" />
          <div className="skeleton-line w-3/4" />
          <div className="skeleton-line" />
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="container" style={{ padding: 24 }}>
        <div className="banner-error" role="alert">{err}</div>
        <button className="btn btn-primary" onClick={() => nav(-1)} style={{ marginTop: 12 }}>
          Go Back
        </button>
      </div>
    );
  }

  async function onDelete() {
    if (!user) return alert("Sign in required.");
    if (user.id !== recipe.authorId) return alert("Only author can delete.");
    if (!window.confirm("Delete this recipe?")) return;
    setBusy(true);
    try {
      await api.recipes.delete(recipe.id);
      nav("/");
    } catch (e) {
      alert(e?.message || "Failed to delete.");
    } finally {
      setBusy(false);
    }
  }

  async function onFavorite() {
    if (!user) return alert("Sign in required.");
    try {
      await api.recipes.toggleFavorite(recipe.id);
      alert("Toggled favorite!");
    } catch (e) {
      alert(e?.message || "Failed to toggle favorite.");
    }
  }

  return (
    <div className="container" style={{ padding: "24px 0 48px" }}>
      <h2 style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <span>{recipe.title}</span>
        <span style={{ fontSize: 14, color: "#6b7280" }}>by {recipe.authorName || "Unknown"}</span>
      </h2>
      <div className="detail">
        <div>
          <img src={recipe.imageUrl} alt={recipe.title} />
          <div className="detail-actions">
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
