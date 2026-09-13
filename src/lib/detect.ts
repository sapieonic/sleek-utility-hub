import { getTransform, type Opts } from "./transforms";

export interface DetectedStep {
  transformId: string;
  opts?: Opts;
}

export interface Candidate {
  id: string;
  /** Sentence shown in the banner, e.g. "Base64 that decodes to JSON". */
  label: string;
  confidence: number;
  steps: DetectedStep[];
  /** Shown on the primary button, e.g. "Decode and format". */
  action: string;
}

const BASE64 = /^[A-Za-z0-9+/=_-]+$/;

function looksLikeJson(text: string): boolean {
  const trimmed = text.trim();
  if (!/^[[{]/.test(trimmed)) return false;
  try {
    JSON.parse(trimmed);
    return true;
  } catch {
    return false;
  }
}

function tryBase64(text: string): string | null {
  const compact = text.trim().replace(/\s+/g, "");
  if (compact.length < 8 || compact.length % 4 === 1) return null;
  if (!BASE64.test(compact)) return null;
  // Plain English passes the alphabet test; require the round-trip to agree.
  try {
    const decoded = getTransform("base64-decode")!.run(compact, {});
    if (decoded.error || !decoded.output) return null;
    // eslint-disable-next-line no-control-regex
    if (/[\x00-\x08\x0E-\x1F\uFFFD]/.test(decoded.output)) return null;
    const reencoded = getTransform("base64-encode")!.run(decoded.output, { urlSafe: false });
    const normalized = compact.replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
    if (reencoded.output.replace(/=+$/, "") !== normalized) return null;
    return decoded.output;
  } catch {
    return null;
  }
}

/**
 * Everything here runs locally, on paste, and only ever *proposes*. Nothing is
 * applied to the buffer until someone presses a key.
 */
export function detect(text: string): Candidate[] {
  const trimmed = text.trim();
  if (trimmed.length < 4) return [];

  const candidates: Candidate[] = [];

  if (looksLikeJson(trimmed)) {
    const alreadyPretty = /\n\s+\S/.test(trimmed);
    if (!alreadyPretty) {
      candidates.push({
        id: "json",
        label: "JSON on one line",
        confidence: 0.97,
        action: "Format it",
        steps: [{ transformId: "json-format" }],
      });
    }
  }

  // Almost-JSON is the case that needs help most: running the formatter is how
  // you find out *where* it is broken, so offer that rather than staying quiet.
  if (/^[[{]/.test(trimmed) && !looksLikeJson(trimmed)) {
    candidates.push({
      id: "json-broken",
      label: "JSON with a syntax error in it",
      confidence: 0.75,
      action: "Show me where",
      steps: [{ transformId: "json-format" }],
    });
  }

  const decoded = tryBase64(trimmed);
  if (decoded) {
    if (looksLikeJson(decoded)) {
      candidates.push({
        id: "base64-json",
        label: "Base64 that decodes to JSON",
        confidence: 0.96,
        action: "Decode and format",
        steps: [{ transformId: "base64-decode" }, { transformId: "json-format" }],
      });
    } else {
      candidates.push({
        id: "base64",
        label: "Base64-encoded text",
        confidence: 0.88,
        action: "Decode it",
        steps: [{ transformId: "base64-decode" }],
      });
    }
  }

  if (/%[0-9A-Fa-f]{2}/.test(trimmed)) {
    const hits = trimmed.match(/%[0-9A-Fa-f]{2}/g)?.length ?? 0;
    candidates.push({
      id: "percent",
      label: "Percent-encoded URL",
      confidence: Math.min(0.9, 0.45 + hits * 0.05),
      action: "Decode it",
      steps: [{ transformId: "url-decode" }],
    });
  }

  if (/\\u[0-9A-Fa-f]{4}/.test(trimmed)) {
    candidates.push({
      id: "escapes",
      label: "\\uXXXX escape sequences",
      confidence: 0.82,
      action: "Unescape it",
      steps: [{ transformId: "utf8-decode" }],
    });
  }

  if (/^\s*</.test(trimmed)) {
    const isXml = /^\s*<\?xml/i.test(trimmed) || !/<(div|span|p|a|body|html|table|ul|li)\b/i.test(trimmed);
    candidates.push(
      isXml
        ? {
            id: "xml",
            label: "an XML document",
            confidence: 0.8,
            action: "Read it as JSON",
            steps: [{ transformId: "xml-decode" }],
          }
        : {
            id: "html",
            label: "HTML markup",
            confidence: 0.85,
            action: "Format it",
            steps: [{ transformId: "html-format" }],
          },
    );
  }

  if (/^\s*(SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+TABLE|WITH)\b/i.test(trimmed)) {
    candidates.push({
      id: "sql",
      label: "a SQL statement",
      confidence: 0.86,
      action: "Format it",
      steps: [{ transformId: "sql-format" }],
    });
  }

  // reduce, not Math.max(...spread): a 200k-line paste overflowed the stack
  // and took the render down with it.
  const longestLine = trimmed.split("\n").reduce((max, line) => Math.max(max, line.length), 0);
  if (longestLine > 200 && /[{};]/.test(trimmed)) {
    const isCss = /[.#@][\w-]+\s*\{/.test(trimmed) && !/\b(function|=>|const|var|return)\b/.test(trimmed);
    candidates.push({
      id: isCss ? "min-css" : "min-js",
      label: isCss ? "minified CSS" : "minified JavaScript",
      confidence: 0.7,
      action: "Format it",
      steps: [{ transformId: isCss ? "css-format" : "js-format" }],
    });
  }

  if (/^#{1,6}\s|\n#{1,6}\s|^```|\n```|\n[-*]\s/.test(trimmed)) {
    candidates.push({
      id: "markdown",
      label: "Markdown",
      confidence: 0.6,
      action: "Render it",
      steps: [{ transformId: "markdown-to-html" }],
    });
  }

  return candidates.sort((a, b) => b.confidence - a.confidence).slice(0, 4);
}
