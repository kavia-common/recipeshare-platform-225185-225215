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
  const [err, setErr] = useState("");

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
    setErr("");
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
    } catch (e) {
      setErr(e?.message || "Failed to create recipe.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="form">
      <h2>Create Recipe</h2>
      {err && <div className="banner-error" role="alert">{err}</div>}

      {/* Quick Fill for Testing */}
      <div className="field">
        <label>Quick Fill (Testing)</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn"
            onClick={() =>
              setValues({
                title: "Crispy Masala Dosa",
                imageUrl: "https://images.unsplash.com/photo-1625944525603-c2c542ad3a45",
                description: "A South Indian classic: thin, crispy crepe made from fermented rice and lentil batter, served with sambar and chutneys.",
                ingredients: [
                  "2 cups parboiled rice",
                  "1/2 cup urad dal (split black gram)",
                  "1/4 tsp fenugreek seeds",
                  "Salt to taste",
                  "Oil or ghee for cooking"
                ].join("\n"),
                instructions:
                  "1) Rinse rice, dal, and fenugreek seeds; soak 4-6 hours.\n" +
                  "2) Grind to a smooth batter, adding water as needed.\n" +
                  "3) Ferment overnight until bubbly and slightly tangy.\n" +
                  "4) Add salt; heat a tawa, pour a ladle of batter, and spread thin.\n" +
                  "5) Drizzle oil, cook until crisp, fold, and serve hot with sambar and chutney."
              })
            }
          >
            Dosa
          </button>

          <button
            type="button"
            className="btn"
            onClick={() =>
              setValues({
                title: "Decadent Chocolate Cake",
                imageUrl: "https://images.unsplash.com/photo-1601972599720-bdbc842bb5c9",
                description: "Moist and rich chocolate cake layered with smooth chocolate ganache.",
                ingredients: [
                  "1 3/4 cups all-purpose flour",
                  "3/4 cup cocoa powder",
                  "1 1/2 tsp baking powder",
                  "1 1/2 tsp baking soda",
                  "1 tsp salt",
                  "2 cups sugar",
                  "2 eggs",
                  "1 cup milk",
                  "1/2 cup vegetable oil",
                  "2 tsp vanilla extract",
                  "1 cup boiling water"
                ].join("\n"),
                instructions:
                  "1) Preheat oven to 350°F (175°C). Grease and line two 8-inch pans.\n" +
                  "2) Whisk dry ingredients; add eggs, milk, oil, vanilla; mix until smooth.\n" +
                  "3) Stir in boiling water (batter will be thin). Divide into pans.\n" +
                  "4) Bake 30–35 minutes; cool completely.\n" +
                  "5) Frost with chocolate ganache or buttercream."
              })
            }
          >
            Chocolate Cake
          </button>

          <button
            type="button"
            className="btn"
            onClick={() =>
              setValues({
                title: "Vegetable Stir Fry",
                imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
                description: "Quick, colorful stir fry packed with crunchy vegetables and a savory sauce.",
                ingredients: [
                  "2 tbsp vegetable oil",
                  "3 cloves garlic, minced",
                  "1 tsp ginger, minced",
                  "1 bell pepper, sliced",
                  "2 carrots, julienned",
                  "1 cup broccoli florets",
                  "2 tbsp soy sauce",
                  "1 tbsp oyster sauce (optional)",
                  "1 tsp sesame oil"
                ].join("\n"),
                instructions:
                  "1) Heat oil in a wok over high heat; add garlic and ginger.\n" +
                  "2) Add vegetables; stir fry 3–5 minutes until crisp-tender.\n" +
                  "3) Stir in soy sauce, oyster sauce, and sesame oil; toss to coat.\n" +
                  "4) Serve hot over rice or noodles."
              })
            }
          >
            Vegetable Stir Fry
          </button>
        </div>
      </div>

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
        <button className="btn btn-primary" onClick={onSubmit} disabled={busy} aria-live="polite">
          {busy ? "Creating..." : "Create"}
        </button>
      </div>
    </div>
  );
}
