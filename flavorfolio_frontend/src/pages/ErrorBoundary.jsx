import React from "react";

/**
 * ErrorBoundary wraps the app and catches render errors,
 * showing a friendly UI instead of a blank screen.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || "Something went wrong." };
  }

  componentDidCatch(error, errorInfo) {
    // In production, send to logging service. Avoid leaking sensitive info to users.
    // console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container" style={{ padding: "48px 0" }}>
          <div className="error-pane">
            <div className="error-badge">Error</div>
            <h2>Oops! Something went wrong.</h2>
            <p className="muted">{this.state.errorMessage}</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
