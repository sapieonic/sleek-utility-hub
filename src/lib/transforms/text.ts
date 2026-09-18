import type { TransformDef } from "./types";
import { shq } from "./types";

/**
 * The word boundaries camel, snake and kebab share. Lower-casing first and
 * stripping afterwards destroyed the boundaries inside myVariableName and ate
 * every letter that is not a–z, so split first and re-case per mode instead.
 */
function words(text: string): string[] {
  return text.match(/\p{Lu}?\p{Ll}+|\p{Lu}+(?!\p{Ll})|\p{N}+/gu) ?? [];
}

export const changeCase: TransformDef = {
  id: "case",
  name: "Change Case",
  chip: "Text · Case",
  category: "text",
  blurb: "Upper, lower, title, sentence, camel, snake, kebab or inverted.",
  legacyPaths: ["/tools/string-utilities"],
  produces: "same",
  options: [
    {
      key: "mode",
      label: "Case",
      type: "select",
      default: "upper",
      options: [
        { value: "upper", label: "UPPER" },
        { value: "lower", label: "lower" },
        { value: "title", label: "Title Case" },
        { value: "sentence", label: "Sentence case" },
        { value: "camel", label: "camelCase" },
        { value: "snake", label: "snake_case" },
        { value: "kebab", label: "kebab-case" },
        { value: "toggle", label: "iNVERTED" },
      ],
    },
  ],
  run(input, opts) {
    if (!input) return { output: "" };
    const text = input;
    switch (opts.mode) {
      case "lower":
        return { output: text.toLowerCase() };
      case "title":
        return {
          output: text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
        };
      case "sentence":
        return {
          output: text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()),
        };
      case "camel":
        return {
          output: words(text)
            .map((w, i) =>
              i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
            )
            .join(""),
        };
      case "snake":
        return { output: words(text).map((w) => w.toLowerCase()).join("_") };
      case "kebab":
        return { output: words(text).map((w) => w.toLowerCase()).join("-") };
      case "toggle":
        return {
          output: Array.from(text)
            .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
            .join(""),
        };
      default:
        return { output: text.toUpperCase() };
    }
  },
  shell: (opts) =>
    opts.mode === "upper" ? "tr '[:lower:]' '[:upper:]'" : opts.mode === "lower" ? "tr '[:upper:]' '[:lower:]'" : null,
  node: () => null,
  python: () => null,
};

export const whitespace: TransformDef = {
  id: "whitespace",
  name: "Whitespace",
  chip: "Text · Whitespace",
  category: "text",
  blurb: "Trim, collapse runs of spaces, drop blank lines or strip it all out.",
  legacyPaths: ["/tools/string-utilities"],
  produces: "same",
  options: [
    {
      key: "mode",
      label: "Mode",
      type: "select",
      default: "trimLines",
      options: [
        { value: "trimLines", label: "trim each line" },
        { value: "collapse", label: "collapse spaces" },
        { value: "blank", label: "remove blank lines" },
        { value: "all", label: "remove all whitespace" },
        { value: "unwrap", label: "join into one line" },
      ],
    },
  ],
  run(input, opts) {
    if (!input) return { output: "" };
    switch (opts.mode) {
      case "collapse":
        return { output: input.replace(/[^\S\n]+/g, " ").replace(/ *\n */g, "\n").trim() };
      case "blank":
        return { output: input.split("\n").filter((l) => l.trim()).join("\n") };
      case "all":
        return { output: input.replace(/\s/g, "") };
      case "unwrap":
        return { output: input.replace(/\s+/g, " ").trim() };
      default:
        return { output: input.split("\n").map((l) => l.trim()).join("\n") };
    }
  },
  shell: (opts) => (opts.mode === "blank" ? "grep -v '^[[:space:]]*$'" : null),
  node: () => null,
  python: () => null,
};

export const findReplace: TransformDef = {
  id: "replace",
  name: "Find and Replace",
  chip: "Text · Replace",
  category: "text",
  blurb: "Literal or regular-expression replacement, counted.",
  legacyPaths: ["/tools/string-utilities"],
  produces: "same",
  options: [
    { key: "find", label: "Find", type: "text", default: "", placeholder: "find", width: 120 },
    { key: "replace", label: "Replace", type: "text", default: "", placeholder: "replace", width: 120 },
    { key: "regex", label: "regex", type: "toggle", default: false },
    { key: "caseSensitive", label: "match case", type: "toggle", default: true },
  ],
  run(input, opts) {
    const find = String(opts.find ?? "");
    if (!input || !find) return { output: input };
    const replace = String(opts.replace ?? "");
    const flags = `g${opts.caseSensitive ? "" : "i"}`;
    try {
      const pattern = opts.regex ? find : find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(pattern, flags);
      const matches = input.match(re)?.length ?? 0;
      return {
        output: input.replace(re, replace),
        notes: [`${matches} ${matches === 1 ? "replacement" : "replacements"}`],
      };
    } catch (err) {
      return {
        output: "",
        error: {
          message: "Invalid regular expression",
          hint: err instanceof Error ? err.message : undefined,
        },
      };
    }
  },
  shell: (opts) => {
    const find = String(opts.find ?? "");
    if (!find) return null;
    const replace = String(opts.replace ?? "");
    // sed works a line at a time, and its right-hand side has no equivalent of
    // a JS $-substitution, so neither case has a faithful command.
    if (/\n/.test(find) || /\n/.test(replace)) return null;
    if (/\$[$&`'\d]/.test(replace)) return null;
    // Literal mode escapes the same metacharacters run() does; `&` on the right
    // is sed's whole-match reference and has to go too.
    const pattern = opts.regex ? find : find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const body = `s/${pattern.replace(/\//g, "\\/")}/${replace.replace(/[&\\]/g, "\\$&").replace(/\//g, "\\/")}/g${opts.caseSensitive ? "" : "I"}`;
    return `sed -E ${shq(body)}`;
  },
  node: (opts) => {
    const find = String(opts.find ?? "");
    if (!find) return null;
    const pattern = opts.regex ? find : find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const flags = `g${opts.caseSensitive ? "" : "i"}`;
    return `input.replace(new RegExp(${JSON.stringify(pattern)}, ${JSON.stringify(flags)}), ${JSON.stringify(String(opts.replace ?? ""))})`;
  },
  python: () => null,
};

export const lines: TransformDef = {
  id: "lines",
  name: "Sort and Filter Lines",
  chip: "Text · Lines",
  category: "text",
  blurb: "Sort, reverse, de-duplicate or number the lines.",
  legacyPaths: ["/tools/string-utilities", "/tools/sorting-list"],
  produces: "same",
  options: [
    {
      key: "mode",
      label: "Mode",
      type: "select",
      default: "sortAsc",
      options: [
        { value: "sortAsc", label: "sort A→Z" },
        { value: "sortDesc", label: "sort Z→A" },
        { value: "numeric", label: "sort numerically" },
        { value: "reverse", label: "reverse" },
        { value: "unique", label: "unique" },
        { value: "number", label: "number lines" },
      ],
    },
  ],
  run(input, opts) {
    if (!input) return { output: "" };
    const all = input.split("\n");
    switch (opts.mode) {
      case "sortDesc":
        return { output: [...all].sort((a, b) => b.localeCompare(a)).join("\n") };
      case "numeric":
        return {
          output: [...all]
            .sort((a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0))
            .join("\n"),
        };
      case "reverse":
        return { output: [...all].reverse().join("\n") };
      case "unique": {
        const seen = new Set<string>();
        const kept = all.filter((l) => (seen.has(l) ? false : (seen.add(l), true)));
        return { output: kept.join("\n"), notes: [`${all.length - kept.length} removed`] };
      }
      case "number": {
        const width = String(all.length).length;
        return {
          output: all.map((l, i) => `${String(i + 1).padStart(width, " ")}  ${l}`).join("\n"),
        };
      }
      default:
        return { output: [...all].sort((a, b) => a.localeCompare(b)).join("\n") };
    }
  },
  // sortAsc/sortDesc have no command: run() sorts with localeCompare, while a
  // shell sort is byte-ordered and puts "Banana" before "apple". `nl -ba` has
  // no command either — fixed six-column field and a tab, against a width
  // computed from the line count and two spaces here.
  shell: (opts) =>
    opts.mode === "numeric"
      ? "sort -n"
      : opts.mode === "unique"
        ? "awk '!seen[$0]++'"
        : opts.mode === "reverse"
          ? "tail -r"
          : null,
  node: () => null,
  python: () => null,
};

export const strip: TransformDef = {
  id: "strip",
  name: "Strip Characters",
  chip: "Text · Strip",
  category: "text",
  blurb: "Remove digits, punctuation, or anything that is not printable ASCII.",
  legacyPaths: ["/tools/string-utilities"],
  produces: "same",
  options: [
    {
      key: "mode",
      label: "Remove",
      type: "select",
      default: "digits",
      options: [
        { value: "digits", label: "digits" },
        { value: "punctuation", label: "punctuation" },
        { value: "nonAscii", label: "non-ASCII" },
        { value: "ansi", label: "ANSI colour codes" },
      ],
    },
  ],
  run(input, opts) {
    if (!input) return { output: "" };
    switch (opts.mode) {
      case "punctuation":
        return { output: input.replace(/[^\w\s]/g, "") };
      case "nonAscii":
        // eslint-disable-next-line no-control-regex
        return { output: input.replace(/[^\x00-\x7F]/g, "") };
      case "ansi":
        // eslint-disable-next-line no-control-regex
        return { output: input.replace(/\x1B\[[0-9;]*[A-Za-z]/g, "") };
      default:
        return { output: input.replace(/[0-9]/g, "") };
    }
  },
  shell: () => null,
  node: () => null,
  python: () => null,
};

export const textTransforms = [changeCase, whitespace, findReplace, lines, strip];
