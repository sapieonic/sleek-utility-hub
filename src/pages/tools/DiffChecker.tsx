import React, { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, FileCode, GitCompare, Plus, Minus, Equal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as Diff from 'diff';

interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

const DiffChecker = () => {
  const [originalText, setOriginalText] = useState('');
  const [modifiedText, setModifiedText] = useState('');
  const [diffMode, setDiffMode] = useState<'chars' | 'words' | 'lines'>('lines');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const { toast } = useToast();

  const diffResult = useMemo(() => {
    if (!originalText && !modifiedText) return [];

    let text1 = originalText;
    let text2 = modifiedText;

    if (ignoreCase) {
      text1 = text1.toLowerCase();
      text2 = text2.toLowerCase();
    }

    const options = { ignoreWhitespace };

    switch (diffMode) {
      case 'chars':
        return Diff.diffChars(text1, text2, options);
      case 'words':
        return Diff.diffWords(text1, text2, options);
      case 'lines':
      default:
        return Diff.diffLines(text1, text2, options);
    }
  }, [originalText, modifiedText, diffMode, ignoreWhitespace, ignoreCase]);

  const stats = useMemo(() => {
    let additions = 0;
    let deletions = 0;
    let unchanged = 0;

    diffResult.forEach((part: DiffPart) => {
      const count = diffMode === 'lines'
        ? part.value.split('\n').filter(l => l).length
        : part.value.length;

      if (part.added) additions += count;
      else if (part.removed) deletions += count;
      else unchanged += count;
    });

    return { additions, deletions, unchanged };
  }, [diffResult, diffMode]);

  const handleSwap = () => {
    const temp = originalText;
    setOriginalText(modifiedText);
    setModifiedText(temp);
    toast({
      title: "Texts swapped",
      description: "Original and modified texts have been swapped.",
    });
  };

  const handleClear = () => {
    setOriginalText('');
    setModifiedText('');
    toast({
      title: "Cleared",
      description: "Both text areas have been cleared.",
    });
  };

  const loadSample = () => {
    setOriginalText(`function greet(name) {
  console.log("Hello, " + name);
  return true;
}

const users = ["Alice", "Bob"];
users.forEach(greet);`);

    setModifiedText(`function greet(name, greeting = "Hello") {
  console.log(greeting + ", " + name + "!");
  return true;
}

const users = ["Alice", "Bob", "Charlie"];
users.forEach(user => greet(user));`);

    toast({
      title: "Sample loaded",
      description: "Sample code has been loaded for comparison.",
    });
  };

  const renderDiff = () => {
    if (diffResult.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-12">
          Enter text in both fields to see the differences
        </div>
      );
    }

    const allSame = diffResult.every((part: DiffPart) => !part.added && !part.removed);
    if (allSame) {
      return (
        <div className="text-center py-12">
          <Equal className="h-12 w-12 mx-auto text-green-500 mb-4" />
          <p className="text-green-600 dark:text-green-400 font-medium">No differences found!</p>
          <p className="text-muted-foreground text-sm mt-1">Both texts are identical.</p>
        </div>
      );
    }

    return (
      <div className="font-mono text-sm whitespace-pre-wrap break-all">
        {diffResult.map((part: DiffPart, index: number) => {
          let className = '';
          let icon = null;

          if (part.added) {
            className = 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
            icon = <Plus className="inline h-3 w-3 mr-1" />;
          } else if (part.removed) {
            className = 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 line-through';
            icon = <Minus className="inline h-3 w-3 mr-1" />;
          }

          if (diffMode === 'lines') {
            return (
              <div key={index} className={`${className} px-2 py-0.5 border-l-4 ${part.added ? 'border-green-500' : part.removed ? 'border-red-500' : 'border-transparent'}`}>
                {part.value}
              </div>
            );
          }

          return (
            <span key={index} className={`${className} ${className ? 'px-0.5 rounded' : ''}`}>
              {part.value}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <a href="/" className="text-primary hover:underline flex items-center gap-1 text-sm mb-4">
            <ArrowLeftRight className="h-4 w-4" />
            Back to all tools
          </a>
          <h1 className="text-3xl font-bold mb-2">Diff Checker</h1>
          <p className="text-muted-foreground">Compare two texts and highlight the differences between them.</p>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Compare by:</Label>
                <div className="flex gap-1">
                  {(['lines', 'words', 'chars'] as const).map((mode) => (
                    <Button
                      key={mode}
                      variant={diffMode === mode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDiffMode(mode)}
                      className="capitalize"
                    >
                      {mode}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="ignore-whitespace"
                  checked={ignoreWhitespace}
                  onCheckedChange={setIgnoreWhitespace}
                />
                <Label htmlFor="ignore-whitespace" className="text-sm cursor-pointer">
                  Ignore whitespace
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="ignore-case"
                  checked={ignoreCase}
                  onCheckedChange={setIgnoreCase}
                />
                <Label htmlFor="ignore-case" className="text-sm cursor-pointer">
                  Ignore case
                </Label>
              </div>

              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={loadSample}>
                  Load Sample
                </Button>
                <Button variant="outline" size="sm" onClick={handleSwap}>
                  Swap
                </Button>
                <Button variant="outline" size="sm" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileCode className="h-5 w-5" />
                Original Text
              </CardTitle>
              <CardDescription>Paste the original content here</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-[250px] font-mono text-sm"
                placeholder="Enter original text..."
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileCode className="h-5 w-5" />
                Modified Text
              </CardTitle>
              <CardDescription>Paste the modified content here</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-[250px] font-mono text-sm"
                placeholder="Enter modified text..."
                value={modifiedText}
                onChange={(e) => setModifiedText(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="h-5 w-5" />
                Differences
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                  <Plus className="h-3 w-3 mr-1" />
                  {stats.additions} added
                </Badge>
                <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
                  <Minus className="h-3 w-3 mr-1" />
                  {stats.deletions} removed
                </Badge>
                <Badge variant="outline">
                  {stats.unchanged} unchanged
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-muted/30 max-h-[500px] overflow-auto">
              {renderDiff()}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default DiffChecker;
