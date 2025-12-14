
import { ThemeToggle } from "./ThemeToggle";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b sticky top-0 z-10 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-500">
            UtilityHub
          </div>
          <div className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
            Beta
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <a href="https://github.com/sapieonic/sleek-utility-hub" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="icon">
              <Github className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="sr-only">GitHub</span>
            </Button>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
