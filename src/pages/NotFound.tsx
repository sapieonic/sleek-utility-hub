
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-8">Oops! We couldn't find that page.</p>
          <Button asChild>
            <a href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </a>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
