import React from "react";

export function IconButton({
  label,
  active,
  onClick,
  children,
  size = 26,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  size?: number;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="wk-focus flex items-center justify-center rounded-md transition-colors"
      style={{
        width: size,
        height: size,
        color: active ? "var(--wk-text)" : "var(--wk-faint)",
        background: active ? "var(--wk-raised)" : "transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--wk-raised)";
        e.currentTarget.style.color = "var(--wk-dim)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = active ? "var(--wk-raised)" : "transparent";
        e.currentTarget.style.color = active ? "var(--wk-text)" : "var(--wk-faint)";
      }}
    >
      {children}
    </button>
  );
}

type Tone = "ok" | "accent" | "warn" | "err" | "neutral";

const TONES: Record<Tone, { bg: string; fg: string; border: string }> = {
  ok: { bg: "var(--wk-ok-wash)", fg: "var(--wk-ok)", border: "color-mix(in srgb, var(--wk-ok) 26%, transparent)" },
  accent: { bg: "var(--wk-accent-wash)", fg: "var(--wk-accent)", border: "color-mix(in srgb, var(--wk-accent) 26%, transparent)" },
  warn: { bg: "var(--wk-warn-wash)", fg: "var(--wk-warn)", border: "color-mix(in srgb, var(--wk-warn) 26%, transparent)" },
  err: { bg: "var(--wk-err-wash)", fg: "var(--wk-err)", border: "color-mix(in srgb, var(--wk-err) 30%, transparent)" },
  neutral: { bg: "var(--wk-raised)", fg: "var(--wk-dim)", border: "var(--wk-line)" },
};

export function Pill({
  tone = "neutral",
  dot,
  children,
  title,
}: {
  tone?: Tone;
  dot?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  const t = TONES[tone];
  return (
    <span
      title={title}
      className="inline-flex h-[24px] flex-none items-center gap-[6px] rounded-md px-[9px] text-[11px] font-medium"
      style={{ background: t.bg, color: t.fg, border: `1px solid ${t.border}` }}
    >
      {dot && <span className="h-[6px] w-[6px] rounded-full" style={{ background: t.fg }} />}
      {children}
    </span>
  );
}

export function Divider({ vertical }: { vertical?: boolean }) {
  return vertical ? (
    <span className="h-[12px] w-px flex-none" style={{ background: "var(--wk-line)" }} />
  ) : (
    <div className="h-px w-full" style={{ background: "var(--wk-line)" }} />
  );
}

export function PaneHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-[34px] flex-none items-center gap-[9px] px-3"
      style={{ background: "var(--wk-panel)", borderBottom: "1px solid var(--wk-line)" }}
    >
      {children}
    </div>
  );
}

export function Mono({
  children,
  size = 11,
  color = "var(--wk-faint)",
  className,
  title,
}: {
  children: React.ReactNode;
  size?: number;
  color?: string;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={className}
      style={{ fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace', fontSize: size, color }}
    >
      {children}
    </span>
  );
}
