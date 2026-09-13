import React from "react";
import type { Evaluation } from "@/state/workspace";
import { byteLength, formatBytes, formatMs, lineCount, type Lang } from "@/lib/transforms";
import type { OutlineSummary } from "@/lib/outline";
import { Icon } from "./Icon";
import { Divider, Mono } from "./Chrome";

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

const LANG_LABEL: Record<Lang, string> = {
  json: "JSON",
  javascript: "JavaScript",
  html: "HTML",
  css: "CSS",
  sql: "SQL",
  xml: "XML",
  markdown: "Markdown",
  text: "Plain text",
};

export function StatusBar({
  source,
  evaluation,
  outline,
  stale,
}: {
  source: string;
  evaluation: Evaluation;
  outline: OutlineSummary | null;
  stale: boolean;
}) {
  const inBytes = byteLength(source);
  const outBytes = byteLength(evaluation.output);
  const failed = Boolean(evaluation.error);
  const hasSteps = evaluation.steps.length > 0;

  return (
    <footer
      className="flex min-h-[28px] flex-none items-center gap-[10px] overflow-hidden px-3"
      style={{ background: "var(--wk-panel)", borderTop: "1px solid var(--wk-line)" }}
    >
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {failed
          ? `Error: ${evaluation.error?.message}`
          : hasSteps
            ? `${evaluation.steps.length} steps ran cleanly`
            : "No steps"}
      </span>
      {failed ? (
        <span className="flex min-w-0 items-center gap-[5px]" style={{ color: "var(--wk-err)" }}>
          <Icon name="alert" size={11} />
          <Mono size={11} color="var(--wk-err)" className="truncate" title={evaluation.error?.message}>
            {evaluation.error?.message}
            {evaluation.error?.line ? ` — line ${evaluation.error.line}, column ${evaluation.error.column}` : ""}
          </Mono>
        </span>
      ) : hasSteps ? (
        <span className="flex flex-none items-center gap-[5px]" style={{ color: "var(--wk-ok)" }}>
          <Icon name="check" size={11} />
          <Mono size={11} color="var(--wk-ok)">
            {outline ? "Valid JSON" : `${evaluation.steps.length} of ${evaluation.steps.length} steps ran clean`}
          </Mono>
        </span>
      ) : (
        <Mono size={11}>No steps — showing the buffer as pasted</Mono>
      )}

      {outline && (
        <>
          <Divider vertical />
          <Mono size={11} className="flex-none">
            {plural(outline.keyCount, "key")} · {plural(outline.maxDepth, "level")}
          </Mono>
        </>
      )}

      {hasSteps && !failed && (
        <>
          <Divider vertical />
          <Mono size={11} className="flex-none">
            {formatBytes(inBytes)} → {formatBytes(outBytes)}
          </Mono>
          <Divider vertical />
          <Mono size={11} className="flex-none">
            {stale ? "catching up…" : formatMs(evaluation.totalMs)}
          </Mono>
        </>
      )}

      <div className="flex-1" />

      <Mono size={11} className="hidden flex-none md:inline">
        {plural(lineCount(source), "line")}
      </Mono>
      <Divider vertical />
      <Mono size={11} className="hidden flex-none md:inline">
        UTF-8
      </Mono>
      <Divider vertical />
      <Mono size={11} color="var(--wk-dim)" className="flex-none">
        {LANG_LABEL[evaluation.language]}
      </Mono>
    </footer>
  );
}
