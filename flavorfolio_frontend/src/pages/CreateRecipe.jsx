import React, { useMemo, useRef, useState } from "react";
import { z } from "zod";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Zod schema for client-side validation
const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  ingredients: z.string().min(3, "Provide at least one ingredient"),
  instructions: z.string().min(10, "Instructions must be at least 10 characters"),
  imageUrl: z.string().optional(),
});

/**
 * Create Recipe page
 * - Validates inputs via Zod
 * - Builds FormData to support image upload and other fields
 * - Friendly error if backend requires image and it is missing
 */
export default function CreateRecipe() {
  const { user } = useAuth();
  const nav = useNavigate();

  const fileInputRef = useRef(null);

  const [values, setValues] = useState({
    title: "",
    imageUrl: "",
    description: "",
    ingredients: "",
    instructions: "",
    imageFile: null,
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function onChange(e) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  }

  function handleImageUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || "");
        setValues((v) => ({ ...v, imageUrl: dataUrl, imageFile: file }));
      };
      reader.onerror = () => {
        setErr("Failed to read selected image. Please try another file.");
      };
      reader.readAsDataURL(file);
    } catch (ex) {
      setErr(ex?.message || "Unexpected error while reading image.");
    }
  }

  async function onSubmit(e) {
    e.preventDefault();

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const errs = {};
      for (const issue of parsed.error.issues) {
        errs[issue.path[0]] = issue.message;
      }
      setErrors(errs);
      return;
    }

    if (!user) {
      alert("Please sign in to create a recipe.");
      return;
    }

    setBusy(true);
    setErr("");
    try {
      // Build FormData
      const fd = new FormData();
      fd.append("title", values.title.trim());
      fd.append("description", values.description.trim());
      // Ingredients as newline list -> let server parse; alternatively send JSON string
      fd.append("ingredients", values.ingredients);
      fd.append("instructions", values.instructions.trim());
      if (values.imageFile) {
        fd.append("image", values.imageFile);
      } else if (values.imageUrl) {
        // If backend accepts imageUrl for remote fetch, include it; otherwise backend may 400.
        fd.append("imageUrl", values.imageUrl.trim());
      }

      const created = await api.recipes.create(fd);
      const newId = created?.id || created?._id;
      if (newId) {
        nav(`/recipes/${newId}`);
      } else {
        // Fallback navigate to home if id missing
        nav("/");
      }
    } catch (e) {
      const message =
        e?.status === 400
          ? "Please include a valid image file or URL and ensure all fields are filled correctly."
          : e?.message || "Failed to create recipe.";
      setErr(message);
    } finally {
      setBusy(false);
    }
  }

  const presets = useMemo(
    () => [
      {
        label: "Dosa",
        data: {
          title: "Crispy Masala Dosa",
          imageUrl: "https://images.unsplash.com/photo-1625944525603-c2c542ad3a45",
          description:
            "A South Indian classic: thin, crispy crepe made from fermented rice and lentil batter, served with sambar and chutneys.",
          ingredients: [
            "2 cups parboiled rice",
            "1/2 cup urad dal (split black gram)",
            "1/4 tsp fenugreek seeds",
            "Salt to taste",
            "Oil or ghee for cooking",
          ].join("\n"),
          instructions:
            "1) Rinse rice, dal, and fenugreek seeds; soak 4-6 hours.\n" +
            "2) Grind to a smooth batter, adding water as needed.\n" +
            "3) Ferment overnight until bubbly and slightly tangy.\n" +
            "4) Add salt; heat a tawa, pour a ladle of batter, and spread thin.\n" +
            "5) Drizzle oil, cook until crisp, fold, and serve hot with sambar and chutney.",
        },
      },
      {
        label: "Chocolate Cake",
        data: {
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
            "1 cup boiling water",
          ].join("\n"),
          instructions:
            "1) Preheat oven to 350°F (175°C). Grease and line two 8-inch pans.\n" +
            "2) Whisk dry ingredients; add eggs, milk, oil, vanilla; mix until smooth.\n" +
            "3) Stir in boiling water (batter will be thin). Divide into pans.\n" +
            "4) Bake 30–35 minutes; cool completely.\n" +
            "5) Frost with chocolate ganache or buttercream.",
        },
      },
      {
        label: "Vegetable Stir Fry",
        data: {
          title: "Vegetable Stir Fry",
          imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
          description:
            "Quick, colorful stir fry packed with crunchy vegetables and a savory sauce.",
          ingredients: [
            "2 tbsp vegetable oil",
            "3 cloves garlic, minced",
            "1 tsp ginger, minced",
            "1 bell pepper, sliced",
            "2 carrots, julienned",
            "1 cup broccoli florets",
            "2 tbsp soy sauce",
            "1 tbsp oyster sauce (optional)",
            "1 tsp sesame oil",
          ].join("\n"),
          instructions:
            "1) Heat oil in a wok over high heat; add garlic and ginger.\n" +
            "2) Add vegetables; stir fry 3–5 minutes until crisp-tender.\n" +
            "3) Stir in soy sauce, oyster sauce, and sesame oil; toss to coat.\n" +
            "4) Serve hot over rice or noodles.",
        },
      },
    ],
    []
  );

  const onPreset = (p) => {
    setValues({ ...p.data, imageFile: null });
  };

  return (
    <div className="form">
      <h2>Create Recipe</h2>
      {err && (
        <div className="banner-error" role="alert">
          {err}
        </div>
      )}

      {values.imageUrl ? (
        <div style={{ marginBottom: 12 }}>
          <img
            src={values.imageUrl}
            alt="Selected preview"
            style={{ width: "100%", maxHeight: 240, objectFit: "cover", borderRadius: 12, border: "1px solid #e5e7eb" }}
          />
        </div>
      ) : null}

      <div className="field">
        <label>Quick Fill (Testing)</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              className="btn"
              onClick={() => onPreset(p)}
              aria-label={`Quick fill ${p.label}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={values.title}
            onChange={onChange}
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "title-error" : undefined}
          />
          {errors.title && (
            <span id="title-error" className="error">
              {errors.title}
            </span>
          )}
        </div>

        <div className="field">
          <label htmlFor="imageUrl">Image URL</label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="text"
            value={values.imageUrl}
            onChange={onChange}
            aria-invalid={!!errors.imageUrl}
            aria-describedby={errors.imageUrl ? "imageUrl-error" : undefined}
          />
          {errors.imageUrl && (
            <span id="imageUrl-error" className="error">
              {errors.imageUrl}
            </span>
          )}
        </div>

        <div className="field">
          <label>Upload image</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
              aria-label="Image file input"
            />
            <button
              className="btn"
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              aria-label="Choose image to upload"
            >
              Upload image
            </button>
            {values.imageFile ? (
              <span style={{ fontSize: 12, color: "#6b7280" }} aria-live="polite">
                Selected: {values.imageFile.name}
              </span>
            ) : null}
          </div>
          <span className="muted" style={{ fontSize: 12 }}>
            Choose an image file or paste an Image URL above. If a file is chosen, its preview is used.
          </span>
        </div>

        <div className="field">
          <label htmlFor="description">Short Description</label>
          <input
            id="description"
            name="description"
            type="text"
            value={values.description}
            onChange={onChange}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? "description-error" : undefined}
          />
          {errors.description && (
            <span id="description-error" className="error">
              {errors.description}
            </span>
          )}
        </div>

        <div className="field">
          <label htmlFor="ingredients">Ingredients (one per line)</label>
          <textarea
            id="ingredients"
            name="ingredients"
            value={values.ingredients}
            onChange={onChange}
            aria-invalid={!!errors.ingredients}
            aria-describedby={errors.ingredients ? "ingredients-error" : undefined}
          />
          {errors.ingredients && (
            <span id="ingredients-error" className="error">
              {errors.ingredients}
            </span>
          )}
        </div>

        <div className="field">
          <label htmlFor="instructions">Instructions</label>
          <textarea
            id="instructions"
            name="instructions"
            value={values.instructions}
            onChange={onChange}
            aria-invalid={!!errors.instructions}
            aria-describedby={errors.instructions ? "instructions-error" : undefined}
          />
          {errors.instructions && (
            <span id="instructions-error" className="error">
              {errors.instructions}
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" type="submit" disabled={busy} aria-live="polite">
            {busy ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
