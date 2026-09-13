import React, { useEffect, useMemo, useState } from "react";
import type { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { diffLines } from "diff";
import { marked } from "marked";
import type { Lang } from "@/lib/transforms";
import { CodePane } from "./CodePane";
import { Icon } from "./Icon";
import { Mono } from "./Chrome";

export type OutputMode = "raw" | "preview" | "diff";

const MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';

/** Only these two have a rendering worth showing; everything else is just text. */
const PREVIEWABLE: Lang[] = ["markdown", "html"];

/** Unchanged lines kept either side of a change before we fold the rest away. */
const CONTEXT = 3;

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

/* ------------------------------------------------------------------ preview */

/**
 * The iframe is a separate document, so it inherits none of our custom
 * properties. We read the ones the preview stylesheet needs off the root
 * element and inline their resolved values into the srcDoc instead.
 */
const PREVIEW_TOKENS = [
  "--wk-panel",
  "--wk-raised",
  "--wk-line",
  "--wk-text",
  "--wk-dim",
  "--wk-faint",
  "--wk-accent",
  "--wk-syn-str",
] as const;

type TokenName = (typeof PREVIEW_TOKENS)[number];
type TokenMap = Partial<Record<TokenName, string>>;

function readTokens(): TokenMap {
  if (typeof document === "undefined") return {};
  const computed = getComputedStyle(document.documentElement);
  const out: TokenMap = {};
  for (const name of PREVIEW_TOKENS) {
    const value = computed.getPropertyValue(name).trim();
    if (value) out[name] = value;
  }
  return out;
}

/**
 * The srcDoc holds a snapshot of the theme, so re-read it when the root
 * element's class flips between light and dark.
 */
function useThemeRevision(): number {
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const observer = new MutationObserver(() => setRevision((n) => n + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  return revision;
}

/**
 * Wrap already-rendered HTML in a legible document. Every colour falls back to
 * a CSS system colour so a missing token degrades rather than disappears.
 */
function previewDocument(body: string, tokens: TokenMap): string {
  const vars = PREVIEW_TOKENS.filter((name) => tokens[name])
    .map((name) => `${name}: ${tokens[name]};`)
    .join(" ");

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>
:root { ${vars} }
* { box-sizing: border-box; }
html { background: var(--wk-panel, Canvas); }
body {
  margin: 0;
  padding: 18px 22px 40px;
  background: var(--wk-panel, Canvas);
  color: var(--wk-text, CanvasText);
  font-family: "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 13.5px;
  line-height: 1.65;
  word-wrap: break-word;
}
h1, h2, h3, h4, h5, h6 { margin: 1.4em 0 0.5em; line-height: 1.3; font-weight: 600; }
h1 { font-size: 1.7em; } h2 { font-size: 1.35em; } h3 { font-size: 1.15em; }
h4, h5, h6 { font-size: 1em; }
h1, h2 { padding-bottom: 0.28em; border-bottom: 1px solid var(--wk-line, GrayText); }
:is(h1, h2, h3, h4, h5, h6):first-child { margin-top: 0; }
p, ul, ol, blockquote, table, pre { margin: 0 0 0.9em; }
a { color: var(--wk-accent, LinkText); text-decoration: underline; text-underline-offset: 2px; }
ul, ol { padding-left: 1.5em; }
li { margin: 0.18em 0; }
blockquote {
  padding: 0.1em 0 0.1em 0.9em;
  border-left: 2px solid var(--wk-line, GrayText);
  color: var(--wk-dim, GrayText);
}
code, kbd, samp {
  font-family: ${MONO.replace(/"/g, "'")};
  font-size: 0.86em;
}
:not(pre) > code {
  background: var(--wk-raised, Canvas);
  border: 1px solid var(--wk-line, GrayText);
  border-radius: 4px;
  padding: 0.1em 0.34em;
}
pre {
  background: var(--wk-raised, Canvas);
  border: 1px solid var(--wk-line, GrayText);
  border-radius: 6px;
  padding: 10px 12px;
  overflow-x: auto;
  line-height: 1.55;
}
pre code { background: none; border: 0; padding: 0; }
table { border-collapse: collapse; width: auto; max-width: 100%; display: block; overflow-x: auto; }
th, td {
  border: 1px solid var(--wk-line, GrayText);
  padding: 5px 10px;
  text-align: left;
  font-size: 0.94em;
}
th { background: var(--wk-raised, Canvas); font-weight: 600; }
hr { border: 0; border-top: 1px solid var(--wk-line, GrayText); margin: 1.6em 0; }
img { max-width: 100%; height: auto; }
del { color: var(--wk-faint, GrayText); }
input[type="checkbox"] { margin-right: 0.4em; }
::selection { background: var(--wk-accent, Highlight); color: var(--wk-panel, Canvas); }
</style></head><body>${body}</body></html>`;
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 items-start gap-[7px] px-4 py-4">
      <span style={{ color: "var(--wk-faint)", paddingTop: 1 }}>
        <Icon name="info" size={12} />
      </span>
      <p className="text-[11.5px] leading-[17px]" style={{ color: "var(--wk-faint)" }}>
        {children}
      </p>
    </div>
  );
}

function PreviewBody({ value, language }: { value: string; language: Lang }) {
  const revision = useThemeRevision();
  const tokens = useMemo(readTokens, [revision]);

  const srcDoc = useMemo(() => {
    if (language === "markdown") {
      let rendered: string;
      try {
        rendered = marked.parse(value, { gfm: true, breaks: true, async: false });
      } catch (error) {
        rendered = "";
        void error;
      }
      return previewDocument(rendered, tokens);
    }
    return previewDocument(value, tokens);
  }, [value, language, tokens]);

  if (!PREVIEWABLE.includes(language)) {
    return (
      <Notice>
        There is nothing to render for {language === "text" ? "plain text" : language}. Preview shows Markdown
        and HTML; for everything else the raw result is the whole story.
      </Notice>
    );
  }

  if (!value.trim()) {
    return <Notice>The result is empty, so the preview is too. It fills in as soon as there is output.</Notice>;
  }

  return (
    <div className="min-h-0 flex-1" style={{ background: "var(--wk-panel)" }}>
      <iframe
        title={`Rendered ${language} preview`}
        srcDoc={srcDoc}
        sandbox=""
        referrerPolicy="no-referrer"
        className="h-full w-full"
        style={{ border: 0, display: "block", background: "var(--wk-panel)" }}
      />
    </div>
  );
}

/* --------------------------------------------------------------------- diff */

type DiffRow =
  | { kind: "ctx"; text: string; oldNo: number; newNo: number }
  | { kind: "add"; text: string; newNo: number }
  | { kind: "del"; text: string; oldNo: number }
  | { kind: "gap"; hidden: number };

/** A chunk's `value` keeps its trailing newline; that is a separator, not a line. */
function toLines(chunk: string): string[] {
  if (!chunk) return [];
  const body = chunk.endsWith("\n") ? chunk.slice(0, -1) : chunk;
  return body.split("\n");
}

interface DiffModel {
  rows: DiffRow[];
  added: number;
  removed: number;
}

function buildDiff(oldText: string, newText: string): DiffModel {
  const parts = diffLines(oldText, newText);
  const rows: DiffRow[] = [];
  let oldNo = 0;
  let newNo = 0;
  let added = 0;
  let removed = 0;

  for (const part of parts) {
    for (const text of toLines(part.value)) {
      if (part.added) {
        newNo += 1;
        added += 1;
        rows.push({ kind: "add", text, newNo });
      } else if (part.removed) {
        oldNo += 1;
        removed += 1;
        rows.push({ kind: "del", text, oldNo });
      } else {
        oldNo += 1;
        newNo += 1;
        rows.push({ kind: "ctx", text, oldNo, newNo });
      }
    }
  }

  return { rows, added, removed };
}

/**
 * Keep every changed line plus CONTEXT lines either side; everything else
 * becomes a single fold row. A 500-line file with one edit renders 7 rows,
 * not 500.
 */
function collapse(rows: DiffRow[]): DiffRow[] {
  const keep = new Array<boolean>(rows.length).fill(false);
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (row.kind !== "add" && row.kind !== "del") continue;
    const from = Math.max(0, i - CONTEXT);
    const to = Math.min(rows.length - 1, i + CONTEXT);
    for (let j = from; j <= to; j += 1) keep[j] = true;
  }

  const out: DiffRow[] = [];
  let hidden = 0;
  for (let i = 0; i < rows.length; i += 1) {
    if (keep[i]) {
      if (hidden > 0) {
        out.push({ kind: "gap", hidden });
        hidden = 0;
      }
      out.push(rows[i]);
    } else {
      hidden += 1;
    }
  }
  if (hidden > 0) out.push({ kind: "gap", hidden });
  return out;
}

const ROW_TONE: Record<"ctx" | "add" | "del", { background?: string; marker: string; color: string }> = {
  ctx: { marker: " ", color: "var(--wk-dim)" },
  add: {
    background: "color-mix(in srgb, var(--wk-ok) 14%, transparent)",
    marker: "+",
    color: "var(--wk-text)",
  },
  del: {
    background: "color-mix(in srgb, var(--wk-err) 14%, transparent)",
    marker: "-",
    color: "var(--wk-text)",
  },
};

function Gutter({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="w-[34px] flex-none select-none pr-[7px] text-right"
      style={{ color: "var(--wk-faint)", opacity: 0.75 }}
    >
      {children}
    </span>
  );
}

function DiffLine({ row }: { row: DiffRow }) {
  if (row.kind === "gap") {
    return (
      <div
        className="flex items-center gap-[6px] px-[10px]"
        style={{
          minHeight: 20,
          background: "var(--wk-raised)",
          borderTop: "1px solid var(--wk-line)",
          borderBottom: "1px solid var(--wk-line)",
          color: "var(--wk-faint)",
          fontFamily: MONO,
          fontSize: 10.5,
        }}
      >
        <span aria-hidden="true">⋯</span>
        <span>{plural(row.hidden, "unchanged line")}</span>
      </div>
    );
  }

  const tone = ROW_TONE[row.kind];
  const oldNo = row.kind === "add" ? "" : row.oldNo;
  const newNo = row.kind === "del" ? "" : row.newNo;

  return (
    <div
      className="flex px-[10px]"
      style={{
        background: tone.background,
        fontFamily: MONO,
        fontSize: 11.5,
        lineHeight: "20px",
      }}
    >
      <Gutter>{oldNo}</Gutter>
      <Gutter>{newNo}</Gutter>
      <span
        className="w-[14px] flex-none select-none"
        style={{ color: row.kind === "add" ? "var(--wk-ok)" : row.kind === "del" ? "var(--wk-err)" : "var(--wk-faint)" }}
        aria-hidden="true"
      >
        {tone.marker}
      </span>
      <span
        className="min-w-0 flex-1"
        style={{ color: tone.color, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      >
        {row.text === "" ? " " : row.text}
      </span>
    </div>
  );
}

function BufferSelect({
  options,
  selectedId,
  onChange,
}: {
  options: { id: string; name: string }[];
  selectedId: string | null;
  onChange: (id: string | null) => void;
}) {
  const selected = options.find((option) => option.id === selectedId);

  return (
    <span
      className="relative flex h-[24px] flex-none items-center gap-[5px] rounded-[6px] px-[7px]"
      style={{ background: "var(--wk-bg)", border: "1px solid var(--wk-line)" }}
    >
      <Mono size={10.5} color={selected ? "var(--wk-dim)" : "var(--wk-faint)"}>
        {selected ? selected.name : "Pick a buffer"}
      </Mono>
      <span style={{ color: "var(--wk-faint)" }}>
        <Icon name="chevronDown" size={9} />
      </span>
      <select
        aria-label="Compare the result against"
        value={selectedId ?? ""}
        onChange={(event) => onChange(event.target.value || null)}
        className="wk-focus absolute inset-0 cursor-pointer opacity-0"
      >
        <option value="">Pick a buffer</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </span>
  );
}

function DiffBody({
  value,
  buffers,
  activeBufferId,
  diffAgainstId,
  onDiffAgainstChange,
}: {
  value: string;
  buffers: { id: string; name: string; source: string }[];
  activeBufferId: string;
  diffAgainstId: string | null;
  onDiffAgainstChange: (id: string | null) => void;
}) {
  const options = useMemo(
    () => buffers.filter((buffer) => buffer.id !== activeBufferId),
    [buffers, activeBufferId],
  );

  const against = options.find((buffer) => buffer.id === diffAgainstId) ?? null;

  const model = useMemo(() => {
    if (!against) return null;
    return buildDiff(against.source, value);
  }, [against, value]);

  const rows = useMemo(() => (model ? collapse(model.rows) : []), [model]);

  if (options.length === 0) {
    return (
      <Notice>
        There is only one buffer open, so there is nothing to compare against. Open a second buffer and it
        shows up here.
      </Notice>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className="flex h-[34px] flex-none items-center gap-[9px] px-3"
        style={{ borderBottom: "1px solid var(--wk-line)" }}
      >
        <span className="wk-label">Against</span>
        <BufferSelect options={options} selectedId={against?.id ?? null} onChange={onDiffAgainstChange} />
        <span className="flex-1" />
        {model && (
          <Mono size={10.5} color="var(--wk-faint)">
            {model.added === 0 && model.removed === 0
              ? "identical"
              : `${plural(model.added, "line")} added · ${plural(model.removed, "line")} removed`}
          </Mono>
        )}
      </div>

      {!against ? (
        <Notice>Choose a buffer above and the result is compared against its source, line by line.</Notice>
      ) : model && model.added === 0 && model.removed === 0 ? (
        <Notice>
          The result is identical to <span style={{ color: "var(--wk-dim)" }}>{against.name}</span>, line for
          line.
        </Notice>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto py-1">
          {rows.map((row, index) => (
            <DiffLine key={index} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------- switch */

const MODES: { id: OutputMode; label: string }[] = [
  { id: "raw", label: "Raw" },
  { id: "preview", label: "Preview" },
  { id: "diff", label: "Diff" },
];

function ModeSwitch({
  mode,
  onModeChange,
  previewDisabledReason,
}: {
  mode: OutputMode;
  onModeChange: (mode: OutputMode) => void;
  previewDisabledReason: string | null;
}) {
  return (
    <div
      className="flex h-[34px] flex-none items-center gap-[9px] px-3"
      style={{ borderBottom: "1px solid var(--wk-line)" }}
    >
      <div
        className="flex gap-[3px] rounded-[7px] p-[3px]"
        style={{ background: "var(--wk-panel)", border: "1px solid var(--wk-line)" }}
        role="tablist"
        aria-label="Output view"
      >
        {MODES.map((item) => {
          const disabled = item.id === "preview" && previewDisabledReason !== null;
          const active = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={disabled}
              title={disabled ? previewDisabledReason ?? undefined : `Show the ${item.label.toLowerCase()} view`}
              onClick={() => onModeChange(item.id)}
              className="wk-focus flex h-[22px] items-center justify-center rounded-[5px] px-[10px] text-[11.5px]"
              style={{
                background: active ? "var(--wk-line)" : "transparent",
                color: disabled ? "var(--wk-faint)" : active ? "var(--wk-text)" : "var(--wk-dim)",
                fontWeight: active ? 500 : 400,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.55 : 1,
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- root */

export interface OutputViewProps {
  /** The pipeline result. */
  value: string;
  language: Lang;
  mode: OutputMode;
  onModeChange: (mode: OutputMode) => void;
  /** Every open buffer, so diff can offer the others. */
  buffers: { id: string; name: string; source: string }[];
  activeBufferId: string;
  diffAgainstId: string | null;
  onDiffAgainstChange: (id: string | null) => void;
  editorRef?: React.Ref<ReactCodeMirrorRef>;
}

export function OutputView({
  value,
  language,
  mode,
  onModeChange,
  buffers,
  activeBufferId,
  diffAgainstId,
  onDiffAgainstChange,
  editorRef,
}: OutputViewProps): JSX.Element {
  const previewDisabledReason = PREVIEWABLE.includes(language)
    ? null
    : `Preview renders Markdown and HTML — this result is ${language === "text" ? "plain text" : language}.`;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ModeSwitch mode={mode} onModeChange={onModeChange} previewDisabledReason={previewDisabledReason} />

      {mode === "raw" && (
        <CodePane
          editorRef={editorRef}
          value={value}
          language={language}
          readOnly
          placeholder="The result lands here as you type. No button to press."
        />
      )}

      {mode === "preview" && <PreviewBody value={value} language={language} />}

      {mode === "diff" && (
        <DiffBody
          value={value}
          buffers={buffers}
          activeBufferId={activeBufferId}
          diffAgainstId={diffAgainstId}
          onDiffAgainstChange={onDiffAgainstChange}
        />
      )}
    </div>
  );
}
