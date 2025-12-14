import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Copy, Check, FileCode, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TurndownService from 'turndown';

const HtmlToMarkdown = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleConvert = () => {
    if (!input.trim()) {
      toast({
        variant: "destructive",
        title: "Input required",
        description: "Please enter some HTML to convert.",
      });
      return;
    }

    try {
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        hr: '---',
        bulletListMarker: '-',
        codeBlockStyle: 'fenced',
        emDelimiter: '_',
        strongDelimiter: '**',
        linkStyle: 'inlined',
      });

      // Add rules for better conversion
      turndownService.addRule('strikethrough', {
        filter: ['del', 's', 'strike'],
        replacement: function (content) {
          return '~~' + content + '~~';
        }
      });

      const markdown = turndownService.turndown(input);
      setOutput(markdown);
      toast({
        title: "Conversion successful",
        description: "Your HTML has been converted to Markdown.",
      });
    } catch (error) {
      if (error instanceof Error) {
        setOutput(`Error: ${error.message}`);
        toast({
          variant: "destructive",
          title: "Conversion failed",
          description: error.message,
        });
      }
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "The Markdown has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sampleHtml = `<h1>Welcome to My Page</h1>
<p>This is a <strong>bold</strong> and <em>italic</em> text example.</p>
<h2>Features</h2>
<ul>
  <li>Easy to use</li>
  <li>Fast conversion</li>
  <li>Supports many HTML elements</li>
</ul>
<h2>Code Example</h2>
<pre><code>const greeting = "Hello, World!";</code></pre>
<p>Visit <a href="https://example.com">our website</a> for more info.</p>
<blockquote>This is a blockquote</blockquote>`;

  const handleLoadSample = () => {
    setInput(sampleHtml);
    toast({
      title: "Sample loaded",
      description: "Sample HTML has been loaded into the input.",
    });
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
          <h1 className="text-3xl font-bold mb-2">HTML to Markdown Converter</h1>
          <p className="text-muted-foreground">Convert HTML markup to clean, readable Markdown format.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                Input HTML
              </CardTitle>
              <CardDescription>
                Paste your HTML code here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-[300px] font-mono text-sm"
                placeholder="<h1>Hello World</h1>
<p>Enter your HTML here...</p>"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={handleLoadSample}>
                  Load Sample
                </Button>
                <Button onClick={handleConvert}>Convert to Markdown</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Markdown Output
              </CardTitle>
              <CardDescription>
                Your converted Markdown will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-[300px] font-mono text-sm"
                value={output}
                readOnly
                placeholder="# Markdown output will appear here..."
              />
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className="flex items-center gap-1"
                  disabled={!output}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Supported HTML Elements</CardTitle>
            <CardDescription>
              This converter supports the following HTML elements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Headings</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>&lt;h1&gt; - &lt;h6&gt;</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Text Formatting</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>&lt;strong&gt;, &lt;b&gt;</li>
                  <li>&lt;em&gt;, &lt;i&gt;</li>
                  <li>&lt;del&gt;, &lt;s&gt;</li>
                  <li>&lt;code&gt;</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Lists</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>&lt;ul&gt;, &lt;ol&gt;</li>
                  <li>&lt;li&gt;</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Other Elements</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>&lt;a&gt; (links)</li>
                  <li>&lt;img&gt; (images)</li>
                  <li>&lt;blockquote&gt;</li>
                  <li>&lt;pre&gt;, &lt;code&gt;</li>
                  <li>&lt;hr&gt;</li>
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

export default HtmlToMarkdown;
