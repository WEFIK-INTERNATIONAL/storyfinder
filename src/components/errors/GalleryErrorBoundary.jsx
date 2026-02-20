"use client";

import { Component } from "react";

export default class GalleryErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message ?? "An unexpected error occurred.",
    };
  }

  componentDidCatch(error, info) {
    if (process.env.NODE_ENV === "development") {
      console.error("[GalleryErrorBoundary]", error, info.componentStack);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          color: "#f0f0f0",
          fontFamily: "'TheGoodMonolith', monospace",
          fontSize: "0.75rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          zIndex: 99999,
        }}
      >
        <p style={{ opacity: 0.6 }}>Gallery failed to load</p>
        {process.env.NODE_ENV === "development" && (
          <p
            style={{
              opacity: 0.4,
              fontSize: "0.65rem",
              maxWidth: "40ch",
              textAlign: "center",
            }}
          >
            {this.state.message}
          </p>
        )}
        <button
          type="button"
          onClick={this.handleRetry}
          style={{
            background: "none",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "#f0f0f0",
            fontFamily: "inherit",
            fontSize: "inherit",
            letterSpacing: "inherit",
            textTransform: "inherit",
            padding: "0.75em 1.5em",
            cursor: "pointer",
            borderRadius: "0.25em",
            transition: "border-color 0.2s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.borderColor = "rgba(255,255,255,0.8)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)")
          }
        >
          Retry
        </button>
      </div>
    );
  }
}
