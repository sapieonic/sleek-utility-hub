
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
  Pilcrow,
  LucideIcon
} from "lucide-react";

// Define tool categories for filtering
export const TOOL_CATEGORIES = {
  formatters: ["json-formatter", "js-formatter", "html-formatter", "css-formatter", "sql-formatter"],
  encoders: ["base64-encode", "base64-decode", "url-encode", "url-decode", "utf8-encode", "utf8-decode", "xml-decode"],
  generators: ["test-data-generator", "lorem-ipsum-generator", "credit-card-generator", "placeholder-image-generator", "qr-code-generator"],
  converters: ["html-to-markdown-converter", "html-to-pdf-converter"],
  utilities: ["code-share", "json-decoder", "js-compressor", "css-compressor", "markdown-editor", "diff-checker", "qr-code-scanner", "sorting-list", "string-utilities"]
};

// Define which tools are fully implemented
export const IMPLEMENTED_TOOLS = [
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
  "sql-formatter",
  "html-to-markdown-converter",
  "html-to-pdf-converter"
];

export interface ToolDefinition {
  title: string;
  description: string;
  path: string;
  icon: LucideIcon;
  category: "formatters" | "encoders" | "generators" | "converters" | "utilities";
}

export const tools: ToolDefinition[] = [
  // Formatters
  {
    title: "JSON Formatter",
    description: "Format/Beautify JSON",
    path: "/tools/json-formatter",
    icon: Braces,
    category: "formatters"
  },
  {
    title: "JS Formatter",
    description: "Format/Beautify javascript",
    path: "/tools/js-formatter",
    icon: FileType,
    category: "formatters"
  },
  {
    title: "HTML Formatter",
    description: "Format/Beautify HTML",
    path: "/tools/html-formatter",
    icon: FileStack,
    category: "formatters"
  },
  {
    title: "CSS Formatter",
    description: "Format/Beautify CSS",
    path: "/tools/css-formatter",
    icon: Hash,
    category: "formatters"
  },
  {
    title: "SQL Formatter",
    description: "Format/Beautify SQL",
    path: "/tools/sql-formatter",
    icon: FileCode,
    category: "formatters"
  },

  // Encoders/Decoders
  {
    title: "BASE64 Encode",
    description: "Text to base64",
    path: "/tools/base64-encode",
    icon: FileCode,
    category: "encoders"
  },
  {
    title: "BASE64 Decode",
    description: "base64 to plain text",
    path: "/tools/base64-decode",
    icon: Binary,
    category: "encoders"
  },
  {
    title: "URL Encode",
    description: "Encode text to url",
    path: "/tools/url-encode",
    icon: LinkIcon,
    category: "encoders"
  },
  {
    title: "URL Decode",
    description: "Decode url",
    path: "/tools/url-decode",
    icon: FileText,
    category: "encoders"
  },
  {
    title: "UTF8 Encode",
    description: "Plain text to UTF8",
    path: "/tools/utf8-encode",
    icon: File,
    category: "encoders"
  },
  {
    title: "UTF8 Decode",
    description: "UTF8 to plain text",
    path: "/tools/utf8-decode",
    icon: FileCog,
    category: "encoders"
  },
  {
    title: "XML Decode",
    description: "Decode XML string to JSON",
    path: "/tools/xml-decode",
    icon: Presentation,
    category: "encoders"
  },

  // Generators
  {
    title: "Test Data Generator",
    description: "Generate Test Data/Fake Data",
    path: "/tools/test-data-generator",
    icon: FileDigit,
    category: "generators"
  },
  {
    title: "Lorem Ipsum Generator",
    description: "Generate Lorem Ipsum Test data",
    path: "/tools/lorem-ipsum-generator",
    icon: Quote,
    category: "generators"
  },
  {
    title: "Credit Card Generator",
    description: "Generate Credit Card Test data",
    path: "/tools/credit-card-generator",
    icon: CreditCard,
    category: "generators"
  },
  {
    title: "Placeholder Image Generator",
    description: "Generate placeholder images",
    path: "/tools/placeholder-image-generator",
    icon: Image,
    category: "generators"
  },
  {
    title: "QR Code Generator",
    description: "Generate QR code from text",
    path: "/tools/qr-code-generator",
    icon: QrCode,
    category: "generators"
  },

  // Converters
  {
    title: "HTML to Markdown",
    description: "Converts HTML to Markdown",
    path: "/tools/html-to-markdown-converter",
    icon: FileCode,
    category: "converters"
  },
  {
    title: "HTML to PDF",
    description: "Convert HTML to PDF file",
    path: "/tools/html-to-pdf-converter",
    icon: FileDigit,
    category: "converters"
  },

  // Utilities
  {
    title: "Code Share",
    description: "View/Share snippets in 100+ languages",
    path: "/tools/code-share",
    icon: Code,
    category: "utilities"
  },
  {
    title: "JSON Decoder",
    description: "Decode JSON to array",
    path: "/tools/json-decoder",
    icon: FileJson,
    category: "utilities"
  },
  {
    title: "JS Compressor",
    description: "Compress/Minify javascript",
    path: "/tools/js-compressor",
    icon: FileCode2,
    category: "utilities"
  },
  {
    title: "CSS Compressor",
    description: "Compress/Minify CSS",
    path: "/tools/css-compressor",
    icon: FileCode2,
    category: "utilities"
  },
  {
    title: "Markdown Editor",
    description: "GFM Markdown and WYSIWYG Editor",
    path: "/tools/markdown-editor",
    icon: FileEdit,
    category: "utilities"
  },
  {
    title: "Diff Checker",
    description: "Check difference between files online",
    path: "/tools/diff-checker",
    icon: FileCode,
    category: "utilities"
  },
  {
    title: "QR Code Scanner",
    description: "Scan QR code from camera or file",
    path: "/tools/qr-code-scanner",
    icon: ScanLine,
    category: "utilities"
  },
  {
    title: "Sorting List",
    description: "Sort numbers or strings alphabetically",
    path: "/tools/sorting-list",
    icon: List,
    category: "utilities"
  },
  {
    title: "String Utilities",
    description: "Convert, Remove, Replace strings",
    path: "/tools/string-utilities",
    icon: Pilcrow,
    category: "utilities"
  }
];

interface ToolGridProps {
  category?: "all" | "formatters" | "encoders" | "generators" | "converters" | "utilities";
  searchQuery?: string;
}

// Helper function to get tools by category with implementation status
export function getToolsByCategory(category: keyof typeof TOOL_CATEGORIES) {
  return tools
    .filter(tool => tool.category === category)
    .map(tool => {
      const toolId = tool.path.split('/tools/')[1];
      return {
        ...tool,
        isImplemented: IMPLEMENTED_TOOLS.includes(toolId)
      };
    });
}

export function ToolGrid({ category = "all", searchQuery = "" }: ToolGridProps) {
  // Filter tools based on category and search query
  const filteredTools = tools.filter(tool => {
    // Category filter using the new category field
    const passesCategory =
      category === "all" || tool.category === category;

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
