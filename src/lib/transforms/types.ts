export type Lang =
  | "json"
  | "javascript"
  | "html"
  | "css"
  | "sql"
  | "xml"
  | "markdown"
  | "text";

export type Category = "formatters" | "encoders" | "converters" | "text";

export interface TransformError {
  message: string;
  /** 1-based position in the *input*, when the failure has one. */
  line?: number;
  column?: number;
  /** A one-line nudge toward the fix, when there is an obvious one. */
  hint?: string;
}

export interface TransformResult {
  output: string;
  /** What the output is, so the next step and the editor know how to treat it. */
  language?: Lang;
  /** Short factual notes shown on the step card, e.g. "1 replacement". */
  notes?: string[];
  error?: TransformError;
}

export interface OptionDef {
  key: string;
  label: string;
  type: "select" | "toggle" | "text";
  options?: { value: string; label: string }[];
  default: string | boolean;
  placeholder?: string;
  /** Rendered width in px for text inputs. */
  width?: number;
}

export type Opts = Record<string, string | boolean>;

export interface TransformDef {
  id: string;
  /** Name in the library and the palette, e.g. "Base64 Decode". */
  name: string;
  /** Two-part label on a pipeline chip, e.g. "Base64 · Decode". */
  chip: string;
  category: Category;
  blurb: string;
  /** Routes the pre-workspace build used, so old links keep working. */
  legacyPaths?: string[];
  produces: Lang | "same";
  options?: OptionDef[];
  run: (input: string, opts: Opts) => TransformResult;
  /** Equivalent for someone who would rather not use a GUI. `null` = no faithful equivalent. */
  shell?: (opts: Opts) => string | null;
  node?: (opts: Opts) => string | null;
  python?: (opts: Opts) => string | null;
}

export function defaults(def: TransformDef): Opts {
  const out: Opts = {};
  for (const o of def.options ?? []) out[o.key] = o.default;
  return out;
}

/** Single-quote a string for POSIX shells. */
export function shq(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}
