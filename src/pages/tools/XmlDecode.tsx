
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Copy, Check, Presentation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from 'react-router-dom';

const XmlDecode = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleDecode = () => {
    try {
      // Simple XML to JSON conversion
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(input, "text/xml");
      
      // Convert XML to a JSON object
      const convertXmlToJson = (xml: Element): any => {
        // If it's an element with no children, return text content
        if (xml.children.length === 0) {
          return xml.textContent;
        }
        
        // Initialize result object
        const result: Record<string, any> = {};
        
        // Iterate through child elements
        Array.from(xml.children).forEach(child => {
          const name = child.nodeName;
          
          // If we already have this property
          if (result[name]) {
            // Convert to array if not already
            if (!Array.isArray(result[name])) {
              result[name] = [result[name]];
            }
            // Add new value
            result[name].push(convertXmlToJson(child));
          } else {
            // First occurrence of this property
            result[name] = convertXmlToJson(child);
          }
        });
        
        // Add attributes if any
        if (xml.attributes.length > 0) {
          result["@attributes"] = {};
          Array.from(xml.attributes).forEach(attr => {
            result["@attributes"][attr.name] = attr.value;
          });
        }
        
        return result;
      };
      
      const jsonResult = convertXmlToJson(xmlDoc.documentElement);
      const formatted = JSON.stringify(jsonResult, null, 2);
      
      setOutput(formatted);
      toast({
        title: "XML decoded successfully",
        description: "Your XML has been decoded to JSON.",
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
        description: "The JSON output has been copied to your clipboard.",
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
          <h1 className="text-3xl font-bold mb-2">XML Decode</h1>
          <p className="text-muted-foreground">Convert XML to JSON format for easier processing.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Presentation className="h-5 w-5" />
                Input XML
              </CardTitle>
              <CardDescription>
                Paste your XML string to decode
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                className="min-h-[300px] font-mono"
                placeholder='<root><item>Value</item></root>'
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="flex justify-end mt-4">
                <Button onClick={handleDecode}>Convert to JSON</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Presentation className="h-5 w-5" />
                JSON Output
              </CardTitle>
              <CardDescription>
                Your decoded JSON will appear here
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

export default XmlDecode;
