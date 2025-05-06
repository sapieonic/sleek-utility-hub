
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Copy, Check, FileCog } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from 'react-router-dom';

const UTF8Decode = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleDecode = () => {
    try {
      // Replace \\u with \u to ensure it's properly evaluated
      const cleanedInput = input.replace(/\\u/g, '\\u');
      
      // Evaluate the string with escape sequences
      const decoded = JSON.parse(`"${cleanedInput}"`);
      
      setOutput(decoded);
      toast({
        title: "Text decoded successfully",
        description: "Your UTF8 encoded string has been decoded.",
      });
    } catch (error) {
      if (error instanceof Error) {
        setOutput(`Error: ${error.message}`);
        toast({
          variant: "destructive",
          title: "Decoding Error",
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
        description: "The decoded text has been copied to your clipboard.",
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
          <h1 className="text-3xl font-bold mb-2">UTF8 Decode</h1>
          <p className="text-muted-foreground">Convert UTF8 escape sequences to plain text.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCog className="h-5 w-5" />
                Input UTF8 Encoded
              </CardTitle>
              <CardDescription>
                Paste your UTF8 escape sequences to decode
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                className="min-h-[300px] font-mono"
                placeholder='Enter UTF8 sequences like \u0048\u0065\u006c\u006c\u006f'
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="flex justify-end mt-4">
                <Button onClick={handleDecode}>Decode from UTF8</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCog className="h-5 w-5" />
                Decoded Output
              </CardTitle>
              <CardDescription>
                Your decoded text will appear here
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

export default UTF8Decode;
