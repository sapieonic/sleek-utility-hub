
import { LucideIcon, Construction } from "lucide-react";
import { Link } from "react-router-dom";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Card } from "@/components/ui/card";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  inProgress?: boolean;
}

export function ToolCard({ icon: Icon, title, description, path, inProgress = false }: ToolCardProps) {
  return (
    <Link to={path} className="block">
      <Card className={`tool-card group relative ${inProgress ? 'border-amber-500 border-opacity-50' : ''}`}>
        <div className="p-4 sm:p-6">
          <div className="mb-3 sm:mb-4 rounded-full bg-primary/10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
            <Icon className="tool-icon group-hover:scale-110 transition-transform h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">{title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
          
          {inProgress && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 text-amber-500 animate-pulse-gentle">
                  <Construction className="h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform" />
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-64 sm:w-80">
                <div className="font-medium">Work in Progress</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                  This tool is currently under development and may not be fully functional.
                </div>
              </HoverCardContent>
            </HoverCard>
          )}
        </div>
      </Card>
    </Link>
  );
}
