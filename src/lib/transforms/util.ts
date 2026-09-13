/** Byte length of a string as UTF-8 — what every size readout in the UI means. */
export function byteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatMs(ms: number): string {
  if (ms < 1) return `${ms.toFixed(1)} ms`;
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export function lineCount(text: string): number {
  return text ? text.split("\n").length : 0;
}

/**
 * Turn a character offset into a 1-based line/column, so a parser message that
 * only knows "position 214" can point at a place in the editor.
 */
export function offsetToPosition(text: string, offset: number) {
  const upto = text.slice(0, Math.max(0, offset));
  const lines = upto.split("\n");
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

/**
 * V8, SpiderMonkey and JavaScriptCore all word their JSON errors differently.
 * Pull a position out of whichever one we got, and keep the original message.
 */
export function parseJsonError(text: string, err: unknown) {
  const message = err instanceof Error ? err.message : String(err);

  const atPosition = /position (\d+)/i.exec(message);
  if (atPosition) {
    const { line, column } = offsetToPosition(text, Number(atPosition[1]));
    return { message: cleanJsonMessage(message), line, column, hint: jsonHint(text, message) };
  }

  const lineCol = /line (\d+) column (\d+)/i.exec(message);
  if (lineCol) {
    return {
      message: cleanJsonMessage(message),
      line: Number(lineCol[1]),
      column: Number(lineCol[2]),
      hint: jsonHint(text, message),
    };
  }

  return { message: cleanJsonMessage(message), hint: jsonHint(text, message) };
}

function cleanJsonMessage(message: string): string {
  return message
    .replace(/^JSON\.parse:\s*/i, "")
    .replace(/^Unexpected token (.) in JSON at position \d+/i, "Unexpected $1")
    .replace(/ in JSON at position \d+/i, "")
    .replace(/\s+\(line \d+ column \d+\)/i, "")
    .trim();
}

function jsonHint(text: string, message: string): string | undefined {
  if (/trailing comma|after array element|after property/i.test(message) || /,\s*[}\]]/.test(text)) {
    return "A trailing comma before a closing brace or bracket — every parser rejects it.";
  }
  if (/single quote|'/.test(message) || /'[^']*'\s*:/.test(text)) {
    return "JSON strings use double quotes; single quotes are a JavaScript habit.";
  }
  if (/end of (JSON )?input|Unexpected end/i.test(message)) {
    return "The document stops early — a brace or bracket is never closed.";
  }
  return undefined;
}

/**
 * A cheap guess at what a buffer already is, before any step runs. Without it a
 * pipeline whose first step preserves its input (Change Case, Replace, Lines)
 * reported the result as plain text, which cost you the JSON outline and the
 * syntax colours on content that never stopped being JSON.
 */
export function sniffLanguage(source: string): import("./types").Lang {
  const trimmed = source.trim();
  if (!trimmed) return "text";
  if (/^[[{]/.test(trimmed)) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      /* looked like JSON, is not */
    }
  }
  if (/^\s*<\?xml/i.test(trimmed)) return "xml";
  if (/^\s*<(!doctype|html|div|span|p|a|body|table|ul|section|head)\b/i.test(trimmed)) return "html";
  if (/^\s*<[a-zA-Z]/.test(trimmed)) return "xml";
  if (/^\s*(SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+TABLE|WITH)\b/i.test(trimmed)) return "sql";
  if (/^#{1,6}\s|\n#{1,6}\s|^```|\n```/.test(trimmed)) return "markdown";
  if (/[.#@][\w-]+\s*\{[^}]*:[^}]*\}/.test(trimmed)) return "css";
  if (/\b(function|=>|const |let |var |return |import |export )/.test(trimmed)) return "javascript";
  return "text";
}
