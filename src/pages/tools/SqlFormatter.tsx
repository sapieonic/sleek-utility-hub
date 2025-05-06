
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Copy, Check, FileCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';

const SqlFormatter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleFormat = () => {
    try {
      // Format SQL function
      const formatSQL = (sqlString: string) => {
        // Keywords to uppercase
        const keywords = [
          'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING',
          'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN',
          'ON', 'AS', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'UNION',
          'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP',
          'TABLE', 'VIEW', 'INDEX', 'PROCEDURE', 'FUNCTION', 'TRIGGER',
          'IF', 'ELSE', 'CASE', 'WHEN', 'THEN', 'END', 'BEGIN'
        ];
        
        let formatted = sqlString.trim();
        
        // Replace multiple spaces with single space
        formatted = formatted.replace(/\s+/g, ' ');
        
        // Add new line after specific keywords
        keywords.forEach(keyword => {
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
          formatted = formatted.replace(regex, (match) => {
            return `\n${match.toUpperCase()}`;
          });
        });
        
        // Add indentation
        const lines = formatted.split('\n');
        let indentLevel = 0;
        const indentSize = 2;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if (line.toUpperCase().includes('END') || line.toUpperCase().includes(')')) {
            indentLevel = Math.max(0, indentLevel - 1);
          }
          
          if (line) {
            lines[i] = ' '.repeat(indentLevel * indentSize) + line;
          }
          
          if (line.toUpperCase().includes('BEGIN') || line.toUpperCase().includes('(')) {
            indentLevel++;
          }
        }
        
        return lines.join('\n');
      };
      
      const formatted = formatSQL(input);
      setOutput(formatted);
      toast({
        title: "SQL formatted successfully",
        description: "Your SQL has been formatted with proper syntax highlighting.",
      });
    } catch (error) {
      if (error instanceof Error) {
        setOutput(`Error: ${error.message}`);
        toast({
          variant: "destructive",
          title: "Invalid SQL",
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
        description: "The formatted SQL has been copied to your clipboard.",
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
          <h1 className="text-3xl font-bold mb-2">SQL Formatter</h1>
          <p className="text-muted-foreground">Format and beautify your SQL queries with proper indentation.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                Input SQL
              </CardTitle>
              <CardDescription>
                Paste your unformatted SQL here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeMirror
                value={input}
                height="300px"
                extensions={[sql()]}
                onChange={(value) => setInput(value)}
                className="border rounded-md"
              />
              <div className="flex justify-end mt-4">
                <Button onClick={handleFormat}>Format SQL</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                Formatted Output
              </CardTitle>
              <CardDescription>
                Your beautified SQL will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeMirror
                value={output}
                height="300px"
                extensions={[sql()]}
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

export default SqlFormatter;
