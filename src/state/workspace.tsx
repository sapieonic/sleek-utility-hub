import React, {
  createContext,
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import {
  defaults,
  getTransform,
  sniffLanguage,
  type Lang,
  type Opts,
  type TransformError,
} from "@/lib/transforms";
import type { PipelineStep } from "@/lib/pipelineExport";

const STORAGE_KEY = "utilityhub.workspace.v2";
const MAX_BUFFERS = 12;
/**
 * Paste detection does a full Base64 round-trip, which is not worth doing on a
 * multi-megabyte buffer while someone is typing into it.
 */
export const DETECT_LIMIT_BYTES = 2 * 1024 * 1024;

export interface Buffer {
  id: string;
  name: string;
  source: string;
  steps: PipelineStep[];
  updatedAt: number;
  /** Candidate id the user already said no to, so we stop asking. */
  dismissedDetection?: string;
}

export interface WorkspaceState {
  buffers: Buffer[];
  activeId: string;
  suggestOnPaste: boolean;
  applyWithoutAsking: boolean;
  showStructure: boolean;
}

type Action =
  | { type: "setSource"; id: string; source: string; rename?: boolean }
  | { type: "addStep"; transformId: string; opts?: Opts; index?: number }
  | { type: "removeStep"; stepId: string }
  | { type: "moveStep"; stepId: string; delta: number }
  | { type: "setStepOpts"; stepId: string; opts: Opts }
  | { type: "toggleStep"; stepId: string }
  | { type: "setSteps"; steps: { transformId: string; opts?: Opts }[] }
  | { type: "clearSteps" }
  | { type: "newBuffer"; source?: string; name?: string }
  | { type: "closeBuffer"; id: string }
  | { type: "selectBuffer"; id: string }
  | { type: "renameBuffer"; id: string; name: string }
  | { type: "dismissDetection"; candidateId: string }
  | { type: "flatten"; output: string }
  | { type: "setFlag"; key: "suggestOnPaste" | "applyWithoutAsking" | "showStructure"; value: boolean }
  | { type: "clearSession" }
  | { type: "hydrate"; state: WorkspaceState };

let counter = 0;
function uid(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`;
}

const EXTENSION: Record<Lang, string> = {
  json: "json",
  javascript: "js",
  html: "html",
  css: "css",
  sql: "sql",
  xml: "xml",
  markdown: "md",
  text: "txt",
};

/** Give a pasted buffer a name that says what it holds. */
export function nameFor(source: string, fallbackIndex: number): string {
  const trimmed = source.trim();
  if (!trimmed) return `untitled-${fallbackIndex}`;
  if (/^[[{]/.test(trimmed)) {
    try {
      JSON.parse(trimmed);
      return `payload.json`;
    } catch {
      /* not JSON after all */
    }
  }
  if (/^\s*<\?xml/i.test(trimmed)) return "document.xml";
  if (/^\s*</.test(trimmed)) return "markup.html";
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|WITH)\b/i.test(trimmed)) return "query.sql";
  if (/^[A-Za-z0-9+/=_-]{16,}$/.test(trimmed.replace(/\s+/g, ""))) return "encoded.b64";
  if (/^#{1,6}\s/.test(trimmed)) return "notes.md";
  return `untitled-${fallbackIndex}`;
}

/** Two tabs both called payload.json make the diff picker a guessing game. */
function uniqueName(name: string, taken: string[]): string {
  if (!taken.includes(name)) return name;
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  for (let n = 2; n < 100; n += 1) {
    const candidate = `${stem}-${n}${ext}`;
    if (!taken.includes(candidate)) return candidate;
  }
  return name;
}

function emptyBuffer(index: number): Buffer {
  return {
    id: uid("buf"),
    name: `untitled-${index}`,
    source: "",
    steps: [],
    updatedAt: Date.now(),
  };
}

export function initialState(): WorkspaceState {
  const first = emptyBuffer(1);
  return {
    buffers: [first],
    activeId: first.id,
    suggestOnPaste: true,
    applyWithoutAsking: false,
    showStructure: true,
  };
}

function makeStep(transformId: string, opts?: Opts): PipelineStep | null {
  const def = getTransform(transformId);
  if (!def) return null;
  return { id: uid("step"), transformId, opts: { ...defaults(def), ...(opts ?? {}) }, enabled: true };
}

function withActive(state: WorkspaceState, update: (buffer: Buffer) => Buffer): WorkspaceState {
  return {
    ...state,
    buffers: state.buffers.map((b) => (b.id === state.activeId ? { ...update(b), updatedAt: Date.now() } : b)),
  };
}

export function reducer(state: WorkspaceState, action: Action): WorkspaceState {
  switch (action.type) {
    case "hydrate":
      return action.state;

    case "setSource": {
      return {
        ...state,
        buffers: state.buffers.map((b) => {
          if (b.id !== action.id) return b;
          const renamed =
            action.rename && /^untitled-\d+$/.test(b.name)
              ? uniqueName(
                  nameFor(action.source, state.buffers.length),
                  state.buffers.filter((other) => other.id !== b.id).map((other) => other.name),
                )
              : b.name;
          return { ...b, source: action.source, name: renamed, updatedAt: Date.now() };
        }),
      };
    }

    case "addStep": {
      const step = makeStep(action.transformId, action.opts);
      if (!step) return state;
      return withActive(state, (b) => {
        const steps = [...b.steps];
        steps.splice(action.index ?? steps.length, 0, step);
        return { ...b, steps };
      });
    }

    case "removeStep":
      return withActive(state, (b) => ({ ...b, steps: b.steps.filter((s) => s.id !== action.stepId) }));

    case "moveStep":
      return withActive(state, (b) => {
        const index = b.steps.findIndex((s) => s.id === action.stepId);
        const target = index + action.delta;
        if (index === -1 || target < 0 || target >= b.steps.length) return b;
        const steps = [...b.steps];
        const [moved] = steps.splice(index, 1);
        steps.splice(target, 0, moved);
        return { ...b, steps };
      });

    case "setStepOpts":
      return withActive(state, (b) => ({
        ...b,
        steps: b.steps.map((s) => (s.id === action.stepId ? { ...s, opts: { ...s.opts, ...action.opts } } : s)),
      }));

    case "toggleStep":
      return withActive(state, (b) => ({
        ...b,
        steps: b.steps.map((s) => (s.id === action.stepId ? { ...s, enabled: !s.enabled } : s)),
      }));

    case "setSteps": {
      const steps = action.steps
        .map((s) => makeStep(s.transformId, s.opts))
        .filter((s): s is PipelineStep => s !== null);
      return withActive(state, (b) => ({ ...b, steps }));
    }

    case "clearSteps":
      return withActive(state, (b) => ({ ...b, steps: [] }));

    case "newBuffer": {
      const next = emptyBuffer(state.buffers.length + 1);
      const taken = state.buffers.map((b) => b.name);
      if (action.source !== undefined) {
        next.source = action.source;
        next.name = action.name ?? nameFor(action.source, state.buffers.length + 1);
      } else if (action.name) {
        next.name = action.name;
      }
      next.name = uniqueName(next.name, taken);
      let kept = state.buffers;
      if (kept.length >= MAX_BUFFERS) {
        // Evict an empty buffer if there is one; never drop text somebody
        // pasted just because they opened one tab too many.
        const disposable = kept.findIndex((b) => !b.source.trim());
        if (disposable === -1) return state;
        kept = kept.filter((_, i) => i !== disposable);
      }
      return { ...state, buffers: [...kept, next], activeId: next.id };
    }

    case "closeBuffer": {
      if (state.buffers.length === 1) {
        const fresh = emptyBuffer(1);
        return { ...state, buffers: [fresh], activeId: fresh.id };
      }
      const index = state.buffers.findIndex((b) => b.id === action.id);
      const buffers = state.buffers.filter((b) => b.id !== action.id);
      const activeId =
        state.activeId === action.id ? buffers[Math.max(0, index - 1)].id : state.activeId;
      return { ...state, buffers, activeId };
    }

    case "selectBuffer":
      return state.buffers.some((b) => b.id === action.id) ? { ...state, activeId: action.id } : state;

    case "renameBuffer":
      return {
        ...state,
        buffers: state.buffers.map((b) => (b.id === action.id ? { ...b, name: action.name } : b)),
      };

    case "dismissDetection":
      return withActive(state, (b) => ({ ...b, dismissedDetection: action.candidateId }));

    case "flatten":
      return withActive(state, (b) => ({ ...b, source: action.output, steps: [] }));

    case "setFlag":
      return { ...state, [action.key]: action.value };

    case "clearSession": {
      const fresh = emptyBuffer(1);
      return { ...state, buffers: [fresh], activeId: fresh.id };
    }

    default:
      return state;
  }
}

export interface StepOutput {
  stepId: string;
  transformId: string;
  input: string;
  output: string;
  language: Lang;
  notes: string[];
  error?: TransformError;
  ms: number;
  /** True when an earlier step failed, so this one never got to run. */
  skipped: boolean;
}

export interface Evaluation {
  steps: StepOutput[];
  /** What the last successful step produced — what Copy copies. */
  output: string;
  language: Lang;
  error?: TransformError;
  failedAtIndex: number;
  totalMs: number;
}

export function evaluate(source: string, steps: PipelineStep[]): Evaluation {
  const results: StepOutput[] = [];
  let current = source;
  let language: Lang = sniffLanguage(source);
  let failedAtIndex = -1;
  let totalMs = 0;

  steps.forEach((step, index) => {
    const def = getTransform(step.transformId);

    // Nothing downstream of a failure has run. Reporting a disabled step with
    // live content from a pipeline that already died is worse than saying so.
    if (failedAtIndex !== -1) {
      results.push({
        stepId: step.id,
        transformId: step.transformId,
        input: "",
        output: "",
        language,
        notes: [],
        ms: 0,
        skipped: true,
      });
      return;
    }

    if (!def) {
      failedAtIndex = index;
      results.push({
        stepId: step.id,
        transformId: step.transformId,
        input: current,
        output: "",
        language,
        notes: [],
        error: { message: `Unknown step "${step.transformId}"`, hint: "It may come from a newer build." },
        ms: 0,
        skipped: false,
      });
      return;
    }

    if (!step.enabled) {
      results.push({
        stepId: step.id,
        transformId: step.transformId,
        input: current,
        output: current,
        language,
        notes: ["disabled"],
        ms: 0,
        skipped: true,
      });
      return;
    }

    const started = performance.now();
    let result;
    try {
      result = def.run(current, step.opts);
    } catch (err) {
      result = {
        output: "",
        error: { message: err instanceof Error ? err.message : "Step threw unexpectedly" },
      };
    }
    const ms = performance.now() - started;
    totalMs += ms;

    if (result.error) {
      failedAtIndex = index;
      results.push({
        stepId: step.id,
        transformId: step.transformId,
        input: current,
        output: "",
        language,
        notes: result.notes ?? [],
        error: result.error,
        ms,
        skipped: false,
      });
      return;
    }

    const produced = def.produces === "same" ? language : (result.language ?? def.produces);
    language = produced as Lang;
    current = result.output;
    results.push({
      stepId: step.id,
      transformId: step.transformId,
      input: results.length ? results[results.length - 1].output : source,
      output: current,
      language,
      notes: result.notes ?? [],
      ms,
      skipped: false,
    });
  });

  const lastGood = failedAtIndex === -1 ? current : (results[failedAtIndex - 1]?.output ?? source);

  return {
    steps: results,
    output: failedAtIndex === -1 ? current : lastGood,
    language,
    error: failedAtIndex === -1 ? undefined : results[failedAtIndex].error,
    failedAtIndex,
    totalMs,
  };
}

export function extensionFor(language: Lang): string {
  return EXTENSION[language] ?? "txt";
}

interface WorkspaceValue {
  state: WorkspaceState;
  dispatch: React.Dispatch<Action>;
  buffer: Buffer;
  evaluation: Evaluation;
  /** True while the shown result is a keystroke or two behind the buffer. */
  stale: boolean;
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

function load(): WorkspaceState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorkspaceState;
    if (!parsed?.buffers?.length) return null;
    // Drop any step whose transform no longer exists rather than failing to boot.
    parsed.buffers = parsed.buffers.map((b) => ({
      ...b,
      steps: (b.steps ?? []).filter((s) => getTransform(s.transformId)),
    }));
    if (!parsed.buffers.some((b) => b.id === parsed.activeId)) {
      parsed.activeId = parsed.buffers[0].id;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  // Restore synchronously in the reducer's initialiser rather than in an effect.
  // localStorage is synchronous and there is no server render, and hydrating in
  // an effect used to land AFTER the page's own mount effects — which quietly
  // overwrote a pipeline seeded from a /tools/... URL or a shared #p= link.
  const [state, dispatch] = useReducer(reducer, undefined, () => load() ?? initialState());
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const handle = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Quota, private mode, or storage disabled — the app still works,
        // this session just will not outlive the tab.
      }
    }, 300);
    return () => window.clearTimeout(handle);
  }, [state]);

  const buffer = useMemo(
    () => state.buffers.find((b) => b.id === state.activeId) ?? state.buffers[0],
    [state.buffers, state.activeId],
  );

  // Typing stays responsive on a large buffer: React re-runs the pipeline at a
  // lower priority and the status bar says so while the result catches up.
  const deferredSource = useDeferredValue(buffer.source);
  const evaluation = useMemo(
    () => evaluate(deferredSource, buffer.steps),
    [deferredSource, buffer.steps],
  );
  const stale = deferredSource !== buffer.source;

  const value = useMemo(
    () => ({ state, dispatch, buffer, evaluation, stale }),
    [state, buffer, evaluation, stale],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceValue {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return value;
}

/** Convenience wrapper for the actions the chrome fires most. */
export function useWorkspaceActions() {
  const { dispatch, buffer } = useWorkspace();
  return useMemo(
    () => ({
      setSource: (source: string, rename = false) =>
        dispatch({ type: "setSource", id: buffer.id, source, rename }),
      addStep: (transformId: string, opts?: Opts) => dispatch({ type: "addStep", transformId, opts }),
      setSteps: (steps: { transformId: string; opts?: Opts }[]) => dispatch({ type: "setSteps", steps }),
    }),
    [dispatch, buffer.id],
  );
}

export { STORAGE_KEY };
export type { Action as WorkspaceAction };
