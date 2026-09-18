import React from "react";

/**
 * One stroke-based set on a 16px grid, 1.5 stroke, round caps. Everything
 * inherits `currentColor` so a parent can recolour it.
 */
const PATHS: Record<string, React.ReactNode> = {
  mark: (
    <>
      <rect x="1.4" y="1.4" width="17.2" height="17.2" rx="5" strokeWidth="1.5" />
      <path d="M6.2 7.2 L9.3 10 L6.2 12.8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.4 13.1 H14.2" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  search: (
    <>
      <circle cx="7" cy="7" r="4.6" strokeWidth="1.5" />
      <path d="M10.5 10.5 L14 14" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  shield: <path d="M8 1.8 L13.2 3.9 V8 c0 3.2 -2.2 5.2 -5.2 6.2 C5 13.2 2.8 11.2 2.8 8 V3.9 Z" strokeWidth="1.5" strokeLinejoin="round" />,
  lock: (
    <>
      <rect x="3" y="7" width="10" height="6.6" rx="1.6" strokeWidth="1.4" />
      <path d="M5.4 7 V5 a2.6 2.6 0 0 1 5.2 0 v2" strokeWidth="1.4" />
    </>
  ),
  clock: (
    <>
      <circle cx="8" cy="8" r="6.2" strokeWidth="1.5" />
      <path d="M8 4.6 V8 l2.4 1.5" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  moon: <path d="M13.2 9.6 A5.6 5.6 0 0 1 6.4 2.8 A5.7 5.7 0 1 0 13.2 9.6 Z" strokeWidth="1.5" strokeLinejoin="round" />,
  sun: (
    <>
      <circle cx="8" cy="8" r="3.1" strokeWidth="1.5" />
      <path d="M8 1.4 v1.6 M8 13 v1.6 M1.4 8 h1.6 M13 8 h1.6 M3.3 3.3 l1.2 1.2 M11.5 11.5 l1.2 1.2 M12.7 3.3 l-1.2 1.2 M4.5 11.5 l-1.2 1.2" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  git: (
    <>
      <circle cx="4.2" cy="3.4" r="1.9" strokeWidth="1.5" />
      <circle cx="11.8" cy="3.4" r="1.9" strokeWidth="1.5" />
      <circle cx="8" cy="12.6" r="1.9" strokeWidth="1.5" />
      <path d="M4.2 5.3 V7 a1.6 1.6 0 0 0 1.6 1.6 h4.4 A1.6 1.6 0 0 0 11.8 7 V5.3 M8 8.6 v2.1" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  plus: <path d="M8 3.2 v9.6 M3.2 8 h9.6" strokeWidth="1.6" strokeLinecap="round" />,
  close: <path d="M4 4 L12 12 M12 4 L4 12" strokeWidth="1.5" strokeLinecap="round" />,
  chevronDown: <path d="M3.6 6 L8 10.4 L12.4 6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />,
  chevronRight: <path d="M6 3.6 L10.4 8 L6 12.4" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />,
  arrowRight: <path d="M3 8 h9 M9 5 l3 3 -3 3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
  arrowDown: <path d="M8 3 v9 M5 9 l3 3 3 -3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
  grip: (
    <>
      <circle cx="6" cy="3.5" r="1.05" strokeWidth="0" fill="currentColor" />
      <circle cx="10" cy="3.5" r="1.05" strokeWidth="0" fill="currentColor" />
      <circle cx="6" cy="8" r="1.05" strokeWidth="0" fill="currentColor" />
      <circle cx="10" cy="8" r="1.05" strokeWidth="0" fill="currentColor" />
      <circle cx="6" cy="12.5" r="1.05" strokeWidth="0" fill="currentColor" />
      <circle cx="10" cy="12.5" r="1.05" strokeWidth="0" fill="currentColor" />
    </>
  ),
  copy: (
    <>
      <rect x="5.4" y="5.4" width="8.4" height="8.4" rx="1.8" strokeWidth="1.5" />
      <path d="M10.6 2.2 H3.9 A1.7 1.7 0 0 0 2.2 3.9 v6.7" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  check: <path d="M3.2 8.4 L6.4 11.6 L12.8 4.8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  download: <path d="M8 2.4 v7.4 M5.2 7 L8 9.8 L10.8 7 M3 12.8 h10" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
  link: <path d="M6.6 9.4 L9.4 6.6 M6.8 4.4 L8.4 2.8 a2.6 2.6 0 0 1 3.7 3.7 L10.5 8.1 M9.2 11.6 L7.6 13.2 a2.6 2.6 0 0 1 -3.7 -3.7 L5.5 7.9" strokeWidth="1.5" strokeLinecap="round" />,
  trash: <path d="M3 4.4 h10 M6 4.4 V3.2 h4 v1.2 M4.4 4.4 l0.7 8.4 h5.8 l0.7 -8.4" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />,
  alert: (
    <>
      <path d="M8 2.6 L14.4 13.4 H1.6 Z" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 6.6 v3" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  info: (
    <>
      <circle cx="8" cy="8" r="6.2" strokeWidth="1.4" />
      <path d="M8 7.2 v3.8" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="5.1" r="0.85" strokeWidth="0" fill="currentColor" />
    </>
  ),
  zap: <path d="M8.8 1.6 L3.2 9.2 h4 l-0.8 5.2 l5.6 -7.6 h-4 Z" strokeWidth="1.5" strokeLinejoin="round" />,
  braces: (
    <>
      <path d="M6.3 2.2 C4.6 2.2 4.6 4.4 4.6 5.4 c0 1.1 -0.7 2.6 -2.2 2.6 c1.5 0 2.2 1.5 2.2 2.6 c0 1 0 3.2 1.7 3.2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.7 2.2 c1.7 0 1.7 2.2 1.7 3.2 c0 1.1 0.7 2.6 2.2 2.6 c-1.5 0 -2.2 1.5 -2.2 2.6 c0 1 0 3.2 -1.7 3.2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  binary: (
    <>
      <rect x="2.2" y="2.4" width="4.6" height="11.2" rx="1.6" strokeWidth="1.4" />
      <rect x="9.2" y="2.4" width="4.6" height="4.6" rx="1.4" strokeWidth="1.4" />
      <path d="M11.5 9.6 v4" strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
  code: <path d="M5.6 4.6 L2.2 8 L5.6 11.4 M10.4 4.6 L13.8 8 L10.4 11.4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
  swap: <path d="M3.4 5.6 h9.2 M3.4 5.6 l2.6 -2.6 M3.4 5.6 l2.6 2.6 M12.6 10.4 h-9.2 M12.6 10.4 l-2.6 -2.6 M12.6 10.4 l-2.6 2.6" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />,
  type: <path d="M3.2 3.6 h9.6 M8 3.6 v8.8 M5.8 12.4 h4.4" strokeWidth="1.5" strokeLinecap="round" />,
  hash: <path d="M6.2 2.6 L5 13.4 M11 2.6 L9.8 13.4 M2.6 5.8 h10.8 M2.2 10.2 h10.8" strokeWidth="1.4" strokeLinecap="round" />,
  database: (
    <>
      <ellipse cx="8" cy="4" rx="5.2" ry="2.2" strokeWidth="1.4" />
      <path d="M2.8 4 v8 c0 1.2 2.3 2.2 5.2 2.2 s5.2 -1 5.2 -2.2 V4" strokeWidth="1.4" />
      <path d="M2.8 8 c0 1.2 2.3 2.2 5.2 2.2 s5.2 -1 5.2 -2.2" strokeWidth="1.4" />
    </>
  ),
  wrap: <path d="M2.4 4 h11.2 M2.4 8 h8.4 a2.4 2.4 0 0 1 0 4.8 H8.4 M2.4 12.8 h3.6" strokeWidth="1.4" strokeLinecap="round" />,
  paste: (
    <>
      <rect x="3.6" y="2.4" width="8.8" height="11.2" rx="1.8" strokeWidth="1.4" />
      <path d="M6.2 2.4 V1.6 h3.6 v0.8" strokeWidth="1.4" strokeLinejoin="round" />
    </>
  ),
  columns: (
    <>
      <rect x="2" y="3" width="12" height="10" rx="1.6" strokeWidth="1.4" />
      <path d="M8 3 v10" strokeWidth="1.4" />
    </>
  ),
  rows: (
    <>
      <rect x="2" y="3" width="12" height="10" rx="1.6" strokeWidth="1.4" />
      <path d="M2 8 h12" strokeWidth="1.4" />
    </>
  ),
  panelRight: (
    <>
      <rect x="2" y="3" width="12" height="10" rx="1.6" strokeWidth="1.4" />
      <path d="M10.5 3 v10" strokeWidth="1.4" />
    </>
  ),
  menu: <path d="M2.6 4.4 h10.8 M2.6 8 h10.8 M2.6 11.6 h10.8" strokeWidth="1.6" strokeLinecap="round" />,
  eye: (
    <>
      <path d="M1.6 8 S4 3.6 8 3.6 14.4 8 14.4 8 12 12.4 8 12.4 1.6 8 1.6 8 Z" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="2" strokeWidth="1.4" />
    </>
  ),
  undo: <path d="M3 6.4 h6.2 a3.6 3.6 0 0 1 0 7.2 H5.4 M3 6.4 l2.8 -2.8 M3 6.4 l2.8 2.8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
};

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = 15,
  className,
  style,
}: {
  name: IconName;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const viewBox = name === "mark" ? "0 0 20 20" : "0 0 16 16";
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      className={className}
      style={{ flex: "none", ...style }}
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}

export function Kbd({ children, tone }: { children: React.ReactNode; tone?: "accent" }) {
  return (
    <span
      className="wk-kbd"
      aria-hidden="true"
      style={
        tone === "accent"
          ? { background: "var(--wk-bg)", borderColor: "var(--wk-line)", color: "var(--wk-accent)" }
          : undefined
      }
    >
      {children}
    </span>
  );
}
