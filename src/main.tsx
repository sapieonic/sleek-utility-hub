import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import { bootstrapTheme } from "./hooks/use-theme";
import "./index.css";

// Settle the theme before the first paint so the workspace never flashes white.
bootstrapTheme();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>,
);
