import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeftRight, Copy, Check, Download, FileEdit, Eye, Code, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MDEditor from '@uiw/react-md-editor';

const MarkdownEditor = () => {
  const [markdown, setMarkdown] = useState<string>(`# Welcome to Markdown Editor

This is a **full-featured** Markdown editor with live preview.

## Features

- **Bold** and *italic* text
- ~~Strikethrough~~ text
- [Links](https://example.com)
- Inline \`code\` and code blocks

## Code Block Example

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\`

## Lists

### Unordered List
- Item 1
- Item 2
  - Nested item
- Item 3

### Ordered List
1. First item
2. Second item
3. Third item

## Blockquote

> This is a blockquote.
> It can span multiple lines.

## Table

| Feature | Status |
|---------|--------|
| Bold | Supported |
| Italic | Supported |
| Tables | Supported |
| Images | Supported |

## Task List

- [x] Create markdown editor
- [x] Add live preview
- [ ] Share with the world

---

*Start editing to see the magic happen!*
`);

  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Markdown content has been copied.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: 'md' | 'html') => {
    let content = markdown;
    let filename = 'document.md';
    let mimeType = 'text/markdown';

    if (format === 'html') {
      // Basic HTML wrapper
      content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    pre { background: #f4f4f4; padding: 16px; border-radius: 8px; overflow-x: auto; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 16px; color: #666; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f4f4f4; }
    img { max-width: 100%; }
  </style>
</head>
<body>
${markdown}
</body>
</html>`;
      filename = 'document.html';
      mimeType = 'text/html';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: `Document saved as ${filename}`,
    });
  };

  const handleClear = () => {
    setMarkdown('');
    toast({
      title: "Cleared",
      description: "Editor content has been cleared.",
    });
  };

  const insertTemplate = (template: string) => {
    setMarkdown(prev => prev + '\n' + template);
    toast({
      title: "Template inserted",
      description: "Template has been added to the editor.",
    });
  };

  const templates = {
    table: `
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
`,
    codeBlock: `
\`\`\`language
// Your code here
\`\`\`
`,
    taskList: `
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3
`,
    link: `[Link text](https://example.com)`,
    image: `![Alt text](https://via.placeholder.com/300x200)`,
  };

  return (
    <div className="flex flex-col min-h-screen" data-color-mode="auto">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <a href="/" className="text-primary hover:underline flex items-center gap-1 text-sm mb-4">
            <ArrowLeftRight className="h-4 w-4" />
            Back to all tools
          </a>
          <h1 className="text-3xl font-bold mb-2">Markdown Editor</h1>
          <p className="text-muted-foreground">Write and preview Markdown with GitHub Flavored Markdown (GFM) support.</p>
        </div>

        {/* Toolbar */}
        <Card className="mb-4">
          <CardContent className="py-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === 'edit' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('edit')}
                  className="h-8"
                >
                  <Code className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant={viewMode === 'split' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('split')}
                  className="h-8"
                >
                  <FileEdit className="h-4 w-4 mr-1" />
                  Split
                </Button>
                <Button
                  variant={viewMode === 'preview' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('preview')}
                  className="h-8"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </div>

              {/* Quick Insert */}
              <div className="hidden sm:flex items-center gap-1">
                <span className="text-sm text-muted-foreground mr-1">Insert:</span>
                <Button variant="outline" size="sm" onClick={() => insertTemplate(templates.table)}>
                  Table
                </Button>
                <Button variant="outline" size="sm" onClick={() => insertTemplate(templates.codeBlock)}>
                  Code
                </Button>
                <Button variant="outline" size="sm" onClick={() => insertTemplate(templates.taskList)}>
                  Tasks
                </Button>
                <Button variant="outline" size="sm" onClick={() => insertTemplate(templates.link)}>
                  Link
                </Button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="ml-1 hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload('md')}>
                  <Download className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">.md</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload('html')}>
                  <FileText className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">.html</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editor */}
        <Card>
          <CardContent className="p-0 overflow-hidden rounded-lg">
            <div data-color-mode="light" className="dark:hidden">
              <MDEditor
                value={markdown}
                onChange={(val) => setMarkdown(val || '')}
                preview={viewMode === 'split' ? 'live' : viewMode === 'preview' ? 'preview' : 'edit'}
                height={500}
                visibleDragbar={false}
                hideToolbar={true}
              />
            </div>
            <div data-color-mode="dark" className="hidden dark:block">
              <MDEditor
                value={markdown}
                onChange={(val) => setMarkdown(val || '')}
                preview={viewMode === 'split' ? 'live' : viewMode === 'preview' ? 'preview' : 'edit'}
                height={500}
                visibleDragbar={false}
                hideToolbar={true}
              />
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Markdown Quick Reference</CardTitle>
            <CardDescription>Common Markdown syntax for quick reference</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Text Formatting</h4>
                <ul className="space-y-1 text-muted-foreground font-mono text-xs">
                  <li>**bold**</li>
                  <li>*italic*</li>
                  <li>~~strikethrough~~</li>
                  <li>`inline code`</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Headings</h4>
                <ul className="space-y-1 text-muted-foreground font-mono text-xs">
                  <li># Heading 1</li>
                  <li>## Heading 2</li>
                  <li>### Heading 3</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Lists</h4>
                <ul className="space-y-1 text-muted-foreground font-mono text-xs">
                  <li>- Unordered item</li>
                  <li>1. Ordered item</li>
                  <li>- [ ] Task item</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Links & Images</h4>
                <ul className="space-y-1 text-muted-foreground font-mono text-xs">
                  <li>[text](url)</li>
                  <li>![alt](image-url)</li>
                  <li>&gt; Blockquote</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default MarkdownEditor;
