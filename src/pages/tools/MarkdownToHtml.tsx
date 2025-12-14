import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeftRight, Copy, Check, FileText, Code, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { marked } from 'marked';

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
});

const MarkdownToHtml = () => {
  const [input, setInput] = useState(`# Welcome to Markdown to HTML

This converter transforms **Markdown** into clean HTML.

## Features

- Fast conversion
- GFM support (GitHub Flavored Markdown)
- Code syntax highlighting ready
- Live preview

## Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Table Example

| Name | Role |
|------|------|
| Alice | Developer |
| Bob | Designer |

> This is a blockquote

Visit [Example](https://example.com) for more info.
`);
  const [copied, setCopied] = useState(false);
  const [includeWrapper, setIncludeWrapper] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [htmlOutput, setHtmlOutput] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const { toast } = useToast();

  // Update HTML output when input or wrapper option changes
  useEffect(() => {
    const convertMarkdown = async () => {
      try {
        const converted = await marked.parse(input);
        setPreviewHtml(converted);

        if (includeWrapper) {
          setHtmlOutput(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Document</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; }
    h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; }
    code { background: #f6f8fa; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 16px; color: #666; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #f6f8fa; font-weight: 600; }
    a { color: #0366d6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    img { max-width: 100%; }
    ul, ol { padding-left: 2em; }
    hr { border: none; border-top: 1px solid #eee; margin: 24px 0; }
  </style>
</head>
<body>
${converted}
</body>
</html>`);
        } else {
          setHtmlOutput(converted);
        }
      } catch (error) {
        setHtmlOutput(`Error: ${error instanceof Error ? error.message : 'Conversion failed'}`);
        setPreviewHtml('<p>Error rendering preview</p>');
      }
    };
    convertMarkdown();
  }, [input, includeWrapper]);

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlOutput);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "HTML has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([htmlOutput], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "HTML file has been downloaded.",
    });
  };

  const handleClear = () => {
    setInput('');
    toast({ title: "Cleared" });
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
          <h1 className="text-3xl font-bold mb-2">Markdown to HTML Converter</h1>
          <p className="text-muted-foreground">Convert Markdown to clean, styled HTML with GFM support.</p>
        </div>

        {/* Options */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="include-wrapper"
                  checked={includeWrapper}
                  onCheckedChange={setIncludeWrapper}
                />
                <Label htmlFor="include-wrapper" className="cursor-pointer">
                  Include full HTML document with styles
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="show-preview"
                  checked={showPreview}
                  onCheckedChange={setShowPreview}
                />
                <Label htmlFor="show-preview" className="cursor-pointer">
                  Show live preview
                </Label>
              </div>
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Markdown Input
              </CardTitle>
              <CardDescription>Enter your Markdown content</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-[400px] font-mono text-sm"
                placeholder="# Enter Markdown here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {showPreview ? <Eye className="h-5 w-5" /> : <Code className="h-5 w-5" />}
                    {showPreview ? 'Preview' : 'HTML Output'}
                  </CardTitle>
                  <CardDescription>
                    {showPreview ? 'Live rendered preview' : 'Generated HTML code'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span className="ml-1">{copied ? 'Copied' : 'Copy'}</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                    <span className="ml-1">.html</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {showPreview ? (
                <div
                  className="min-h-[400px] border rounded-lg p-4 bg-white dark:bg-gray-950 overflow-auto prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <Textarea
                  className="min-h-[400px] font-mono text-sm"
                  value={htmlOutput}
                  readOnly
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MarkdownToHtml;
