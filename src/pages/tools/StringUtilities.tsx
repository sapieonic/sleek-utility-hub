import React, { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, Copy, Check, Pilcrow, Type, Hash, Replace, Trash2, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const StringUtilities = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [removeText, setRemoveText] = useState('');
  const { toast } = useToast();

  // Statistics
  const stats = useMemo(() => {
    const text = input;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split('\n').length : 0;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).length;

    return { chars, charsNoSpaces, words, lines, sentences, paragraphs };
  }, [input]);

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      toast({ title: "Copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const applyToOutput = (result: string, action: string) => {
    setOutput(result);
    toast({ title: `${action} applied`, description: "Result shown in output area." });
  };

  // Case Conversions
  const toUpperCase = () => applyToOutput(input.toUpperCase(), "UPPERCASE");
  const toLowerCase = () => applyToOutput(input.toLowerCase(), "lowercase");
  const toTitleCase = () => {
    const result = input.replace(/\w\S*/g, txt =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
    applyToOutput(result, "Title Case");
  };
  const toSentenceCase = () => {
    const result = input.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
    applyToOutput(result, "Sentence case");
  };
  const toCamelCase = () => {
    const result = input
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
    applyToOutput(result, "camelCase");
  };
  const toSnakeCase = () => {
    const result = input
      .replace(/\s+/g, '_')
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '');
    applyToOutput(result, "snake_case");
  };
  const toKebabCase = () => {
    const result = input
      .replace(/\s+/g, '-')
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');
    applyToOutput(result, "kebab-case");
  };
  const toggleCase = () => {
    const result = input.split('').map(c =>
      c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()
    ).join('');
    applyToOutput(result, "tOGGLE cASE");
  };

  // Remove Operations
  const removeExtraSpaces = () => {
    const result = input.replace(/\s+/g, ' ').trim();
    applyToOutput(result, "Extra spaces removed");
  };
  const removeAllSpaces = () => {
    const result = input.replace(/\s/g, '');
    applyToOutput(result, "All spaces removed");
  };
  const removeLineBreaks = () => {
    const result = input.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    applyToOutput(result, "Line breaks removed");
  };
  const removeNumbers = () => {
    const result = input.replace(/[0-9]/g, '');
    applyToOutput(result, "Numbers removed");
  };
  const removeSpecialChars = () => {
    const result = input.replace(/[^a-zA-Z0-9\s]/g, '');
    applyToOutput(result, "Special characters removed");
  };
  const removeDuplicateLines = () => {
    const lines = input.split('\n');
    const unique = [...new Set(lines)];
    applyToOutput(unique.join('\n'), "Duplicate lines removed");
  };
  const removeEmptyLines = () => {
    const result = input.split('\n').filter(line => line.trim()).join('\n');
    applyToOutput(result, "Empty lines removed");
  };
  const removeCustomText = () => {
    if (!removeText) {
      toast({ variant: "destructive", title: "Enter text to remove" });
      return;
    }
    const result = input.split(removeText).join('');
    applyToOutput(result, `"${removeText}" removed`);
  };

  // Find & Replace
  const handleFindReplace = () => {
    if (!findText) {
      toast({ variant: "destructive", title: "Enter text to find" });
      return;
    }
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const result = input.replace(regex, replaceText);
    const count = (input.match(regex) || []).length;
    applyToOutput(result, `Replaced ${count} occurrence(s)`);
  };

  // Transform Operations
  const reverseText = () => applyToOutput(input.split('').reverse().join(''), "Text reversed");
  const reverseWords = () => applyToOutput(input.split(' ').reverse().join(' '), "Words reversed");
  const reverseLines = () => applyToOutput(input.split('\n').reverse().join('\n'), "Lines reversed");
  const sortLinesAsc = () => {
    const result = input.split('\n').sort((a, b) => a.localeCompare(b)).join('\n');
    applyToOutput(result, "Lines sorted A-Z");
  };
  const sortLinesDesc = () => {
    const result = input.split('\n').sort((a, b) => b.localeCompare(a)).join('\n');
    applyToOutput(result, "Lines sorted Z-A");
  };
  const shuffleLines = () => {
    const lines = input.split('\n');
    for (let i = lines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lines[i], lines[j]] = [lines[j], lines[i]];
    }
    applyToOutput(lines.join('\n'), "Lines shuffled");
  };
  const trimLines = () => {
    const result = input.split('\n').map(line => line.trim()).join('\n');
    applyToOutput(result, "Lines trimmed");
  };
  const addLineNumbers = () => {
    const result = input.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n');
    applyToOutput(result, "Line numbers added");
  };
  const addPrefix = () => {
    const prefix = prompt("Enter prefix:");
    if (prefix !== null) {
      const result = input.split('\n').map(line => prefix + line).join('\n');
      applyToOutput(result, "Prefix added");
    }
  };
  const addSuffix = () => {
    const suffix = prompt("Enter suffix:");
    if (suffix !== null) {
      const result = input.split('\n').map(line => line + suffix).join('\n');
      applyToOutput(result, "Suffix added");
    }
  };

  // Extract Operations
  const extractEmails = () => {
    const emails = input.match(/[\w.-]+@[\w.-]+\.\w+/g) || [];
    applyToOutput(emails.join('\n'), `Found ${emails.length} email(s)`);
  };
  const extractUrls = () => {
    const urls = input.match(/https?:\/\/[^\s]+/g) || [];
    applyToOutput(urls.join('\n'), `Found ${urls.length} URL(s)`);
  };
  const extractNumbers = () => {
    const numbers = input.match(/-?\d+\.?\d*/g) || [];
    applyToOutput(numbers.join('\n'), `Found ${numbers.length} number(s)`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <a href="/" className="text-primary hover:underline flex items-center gap-1 text-sm mb-4">
            <ArrowLeftRight className="h-4 w-4" />
            Back to all tools
          </a>
          <h1 className="text-3xl font-bold mb-2">String Utilities</h1>
          <p className="text-muted-foreground">Powerful text manipulation tools for developers.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Input/Output Section */}
          <div className="xl:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Pilcrow className="h-5 w-5" />
                  Input Text
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[200px] font-mono text-sm"
                  placeholder="Enter or paste your text here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                {/* Stats */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary">{stats.chars} chars</Badge>
                  <Badge variant="secondary">{stats.charsNoSpaces} chars (no spaces)</Badge>
                  <Badge variant="secondary">{stats.words} words</Badge>
                  <Badge variant="secondary">{stats.lines} lines</Badge>
                  <Badge variant="secondary">{stats.sentences} sentences</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    Output
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={handleCopy} disabled={!output}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span className="ml-1">{copied ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[200px] font-mono text-sm"
                  placeholder="Transformed text will appear here..."
                  value={output}
                  readOnly
                />
              </CardContent>
            </Card>
          </div>

          {/* Operations Section */}
          <div className="space-y-4">
            <Tabs defaultValue="case" className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="case" className="text-xs px-2">Case</TabsTrigger>
                <TabsTrigger value="remove" className="text-xs px-2">Remove</TabsTrigger>
                <TabsTrigger value="transform" className="text-xs px-2">Transform</TabsTrigger>
                <TabsTrigger value="extract" className="text-xs px-2">Extract</TabsTrigger>
              </TabsList>

              <TabsContent value="case" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Case Conversion
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={toUpperCase}>UPPERCASE</Button>
                    <Button variant="outline" size="sm" onClick={toLowerCase}>lowercase</Button>
                    <Button variant="outline" size="sm" onClick={toTitleCase}>Title Case</Button>
                    <Button variant="outline" size="sm" onClick={toSentenceCase}>Sentence case</Button>
                    <Button variant="outline" size="sm" onClick={toCamelCase}>camelCase</Button>
                    <Button variant="outline" size="sm" onClick={toSnakeCase}>snake_case</Button>
                    <Button variant="outline" size="sm" onClick={toKebabCase}>kebab-case</Button>
                    <Button variant="outline" size="sm" onClick={toggleCase}>tOGGLE</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="remove" className="mt-4 space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={removeExtraSpaces}>Extra Spaces</Button>
                      <Button variant="outline" size="sm" onClick={removeAllSpaces}>All Spaces</Button>
                      <Button variant="outline" size="sm" onClick={removeLineBreaks}>Line Breaks</Button>
                      <Button variant="outline" size="sm" onClick={removeNumbers}>Numbers</Button>
                      <Button variant="outline" size="sm" onClick={removeSpecialChars}>Special Chars</Button>
                      <Button variant="outline" size="sm" onClick={removeDuplicateLines}>Duplicate Lines</Button>
                      <Button variant="outline" size="sm" onClick={removeEmptyLines} className="col-span-2">Empty Lines</Button>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Custom text to remove"
                        value={removeText}
                        onChange={(e) => setRemoveText(e.target.value)}
                        className="text-sm"
                      />
                      <Button variant="outline" size="sm" onClick={removeCustomText}>Remove</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Replace className="h-4 w-4" />
                      Find & Replace
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Input
                      placeholder="Find text..."
                      value={findText}
                      onChange={(e) => setFindText(e.target.value)}
                      className="text-sm"
                    />
                    <Input
                      placeholder="Replace with..."
                      value={replaceText}
                      onChange={(e) => setReplaceText(e.target.value)}
                      className="text-sm"
                    />
                    <Button variant="outline" className="w-full" onClick={handleFindReplace}>
                      Replace All
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transform" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      Transform
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={reverseText}>Reverse Text</Button>
                    <Button variant="outline" size="sm" onClick={reverseWords}>Reverse Words</Button>
                    <Button variant="outline" size="sm" onClick={reverseLines}>Reverse Lines</Button>
                    <Button variant="outline" size="sm" onClick={shuffleLines}>Shuffle Lines</Button>
                    <Button variant="outline" size="sm" onClick={sortLinesAsc}>Sort A-Z</Button>
                    <Button variant="outline" size="sm" onClick={sortLinesDesc}>Sort Z-A</Button>
                    <Button variant="outline" size="sm" onClick={trimLines}>Trim Lines</Button>
                    <Button variant="outline" size="sm" onClick={addLineNumbers}>Add Line #</Button>
                    <Button variant="outline" size="sm" onClick={addPrefix}>Add Prefix</Button>
                    <Button variant="outline" size="sm" onClick={addSuffix}>Add Suffix</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="extract" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Extract
                    </CardTitle>
                    <CardDescription className="text-xs">Extract specific content from text</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-2">
                    <Button variant="outline" size="sm" onClick={extractEmails}>
                      Extract Emails
                    </Button>
                    <Button variant="outline" size="sm" onClick={extractUrls}>
                      Extract URLs
                    </Button>
                    <Button variant="outline" size="sm" onClick={extractNumbers}>
                      Extract Numbers
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StringUtilities;
