
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container flex flex-col items-center justify-between gap-3 px-4 md:px-6 md:h-16 md:flex-row">
        <p className="text-xs sm:text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} UtilityHub. All rights reserved.
        </p>
        <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
          <span>Built with</span>
          <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 fill-red-500" />
          <span>using React & Tailwind</span>
        </div>
      </div>
    </footer>
  );
}
