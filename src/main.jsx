import { StrictMode, Component } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./components/App/App.jsx";

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "600px" }}>
          <h1>Something went wrong</h1>
          <pre style={{ overflow: "auto", background: "#f5f5f5", padding: "1rem" }}>
            {this.state.error?.message ?? String(this.state.error)}
          </pre>
          <p>Check the browser console (F12) for more details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
