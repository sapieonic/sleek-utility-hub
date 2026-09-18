import React, { useState } from "react";
import { byteLength, formatBytes, getTransform } from "@/lib/transforms";
import type { Candidate } from "@/lib/detect";
import { useWorkspace } from "@/state/workspace";
import { CodePane } from "./CodePane";
import { Icon } from "./Icon";
import { Mono, Pill } from "./Chrome";

/**
 * No fake status bar and no fake keyboard: the real ones render on top of this
 * layout on a real phone. Every target here is at least 44px.
 */
export function MobileWorkspace({
  onOpenPalette,
  onCopy,
  onSave,
  onShare,
  suggestion,
  onApplyCandidate,
  onDismissCandidate,
  copied,
}: {
  onOpenPalette: () => void;
  onCopy: () => void;
  onSave: () => void;
  onShare: () => void;
  suggestion: Candidate[];
  onApplyCandidate: (candidate: Candidate) => void;
  onDismissCandidate: () => void;
  copied: boolean;
}) {
  const { state, dispatch, buffer, evaluation } = useWorkspace();
  const [view, setView] = useState<"source" | "result">("result");

  const showing = view === "source" ? buffer.source : evaluation.output;
  const best = suggestion[0];

  return (
    <div className="flex h-full flex-col" style={{ background: "var(--wk-bg)", color: "var(--wk-text)" }}>
      <header
        className="flex h-[52px] flex-none items-center gap-[10px] pl-[14px] pr-2"
        style={{ background: "var(--wk-panel)", borderBottom: "1px solid var(--wk-line)" }}
      >
        <span style={{ color: "var(--wk-accent)" }}>
          <Icon name="mark" size={22} />
        </span>
        <span className="flex-1 text-[16px] font-semibold">UtilityHub</span>
        <button
          type="button"
          onClick={onOpenPalette}
          aria-label="Search tools and actions"
          className="wk-focus flex h-[44px] w-[44px] items-center justify-center rounded-md"
          style={{ color: "var(--wk-dim)" }}
        >
          <Icon name="search" size={19} />
        </button>
      </header>

      <div
        className="flex h-[48px] flex-none items-center gap-2 px-[14px]"
        style={{ borderBottom: "1px solid var(--wk-line)" }}
      >
        <span
          className="flex h-[34px] items-center gap-2 rounded-lg px-[10px]"
          style={{ background: "var(--wk-raised)", border: "1px solid var(--wk-line)" }}
        >
          <span className="h-[6px] w-[6px] rounded-full" style={{ background: "var(--wk-accent)" }} />
          <Mono size={12.5} color="var(--wk-text)">
            {buffer.name}
          </Mono>
        </span>
        <div className="flex-1" />
        {evaluation.error ? (
          <Pill tone="err" dot>
            Step {evaluation.failedAtIndex + 1} failed
          </Pill>
        ) : (
          buffer.steps.length > 0 && (
            <Pill tone="ok" dot>
              {buffer.steps.length} {buffer.steps.length === 1 ? "step" : "steps"}
            </Pill>
          )
        )}
      </div>

      {buffer.steps.length > 0 && (
        <div
          className="flex h-[60px] flex-none items-center gap-2 overflow-x-auto px-[14px]"
          style={{ borderBottom: "1px solid var(--wk-line)" }}
        >
          {buffer.steps.map((step, index) => {
            const def = getTransform(step.transformId);
            if (!def) return null;
            return (
              <React.Fragment key={step.id}>
                {index > 0 && (
                  <span className="flex-none" style={{ color: "var(--wk-line-strong)" }}>
                    <Icon name="arrowRight" size={12} />
                  </span>
                )}
                <div
                  className="flex h-[44px] flex-none items-center gap-[7px] rounded-lg pl-[9px]"
                  style={{ background: "var(--wk-raised)", border: "1px solid var(--wk-line)" }}
                >
                  <span
                    className="flex h-[17px] w-[17px] items-center justify-center rounded"
                    style={{
                      fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace',
                      fontSize: 10,
                      fontWeight: 700,
                      background: "var(--wk-accent-wash)",
                      color: "var(--wk-accent)",
                    }}
                  >
                    {index + 1}
                  </span>
                  <span className="text-[12.5px]" style={{ color: "var(--wk-dim)" }}>
                    {def.chip}
                  </span>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "removeStep", stepId: step.id })}
                    aria-label={`Remove ${def.name}`}
                    className="wk-focus flex h-[44px] w-[44px] items-center justify-center rounded-lg"
                    style={{ color: "var(--wk-faint)" }}
                  >
                    <Icon name="close" size={13} />
                  </button>
                </div>
              </React.Fragment>
            );
          })}
          <button
            type="button"
            onClick={onOpenPalette}
            className="wk-focus flex h-[44px] flex-none items-center px-[14px]"
            style={{ border: "1px dashed var(--wk-line)", borderRadius: 8, color: "var(--wk-faint)" }}
          >
            <span className="text-[12.5px]">Add</span>
          </button>
        </div>
      )}

      {best && (
        <div
          className="m-[14px] flex-none rounded-lg p-3"
          style={{
            background: "var(--wk-accent-wash)",
            border: "1px solid color-mix(in srgb, var(--wk-accent) 32%, transparent)",
          }}
        >
          <p className="mb-[10px] text-[13px] font-semibold">This looks like {best.label}.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onApplyCandidate(best)}
              className="wk-focus flex h-[44px] flex-1 items-center justify-center rounded-lg text-[14px] font-semibold"
              style={{ background: "var(--wk-accent)", color: "var(--wk-accent-ink)" }}
            >
              {best.action}
            </button>
            <button
              type="button"
              onClick={onDismissCandidate}
              className="wk-focus flex h-[44px] items-center justify-center rounded-lg px-4 text-[14px]"
              style={{ background: "var(--wk-panel)", border: "1px solid var(--wk-line)" }}
            >
              Not now
            </button>
          </div>
        </div>
      )}

      <div className="h-[62px] flex-none px-[14px] py-[9px]">
        <div
          className="flex h-[44px] gap-[3px] rounded-[9px] p-[3px]"
          style={{ background: "var(--wk-panel)", border: "1px solid var(--wk-line)" }}
          role="tablist"
        >
          {(["source", "result"] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={view === option}
              onClick={() => setView(option)}
              className="wk-focus flex h-full flex-1 items-center justify-center rounded-md text-[13px] capitalize"
              style={{
                background: view === option ? "var(--wk-line)" : "transparent",
                color: view === option ? "var(--wk-text)" : "var(--wk-faint)",
                fontWeight: view === option ? 500 : 400,
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {evaluation.error && view === "result" ? (
          <div className="p-4">
            <p className="mb-1 text-[13px]" style={{ color: "var(--wk-err)" }}>
              {evaluation.error.message}
              {evaluation.error.line ? ` — line ${evaluation.error.line}` : ""}
            </p>
            {evaluation.error.hint && (
              <p className="text-[12px] leading-[18px]" style={{ color: "var(--wk-faint)" }}>
                {evaluation.error.hint}
              </p>
            )}
          </div>
        ) : (
          <CodePane
            value={showing}
            language={view === "source" && buffer.steps.length ? "text" : evaluation.language}
            readOnly={view === "result"}
            placeholder="Paste anything to get started."
            onChange={
              view === "source"
                ? (value) => dispatch({ type: "setSource", id: buffer.id, source: value, rename: true })
                : undefined
            }
          />
        )}
      </div>

      <div
        className="flex h-[30px] flex-none items-center gap-[9px] px-[14px]"
        style={{ background: "var(--wk-panel)", borderTop: "1px solid var(--wk-line)" }}
      >
        <Mono size={11}>
          {formatBytes(byteLength(buffer.source))} → {formatBytes(byteLength(evaluation.output))}
        </Mono>
        <div className="flex-1" />
        <Mono size={11}>{state.buffers.length} buffers</Mono>
      </div>

      <div
        className="flex h-[74px] flex-none items-center gap-[10px] px-[14px]"
        style={{ background: "var(--wk-panel)", borderTop: "1px solid var(--wk-line)" }}
      >
        <button
          type="button"
          onClick={onCopy}
          disabled={!evaluation.output}
          className="wk-focus flex h-[48px] flex-1 items-center justify-center gap-[9px] rounded-[10px]"
          style={{
            background: evaluation.output ? "var(--wk-accent)" : "var(--wk-raised)",
            color: evaluation.output ? "var(--wk-accent-ink)" : "var(--wk-faint)",
          }}
        >
          <Icon name={copied ? "check" : "copy"} size={17} />
          <span className="text-[15px] font-semibold">{copied ? "Copied" : "Copy result"}</span>
        </button>
        <button
          type="button"
          onClick={onShare}
          aria-label="Copy a link to this pipeline"
          className="wk-focus flex h-[48px] w-[48px] flex-none items-center justify-center rounded-[10px]"
          style={{ background: "var(--wk-raised)", border: "1px solid var(--wk-line)", color: "var(--wk-dim)" }}
        >
          <Icon name="link" size={17} />
        </button>
        <button
          type="button"
          onClick={onSave}
          aria-label="Save the output as a file"
          className="wk-focus flex h-[48px] w-[48px] flex-none items-center justify-center rounded-[10px]"
          style={{ background: "var(--wk-raised)", border: "1px solid var(--wk-line)", color: "var(--wk-dim)" }}
        >
          <Icon name="download" size={17} />
        </button>
      </div>
    </div>
  );
}
