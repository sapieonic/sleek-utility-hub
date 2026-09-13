export interface OutlineNode {
  key: string;
  path: string;
  kind: "object" | "array" | "string" | "number" | "boolean" | "null";
  preview: string;
  childCount?: number;
  depth: number;
  children?: OutlineNode[];
  /** 1-based line in the formatted document, so a click can jump there. */
  line?: number;
}

/** Beyond this an array is summarised rather than listed row by row. */
const MAX_ARRAY_ITEMS = 50;

export interface OutlineSummary {
  nodes: OutlineNode[];
  keyCount: number;
  maxDepth: number;
}

function kindOf(value: unknown): OutlineNode["kind"] {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value as OutlineNode["kind"];
}

function previewOf(value: unknown, kind: OutlineNode["kind"]): string {
  switch (kind) {
    case "object":
      return `object · ${Object.keys(value as object).length}`;
    case "array":
      return `array · ${(value as unknown[]).length}`;
    case "string": {
      const text = value as string;
      return text.length > 22 ? `"${text.slice(0, 21)}…"` : `"${text}"`;
    }
    default:
      return String(value);
  }
}

/**
 * Build the Structure panel's tree, and record the line each key lands on in
 * the *formatted* output so selecting a row can scroll the editor to it.
 */
export function buildOutline(formatted: string): OutlineSummary | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(formatted);
  } catch {
    return null;
  }

  // Pair each key occurrence with the line it lands on. The walk below must
  // consume an occurrence for EVERY key in the document, including array items
  // it does not render — otherwise the cursor drifts and every key after a
  // truncated array reports someone else's line.
  const lineOf = new Map<string, number>();
  const lines = formatted.split("\n");
  const cursor = new Map<string, number>();
  lines.forEach((line, index) => {
    const match = /^\s*"((?:[^"\\]|\\.)*)"\s*:/.exec(line);
    if (!match) return;
    const key = match[1];
    const seen = cursor.get(key) ?? 0;
    cursor.set(key, seen + 1);
    lineOf.set(`${key}#${seen}`, index + 1);
  });
  // Minified output is a single line, so no key ever matches. Report no lines
  // at all rather than a panel full of dead click targets.
  const hasLines = lineOf.size > 0;
  const consumed = new Map<string, number>();
  const nextLineFor = (key: string): number | undefined => {
    const seen = consumed.get(key) ?? 0;
    consumed.set(key, seen + 1);
    return hasLines ? lineOf.get(`${key}#${seen}`) : undefined;
  };

  let keyCount = 0;
  let maxDepth = 1;

  /** Advance the line cursor over a subtree without building nodes for it. */
  const consume = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(consume);
      return;
    }
    if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        keyCount += 1;
        nextLineFor(key);
        consume(child);
      }
    }
  };

  const walk = (value: unknown, key: string, path: string, depth: number): OutlineNode => {
    const kind = kindOf(value);
    maxDepth = Math.max(maxDepth, depth);
    const node: OutlineNode = {
      key,
      path,
      kind,
      depth,
      preview: previewOf(value, kind),
      line: depth === 0 ? 1 : nextLineFor(key),
    };

    if (kind === "object") {
      const entries = Object.entries(value as Record<string, unknown>);
      node.childCount = entries.length;
      node.children = entries.map(([k, v]) => {
        keyCount += 1;
        return walk(v, k, `${path}.${k}`, depth + 1);
      });
    } else if (kind === "array") {
      const items = value as unknown[];
      node.childCount = items.length;
      node.children = items
        .slice(0, MAX_ARRAY_ITEMS)
        .map((v, i) => walk(v, `[${i}]`, `${path}[${i}]`, depth + 1));
      // Keep the line cursor in step with the document for the items we chose
      // not to render, or every key after this array points at the wrong line.
      for (const skipped of items.slice(MAX_ARRAY_ITEMS)) consume(skipped);
    }
    return node;
  };

  const root = walk(parsed, "root", "$", 0);
  return { nodes: [root], keyCount, maxDepth };
}
