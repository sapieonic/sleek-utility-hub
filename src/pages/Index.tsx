
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { ToolGrid } from '@/components/ToolGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Binary, FileCode, Newspaper, ArrowBigDownDash } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container">
          <HeroSection onSearch={handleSearch} />
          
          <Tabs defaultValue="all" className="my-8">
            <div className="flex justify-center mb-6">
              <TabsList>
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  <span>All Tools</span>
                </TabsTrigger>
                <TabsTrigger value="formatters" className="flex items-center gap-2">
                  <FileCode className="h-4 w-4" />
                  <span>Formatters</span>
                </TabsTrigger>
                <TabsTrigger value="encoders" className="flex items-center gap-2">
                  <Binary className="h-4 w-4" />
                  <span>Encoders/Decoders</span>
                </TabsTrigger>
                <TabsTrigger value="generators" className="flex items-center gap-2">
                  <Newspaper className="h-4 w-4" />
                  <span>Generators</span>
                </TabsTrigger>
                <TabsTrigger value="converters" className="flex items-center gap-2">
                  <ArrowBigDownDash className="h-4 w-4" />
                  <span>Converters</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all">
              <ToolGrid />
            </TabsContent>
            <TabsContent value="formatters">
              <p className="text-center text-muted-foreground mb-4">Formatter tools for various file formats</p>
              <ToolGrid />
            </TabsContent>
            <TabsContent value="encoders">
              <p className="text-center text-muted-foreground mb-4">Tools for encoding and decoding text</p>
              <ToolGrid />
            </TabsContent>
            <TabsContent value="generators">
              <p className="text-center text-muted-foreground mb-4">Generate random data and more</p>
              <ToolGrid />
            </TabsContent>
            <TabsContent value="converters">
              <p className="text-center text-muted-foreground mb-4">Convert between various formats</p>
              <ToolGrid />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
