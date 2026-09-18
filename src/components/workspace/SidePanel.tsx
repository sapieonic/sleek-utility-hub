import React, { useMemo, useState } from "react";
import type { OutlineNode, OutlineSummary } from "@/lib/outline";
import { exportPipeline, type ExportTarget, type PipelineStep } from "@/lib/pipelineExport";
import type { Buffer } from "@/state/workspace";
import { byteLength, formatBytes } from "@/lib/transforms";
import { Icon } from "./Icon";
import { Mono, PaneHeader } from "./Chrome";

type Tab = "structure" | "export" | "session";

function relativeTime(timestamp: number): string {
  const seconds = Math.round((Date.now() - timestamp) / 1000);
  if (seconds < 45) return "now";
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
  return new Date(timestamp).toLocaleDateString(undefined, { weekday: "short" });
}

const KIND_COLOR: Record<OutlineNode["kind"], string> = {
  object: "var(--wk-faint)",
  array: "var(--wk-faint)",
  string: "var(--wk-syn-str)",
  number: "var(--wk-syn-num)",
  boolean: "var(--wk-syn-bool)",
  null: "var(--wk-syn-bool)",
};

function OutlineRow({
  node,
  collapsed,
  onToggle,
  onJump,
}: {
  node: OutlineNode;
  collapsed: Set<string>;
  onToggle: (path: string) => void;
  onJump: (line?: number) => void;
}) {
  const branch = node.kind === "object" || node.kind === "array";
  const open = branch && !collapsed.has(node.path);

  return (
    <>
      <button
        type="button"
        onClick={() => (branch ? onToggle(node.path) : onJump(node.line))}
        onDoubleClick={() => onJump(node.line)}
        className="wk-focus flex h-[24px] w-full items-center gap-[6px] rounded-[5px] pr-[6px] text-left"
        style={{ paddingLeft: 8 + node.depth * 13, background: node.depth === 0 ? "var(--wk-raised)" : undefined }}
        onMouseEnter={(e) => {
          if (node.depth > 0) e.currentTarget.style.background = "var(--wk-raised)";
        }}
        onMouseLeave={(e) => {
          if (node.depth > 0) e.currentTarget.style.background = "transparent";
        }}
        title={node.path}
      >
        {branch ? (
          <span style={{ color: "var(--wk-faint)" }}>
            <Icon name={open ? "chevronDown" : "chevronRight"} size={9} />
          </span>
        ) : (
          <span className="w-[9px] flex-none" />
        )}
        <Mono size={11.5} color={node.depth === 0 ? "var(--wk-text)" : "var(--wk-syn-key)"}>
          {node.key}
        </Mono>
        <span className="flex-1" />
        <Mono size={10.5} color={KIND_COLOR[node.kind]} className="max-w-[112px] truncate">
          {node.preview}
        </Mono>
      </button>
      {open &&
        node.children?.map((child) => (
          <OutlineRow key={child.path} node={child} collapsed={collapsed} onToggle={onToggle} onJump={onJump} />
        ))}
    </>
  );
}

function StructureTab({
  outline,
  onJump,
}: {
  outline: OutlineSummary | null;
  onJump: (line?: number) => void;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const toggle = (path: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });

  if (!outline) {
    return (
      <div className="px-3 py-4">
        <p className="text-[11.5px] leading-[17px]" style={{ color: "var(--wk-faint)" }}>
          The outline appears when the result is JSON. Add a JSON step, or paste something that parses.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-[10px] py-2">
      {outline.nodes.map((node) => (
        <OutlineRow key={node.path} node={node} collapsed={collapsed} onToggle={toggle} onJump={onJump} />
      ))}
    </div>
  );
}

function ExportTab({ steps, sourceName }: { steps: PipelineStep[]; sourceName: string }) {
  const [target, setTarget] = useState<ExportTarget>("shell");
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => exportPipeline(steps, target, sourceName), [steps, target, sourceName]);

  const copy = async () => {
    await navigator.clipboard.writeText(result.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3">
      <p className="mb-[11px] text-[11.5px] leading-[17px]" style={{ color: "var(--wk-faint)" }}>
        The same steps as something you can paste into a terminal or a CI job. The GUI is for working it out;
        this is for keeping it.
      </p>

      <div
        className="mb-[10px] flex gap-[3px] rounded-[7px] p-[3px]"
        style={{ background: "var(--wk-panel)", border: "1px solid var(--wk-line)" }}
        role="tablist"
        aria-label="Export target"
      >
        {(["shell", "node", "python"] as ExportTarget[]).map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={target === option}
            onClick={() => setTarget(option)}
            tabIndex={target === option ? 0 : -1}
            className="wk-focus flex h-[26px] flex-1 items-center justify-center rounded-[5px] text-[11.5px] capitalize"
            style={{
              background: target === option ? "var(--wk-line)" : "transparent",
              color: target === option ? "var(--wk-text)" : "var(--wk-faint)",
              fontWeight: target === option ? 500 : 400,
            }}
          >
            {option}
          </button>
        ))}
      </div>

      <div
        className="overflow-hidden rounded-lg"
        style={{ background: "var(--wk-panel)", border: "1px solid var(--wk-line)" }}
      >
        <pre
          className="overflow-x-auto px-[11px] py-[10px]"
          style={{
            fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace',
            fontSize: 11,
            lineHeight: "19px",
            color: "var(--wk-dim)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {result.code ||
            (result.missing.length
              ? `No faithful ${target} equivalent — ${result.missing.join(", ")} ${result.missing.length === 1 ? "has" : "have"} none, so emitting the rest would compute something different.`
              : "Add a step to see the equivalent command.")}
        </pre>
        <div
          className="flex h-[32px] items-center gap-2 pl-[11px] pr-2"
          style={{ borderTop: "1px solid var(--wk-line)" }}
        >
          <Mono size={10}>{result.requires.length ? `needs ${result.requires.join(", ")}` : ""}</Mono>
          <div className="flex-1" />
          <button
            type="button"
            onClick={copy}
            disabled={!result.code}
            className="wk-focus flex h-[24px] items-center gap-[6px] rounded-[5px] px-[10px]"
            style={{ background: "var(--wk-raised)", border: "1px solid var(--wk-line)", color: "var(--wk-text)" }}
          >
            <Icon name={copied ? "check" : "copy"} size={11} />
            <span className="text-[11px]">{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {result.missing.length > 0 && (
        <div className="mt-3 flex items-start gap-[7px]">
          <span style={{ color: "var(--wk-warn)", paddingTop: 1 }}>
            <Icon name="alert" size={12} />
          </span>
          <p className="text-[10.5px] leading-[15px]" style={{ color: "var(--wk-dim)" }}>
            No faithful {target} equivalent for{" "}
            <span style={{ color: "var(--wk-text)" }}>{result.missing.join(", ")}</span>. Try another target, or
            keep that step in the browser.
          </p>
        </div>
      )}
    </div>
  );
}

function SessionTab({
  buffers,
  activeId,
  onSelect,
  onClear,
}: {
  buffers: Buffer[];
  activeId: string;
  onSelect: (id: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="px-[10px] pt-2">
        {[...buffers]
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .map((buffer) => (
            <button
              key={buffer.id}
              type="button"
              onClick={() => onSelect(buffer.id)}
              className="wk-focus flex h-[28px] w-full items-center gap-2 rounded-[5px] px-[6px] text-left"
              style={{ background: buffer.id === activeId ? "var(--wk-raised)" : "transparent" }}
            >
              <Mono
                size={11.5}
                color={buffer.id === activeId ? "var(--wk-text)" : "var(--wk-dim)"}
                className="flex-1 truncate"
              >
                {buffer.name}
              </Mono>
              <Mono size={10.5}>{relativeTime(buffer.updatedAt)}</Mono>
              <Mono size={10.5} className="w-[46px] text-right">
                {buffer.source ? formatBytes(byteLength(buffer.source)) : "empty"}
              </Mono>
            </button>
          ))}
      </div>

      <div className="flex items-start gap-[7px] px-[14px] pb-[14px] pt-3">
        <span style={{ color: "var(--wk-ok)", paddingTop: 1 }}>
          <Icon name="lock" size={12} />
        </span>
        <p className="text-[10.5px] leading-[15px]" style={{ color: "var(--wk-faint)" }}>
          Buffers live in this browser only. No account, no upload, and they survive a reload.
        </p>
      </div>

      <div className="px-[10px] pb-3">
        <button
          type="button"
          onClick={onClear}
          className="wk-focus flex h-[26px] items-center gap-[6px] rounded-[5px] px-2"
          style={{ color: "var(--wk-faint)" }}
        >
          <Icon name="trash" size={12} />
          <span className="text-[11px]">Clear every buffer</span>
        </button>
      </div>
    </div>
  );
}

export function SidePanel({
  outline,
  steps,
  buffers,
  activeId,
  sourceName,
  onJump,
  onSelectBuffer,
  onClearSession,
}: {
  outline: OutlineSummary | null;
  steps: PipelineStep[];
  buffers: Buffer[];
  activeId: string;
  sourceName: string;
  onJump: (line?: number) => void;
  onSelectBuffer: (id: string) => void;
  onClearSession: () => void;
}) {
  const [tab, setTab] = useState<Tab>("structure");

  const TABS: { id: Tab; label: string }[] = [
    { id: "structure", label: "Structure" },
    { id: "export", label: "Export" },
    { id: "session", label: "Session" },
  ];

  return (
    <aside
      className="flex w-[276px] flex-none flex-col"
      style={{ background: "var(--wk-bg)", borderLeft: "1px solid var(--wk-line)" }}
    >
      <PaneHeader>
        <div className="flex items-center gap-3" role="tablist" aria-label="Side panel">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              id={`wk-panel-tab-${item.id}`}
              aria-controls="wk-panel-body"
              tabIndex={tab === item.id ? 0 : -1}
              className="wk-focus wk-label flex h-[24px] items-center"
              style={{
                color: tab === item.id ? "var(--wk-text)" : "var(--wk-dim)",
                borderBottom: tab === item.id ? "2px solid var(--wk-accent)" : "2px solid transparent",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </PaneHeader>

      <div
        id="wk-panel-body"
        role="tabpanel"
        aria-labelledby={`wk-panel-tab-${tab}`}
        className="flex min-h-0 flex-1 flex-col"
      >
        {tab === "structure" && <StructureTab outline={outline} onJump={onJump} />}
        {tab === "export" && <ExportTab steps={steps} sourceName={sourceName} />}
        {tab === "session" && (
          <SessionTab buffers={buffers} activeId={activeId} onSelect={onSelectBuffer} onClear={onClearSession} />
        )}
      </div>
    </aside>
  );
}
