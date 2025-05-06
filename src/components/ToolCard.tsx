
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
}

export function ToolCard({ icon: Icon, title, description, path }: ToolCardProps) {
  return (
    <Link to={path} className="tool-card animate-scale">
      <div className="p-6">
        <div className="mb-4 rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center">
          <Icon className="tool-icon" />
        </div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}
