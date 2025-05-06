
import { ThemeToggle } from "./ThemeToggle";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b sticky top-0 z-10 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-500">
            UtilityHub
          </div>
          <div className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
            Beta
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon">
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
