import React from "react";
import type { Candidate } from "@/lib/detect";
import { Icon, Kbd } from "./Icon";

export function DetectBanner({
  candidates,
  onApply,
  onDismiss,
}: {
  candidates: Candidate[];
  onApply: (candidate: Candidate) => void;
  onDismiss: () => void;
}) {
  const [best, ...rest] = candidates;
  if (!best) return null;

  return (
    <div
      className="m-3 flex-none overflow-hidden rounded-[10px]"
      style={{
        background: "var(--wk-accent-wash)",
        border: "1px solid color-mix(in srgb, var(--wk-accent) 32%, transparent)",
        boxShadow: "inset 3px 0 0 var(--wk-accent)",
      }}
    >
      <div className="px-4 pb-[14px] pt-[13px]">
        <div className="mb-1 flex flex-wrap items-center gap-[9px]">
          <span style={{ color: "var(--wk-accent)" }}>
            <Icon name="zap" size={16} />
          </span>
          <span className="text-[14.5px] font-semibold" style={{ color: "var(--wk-text)" }}>
            This looks like {best.label}.
          </span>
          <span className="ml-[2px] flex items-center gap-[7px]">
            <span
              className="block h-[4px] w-[54px] overflow-hidden rounded-sm"
              style={{ background: "var(--wk-line)" }}
            >
              <span
                className="block h-full rounded-sm"
                style={{ width: `${Math.round(best.confidence * 100)}%`, background: "var(--wk-accent)" }}
              />
            </span>
            <span
              style={{
                fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace',
                fontSize: 10.5,
                color: "var(--wk-accent)",
              }}
            >
              {Math.round(best.confidence * 100)}%
            </span>
          </span>
        </div>

        <p className="mb-3 pl-[25px] text-[12px]" style={{ color: "var(--wk-dim)" }}>
          Checked here, in this tab. Nothing has been applied to your buffer yet.
        </p>

        <div className="flex flex-wrap items-center gap-2 pl-[25px]">
          <button
            type="button"
            onClick={() => onApply(best)}
            className="wk-focus flex h-[30px] items-center gap-2 rounded-md pl-[11px] pr-2"
            style={{ background: "var(--wk-accent)", color: "var(--wk-accent-ink)" }}
          >
            <span className="text-[12.5px] font-semibold">{best.action}</span>
            <span
              style={{
                fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace',
                fontSize: 10,
                borderRadius: 4,
                padding: "3px 5px",
                background: "rgb(0 0 0 / 0.22)",
                color: "#ffffff",
              }}
            >
              ⏎
            </span>
          </button>

          {rest.slice(0, 1).map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              onClick={() => onApply(candidate)}
              className="wk-focus flex h-[30px] items-center gap-2 rounded-md px-[11px]"
              style={{ background: "var(--wk-raised)", border: "1px solid var(--wk-line)", color: "var(--wk-text)" }}
            >
              <span className="text-[12.5px]">Treat it as {candidate.label}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={onDismiss}
            className="wk-focus flex h-[30px] items-center gap-2 rounded-md px-[11px]"
            style={{ color: "var(--wk-faint)" }}
          >
            <span className="text-[12.5px]">Leave it alone</span>
            <Kbd>esc</Kbd>
          </button>

          <div className="flex-1" />

          {rest.length > 0 && (
            <span
              className="hidden items-center gap-2 lg:flex"
              style={{
                fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace',
                fontSize: 10.5,
                color: "var(--wk-faint)",
              }}
            >
              also considered
              {rest.map((candidate) => (
                <span
                  key={candidate.id}
                  className="flex h-[22px] items-center rounded-[5px] px-2"
                  style={{ background: "var(--wk-panel)", border: "1px solid var(--wk-line)" }}
                >
                  {candidate.label} · {Math.round(candidate.confidence * 100)}%
                </span>
              ))}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
