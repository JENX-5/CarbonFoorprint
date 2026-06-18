import React from "react";
import PropTypes from "prop-types";

/**
 * ErrorBoundary class component to catch rendering errors from child components.
 * Especially useful for wrapping external third-party widgets like charts.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          className="error-fallback"
          style={{
            padding: "1.5rem",
            background: "var(--color-danger-bg, #fdf2f2)",
            border: "1px dashed var(--color-danger, #ef5350)",
            borderRadius: "var(--radius-md, 8px)",
            textAlign: "center",
            color: "var(--color-danger, #ef5350)",
            fontSize: "0.9rem",
            fontWeight: 500,
          }}
        >
          Something went wrong rendering this component.
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.element,
};
