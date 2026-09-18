import React from "react";
import type { Buffer } from "@/state/workspace";
import { Icon } from "./Icon";
import { IconButton } from "./Chrome";

export function TabStrip({
  buffers,
  activeId,
  showStructure,
  onSelect,
  onClose,
  onNew,
  onToggleStructure,
}: {
  buffers: Buffer[];
  activeId: string;
  showStructure: boolean;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onNew: () => void;
  onToggleStructure: () => void;
}) {
  return (
    <div
      className="flex h-[36px] flex-none items-stretch overflow-x-auto"
      style={{ background: "var(--wk-panel)", borderBottom: "1px solid var(--wk-line)" }}
    >
      <div className="flex items-stretch" role="tablist" aria-label="Open buffers">
      {buffers.map((buffer) => {
        const active = buffer.id === activeId;
        return (
          <div
            key={buffer.id}
            className="group flex flex-none items-center gap-2 px-3"
            style={{
              background: active ? "var(--wk-bg)" : "transparent",
              borderRight: "1px solid var(--wk-line)",
              boxShadow: active ? "inset 0 2px 0 var(--wk-accent)" : undefined,
            }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(buffer.id)}
              className="wk-focus flex items-center gap-2"
            >
              {active && (
                <span className="h-[6px] w-[6px] rounded-full" style={{ background: "var(--wk-accent)" }} />
              )}
              <span
                style={{
                  fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace',
                  fontSize: 11.5,
                  color: active ? "var(--wk-text)" : "var(--wk-faint)",
                }}
              >
                {buffer.name}
              </span>
            </button>
            <button
              type="button"
              aria-label={`Close ${buffer.name}`}
              onClick={() => onClose(buffer.id)}
              className="wk-focus flex h-[24px] w-[24px] items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              style={{ color: "var(--wk-faint)" }}
            >
              <Icon name="close" size={12} />
            </button>
          </div>
        );
      })}
      </div>

      <button
        type="button"
        onClick={onNew}
        aria-label="New buffer"
        title="New buffer  ⌘N"
        className="wk-focus flex w-[36px] flex-none items-center justify-center"
        style={{ color: "var(--wk-faint)" }}
      >
        <Icon name="plus" size={13} />
      </button>

      <div className="flex-1" />
      <div className="flex flex-none items-center gap-1 px-[10px]">
        <IconButton
          label={showStructure ? "Hide side panel" : "Show side panel"}
          active={showStructure}
          onClick={onToggleStructure}
          size={24}
        >
          <Icon name="panelRight" size={13} />
        </IconButton>
      </div>
    </div>
  );
}
