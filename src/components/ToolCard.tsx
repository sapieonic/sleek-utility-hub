
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
        <div className="p-6">
          <div className="mb-4 rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center">
            <Icon className="tool-icon group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-lg font-medium mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          
          {inProgress && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="absolute top-3 right-3 text-amber-500 animate-pulse-gentle">
                  <Construction className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="font-medium">Work in Progress</div>
                <div className="text-sm text-muted-foreground mt-1">
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
