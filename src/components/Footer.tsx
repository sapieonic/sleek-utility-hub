
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} UtilityHub. All rights reserved.
        </p>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>Built with</span>
          <Heart className="h-4 w-4 text-red-500 fill-red-500" />
          <span>using React & Tailwind</span>
        </div>
      </div>
    </footer>
  );
}
