import React from "react";
import { Link } from "react-router-dom";

/**
 * NotFound page to display when route isn't matched.
 */
export default function NotFound() {
  return (
    <div className="container" style={{ padding: "48px 0" }}>
      <div className="error-pane">
        <div className="error-badge">404</div>
        <h2>Page not found</h2>
        <p className="muted">We couldn't find what you were looking for.</p>
        <div style={{ marginTop: 16 }}>
          <Link to="/" className="btn btn-primary">Go Home</Link>
        </div>
      </div>
    </div>
  );
}
