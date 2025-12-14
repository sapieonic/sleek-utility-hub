# Sleek Utility Hub

A modern, feature-rich web application providing a comprehensive collection of developer tools for text processing, formatting, encoding/decoding, and more. Built with React, TypeScript, and cutting-edge web technologies.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://hub.llm-util.com/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## About

Sleek Utility Hub (also known as LLM Utility Hub) is a free, open-source collection of online developer utilities designed to streamline your daily workflow. Whether you need to format code, encode/decode text, generate test data, or convert between formats, this hub provides an intuitive interface with zero external dependencies - all processing happens right in your browser.

### Live Demo

Visit [https://hub.llm-util.com/](https://hub.llm-util.com/) to try it out!

## Key Features

- **100% Client-Side Processing** - All operations run in your browser; no data is sent to any server
- **Modern UI/UX** - Built with shadcn/ui and Tailwind CSS for a beautiful, responsive interface
- **Dark Mode Support** - Seamless theme switching with system preference detection
- **Category-Based Navigation** - Tools organized into Formatters, Encoders, Generators, and Converters
- **Real-Time Search** - Quickly find the tool you need with instant filtering
- **Mobile Responsive** - Works perfectly on all device sizes
- **Fast Performance** - Built with Vite for lightning-fast load times
- **Offline Capable** - Core functionality works without internet connection
- **SEO Optimized** - Full meta tag support for social sharing

## Available Tools

### Formatters (5 tools)

| Tool | Description | Status |
|------|-------------|--------|
| **JSON Formatter** | Parse, validate, and beautify JSON data with proper indentation | Available |
| **JavaScript Formatter** | Format and beautify JavaScript code | Available |
| **HTML Formatter** | Format and beautify HTML markup using DOM parsing | Available |
| **CSS Formatter** | Format and beautify CSS stylesheets | Available |
| **SQL Formatter** | Format SQL queries with keyword highlighting and indentation | Available |

### Encoders & Decoders (7 tools)

| Tool | Description | Status |
|------|-------------|--------|
| **Base64 Encode** | Convert plain text to Base64 encoding | Available |
| **Base64 Decode** | Decode Base64 strings back to plain text | Available |
| **URL Encode** | Encode text for safe URL usage | Available |
| **URL Decode** | Decode URL-encoded strings | Available |
| **UTF-8 Encode** | Convert text to UTF-8 escape sequences (`\uXXXX` format) | Available |
| **UTF-8 Decode** | Convert UTF-8 escape sequences back to text | Available |
| **XML Decode** | Convert XML to JSON format | Available |

### Generators (Coming Soon)

| Tool | Description | Status |
|------|-------------|--------|
| **Test Data Generator** | Generate fake/test data for development | In Progress |
| **Lorem Ipsum Generator** | Generate placeholder text | In Progress |
| **Credit Card Generator** | Generate test credit card numbers | In Progress |
| **Placeholder Image Generator** | Generate placeholder images | In Progress |
| **QR Code Generator** | Generate QR codes from text | In Progress |

### Converters (4 tools)

| Tool | Description | Status |
|------|-------------|--------|
| **HTML to Markdown** | Convert HTML markup to Markdown using Turndown | Available |
| **HTML to PDF** | Convert HTML to PDF documents with html2pdf.js | Available |
| **Markdown to HTML** | Convert Markdown to styled HTML with GFM support | Available |
| **Markdown to PDF** | Convert Markdown to PDF with live preview using react-markdown | Available |

### Utilities (4 tools)

| Tool | Description | Status |
|------|-------------|--------|
| **Diff Checker** | Compare text with line/word/char modes, ignore whitespace/case options | Available |
| **Markdown Editor** | GFM Markdown editor with split/edit/preview modes, download as .md or .html | Available |
| **String Utilities** | 30+ operations: case conversion, text transforms, extract emails/URLs/numbers | Available |

### Generators (Coming Soon)

| Tool | Description | Status |
|------|-------------|--------|
| **Test Data Generator** | Generate fake/test data for development | In Progress |
| **Lorem Ipsum Generator** | Generate placeholder text | In Progress |
| **Credit Card Generator** | Generate test credit card numbers | In Progress |
| **Placeholder Image Generator** | Generate placeholder images | In Progress |
| **QR Code Generator** | Generate QR codes from text | In Progress |

### Additional Tools (Coming Soon)

| Tool | Description | Status |
|------|-------------|--------|
| **Code Share** | View/share code snippets in 100+ languages | In Progress |
| **JSON Decoder** | Decode JSON to array format | In Progress |
| **JS Compressor** | Minify JavaScript code | In Progress |
| **CSS Compressor** | Minify CSS stylesheets | In Progress |
| **QR Code Scanner** | Scan QR codes via camera or file upload | In Progress |
| **Sorting List** | Sort lists alphabetically or numerically | In Progress |

## Tech Stack

### Core

| Technology | Version | Purpose |
|------------|---------|---------|
| [React](https://react.dev/) | 18.3.1 | UI Framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.5.3 | Type Safety |
| [Vite](https://vitejs.dev/) | 5.4.1 | Build Tool (with SWC) |

### UI & Styling

| Technology | Purpose |
|------------|---------|
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework |
| [shadcn/ui](https://ui.shadcn.com/) | Pre-built accessible components (40+) |
| [Radix UI](https://www.radix-ui.com/) | Accessibility-focused primitives |
| [Lucide React](https://lucide.dev/) | Icon library |

### Code Editing

| Technology | Purpose |
|------------|---------|
| [CodeMirror 6](https://codemirror.net/) | Advanced code editor |
| Language support | HTML, SQL, JavaScript |

### State & Forms

| Technology | Purpose |
|------------|---------|
| [TanStack Query](https://tanstack.com/query) | Server state management |
| [React Hook Form](https://react-hook-form.com/) | Form handling |
| [Zod](https://zod.dev/) | Schema validation |

### Conversion & Processing

| Technology | Purpose |
|------------|---------|
| [Turndown](https://github.com/mixmark-io/turndown) | HTML to Markdown conversion |
| [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) | Client-side PDF generation |
| [marked](https://marked.js.org/) | Markdown parsing |
| [react-markdown](https://github.com/remarkjs/react-markdown) | Markdown rendering |
| [remark-gfm](https://github.com/remarkjs/remark-gfm) | GitHub Flavored Markdown support |
| [diff](https://github.com/kpdecker/jsdiff) | Text comparison |
| [@uiw/react-md-editor](https://uiwjs.github.io/react-md-editor/) | Markdown WYSIWYG editor |

### Additional Libraries

| Technology | Purpose |
|------------|---------|
| [React Router v6](https://reactrouter.com/) | Client-side routing |
| [next-themes](https://github.com/pacocoursey/next-themes) | Theme management |
| [Sonner](https://sonner.emilkowal.ski/) | Toast notifications |
| [react-helmet-async](https://github.com/staylor/react-helmet-async) | SEO meta tags |
| [date-fns](https://date-fns.org/) | Date utilities |
| [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin) | Prose styling for Markdown |

## Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm** or **bun**: Package manager

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/sapionic/sleek-utility-hub.git
cd sleek-utility-hub
```

2. **Install dependencies:**
```bash
npm install
# or
bun install
```

3. **Start the development server:**
```bash
npm run dev
# or
bun run dev
```

4. **Open your browser** and navigate to `http://localhost:8080`

### Building for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 8080 |
| `npm run build` | Build optimized production bundle |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint for code quality |

## Project Structure

```
sleek-utility-hub/
├── public/                     # Static assets (favicon, icons)
├── src/
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components (40+ pre-built)
│   │   ├── Header.tsx          # Navigation header with theme toggle
│   │   ├── Footer.tsx          # Application footer
│   │   ├── HeroSection.tsx     # Landing section with animated search
│   │   ├── ToolCard.tsx        # Individual tool card component
│   │   ├── ToolGrid.tsx        # Grid layout with category filtering
│   │   ├── CategorySection.tsx # Category-based tool sections
│   │   ├── SearchTools.tsx     # Search input component
│   │   └── ThemeToggle.tsx     # Dark/light mode toggle
│   │
│   ├── pages/                  # Page components
│   │   ├── tools/              # Individual tool implementations
│   │   │   ├── JsonFormatter.tsx
│   │   │   ├── JsFormatter.tsx
│   │   │   ├── HtmlFormatter.tsx
│   │   │   ├── CssFormatter.tsx
│   │   │   ├── SqlFormatter.tsx
│   │   │   ├── Base64Encode.tsx
│   │   │   ├── Base64Decode.tsx
│   │   │   ├── UrlEncode.tsx
│   │   │   ├── UrlDecode.tsx
│   │   │   ├── UTF8Encode.tsx
│   │   │   ├── UTF8Decode.tsx
│   │   │   ├── XmlDecode.tsx
│   │   │   ├── HtmlToMarkdown.tsx
│   │   │   ├── HtmlToPdf.tsx
│   │   │   ├── MarkdownToHtml.tsx
│   │   │   ├── MarkdownToPdf.tsx
│   │   │   ├── DiffChecker.tsx
│   │   │   ├── MarkdownEditor.tsx
│   │   │   └── StringUtilities.tsx
│   │   ├── Index.tsx           # Home page with tool discovery
│   │   └── NotFound.tsx        # 404 error page
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-mobile.tsx      # Mobile detection (768px breakpoint)
│   │   └── use-toast.ts        # Toast notification hook
│   │
│   ├── lib/                    # Utility functions
│   │   └── utils.ts            # Class name merging utility (cn)
│   │
│   ├── App.tsx                 # Main app with routing
│   ├── main.tsx                # React entry point
│   ├── index.css               # Global styles & CSS variables
│   └── App.css                 # Additional app styles
│
├── index.html                  # HTML template with SEO meta tags
├── package.json                # Dependencies and scripts
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind theme & extensions
├── components.json             # shadcn/ui configuration
├── eslint.config.js            # ESLint rules
└── postcss.config.js           # PostCSS configuration
```

## Adding New Tools

To add a new tool to the application:

### 1. Create the Tool Component

Create a new file in `src/pages/tools/YourTool.tsx`:

```tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function YourTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleProcess = () => {
    // Your processing logic here
    setOutput(processedResult);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Your tool UI */}
    </div>
  );
}
```

### 2. Add the Route

In `src/App.tsx`, add the route:

```tsx
import YourTool from "./pages/tools/YourTool";

// Inside the Routes component:
<Route path="/tools/your-tool" element={<YourTool />} />
```

### 3. Register the Tool

In `src/components/ToolGrid.tsx`:

1. Add to the appropriate category in `TOOL_CATEGORIES`
2. Add to `IMPLEMENTED_TOOLS` array when complete
3. Add the tool definition to the `tools` array

```tsx
{
  title: "Your Tool",
  description: "Description of what your tool does",
  path: "/tools/your-tool",
  icon: YourIcon
}
```

## Browser APIs Used

This application leverages native browser APIs for all processing:

- `btoa()` / `atob()` - Base64 encoding/decoding
- `encodeURIComponent()` / `decodeURIComponent()` - URL encoding
- `DOMParser` - HTML/XML parsing
- `navigator.clipboard` - Copy to clipboard
- `localStorage` - Theme persistence
- `matchMedia` - Responsive design detection

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow

1. **Fork** the repository
2. **Create** your feature branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit** your changes:
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push** to the branch:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open** a Pull Request

### Code Style

- Follow existing TypeScript patterns
- Use functional components with hooks
- Follow the established tool component pattern
- Ensure responsive design works on all breakpoints
- Test dark mode compatibility

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) - Beautiful, accessible components
- Icons by [Lucide](https://lucide.dev/) - Consistent icon library
- Styling by [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- Code editing by [CodeMirror](https://codemirror.net/) - Versatile code editor

## Support

For questions, feedback, or bug reports, please [open an issue](https://github.com/sapionic/sleek-utility-hub/issues) on GitHub.

---

Made with care for developers everywhere
