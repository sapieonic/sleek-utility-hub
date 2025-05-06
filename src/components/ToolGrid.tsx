
import { ToolCard } from "./ToolCard";
import {
  Code,
  FileJson,
  Braces,
  FileCode,
  Binary,
  Link as LinkIcon,
  FileText,
  FileHexagon,
  FileCog,
  Presentation,
  FileType,
  FileStack,
  Hash,
  Quote,
  CreditCard,
  ImageSquare,
  FileCode2,
  FileEditing,
  FileDigit,
  QrCode,
  ScanLine,
  List,
  Pilcrow
} from "lucide-react";

export function ToolGrid() {
  const tools = [
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
      icon: FileHexagon
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
      icon: ImageSquare
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
      icon: FileEditing
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {tools.map((tool, index) => (
        <div key={tool.path} className="opacity-0 animate-fade-in" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}>
          <ToolCard
            icon={tool.icon}
            title={tool.title}
            description={tool.description}
            path={tool.path}
          />
        </div>
      ))}
    </div>
  );
}
