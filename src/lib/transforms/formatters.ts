import type { TransformDef, TransformResult, Opts } from "./types";
import { parseJsonError } from "./util";

const INDENT_OPTIONS = [
  { value: "2", label: "2 spaces" },
  { value: "4", label: "4 spaces" },
  { value: "tab", label: "Tab" },
  { value: "0", label: "Minify" },
];

function indentUnit(value: string): string {
  if (value === "tab") return "\t";
  return " ".repeat(Number(value) || 0);
}

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>;
    return Object.keys(source)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortDeep(source[key]);
        return acc;
      }, {});
  }
  return value;
}

export const jsonFormat: TransformDef = {
  id: "json-format",
  name: "JSON Format",
  chip: "JSON · Format",
  category: "formatters",
  blurb: "Parse and re-print JSON, with the failure pointed at a line and column.",
  legacyPaths: ["/tools/json-formatter", "/tools/json-decoder"],
  produces: "json",
  options: [
    { key: "indent", label: "Indent", type: "select", options: INDENT_OPTIONS, default: "2" },
    { key: "sortKeys", label: "sort keys", type: "toggle", default: false },
  ],
  run(input, opts) {
    if (!input.trim()) return { output: "", language: "json" };
    try {
      const parsed = JSON.parse(input);
      const shaped = opts.sortKeys ? sortDeep(parsed) : parsed;
      const unit = String(opts.indent);
      const output =
        unit === "0" ? JSON.stringify(shaped) : JSON.stringify(shaped, null, indentUnit(unit));
      return { output, language: "json" };
    } catch (err) {
      return { output: "", language: "json", error: parseJsonError(input, err) };
    }
  },
  shell: (opts) => {
    const indent = String(opts.indent);
    const sort = opts.sortKeys ? "S" : "";
    // `-S` sorts every object, which is what sortDeep does; jq's own default
    // indent is 2, so only the other widths need saying out loud.
    if (indent === "0") return `jq -c${sort} .`;
    const shape = indent === "tab" ? " --tab" : indent === "2" ? "" : ` --indent ${Number(indent) || 2}`;
    return `jq${sort ? " -S" : ""}${shape} .`;
  },
  node: (opts) => {
    const indent = opts.indent === "tab" ? `"\\t"` : Number(opts.indent) || 0;
    if (!opts.sortKeys) return `JSON.stringify(JSON.parse(input), null, ${indent})`;
    // A JSON.stringify replacer cannot reorder keys, so sorting has to rebuild
    // the value — the same walk run() does, inlined to keep this one expression.
    const sorter =
      `(function sort(v) { return Array.isArray(v) ? v.map(sort) ` +
      `: v && typeof v === "object" ? Object.keys(v).sort().reduce((acc, k) => (acc[k] = sort(v[k]), acc), {}) : v; })`;
    return `JSON.stringify(${sorter}(JSON.parse(input)), null, ${indent})`;
  },
  python: (opts) => {
    const sort = opts.sortKeys ? ", sort_keys=True" : "";
    // json.dumps(indent=None) still puts a space after ":" and ",", so it is
    // not the same string as JSON.stringify with no indent.
    if (String(opts.indent) === "0") {
      return `json.dumps(json.loads(text), separators=(",", ":")${sort})`;
    }
    const indent = opts.indent === "tab" ? `"\\t"` : Number(opts.indent);
    return `json.dumps(json.loads(text), indent=${indent}${sort})`;
  },
};

const WORD_CHAR = /[A-Za-z0-9_$]/;

/**
 * A `/` opens a regex literal only where a value may start. These are the
 * characters that can legally precede one; `)` and `]` are deliberately absent,
 * because `(a + b) / c` and `xs[0] / 2` are division.
 */
const REGEX_PREFIX = new Set([..."(,=:[!&|?{};+-*~^%"]);
/** The same thing for words: `return /x/` is a regex, `total /x/` is not. */
const REGEX_KEYWORDS = new Set([
  "return", "typeof", "case", "in", "of", "new", "delete", "void", "throw", "do", "else", "yield", "await",
]);

/** End offset (exclusive) of the regex literal starting at `start`, or -1 if it is not one. */
function findRegexEnd(source: string, start: number): number {
  let i = start + 1;
  let inClass = false;
  while (i < source.length) {
    const c = source[i];
    // A regex literal never spans a line; if we ran into one we mis-read a division.
    if (c === "\n" || c === "\r") return -1;
    if (c === "\\") {
      i += 2;
      continue;
    }
    // Inside `[...]` a `/` is an ordinary character.
    if (c === "[") inClass = true;
    else if (c === "]") inClass = false;
    else if (c === "/" && !inClass) {
      i += 1;
      while (i < source.length && /[a-z]/i.test(source[i])) i += 1; // flags
      return i;
    }
    i += 1;
  }
  return -1;
}

/** End offset (exclusive) of the `url(...)` token whose `(` was consumed up to `start`. */
function findUrlEnd(source: string, start: number): number {
  let i = start;
  while (i < source.length) {
    const c = source[i];
    if (c === '"' || c === "'") {
      const close = source.indexOf(c, i + 1);
      if (close === -1) return source.length;
      i = close + 1;
      continue;
    }
    if (c === ")") return i + 1;
    // Unterminated: stop at the end of the block rather than eating the stylesheet.
    if (c === "}") return i;
    i += 1;
  }
  return source.length;
}

/**
 * A token-aware beautifier. It deliberately does NOT evaluate the input —
 * the build this replaced ran `eval()` on whatever you pasted, which both
 * executed arbitrary code and quietly turned real JavaScript into JSON.
 */
function beautifyBraces(source: string, unit: string, language: "javascript" | "css"): string {
  const js = language === "javascript";
  const out: string[] = [];
  /** `parens` per block: a `{` starts a fresh statement context, a `}` restores the old one. */
  const parenStack: number[] = [];
  let depth = 0;
  let parens = 0;
  let line = "";
  let i = 0;
  const n = source.length;

  // What came before decides whether a `/` divides or opens a regex.
  let lastSig = "";
  let word = "";
  let lastWord = "";

  const flush = () => {
    const trimmed = line.trim();
    if (trimmed.length) out.push(unit.repeat(Math.max(0, depth)) + trimmed);
    line = "";
  };

  const remember = (ch: string) => {
    if (WORD_CHAR.test(ch)) {
      word += ch;
      lastSig = ch;
      return;
    }
    if (word) {
      lastWord = word;
      word = "";
    }
    if (!/\s/.test(ch)) lastSig = ch;
  };
  /** A whole string, regex, url() or comment counts as one opaque thing. */
  const rememberToken = (ch: string) => {
    lastSig = ch;
    word = "";
    lastWord = "";
  };

  const startsRegex = () =>
    lastSig === "" ||
    REGEX_PREFIX.has(lastSig) ||
    (WORD_CHAR.test(lastSig) && REGEX_KEYWORDS.has(word || lastWord));

  while (i < n) {
    const c = source[i];

    // An unquoted url() token may not contain whitespace, so it is copied
    // verbatim: re-spacing `url(data:image/png;base64,…)` invalidates it.
    if (!js && !word && (c === "u" || c === "U") && /^url\(/i.test(source.slice(i, i + 4))) {
      const end = findUrlEnd(source, i + 4);
      line += source.slice(i, end);
      i = end;
      rememberToken(")");
      continue;
    }

    // Template literals pass through untouched, including a `${ }` that holds
    // another template: the closing backtick is only the one at nesting depth 0.
    if (c === "`") {
      line += c;
      i += 1;
      const expr: number[] = [0];
      while (i < n) {
        const ch = source[i];
        if (ch === "\\") {
          line += source.slice(i, i + 2);
          i += 2;
          continue;
        }
        if (ch === "$" && source[i + 1] === "{") {
          expr[expr.length - 1] += 1;
          line += "${";
          i += 2;
          continue;
        }
        if (ch === "}" && expr[expr.length - 1] > 0) {
          expr[expr.length - 1] -= 1;
          line += ch;
          i += 1;
          continue;
        }
        if ((ch === '"' || ch === "'") && expr[expr.length - 1] > 0) {
          // A quoted string inside `${ }` may hold a backtick of its own.
          const quote = ch;
          line += ch;
          i += 1;
          while (i < n && source[i] !== "\n") {
            if (source[i] === "\\") {
              line += source.slice(i, i + 2);
              i += 2;
              continue;
            }
            line += source[i];
            i += 1;
            if (source[i - 1] === quote) break;
          }
          continue;
        }
        line += ch;
        i += 1;
        if (ch === "`") {
          if (expr[expr.length - 1] > 0) expr.push(0); // a template opened inside `${ }`
          else {
            expr.pop();
            if (!expr.length) break;
          }
        }
      }
      rememberToken("`");
      continue;
    }

    // Strings pass through untouched. Neither language lets a raw newline sit
    // inside one, so a stray quote stops at the line end instead of swallowing
    // the rest of the file.
    if (c === '"' || c === "'") {
      const quote = c;
      line += c;
      i += 1;
      while (i < n) {
        if (source[i] === "\\") {
          line += source.slice(i, i + 2);
          i += 2;
          continue;
        }
        if (source[i] === "\n" || source[i] === "\r") break;
        line += source[i];
        i += 1;
        if (source[i - 1] === quote) break;
      }
      rememberToken(quote);
      continue;
    }

    // `//` is read as a line comment in CSS too. It is not standard CSS, but it
    // is a common habit, and the alternative — falling through — let the
    // apostrophe in `// it's red` open a string that ran to end of file.
    if (c === "/" && source[i + 1] === "/") {
      const end = source.indexOf("\n", i);
      line = line.replace(/\s+$/, "");
      line += (line ? " " : "") + source.slice(i, end === -1 ? n : end).trim();
      i = end === -1 ? n : end;
      flush();
      rememberToken("");
      continue;
    }

    if (c === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      const block = source.slice(i, end === -1 ? n : end + 2);
      i = end === -1 ? n : end + 2;
      flush();
      for (const raw of block.split("\n")) out.push(unit.repeat(depth) + raw.trim());
      rememberToken("");
      continue;
    }

    // A regex literal is one token: its `//`, `{`, `}` and `;` are not code.
    if (js && c === "/" && startsRegex()) {
      const end = findRegexEnd(source, i);
      if (end !== -1) {
        line += source.slice(i, end);
        i = end;
        rememberToken("/");
        continue;
      }
    }

    if (c === "{") {
      line = line.replace(/\s+$/, "");
      line += line === "" || /[([{]$/.test(line) ? "{" : " {";
      flush();
      depth += 1;
      // A block body is its own statement context. Without this, a `{` opened
      // inside an unclosed call — `items.forEach(function (x) {` — kept
      // `parens > 0`, and every `;` in the body joined one line.
      parenStack.push(parens);
      parens = 0;
      i += 1;
      remember("{");
      continue;
    }

    if (c === "}") {
      flush();
      depth = Math.max(0, depth - 1);
      line = "}";
      parens = parenStack.pop() ?? 0;
      i += 1;
      remember("}");
      continue;
    }

    if (c === ";") {
      // `for (a; b; c)` keeps its semicolons on one line.
      if (parens > 0) {
        line += "; ";
        i += 1;
        remember(";");
        continue;
      }
      line += ";";
      flush();
      i += 1;
      remember(";");
      continue;
    }

    if (c === "(") {
      parens += 1;
      line += c;
      i += 1;
      remember(c);
      continue;
    }
    if (c === ")") {
      parens = Math.max(0, parens - 1);
      line += c;
      i += 1;
      remember(c);
      continue;
    }

    // We re-decide every line break ourselves.
    if (c === "\n" || c === "\r") {
      i += 1;
      remember(c);
      continue;
    }
    if (c === " " || c === "\t") {
      if (line && !line.endsWith(" ")) line += " ";
      i += 1;
      remember(c);
      continue;
    }

    line += c;
    i += 1;
    remember(c);
  }

  flush();
  return out.join("\n");
}

export const jsFormat: TransformDef = {
  id: "js-format",
  name: "JavaScript Format",
  chip: "JS · Format",
  category: "formatters",
  blurb: "Re-indent JavaScript without executing a single line of it.",
  legacyPaths: ["/tools/js-formatter"],
  produces: "javascript",
  options: [{ key: "indent", label: "Indent", type: "select", options: INDENT_OPTIONS.slice(0, 3), default: "2" }],
  run(input, opts) {
    if (!input.trim()) return { output: "", language: "javascript" };
    return { output: beautifyBraces(input, indentUnit(String(opts.indent)), "javascript"), language: "javascript" };
  },
  shell: () => null,
  node: () => null,
  python: () => null,
};

export const cssFormat: TransformDef = {
  id: "css-format",
  name: "CSS Format",
  chip: "CSS · Format",
  category: "formatters",
  blurb: "Re-indent stylesheets, leaving strings, comments and url() alone.",
  legacyPaths: ["/tools/css-formatter", "/tools/css-compressor"],
  produces: "css",
  options: [{ key: "indent", label: "Indent", type: "select", options: INDENT_OPTIONS, default: "2" }],
  run(input, opts) {
    if (!input.trim()) return { output: "", language: "css" };
    if (String(opts.indent) === "0") {
      const minified = input
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\s+/g, " ")
        .replace(/\s*([{}:;,>~+])\s*/g, "$1")
        .replace(/;}/g, "}")
        .trim();
      return { output: minified, language: "css", notes: ["minified"] };
    }
    return { output: beautifyBraces(input, indentUnit(String(opts.indent)), "css"), language: "css" };
  },
  shell: () => null,
  node: () => null,
  python: () => null,
};

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);
const OPAQUE_ELEMENTS = new Set(["pre", "script", "style", "textarea"]);

/**
 * Offset of the `>` that closes the tag starting at `start`, or -1. Quoted
 * attribute values are skipped, so `<a title="a>b">` is one tag and not two.
 */
function findTagEnd(source: string, start: number): number {
  let i = start + 1;
  while (i < source.length) {
    const c = source[i];
    if (c === '"' || c === "'") {
      const close = source.indexOf(c, i + 1);
      if (close === -1) return -1;
      i = close + 1;
      continue;
    }
    if (c === ">") return i;
    i += 1;
  }
  return -1;
}

/**
 * Tag-walking rather than DOMParser: a round-trip through the DOM invents an
 * <html><head><body> wrapper around a fragment and drops anything it dislikes,
 * which is the wrong answer when someone pastes half a template.
 */
function formatHtml(source: string, unit: string): string {
  const out: string[] = [];
  const lower = source.toLowerCase();
  let depth = 0;
  let i = 0;
  const n = source.length;

  const pushText = (chunk: string) => {
    const text = chunk.replace(/\s+/g, " ").trim();
    if (text) out.push(unit.repeat(depth) + text);
  };
  /** A `<` only opens markup if something closes it: `a < b` is prose. */
  const isTagStart = (p: number) =>
    source[p] === "<" &&
    (source.startsWith("<!--", p) ||
      (/[a-zA-Z!/?]/.test(source[p + 1] ?? "") && findTagEnd(source, p) !== -1));
  const nextTag = (from: number) => {
    let p = source.indexOf("<", from);
    while (p !== -1 && !isTagStart(p)) p = source.indexOf("<", p + 1);
    return p === -1 ? n : p;
  };

  while (i < n) {
    if (!isTagStart(i)) {
      const end = nextTag(i + 1);
      pushText(source.slice(i, end));
      i = end;
      continue;
    }

    // Comments first: `<!-- a > b -->` ends at `-->`, not at the first `>`.
    if (source.startsWith("<!--", i)) {
      const end = source.indexOf("-->", i + 4);
      out.push(unit.repeat(depth) + source.slice(i, end === -1 ? n : end + 3).trim());
      i = end === -1 ? n : end + 3;
      continue;
    }

    const close = findTagEnd(source, i);
    const token = source.slice(i, close + 1);
    i = close + 1;

    if (/^<[!?]/.test(token)) {
      out.push(unit.repeat(depth) + token.trim());
      continue;
    }

    const closing = /^<\//.test(token);
    const name = (/^<\/?\s*([a-zA-Z][\w:-]*)/.exec(token)?.[1] ?? "").toLowerCase();
    const selfClosing = /\/>$/.test(token) || VOID_ELEMENTS.has(name);

    if (closing) {
      depth = Math.max(0, depth - 1);
      out.push(unit.repeat(depth) + token.trim());
      continue;
    }

    out.push(unit.repeat(depth) + token.trim());
    if (selfClosing) continue;
    depth += 1;

    if (!OPAQUE_ELEMENTS.has(name)) continue;
    // The body of script/style/pre/textarea is not markup: scan for the literal
    // closing tag instead of tokenizing, or `if (a < b)` looks like a tag and
    // the element never closes. The closing tag itself goes round the loop.
    const end = lower.indexOf(`</${name}`, i);
    const body = source.slice(i, end === -1 ? n : end).replace(/^\n+|\s+$/g, "");
    if (body) for (const raw of body.split("\n")) out.push(unit.repeat(depth) + raw.trim());
    i = end === -1 ? n : end;
  }

  return out.join("\n");
}

export const htmlFormat: TransformDef = {
  id: "html-format",
  name: "HTML Format",
  chip: "HTML · Format",
  category: "formatters",
  blurb: "Indent markup by nesting depth, keeping pre, script and style verbatim.",
  legacyPaths: ["/tools/html-formatter"],
  produces: "html",
  options: [{ key: "indent", label: "Indent", type: "select", options: INDENT_OPTIONS.slice(0, 3), default: "2" }],
  run(input, opts) {
    if (!input.trim()) return { output: "", language: "html" };
    return { output: formatHtml(input, indentUnit(String(opts.indent))), language: "html" };
  },
  shell: () => null,
  node: () => null,
  python: () => null,
};

const SQL_CLAUSES = [
  "SELECT", "FROM", "WHERE", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "OFFSET",
  "INNER JOIN", "LEFT OUTER JOIN", "RIGHT OUTER JOIN", "FULL OUTER JOIN",
  "LEFT JOIN", "RIGHT JOIN", "OUTER JOIN", "CROSS JOIN", "JOIN",
  "UNION ALL", "UNION", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM",
  "CREATE TABLE", "ALTER TABLE", "DROP TABLE", "RETURNING", "WITH",
];
const SQL_INLINE = [
  "AND", "OR", "NOT", "IN", "EXISTS", "BETWEEN", "LIKE", "ILIKE", "IS", "NULL",
  "AS", "ON", "ASC", "DESC", "DISTINCT", "CASE", "WHEN", "THEN", "ELSE", "END",
  "COUNT", "SUM", "AVG", "MIN", "MAX", "COALESCE", "CAST",
];

/** Split SQL into string-literal and code segments so we never touch a literal. */
function splitSqlLiterals(source: string): { text: string; literal: boolean }[] {
  const parts: { text: string; literal: boolean }[] = [];
  let buffer = "";
  let i = 0;
  while (i < source.length) {
    const c = source[i];
    if (c === "'" || c === '"') {
      if (buffer) parts.push({ text: buffer, literal: false });
      buffer = "";
      const quote = c;
      let literal = c;
      i += 1;
      while (i < source.length) {
        // A doubled quote is an escaped quote, not the end: `'it''s'` is one
        // literal. Breaking on its second half put `s from Bob` back in the
        // code stream, where the clause pass rewrote the inside of a string.
        if (source[i] === quote && source[i + 1] === quote) {
          literal += quote + quote;
          i += 2;
          continue;
        }
        literal += source[i];
        i += 1;
        if (source[i - 1] === quote) break;
      }
      parts.push({ text: literal, literal: true });
      continue;
    }
    buffer += c;
    i += 1;
  }
  if (buffer) parts.push({ text: buffer, literal: false });
  return parts;
}

function formatSql(source: string, unit: string, uppercase: boolean): string {
  const segments = splitSqlLiterals(source.replace(/\s+/g, " ").trim());

  // One pass per concern, with a single alternation each. Replacing clause by
  // clause in a loop re-matched the tail of a multi-word clause: "INNER JOIN"
  // became "\nINNER" + "\nJOIN". The alternation is ordered longest-first, and
  // JavaScript alternation is leftmost-first, so the long form always wins.
  const alternation = (words: string[]) =>
    words.map((w) => w.replace(/ /g, "\\s+")).join("|");
  const canonical = new Map(
    [...SQL_CLAUSES, ...SQL_INLINE].map((word) => [word.replace(/\s+/g, " ").toUpperCase(), word]),
  );
  const spell = (match: string) =>
    canonical.get(match.replace(/\s+/g, " ").toUpperCase()) ?? match;

  const keywordRe = new RegExp(`\\b(?:${alternation([...SQL_CLAUSES, ...SQL_INLINE])})\\b`, "gi");
  const clauseRe = new RegExp(`\\b(?:${alternation(SQL_CLAUSES)})\\b`, "gi");

  const marked = segments
    .map(({ text, literal }) => {
      if (literal) return text;
      const cased = uppercase ? text.replace(keywordRe, spell) : text;
      return cased.replace(clauseRe, (match) => `\n${spell(match)}`);
    })
    .join("");

  const lines: string[] = [];
  let depth = 0;
  for (const raw of marked.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const opens = (line.match(/\(/g) ?? []).length;
    const closes = (line.match(/\)/g) ?? []).length;
    if (line.startsWith(")")) depth = Math.max(0, depth - 1);
    lines.push(unit.repeat(depth) + line);
    depth = Math.max(0, depth + opens - closes);
  }
  return lines.join("\n");
}

export const sqlFormat: TransformDef = {
  id: "sql-format",
  name: "SQL Format",
  chip: "SQL · Format",
  category: "formatters",
  blurb: "One clause per line, keywords cased, string literals left exactly as written.",
  legacyPaths: ["/tools/sql-formatter"],
  produces: "sql",
  options: [
    { key: "indent", label: "Indent", type: "select", options: INDENT_OPTIONS.slice(0, 3), default: "2" },
    { key: "uppercase", label: "upper keywords", type: "toggle", default: true },
  ],
  run(input, opts) {
    if (!input.trim()) return { output: "", language: "sql" };
    return {
      output: formatSql(input, indentUnit(String(opts.indent)), Boolean(opts.uppercase)),
      language: "sql",
    };
  },
  shell: () => null,
  node: () => null,
  python: () => null,
};

export const formatters = [jsonFormat, jsFormat, htmlFormat, cssFormat, sqlFormat];
