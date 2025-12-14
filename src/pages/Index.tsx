import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { ToolGrid, getToolsByCategory } from '@/components/ToolGrid';
import { CategorySection } from '@/components/CategorySection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Code,
  Binary,
  FileCode,
  Newspaper,
  ArrowRightLeft,
  Wrench,
  LayoutGrid,
  Search
} from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<"grouped" | "all">("grouped");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Auto-switch to "all" view when searching
    if (query) {
      setActiveView("all");
    }
  };

  // Get tools for each category
  const formatterTools = getToolsByCategory('formatters');
  const encoderTools = getToolsByCategory('encoders');
  const generatorTools = getToolsByCategory('generators');
  const converterTools = getToolsByCategory('converters');
  const utilityTools = getToolsByCategory('utilities');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container px-4 sm:px-6">
          <HeroSection onSearch={handleSearch} />

          {/* View Toggle */}
          <div className="flex justify-center mb-6">
            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "grouped" | "all")} className="w-full max-w-md">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="grouped" className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  <span>By Category</span>
                </TabsTrigger>
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <span>All Tools</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Grouped View */}
          {activeView === "grouped" && !searchQuery && (
            <div className="space-y-4">
              <CategorySection
                title="Formatters"
                description="Format and beautify your code with proper indentation"
                icon={FileCode}
                tools={formatterTools}
                colorClass="text-blue-600 dark:text-blue-400"
                bgColorClass="bg-blue-100 dark:bg-blue-900/30"
              />

              <CategorySection
                title="Encoders & Decoders"
                description="Encode and decode text in various formats"
                icon={Binary}
                tools={encoderTools}
                colorClass="text-emerald-600 dark:text-emerald-400"
                bgColorClass="bg-emerald-100 dark:bg-emerald-900/30"
              />

              <CategorySection
                title="Converters"
                description="Convert between different file formats"
                icon={ArrowRightLeft}
                tools={converterTools}
                colorClass="text-purple-600 dark:text-purple-400"
                bgColorClass="bg-purple-100 dark:bg-purple-900/30"
              />

              <CategorySection
                title="Generators"
                description="Generate test data, placeholders, and more"
                icon={Newspaper}
                tools={generatorTools}
                colorClass="text-amber-600 dark:text-amber-400"
                bgColorClass="bg-amber-100 dark:bg-amber-900/30"
              />

              <CategorySection
                title="Utilities"
                description="Additional helpful tools for developers"
                icon={Wrench}
                tools={utilityTools}
                colorClass="text-rose-600 dark:text-rose-400"
                bgColorClass="bg-rose-100 dark:bg-rose-900/30"
              />
            </div>
          )}

          {/* All Tools View (with category tabs) */}
          {(activeView === "all" || searchQuery) && (
            <Tabs defaultValue="all" className="my-6 sm:my-8">
              <div className="flex justify-center mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-none">
                <TabsList className="h-auto p-1 flex-wrap justify-center">
                  <TabsTrigger value="all" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 px-2 sm:px-3">
                    <Code className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>All</span>
                  </TabsTrigger>
                  <TabsTrigger value="formatters" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 px-2 sm:px-3">
                    <FileCode className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Formatters</span>
                  </TabsTrigger>
                  <TabsTrigger value="encoders" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 px-2 sm:px-3">
                    <Binary className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Encoders</span>
                  </TabsTrigger>
                  <TabsTrigger value="converters" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 px-2 sm:px-3">
                    <ArrowRightLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Converters</span>
                  </TabsTrigger>
                  <TabsTrigger value="generators" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 px-2 sm:px-3">
                    <Newspaper className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Generators</span>
                  </TabsTrigger>
                  <TabsTrigger value="utilities" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 px-2 sm:px-3">
                    <Wrench className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Utilities</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all">
                <ToolGrid category="all" searchQuery={searchQuery} />
              </TabsContent>
              <TabsContent value="formatters">
                <p className="text-center text-xs sm:text-sm text-muted-foreground mb-4">Format and beautify your code</p>
                <ToolGrid category="formatters" searchQuery={searchQuery} />
              </TabsContent>
              <TabsContent value="encoders">
                <p className="text-center text-xs sm:text-sm text-muted-foreground mb-4">Encode and decode text in various formats</p>
                <ToolGrid category="encoders" searchQuery={searchQuery} />
              </TabsContent>
              <TabsContent value="converters">
                <p className="text-center text-xs sm:text-sm text-muted-foreground mb-4">Convert between different file formats</p>
                <ToolGrid category="converters" searchQuery={searchQuery} />
              </TabsContent>
              <TabsContent value="generators">
                <p className="text-center text-xs sm:text-sm text-muted-foreground mb-4">Generate test data, placeholders, and more</p>
                <ToolGrid category="generators" searchQuery={searchQuery} />
              </TabsContent>
              <TabsContent value="utilities">
                <p className="text-center text-xs sm:text-sm text-muted-foreground mb-4">Additional helpful tools for developers</p>
                <ToolGrid category="utilities" searchQuery={searchQuery} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
