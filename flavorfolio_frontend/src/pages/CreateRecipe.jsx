import React, { useState } from "react";
import { z } from "zod";
import { createRecipe } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  imageUrl: z.string().url("Please provide a valid image URL"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  ingredients: z.string().min(3, "Provide at least one ingredient"),
  instructions: z.string().min(10, "Instructions must be at least 10 characters"),
});

/** Create Recipe form with Zod validation and Cloudinary upload placeholder. */
export default function CreateRecipe() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [values, setValues] = useState({
    title: "",
    imageUrl: "",
    description: "",
    ingredients: "",
    instructions: "",
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  function onChange(e) {
    setValues(v => ({ ...v, [e.target.name]: e.target.value }));
  }

  function openCloudinaryWidget() {
    // Placeholder: In real Next.js app, open Cloudinary upload widget and set secure_url
    const url = prompt("Paste image URL (Cloudinary placeholder):");
    if (url) setValues(v => ({ ...v, imageUrl: url }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const errs = {};
      parsed.error.issues.forEach(i => errs[i.path[0]] = i.message);
      setErrors(errs);
      return;
    }
    if (!user) return alert("Please sign in.");

    setBusy(true);
    try {
      const payload = {
        title: values.title.trim(),
        imageUrl: values.imageUrl.trim(),
        description: values.description.trim(),
        ingredients: values.ingredients.split("\n").map(s => s.trim()).filter(Boolean),
        instructions: values.instructions.trim(),
      };
      const r = await createRecipe(payload, user);
      nav(`/recipes/${r.id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="form">
      <h2>Create Recipe</h2>

      <div className="field">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" type="text" value={values.title} onChange={onChange} />
        {errors.title && <span className="error">{errors.title}</span>}
      </div>

      <div className="field">
        <label htmlFor="imageUrl">Image URL</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input id="imageUrl" name="imageUrl" type="text" value={values.imageUrl} onChange={onChange} />
          <button className="btn" onClick={openCloudinaryWidget} type="button">Upload</button>
        </div>
        {errors.imageUrl && <span className="error">{errors.imageUrl}</span>}
      </div>

      <div className="field">
        <label htmlFor="description">Short Description</label>
        <input id="description" name="description" type="text" value={values.description} onChange={onChange} />
        {errors.description && <span className="error">{errors.description}</span>}
      </div>

      <div className="field">
        <label htmlFor="ingredients">Ingredients (one per line)</label>
        <textarea id="ingredients" name="ingredients" value={values.ingredients} onChange={onChange} />
        {errors.ingredients && <span className="error">{errors.ingredients}</span>}
      </div>

      <div className="field">
        <label htmlFor="instructions">Instructions</label>
        <textarea id="instructions" name="instructions" value={values.instructions} onChange={onChange} />
        {errors.instructions && <span className="error">{errors.instructions}</span>}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary" onClick={onSubmit} disabled={busy}>
          {busy ? "Creating..." : "Create"}
        </button>
      </div>
    </div>
  );
}
