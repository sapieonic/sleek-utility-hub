import { LucideIcon } from "lucide-react";
import { ToolCard } from "./ToolCard";
import { Badge } from "@/components/ui/badge";

interface Tool {
  title: string;
  description: string;
  path: string;
  icon: LucideIcon;
  isImplemented: boolean;
}

interface CategorySectionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  tools: Tool[];
  colorClass: string;
  bgColorClass: string;
}

export function CategorySection({
  title,
  description,
  icon: Icon,
  tools,
  colorClass,
  bgColorClass,
}: CategorySectionProps) {
  const implementedCount = tools.filter(t => t.isImplemented).length;
  const totalCount = tools.length;

  // Sort tools: implemented first, then not implemented
  const sortedTools = [...tools].sort((a, b) => {
    if (a.isImplemented === b.isImplemented) return 0;
    return a.isImplemented ? -1 : 1;
  });

  return (
    <section className="mb-10 sm:mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className={`rounded-xl ${bgColorClass} p-2.5 sm:p-3 w-fit`}>
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${colorClass}`} />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h2 className={`text-xl sm:text-2xl font-bold ${colorClass}`}>{title}</h2>
            <Badge variant="secondary" className="text-xs">
              {implementedCount}/{totalCount} available
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 sm:mt-1">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {sortedTools.map((tool, index) => (
          <div
            key={tool.path}
            className="opacity-0 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
          >
            <ToolCard
              icon={tool.icon}
              title={tool.title}
              description={tool.description}
              path={tool.path}
              inProgress={!tool.isImplemented}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
