
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { ToolGrid } from '@/components/ToolGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Binary, FileCode, Newspaper, ArrowBigDownDash } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<"all" | "formatters" | "encoders" | "generators" | "converters">("all");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container px-4 sm:px-6">
          <HeroSection onSearch={handleSearch} />
          
          <Tabs defaultValue="all" className="my-6 sm:my-8" onValueChange={(value) => setActiveCategory(value as any)}>
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
                <TabsTrigger value="generators" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 px-2 sm:px-3">
                  <Newspaper className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Generators</span>
                </TabsTrigger>
                <TabsTrigger value="converters" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 px-2 sm:px-3">
                  <ArrowBigDownDash className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Converters</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all">
              <ToolGrid category="all" searchQuery={searchQuery} />
            </TabsContent>
            <TabsContent value="formatters">
              <p className="text-center text-xs sm:text-sm text-muted-foreground mb-4">Formatter tools for various file formats</p>
              <ToolGrid category="formatters" searchQuery={searchQuery} />
            </TabsContent>
            <TabsContent value="encoders">
              <p className="text-center text-xs sm:text-sm text-muted-foreground mb-4">Tools for encoding and decoding text</p>
              <ToolGrid category="encoders" searchQuery={searchQuery} />
            </TabsContent>
            <TabsContent value="generators">
              <p className="text-center text-xs sm:text-sm text-muted-foreground mb-4">Generate random data and more</p>
              <ToolGrid category="generators" searchQuery={searchQuery} />
            </TabsContent>
            <TabsContent value="converters">
              <p className="text-center text-xs sm:text-sm text-muted-foreground mb-4">Convert between various formats</p>
              <ToolGrid category="converters" searchQuery={searchQuery} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
