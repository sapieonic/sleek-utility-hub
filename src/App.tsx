import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { WorkspaceProvider } from "@/state/workspace";
import Workspace from "./pages/Workspace";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider delayDuration={400}>
    <WorkspaceProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Workspace />} />
          {/* Every pre-workspace tool URL still resolves — it opens the
              workspace with that tool already loaded as step one. */}
          <Route path="/tools/:slug" element={<Workspace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Sonner
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--wk-raised)",
            border: "1px solid var(--wk-line)",
            color: "var(--wk-text)",
            fontSize: "12px",
          },
        }}
      />
    </WorkspaceProvider>
  </TooltipProvider>
);

export default App;
