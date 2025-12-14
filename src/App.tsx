
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import Index from "./pages/Index";
import JsonFormatter from "./pages/tools/JsonFormatter";
import Base64Encode from "./pages/tools/Base64Encode";
import Base64Decode from "./pages/tools/Base64Decode";
import UrlEncode from "./pages/tools/UrlEncode";
import UrlDecode from "./pages/tools/UrlDecode";
import UTF8Encode from "./pages/tools/UTF8Encode";
import UTF8Decode from "./pages/tools/UTF8Decode";
import XmlDecode from "./pages/tools/XmlDecode";
import JsFormatter from "./pages/tools/JsFormatter";
import HtmlFormatter from "./pages/tools/HtmlFormatter";
import CssFormatter from "./pages/tools/CssFormatter";
import SqlFormatter from "./pages/tools/SqlFormatter";
import HtmlToMarkdown from "./pages/tools/HtmlToMarkdown";
import HtmlToPdf from "./pages/tools/HtmlToPdf";
import NotFound from "./pages/NotFound";

const App = () => {
  // Create a new QueryClient instance inside the component
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Helmet>
          <title>LLM Utility Hub - Developer Tools for Text Processing</title>
          <meta name="description" content="Free online developer tools for formatting, encoding, decoding, and converting text. JSON, HTML, CSS formatters, Base64, URL encoders/decoders, and more." />
        </Helmet>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tools/json-formatter" element={<JsonFormatter />} />
            <Route path="/tools/base64-encode" element={<Base64Encode />} />
            <Route path="/tools/base64-decode" element={<Base64Decode />} />
            <Route path="/tools/url-encode" element={<UrlEncode />} />
            <Route path="/tools/url-decode" element={<UrlDecode />} />
            <Route path="/tools/utf8-encode" element={<UTF8Encode />} />
            <Route path="/tools/utf8-decode" element={<UTF8Decode />} />
            <Route path="/tools/xml-decode" element={<XmlDecode />} />
            <Route path="/tools/js-formatter" element={<JsFormatter />} />
            <Route path="/tools/html-formatter" element={<HtmlFormatter />} />
            <Route path="/tools/css-formatter" element={<CssFormatter />} />
            <Route path="/tools/sql-formatter" element={<SqlFormatter />} />
            <Route path="/tools/html-to-markdown-converter" element={<HtmlToMarkdown />} />
            <Route path="/tools/html-to-pdf-converter" element={<HtmlToPdf />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
