
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Copy, Check, FileType } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from 'react-router-dom';

const JsFormatter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleFormat = () => {
    try {
      // Parse the JavaScript code
      const parsed = eval(`(${input})`);
      
      // Format with proper indentation
      const formatted = JSON.stringify(parsed, null, 2);
      
      setOutput(formatted);
      toast({
        title: "JavaScript formatted successfully",
        description: "Your JavaScript has been formatted with proper indentation.",
      });
    } catch (error) {
      try {
        // Try as just a JSON string if it's not valid JS
        const parsed = JSON.parse(input);
        const formatted = JSON.stringify(parsed, null, 2);
        setOutput(formatted);
        toast({
          title: "JavaScript formatted successfully",
          description: "Your code was parsed as JSON and formatted with proper indentation.",
        });
      } catch {
        // If both attempts fail, show error
        if (error instanceof Error) {
          setOutput(`Error: ${error.message}`);
          toast({
            variant: "destructive",
            title: "Invalid JavaScript",
            description: error.message,
          });
        }
      }
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "The formatted code has been copied to your clipboard.",
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
          <h1 className="text-3xl font-bold mb-2">JavaScript Formatter</h1>
          <p className="text-muted-foreground">Format and beautify your JavaScript code with proper indentation.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileType className="h-5 w-5" />
                Input JavaScript
              </CardTitle>
              <CardDescription>
                Paste your unformatted JavaScript here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                className="min-h-[300px] font-mono"
                placeholder='{"key":"value"}'
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="flex justify-end mt-4">
                <Button onClick={handleFormat}>Format JavaScript</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileType className="h-5 w-5" />
                Formatted Output
              </CardTitle>
              <CardDescription>
                Your beautified JavaScript will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                className="min-h-[300px] font-mono"
                value={output}
                readOnly
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

export default JsFormatter;
