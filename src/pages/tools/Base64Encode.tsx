
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Copy, Check, FileCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from 'react-router-dom';

const Base64Encode = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleEncode = () => {
    try {
      const encoded = btoa(input);
      setOutput(encoded);
      toast({
        title: "Text encoded successfully",
        description: "Your text has been encoded to Base64.",
      });
    } catch (error) {
      if (error instanceof Error) {
        setOutput(`Error: ${error.message}`);
        toast({
          variant: "destructive",
          title: "Encoding Error",
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
        description: "The encoded text has been copied to your clipboard.",
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
          <h1 className="text-3xl font-bold mb-2">BASE64 Encode</h1>
          <p className="text-muted-foreground">Convert plain text to Base64 encoded string.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                Input Text
              </CardTitle>
              <CardDescription>
                Paste your text to encode to Base64
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                className="min-h-[300px] font-mono"
                placeholder='Enter plain text to encode'
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="flex justify-end mt-4">
                <Button onClick={handleEncode}>Encode to Base64</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                Encoded Output
              </CardTitle>
              <CardDescription>
                Your Base64 encoded output will appear here
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

export default Base64Encode;
