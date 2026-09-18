import { getTransform, shq, type Opts } from "./transforms";

export interface PipelineStep {
  id: string;
  transformId: string;
  opts: Opts;
  enabled: boolean;
}

export type ExportTarget = "shell" | "node" | "python";

export interface ExportResult {
  code: string;
  /** Steps with no faithful command-line equivalent — named, never silently dropped. */
  missing: string[];
  requires: string[];
}

const SHELL_REQUIREMENTS: Record<string, string> = {
  "json-format": "jq",
  "url-encode": "jq",
};

/**
 * The GUI is for working it out; this is for keeping it. Where a step has no
 * honest one-liner we say so rather than emitting something that looks right
 * and is not.
 */
export function exportPipeline(
  steps: PipelineStep[],
  target: ExportTarget,
  sourceName = "input.txt",
): ExportResult {
  const active = steps.filter((s) => s.enabled);
  const missing: string[] = [];
  const requires = new Set<string>();

  if (active.length === 0) {
    return { code: "# Add a step to see the equivalent command.", missing: [], requires: [] };
  }

  if (target === "shell") {
    const parts: string[] = [];
    for (const step of active) {
      const def = getTransform(step.transformId);
      if (!def) continue;
      const fragment = def.shell?.(step.opts) ?? null;
      if (!fragment) {
        missing.push(def.name);
        continue;
      }
      if (SHELL_REQUIREMENTS[def.id]) requires.add(SHELL_REQUIREMENTS[def.id]);
      parts.push(fragment);
    }
    if (parts.length === 0 || missing.length > 0) {
      // Emitting the steps that DO translate would hand someone a runnable
      // command that quietly computes something else. Better to give nothing
      // and name what is missing.
      return { code: "", missing, requires: [...requires] };
    }
    // Quoted: the name comes from a buffer tab the user can rename to anything,
    // and this string is about to be pasted into somebody's shell.
    const code = [`cat ${shq(sourceName)} \\`, ...parts.map((p, i) => `  | ${p}${i === parts.length - 1 ? "" : " \\"}`)].join("\n");
    return { code, missing, requires: [...requires] };
  }

  if (target === "node") {
    const body: string[] = [`let input = fs.readFileSync(${JSON.stringify(sourceName)}, "utf8");`, ""];
    for (const step of active) {
      const def = getTransform(step.transformId);
      if (!def) continue;
      const expr = def.node?.(step.opts) ?? null;
      if (!expr) {
        missing.push(def.name);
        continue;
      }
      body.push(`// ${def.name}`);
      body.push(`input = ${expr};`);
    }
    body.push("", "process.stdout.write(input);");
    return {
      code: missing.length > 0 ? "" : [`import fs from "node:fs";`, "", ...body].join("\n"),
      missing,
      requires: [...requires],
    };
  }

  const imports = new Set<string>();
  const body: string[] = [];
  for (const step of active) {
    const def = getTransform(step.transformId);
    if (!def) continue;
    const expr = def.python?.(step.opts) ?? null;
    if (!expr) {
      missing.push(def.name);
      continue;
    }
    if (expr.includes("json.")) imports.add("import json");
    if (expr.includes("base64.")) imports.add("import base64");
    if (expr.includes("urllib.")) imports.add("import urllib.parse");
    body.push(`# ${def.name}`);
    body.push(`text = ${expr}`);
  }
  if (missing.length > 0) return { code: "", missing, requires: [...requires] };

  return {
    code: [
      ...[...imports].sort(),
      imports.size ? "" : null,
      `text = open(${JSON.stringify(sourceName)}).read()`,
      "",
      ...body,
      "",
      "print(text)",
    ]
      .filter((l): l is string => l !== null)
      .join("\n"),
    missing,
    requires: [...requires],
  };
}
