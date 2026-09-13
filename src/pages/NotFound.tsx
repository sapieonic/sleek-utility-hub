import { Link, useLocation } from "react-router-dom";
import { Icon } from "@/components/workspace/Icon";
import { Mono } from "@/components/workspace/Chrome";

export default function NotFound() {
  const location = useLocation();

  return (
    <div
      className="flex h-full flex-col items-center justify-center px-6"
      style={{ background: "var(--wk-bg)", color: "var(--wk-text)" }}
    >
      <span className="mb-5" style={{ color: "var(--wk-accent)" }}>
        <Icon name="mark" size={34} />
      </span>
      <h1 className="mb-2 text-[20px] font-semibold">No tool lives at that address.</h1>
      <p className="mb-1 max-w-[440px] text-center text-[13px] leading-[20px]" style={{ color: "var(--wk-dim)" }}>
        Every tool now runs inside one workspace, so there is a single page to go back to.
      </p>
      <Mono size={11} className="mb-6">
        {location.pathname}
      </Mono>
      <Link
        to="/"
        className="wk-focus flex h-[32px] items-center gap-2 rounded-md px-4 text-[13px] font-semibold"
        style={{ background: "var(--wk-accent)", color: "var(--wk-accent-ink)" }}
      >
        Open the workspace
      </Link>
    </div>
  );
}
