import React, { useState } from "react";
import {
  ALL_TRANSFORMS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  UNBUILT_TOOLS,
  type Category,
  type TransformDef,
} from "@/lib/transforms";
import { Icon, Kbd } from "./Icon";

const CATEGORY_ICON: Record<Category, "braces" | "binary" | "swap" | "type"> = {
  formatters: "braces",
  encoders: "binary",
  converters: "swap",
  text: "type",
};

function Row({
  label,
  icon,
  shortcut,
  active,
  indent,
  onClick,
  title,
}: {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  active?: boolean;
  indent?: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="wk-focus group flex h-[30px] w-full items-center gap-[9px] rounded-md px-2 text-left transition-colors"
      style={{
        paddingLeft: indent ? 26 : 8,
        background: active ? "var(--wk-raised)" : "transparent",
        boxShadow: active ? "inset 2px 0 0 var(--wk-accent)" : undefined,
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "var(--wk-raised)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      {icon && <span style={{ color: active ? "var(--wk-accent)" : "var(--wk-faint)" }}>{icon}</span>}
      <span
        className="flex-1 truncate text-[12.5px]"
        style={{ color: active ? "var(--wk-text)" : "var(--wk-dim)", fontWeight: active ? 500 : 400 }}
      >
        {label}
      </span>
      {shortcut && <Kbd>{shortcut}</Kbd>}
    </button>
  );
}

export function Rail({
  recents,
  activeIds,
  onPick,
}: {
  recents: TransformDef[];
  activeIds: string[];
  onPick: (transformId: string) => void;
}) {
  const [open, setOpen] = useState<Record<Category, boolean>>({
    formatters: true,
    encoders: false,
    converters: false,
    text: false,
  });

  return (
    <nav
      className="flex w-[216px] flex-none flex-col overflow-y-auto px-2 py-[10px]"
      style={{ background: "var(--wk-bg)", borderRight: "1px solid var(--wk-line)" }}
      aria-label="Tool library"
    >
      {recents.length > 0 && (
        <>
          <div className="flex h-[22px] items-center px-2">
            <span className="wk-label">Recent</span>
          </div>
          {recents.map((def, index) => (
            <Row
              key={def.id}
              label={def.name}
              title={def.blurb}
              icon={<Icon name={CATEGORY_ICON[def.category]} size={15} />}
              shortcut={index < 3 ? `⌥${index + 1}` : undefined}
              active={activeIds.includes(def.id)}
              onClick={() => onPick(def.id)}
            />
          ))}
          <div className="mx-2 my-[10px] h-px" style={{ background: "var(--wk-line)" }} />
        </>
      )}

      <div className="flex h-[22px] items-center px-2">
        <span className="wk-label">Library</span>
      </div>

      {CATEGORY_ORDER.map((category) => {
        const items = ALL_TRANSFORMS.filter((t) => t.category === category);
        const expanded = open[category];
        return (
          <div key={category}>
            <button
              type="button"
              onClick={() => setOpen((o) => ({ ...o, [category]: !o[category] }))}
              aria-expanded={expanded}
              className="wk-focus flex h-[28px] w-full items-center gap-[7px] rounded-md px-2"
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--wk-raised)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ color: "var(--wk-faint)" }}>
                <Icon name={expanded ? "chevronDown" : "chevronRight"} size={11} />
              </span>
              <span
                className="flex-1 text-left text-[12px] font-semibold"
                style={{ color: expanded ? "var(--wk-text)" : "var(--wk-dim)" }}
              >
                {CATEGORY_LABELS[category]}
              </span>
              <span
                style={{
                  fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace',
                  fontSize: 10.5,
                  color: "var(--wk-faint)",
                }}
              >
                {items.length}
              </span>
            </button>
            {expanded &&
              items.map((def) => (
                <Row
                  key={def.id}
                  label={def.name}
                  title={def.blurb}
                  indent
                  active={activeIds.includes(def.id)}
                  onClick={() => onPick(def.id)}
                />
              ))}
          </div>
        );
      })}

      <div className="flex-1" />

      <div
        className="mt-3 rounded-lg px-[10px] py-[9px]"
        style={{ background: "var(--wk-panel)", border: "1px solid var(--wk-line)" }}
      >
        <div className="mb-1 flex items-center gap-[7px]">
          <span style={{ color: "var(--wk-warn)" }}>
            <Icon name="alert" size={12} />
          </span>
          <span className="text-[11.5px] font-semibold" style={{ color: "var(--wk-text)" }}>
            {UNBUILT_TOOLS.length} tools in progress
          </span>
        </div>
        <p className="text-[10.5px] leading-[15px]" style={{ color: "var(--wk-faint)" }}>
          Kept out of the library and the palette until they actually work.
        </p>
      </div>
    </nav>
  );
}
