import React from "react";
import { Icon, Kbd } from "./Icon";
import { IconButton } from "./Chrome";
import { useTheme } from "@/hooks/use-theme";

export function TitleBar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const { theme, toggle } = useTheme();

  return (
    <header
      className="flex h-[44px] flex-none items-center gap-3 px-3"
      style={{ background: "var(--wk-panel)", borderBottom: "1px solid var(--wk-line)" }}
    >
      <div className="flex w-[200px] flex-none items-center gap-[9px]">
        <span style={{ color: "var(--wk-accent)" }}>
          <Icon name="mark" size={20} />
        </span>
        <span className="text-[14px] font-semibold tracking-[-0.01em]" style={{ color: "var(--wk-text)" }}>
          UtilityHub
        </span>
      </div>

      <div className="flex flex-1 justify-center">
        <button
          type="button"
          onClick={onOpenPalette}
          className="wk-focus flex h-[28px] w-full max-w-[440px] items-center gap-2 rounded-md px-[9px] text-left transition-colors"
          style={{ background: "var(--wk-bg)", border: "1px solid var(--wk-line-control)" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--wk-accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--wk-line-control)")}
        >
          <span style={{ color: "var(--wk-faint)" }}>
            <Icon name="search" size={13} />
          </span>
          <span className="flex-1 truncate text-[12px]" style={{ color: "var(--wk-faint)" }}>
            Search tools, run actions, jump to a buffer…
          </span>
          <Kbd>⌘K</Kbd>
        </button>
      </div>

      <div className="flex w-[200px] flex-none items-center justify-end gap-[6px]">
        <span
          className="hidden items-center gap-[5px] rounded-[5px] px-2 py-[3px] sm:inline-flex"
          style={{
            background: "var(--wk-ok-wash)",
            border: "1px solid color-mix(in srgb, var(--wk-ok) 26%, transparent)",
            color: "var(--wk-ok)",
          }}
          title="Everything runs in this tab. Nothing you paste is uploaded."
        >
          <Icon name="shield" size={11} />
          <span className="text-[10.5px] font-medium">Local only</span>
        </span>
        <IconButton label={theme === "dark" ? "Switch to light" : "Switch to dark"} onClick={toggle}>
          <Icon name={theme === "dark" ? "sun" : "moon"} size={15} />
        </IconButton>
        <a
          href="https://github.com/sapieonic/sleek-utility-hub"
          target="_blank"
          rel="noopener noreferrer"
          title="Source on GitHub"
          aria-label="Source on GitHub"
          className="wk-focus flex h-[26px] w-[26px] items-center justify-center rounded-md"
          style={{ color: "var(--wk-faint)" }}
        >
          <Icon name="git" size={15} />
        </a>
      </div>
    </header>
  );
}
