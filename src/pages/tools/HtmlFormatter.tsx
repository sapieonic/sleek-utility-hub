
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Copy, Check, FileStack } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';

const HtmlFormatter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleFormat = () => {
    try {
      // Format HTML by parsing it and pretty printing
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, 'text/html');
      
      // Create a formatted output
      const formatNode = (node: Node, level: number = 0): string => {
        const indent = '  '.repeat(level);
        
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim();
          if (text && text.length > 0) {
            return `${indent}${text}\n`;
          }
          return '';
        }
        
        if (node.nodeType === Node.COMMENT_NODE) {
          return `${indent}<!-- ${node.nodeValue} -->\n`;
        }
        
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const tagName = element.tagName.toLowerCase();
          
          // Handle self-closing tags
          if (element.children.length === 0 && !element.textContent?.trim()) {
            const attrs = formatAttributes(element);
            return `${indent}<${tagName}${attrs}>\n`;
          }
          
          // Opening tag
          const attrs = formatAttributes(element);
          let result = `${indent}<${tagName}${attrs}>\n`;
          
          // Children
          for (let i = 0; i < element.childNodes.length; i++) {
            result += formatNode(element.childNodes[i], level + 1);
          }
          
          // Closing tag
          result += `${indent}</${tagName}>\n`;
          return result;
        }
        
        return '';
      };
      
      const formatAttributes = (element: Element): string => {
        let result = '';
        const attributes = element.attributes;
        for (let i = 0; i < attributes.length; i++) {
          const attr = attributes[i];
          result += ` ${attr.name}="${attr.value}"`;
        }
        return result;
      };
      
      let formatted = formatNode(doc.documentElement);
      
      // Clean up the output
      formatted = formatted.replace(/\n\s*\n/g, '\n');
      
      setOutput(formatted);
      toast({
        title: "HTML formatted successfully",
        description: "Your HTML has been formatted with proper indentation.",
      });
    } catch (error) {
      if (error instanceof Error) {
        setOutput(`Error: ${error.message}`);
        toast({
          variant: "destructive",
          title: "Invalid HTML",
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
        description: "The formatted HTML has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <Link to="/" className="text-primary hover:underline flex items-center gap-1 text-sm mb-4">
            <ArrowLeftRight className="h-4 w-4" />
            Back to all tools
          </Link>
          <h1 className="text-3xl font-bold mb-2">HTML Formatter</h1>
          <p className="text-muted-foreground">Format and beautify your HTML code with proper indentation.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileStack className="h-5 w-5" />
                Input HTML
              </CardTitle>
              <CardDescription>
                Paste your unformatted HTML here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeMirror
                value={input}
                height="300px"
                extensions={[html()]}
                onChange={(value) => setInput(value)}
                className="border rounded-md"
              />
              <div className="flex justify-end mt-4">
                <Button onClick={handleFormat}>Format HTML</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileStack className="h-5 w-5" />
                Formatted Output
              </CardTitle>
              <CardDescription>
                Your beautified HTML will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeMirror
                value={output}
                height="300px"
                extensions={[html()]}
                editable={false}
                className="border rounded-md"
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
      </main>
      <Footer />
    </div>
  );
};

export default HtmlFormatter;
