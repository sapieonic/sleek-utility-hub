import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeftRight, FileText, Eye, FileDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import html2pdf from 'html2pdf.js';

const MarkdownToPdf = () => {
  const [input, setInput] = useState(`# Project Report

## Introduction

This document demonstrates the **Markdown to PDF** conversion feature. You can write your content in Markdown and export it as a professionally formatted PDF.

## Features

- Full Markdown support
- GitHub Flavored Markdown (GFM)
- Tables and code blocks
- Multiple page sizes
- Custom margins

## Code Example

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

## Data Table

| Feature | Status | Priority |
|---------|--------|----------|
| Markdown parsing | Complete | High |
| PDF generation | Complete | High |
| Custom styling | Complete | Medium |

## Blockquote

> "The best way to predict the future is to create it."
> — Peter Drucker

## Conclusion

This converter makes it easy to create professional PDF documents from simple Markdown text. All processing happens in your browser.

---

*Generated with Sleek Utility Hub*
`);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pageSize, setPageSize] = useState('a4');
  const [orientation, setOrientation] = useState('portrait');
  const [margin, setMargin] = useState('15');
  const { toast } = useToast();

  const handleGeneratePdf = async () => {
    if (!input.trim()) {
      toast({
        variant: "destructive",
        title: "Input required",
        description: "Please enter some Markdown to convert.",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Get the preview element and clone it for PDF generation
      const previewElement = document.getElementById('markdown-preview-content');
      if (!previewElement) {
        throw new Error('Preview element not found');
      }

      const container = document.createElement('div');
      container.innerHTML = `
        <div style="
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          padding: 20px;
        ">
          ${previewElement.innerHTML}
        </div>
      `;
      document.body.appendChild(container);

      const marginValue = parseInt(margin);

      const options = {
        margin: marginValue,
        filename: 'markdown-document.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: {
          unit: 'mm',
          format: pageSize,
          orientation: orientation as 'portrait' | 'landscape'
        }
      };

      await html2pdf().set(options).from(container).save();

      document.body.removeChild(container);

      toast({
        title: "PDF generated",
        description: "Your PDF has been downloaded.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate PDF",
      });
    } finally {
      setIsGenerating(false);
    }
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
          <h1 className="text-3xl font-bold mb-2">Markdown to PDF Converter</h1>
          <p className="text-muted-foreground">Convert Markdown to a professionally styled PDF document.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Markdown Input
                </CardTitle>
                <CardDescription>Write or paste your Markdown content</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[350px] font-mono text-sm"
                  placeholder="# Enter Markdown here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* PDF Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">PDF Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Page Size</Label>
                    <Select value={pageSize} onValueChange={setPageSize}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a4">A4</SelectItem>
                        <SelectItem value="letter">Letter</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="a3">A3</SelectItem>
                        <SelectItem value="a5">A5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Orientation</Label>
                    <Select value={orientation} onValueChange={setOrientation}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Margin</Label>
                  <Select value={margin} onValueChange={setMargin}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Small (5mm)</SelectItem>
                      <SelectItem value="10">Medium (10mm)</SelectItem>
                      <SelectItem value="15">Large (15mm)</SelectItem>
                      <SelectItem value="20">Extra Large (20mm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  onClick={handleGeneratePdf}
                  disabled={isGenerating || !input.trim()}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <FileDown className="h-4 w-4 mr-2" />
                      Generate & Download PDF
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live Preview
              </CardTitle>
              <CardDescription>Preview how your PDF will look</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="min-h-[500px] border rounded-lg p-6 bg-white dark:bg-gray-950 overflow-auto"
                style={{ maxHeight: '600px' }}
              >
                <div id="markdown-preview-content" className="prose prose-sm sm:prose dark:prose-invert max-w-none prose-headings:font-semibold prose-h1:text-2xl prose-h1:border-b prose-h1:pb-2 prose-h2:text-xl prose-h2:border-b prose-h2:pb-2 prose-pre:bg-gray-100 prose-pre:dark:bg-gray-800 prose-code:text-sm prose-code:bg-gray-100 prose-code:dark:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:dark:bg-blue-950 prose-table:border prose-th:bg-gray-50 prose-th:dark:bg-gray-800">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {input}
                  </ReactMarkdown>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MarkdownToPdf;
