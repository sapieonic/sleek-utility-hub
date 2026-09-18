import { getTransform, type Opts } from "./transforms";
import type { PipelineStep } from "./pipelineExport";

export interface SharedStep {
  t: string;
  o?: Opts;
}

/**
 * The link carries the STEPS, never the buffer. A teammate opens the same
 * pipeline and pastes their own payload — nothing you pasted travels.
 */
export function encodePipeline(steps: PipelineStep[]): string {
  const payload: SharedStep[] = steps
    .filter((s) => s.enabled)
    .map((s) => ({ t: s.transformId, o: Object.keys(s.opts).length ? s.opts : undefined }));
  if (payload.length === 0) return "";
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodePipeline(encoded: string): { transformId: string; opts?: Opts }[] | null {
  try {
    let normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padding = normalized.length % 4;
    if (padding) normalized += "=".repeat(4 - padding);
    const binary = atob(normalized);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as SharedStep[];
    if (!Array.isArray(parsed)) return null;
    const steps = parsed
      .filter((s) => s && typeof s.t === "string" && getTransform(s.t))
      .map((s) => ({ transformId: s.t, opts: s.o }));
    return steps.length ? steps : null;
  } catch {
    return null;
  }
}

export function shareUrl(steps: PipelineStep[]): string {
  const encoded = encodePipeline(steps);
  const base = `${window.location.origin}${window.location.pathname}`;
  return encoded ? `${base}#p=${encoded}` : base;
}
