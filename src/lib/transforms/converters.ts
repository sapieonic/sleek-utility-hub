import TurndownService from "turndown";
import { marked } from "marked";
import type { TransformDef } from "./types";

/** Same options the standalone converter page used, so output is unchanged. */
function turndown(): TurndownService {
  const service = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "_",
    strongDelimiter: "**",
    linkStyle: "inlined",
  });
  service.addRule("strikethrough", {
    filter: ["del", "s"],
    replacement: (content) => `~~${content}~~`,
  });
  return service;
}

export const htmlToMarkdown: TransformDef = {
  id: "html-to-markdown",
  name: "HTML to Markdown",
  chip: "HTML · To Markdown",
  category: "converters",
  blurb: "Convert markup to GitHub-flavoured Markdown.",
  legacyPaths: ["/tools/html-to-markdown-converter"],
  produces: "markdown",
  run(input) {
    if (!input.trim()) return { output: "", language: "markdown" };
    try {
      return { output: turndown().turndown(input), language: "markdown" };
    } catch (err) {
      return {
        output: "",
        language: "markdown",
        error: { message: err instanceof Error ? err.message : "Could not read that as HTML" },
      };
    }
  },
  shell: () => null,
  node: () => `new TurndownService().turndown(input)`,
  python: () => null,
};

export const markdownToHtml: TransformDef = {
  id: "markdown-to-html",
  name: "Markdown to HTML",
  chip: "Markdown · To HTML",
  category: "converters",
  blurb: "Render Markdown to HTML, with GFM tables and line breaks.",
  legacyPaths: ["/tools/markdown-to-html-converter"],
  produces: "html",
  options: [{ key: "breaks", label: "hard line breaks", type: "toggle", default: true }],
  run(input, opts) {
    if (!input.trim()) return { output: "", language: "html" };
    try {
      const output = marked.parse(input, {
        gfm: true,
        breaks: Boolean(opts.breaks),
        async: false,
      }) as string;
      return { output, language: "html" };
    } catch (err) {
      return {
        output: "",
        language: "html",
        error: { message: err instanceof Error ? err.message : "Could not render that Markdown" },
      };
    }
  },
  shell: () => null,
  node: () => `marked.parse(input, { gfm: true })`,
  python: () => null,
};

export const converters = [htmlToMarkdown, markdownToHtml];
