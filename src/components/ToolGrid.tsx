
import { ToolCard } from "./ToolCard";
import {
  Code,
  FileJson,
  Braces,
  FileCode,
  Binary,
  Link as LinkIcon,
  FileText,
  File,
  FileCog,
  Presentation,
  FileType,
  FileStack,
  Hash,
  Quote,
  CreditCard,
  Image,
  FileCode2,
  FileEdit,
  FileDigit,
  QrCode,
  ScanLine,
  List,
  Pilcrow
} from "lucide-react";

// Define tool categories for filtering
export const TOOL_CATEGORIES = {
  formatters: ["json-formatter", "js-formatter", "html-formatter", "css-formatter", "sql-formatter"],
  encoders: ["base64-encode", "base64-decode", "url-encode", "url-decode", "utf8-encode", "utf8-decode", "xml-decode"],
  generators: ["test-data-generator", "lorem-ipsum-generator", "credit-card-generator", "placeholder-image-generator", "qr-code-generator"],
  converters: ["html-to-markdown-converter", "html-to-pdf-converter"]
};

// Define which tools are fully implemented
const IMPLEMENTED_TOOLS = [
  "json-formatter", 
  "base64-encode", 
  "base64-decode", 
  "url-encode", 
  "url-decode", 
  "utf8-encode", 
  "utf8-decode", 
  "xml-decode", 
  "js-formatter", 
  "html-formatter", 
  "css-formatter", 
  "sql-formatter"
];

export const tools = [
  {
    title: "Code Share",
    description: "View/Share snippets in 100+ language",
    path: "/tools/code-share",
    icon: Code
  },
  {
    title: "JSON Decoder",
    description: "Decode JSON to array",
    path: "/tools/json-decoder",
    icon: FileJson
  },
  {
    title: "JSON Formatter",
    description: "Format/Beautify JSON",
    path: "/tools/json-formatter",
    icon: Braces
  },
  {
    title: "BASE64 Encode",
    description: "Text to base64",
    path: "/tools/base64-encode",
    icon: FileCode
  },
  {
    title: "BASE64 Decode",
    description: "base64 to plain text",
    path: "/tools/base64-decode",
    icon: Binary
  },
  {
    title: "URL Encode online",
    description: "Encode text to url",
    path: "/tools/url-encode",
    icon: LinkIcon
  },
  {
    title: "URL Decode",
    description: "Decode url",
    path: "/tools/url-decode",
    icon: FileText
  },
  {
    title: "UTF8 Encode",
    description: "Plain text to UTF8",
    path: "/tools/utf8-encode",
    icon: File
  },
  {
    title: "UTF8 Decode",
    description: "UTF8 to plain text",
    path: "/tools/utf8-decode",
    icon: FileCog
  },
  {
    title: "XML Decode",
    description: "Decode XML string to array",
    path: "/tools/xml-decode",
    icon: Presentation
  },
  {
    title: "JS Formatter",
    description: "Format/Beautify javascript",
    path: "/tools/js-formatter",
    icon: FileType
  },
  {
    title: "HTML Formatter",
    description: "Format/Beautify HTML",
    path: "/tools/html-formatter",
    icon: FileStack
  },
  {
    title: "CSS Formatter",
    description: "Format/Beautify CSS",
    path: "/tools/css-formatter",
    icon: Hash
  },
  {
    title: "JS Compressor",
    description: "Compress/Minify javascript",
    path: "/tools/js-compressor",
    icon: FileCode2
  },
  {
    title: "CSS Compressor",
    description: "Compress/Minify CSS",
    path: "/tools/css-compressor",
    icon: FileCode2
  },
  {
    title: "SQL Formatter",
    description: "Format/Beautify SQL",
    path: "/tools/sql-formatter",
    icon: FileCode
  },
  {
    title: "Test Data Generator",
    description: "Generate Test Data/Fake Data",
    path: "/tools/test-data-generator",
    icon: FileDigit
  },
  {
    title: "Lorem Ipsum Generator",
    description: "Generate Lorem Ipsum Test data",
    path: "/tools/lorem-ipsum-generator",
    icon: Quote
  },
  {
    title: "Credit Card Generator",
    description: "Generate Credit Card Test data",
    path: "/tools/credit-card-generator",
    icon: CreditCard
  },
  {
    title: "Placeholder Image Generator",
    description: "Generate placeholder images",
    path: "/tools/placeholder-image-generator",
    icon: Image // Changed from ImageSquare
  },
  {
    title: "HTML to Markdown Converter",
    description: "Converts HTML to Markdown",
    path: "/tools/html-to-markdown-converter",
    icon: FileCode
  },
  {
    title: "Markdown Editor",
    description: "GFM Markdown and WYSIWYG Editor",
    path: "/tools/markdown-editor",
    icon: FileEdit // Changed from FileEditing
  },
  {
    title: "Diff Checker",
    description: "Check difference between files online",
    path: "/tools/diff-checker",
    icon: FileCode
  },
  {
    title: "HTML to PDF Converter",
    description: "Convert HTML to PDF file",
    path: "/tools/html-to-pdf-converter",
    icon: FileDigit
  },
  {
    title: "QR Code Generator",
    description: "Generate QR code from text",
    path: "/tools/qr-code-generator",
    icon: QrCode
  },
  {
    title: "QR Code Scanner",
    description: "Scan QR code from built in camera or file upload",
    path: "/tools/qr-code-scanner",
    icon: ScanLine
  },
  {
    title: "Sorting list",
    description: "Sort a list of numbers or strings alphabetically or by length",
    path: "/tools/sorting-list",
    icon: List
  },
  {
    title: "String Utilities",
    description: "Convert, Remove, Replace related Utilities for a string",
    path: "/tools/string-utilities",
    icon: Pilcrow
  }
];

interface ToolGridProps {
  category?: "all" | "formatters" | "encoders" | "generators" | "converters";
  searchQuery?: string;
}

export function ToolGrid({ category = "all", searchQuery = "" }: ToolGridProps) {
  // Filter tools based on category and search query
  const filteredTools = tools.filter(tool => {
    // Extract the tool identifier from the path
    const toolId = tool.path.split('/tools/')[1];
    
    // Category filter
    const passesCategory = 
      category === "all" || 
      (TOOL_CATEGORIES.formatters.includes(toolId) && category === "formatters") ||
      (TOOL_CATEGORIES.encoders.includes(toolId) && category === "encoders") ||
      (TOOL_CATEGORIES.generators.includes(toolId) && category === "generators") ||
      (TOOL_CATEGORIES.converters.includes(toolId) && category === "converters");
    
    // Search filter
    const passesSearch = 
      searchQuery === "" || 
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return passesCategory && passesSearch;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredTools.map((tool, index) => {
        // Check if the tool is implemented
        const toolId = tool.path.split('/tools/')[1];
        const isImplemented = IMPLEMENTED_TOOLS.includes(toolId);
        
        return (
          <div key={tool.path} className="opacity-0 animate-fade-in" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}>
            <ToolCard
              icon={tool.icon}
              title={tool.title}
              description={tool.description}
              path={tool.path}
              inProgress={!isImplemented}
            />
          </div>
        );
      })}
      {filteredTools.length === 0 && (
        <div className="col-span-4 text-center py-12">
          <p className="text-muted-foreground">No tools found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
