import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import type { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { toast } from "sonner";

import {
  LEGACY_ROUTES,
  byteLength,
  formatBytes,
  getTransform,
  lineCount,
  type Opts,
} from "@/lib/transforms";
import { detect, type Candidate } from "@/lib/detect";
import { buildOutline } from "@/lib/outline";
import { decodePipeline, shareUrl } from "@/lib/shareLink";
import { canExportPdf, exportPdf } from "@/lib/exportPdf";
import { DETECT_LIMIT_BYTES, extensionFor, useWorkspace } from "@/state/workspace";
import { useRecents } from "@/hooks/use-recents";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMinWidth } from "@/hooks/use-min-width";

import { TitleBar } from "@/components/workspace/TitleBar";
import { Rail } from "@/components/workspace/Rail";
import { TabStrip } from "@/components/workspace/TabStrip";
import { PipelineBar } from "@/components/workspace/PipelineBar";
import { CodePane } from "@/components/workspace/CodePane";
import { OutputView, type OutputMode } from "@/components/workspace/OutputView";
import { StatusBar } from "@/components/workspace/StatusBar";
import { SidePanel } from "@/components/workspace/SidePanel";
import { DetectBanner } from "@/components/workspace/DetectBanner";
import { CommandPalette, type PaletteAction } from "@/components/workspace/CommandPalette";
import { MobileWorkspace } from "@/components/workspace/MobileWorkspace";
import { Icon } from "@/components/workspace/Icon";
import { Mono, PaneHeader } from "@/components/workspace/Chrome";

/**
 * Anything that already owns the keyboard. BUTTON and SELECT are in here
 * because a bare Backspace used to delete the focused pipeline step from a
 * focused dropdown or icon button — destroying work with no undo.
 */
function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return (
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.tagName === "SELECT" ||
    el.tagName === "BUTTON" ||
    el.tagName === "A" ||
    el.isContentEditable ||
    Boolean(el.closest?.(".cm-editor"))
  );
}

export default function Workspace() {
  const { state, dispatch, buffer, evaluation, stale } = useWorkspace();
  const { recents, push: pushRecent } = useRecents();
  const isMobile = useIsMobile();
  // Under this width the side panel would starve the editors, so it floats
  // over the output instead of stealing a quarter of the row.
  const roomForPanel = useMinWidth(1180);
  const params = useParams();

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [focusedStepId, setFocusedStepId] = useState<string | null>(null);
  const [outputMode, setOutputMode] = useState<OutputMode>("raw");
  const bufferCount = state.buffers.length;
  const [diffAgainstId, setDiffAgainstId] = useState<string | null>(null);
  const outputRef = useRef<ReactCodeMirrorRef>(null);
  const seeded = useRef(false);
  const countRef = useRef(bufferCount);
  countRef.current = bufferCount;

  const sourceBytes = byteLength(buffer.source);
  const detectable = sourceBytes <= DETECT_LIMIT_BYTES;
  const outline = useMemo(
    () => (evaluation.language === "json" ? buildOutline(evaluation.output) : null),
    [evaluation.language, evaluation.output],
  );

  /* --- seed from a legacy /tools/... route or a shared #p= pipeline ------ */
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;

    const hash = window.location.hash;
    const shared = hash.startsWith("#p=") ? decodePipeline(hash.slice(3)) : null;
    if (shared) {
      dispatch({ type: "setSteps", steps: shared });
      history.replaceState(null, "", window.location.pathname);
      toast.success("Pipeline loaded from the link", {
        description: "The steps came across; paste your own payload to run them.",
      });
      return;
    }

    const path = params.slug ? `/tools/${params.slug}` : null;
    const transformId = path ? LEGACY_ROUTES[path] : null;
    if (transformId) {
      dispatch({ type: "setSteps", steps: [{ transformId }] });
      pushRecent(transformId);
    }
  }, [dispatch, params.slug, pushRecent]);

  /* --- detection ---------------------------------------------------------- */
  const candidates = useMemo<Candidate[]>(() => {
    if (!state.suggestOnPaste) return [];
    if (buffer.steps.length > 0) return [];
    if (!detectable) return [];
    return detect(buffer.source);
  }, [buffer.source, buffer.steps.length, state.suggestOnPaste, detectable]);

  const suggestion = useMemo(
    () => (candidates.length && candidates[0].id !== buffer.dismissedDetection ? candidates : []),
    [candidates, buffer.dismissedDetection],
  );

  const applyCandidate = useCallback(
    (candidate: Candidate) => {
      dispatch({ type: "setSteps", steps: candidate.steps.map((s) => ({ transformId: s.transformId, opts: s.opts })) });
      candidate.steps.forEach((s) => pushRecent(s.transformId));
    },
    [dispatch, pushRecent],
  );

  /* --- actions ------------------------------------------------------------ */
  const addStep = useCallback(
    (transformId: string) => {
      dispatch({ type: "addStep", transformId });
      pushRecent(transformId);
    },
    [dispatch, pushRecent],
  );

  const useOnly = useCallback(
    (transformId: string) => {
      dispatch({ type: "setSteps", steps: [{ transformId }] });
      pushRecent(transformId);
    },
    [dispatch, pushRecent],
  );

  const newBuffer = useCallback(() => {
    dispatch({ type: "newBuffer" });
    // The reducer refuses rather than evicting a buffer with content in it.
    window.setTimeout(() => {
      if (countRef.current === bufferCount) {
        toast.info("Close a buffer first", {
          description: "Every open buffer has something in it, and none of them are going to be thrown away.",
        });
      }
    }, 0);
  }, [dispatch, bufferCount]);

  const copyOutput = useCallback(async () => {
    if (!evaluation.output) return;
    try {
      await navigator.clipboard.writeText(evaluation.output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
      toast.success(`${formatBytes(byteLength(evaluation.output))} copied`);
    } catch {
      toast.error("The browser refused clipboard access");
    }
  }, [evaluation.output]);

  const saveOutput = useCallback(() => {
    const blob = new Blob([evaluation.output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const base = buffer.name.replace(/\.[^.]+$/, "");
    link.href = url;
    link.download = `${base}.${extensionFor(evaluation.language)}`;
    link.click();
    URL.revokeObjectURL(url);
  }, [evaluation.output, evaluation.language, buffer.name]);

  const savePdf = useCallback(async () => {
    const base = buffer.name.replace(/\.[^.]+$/, "");
    const html =
      evaluation.language === "markdown"
        ? (getTransform("markdown-to-html")!.run(evaluation.output, { breaks: true }).output ?? "")
        : evaluation.output;
    const dismiss = toast.loading("Rendering the PDF…");
    try {
      await exportPdf(html, `${base}.pdf`);
      toast.success("PDF saved", { id: dismiss });
    } catch (err) {
      toast.error("Could not render the PDF", {
        id: dismiss,
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }, [buffer.name, evaluation.language, evaluation.output]);

  const copyShareLink = useCallback(async () => {
    if (buffer.steps.length === 0) {
      toast.info("Add a step first — a link with no steps is just the home page.");
      return;
    }
    await navigator.clipboard.writeText(shareUrl(buffer.steps));
    toast.success("Link copied", { description: "It carries the steps, never the data." });
  }, [buffer.steps]);

  const jumpToLine = useCallback((line?: number) => {
    const view = outputRef.current?.view;
    if (!view || !line) return;
    const target = view.state.doc.line(Math.min(line, view.state.doc.lines));
    view.dispatch({ selection: { anchor: target.from }, scrollIntoView: true });
    view.focus();
  }, []);

  /* --- keyboard ----------------------------------------------------------- */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;

      if (mod && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
        return;
      }
      if (paletteOpen) return;

      if (mod && event.shiftKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        void copyOutput();
        return;
      }
      if (mod && event.shiftKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        setPaletteOpen(true);
        return;
      }
      if (mod && !event.shiftKey && event.key.toLowerCase() === "n") {
        event.preventDefault();
        newBuffer();
        return;
      }
      if (isTypingTarget(event.target)) return;

      const digit = /^Digit([1-3])$/.exec(event.code);
      if (event.altKey && digit) {
        const def = recents[Number(digit[1]) - 1];
        if (def) {
          event.preventDefault();
          addStep(def.id);
        }
        return;
      }

      // Only claim Enter/Escape when nothing else is focused. Swallowing them
      // globally made every other button in the app unactivatable by keyboard
      // while a suggestion was on screen.
      const onBody = event.target === document.body;
      if (event.key === "Enter" && suggestion.length && onBody) {
        event.preventDefault();
        applyCandidate(suggestion[0]);
        return;
      }
      if (event.key === "Escape" && suggestion.length) {
        event.preventDefault();
        dispatch({ type: "dismissDetection", candidateId: suggestion[0].id });
        return;
      }
      if ((event.key === "Backspace" || event.key === "Delete") && focusedStepId) {
        event.preventDefault();
        dispatch({ type: "removeStep", stepId: focusedStepId });
        setFocusedStepId(null);
        return;
      }
      if (event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown") && focusedStepId) {
        event.preventDefault();
        dispatch({ type: "moveStep", stepId: focusedStepId, delta: event.key === "ArrowUp" ? -1 : 1 });
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen, copyOutput, dispatch, recents, addStep, suggestion, applyCandidate, focusedStepId, newBuffer]);

  const paletteCommands = useMemo<PaletteAction[]>(
    () => [
      { id: "cmd:new", group: "Commands", label: "New buffer", run: newBuffer },
      { id: "cmd:clear", group: "Commands", label: "Clear all steps", run: () => dispatch({ type: "clearSteps" }) },
      { id: "cmd:copy", group: "Commands", label: "Copy output", run: () => void copyOutput() },
      { id: "cmd:save", group: "Commands", label: "Save output as a file", run: saveOutput },
      { id: "cmd:share", group: "Commands", label: "Copy a link to this pipeline", run: () => void copyShareLink() },
      ...(canExportPdf(evaluation.language)
        ? [
            {
              id: "cmd:pdf",
              group: "Commands",
              label: "Export the output as a PDF",
              run: () => void savePdf(),
            },
          ]
        : []),
      {
        id: "cmd:view-raw",
        group: "Commands",
        label: "Show the output as raw text",
        run: () => setOutputMode("raw"),
      },
      {
        id: "cmd:view-preview",
        group: "Commands",
        label: "Preview the rendered output",
        hint: "Markdown and HTML only",
        run: () => setOutputMode("preview"),
      },
      {
        id: "cmd:view-diff",
        group: "Commands",
        label: "Diff the output against another buffer",
        run: () => setOutputMode("diff"),
      },
      {
        id: "cmd:flatten",
        group: "Commands",
        label: "Replace the buffer with the result",
        hint: "Bakes the pipeline into the source and clears the steps",
        run: () => dispatch({ type: "flatten", output: evaluation.output }),
      },
      {
        id: "cmd:suggest",
        group: "Commands",
        label: state.suggestOnPaste ? "Turn off paste suggestions" : "Turn on paste suggestions",
        run: () => dispatch({ type: "setFlag", key: "suggestOnPaste", value: !state.suggestOnPaste }),
      },
    ],
    [dispatch, copyOutput, saveOutput, copyShareLink, savePdf, newBuffer, evaluation.output, evaluation.language, state.suggestOnPaste],
  );

  const palette = (
    <CommandPalette
      open={paletteOpen}
      onClose={() => setPaletteOpen(false)}
      bufferName={buffer.name}
      currentOutput={evaluation.output || buffer.source}
      currentLanguage={evaluation.language}
      buffers={state.buffers}
      onAddStep={addStep}
      onUseOnly={useOnly}
      onSelectBuffer={(id) => dispatch({ type: "selectBuffer", id })}
      commands={paletteCommands}
    />
  );

  const panel = (
    <SidePanel
      outline={outline}
      steps={buffer.steps}
      buffers={state.buffers}
      activeId={state.activeId}
      sourceName={buffer.name}
      onJump={jumpToLine}
      onSelectBuffer={(id) => dispatch({ type: "selectBuffer", id })}
      onClearSession={() => dispatch({ type: "clearSession" })}
    />
  );

  const head = (
    <Helmet>
      <title>UtilityHub — one buffer, every tool</title>
      <meta
        name="description"
        content="A keyboard-first developer workspace: paste once, chain formatters, encoders and converters, and copy the result. Everything runs locally in your browser."
      />
    </Helmet>
  );

  if (isMobile) {
    return (
      <>
        {head}
        <MobileWorkspace
          onOpenPalette={() => setPaletteOpen(true)}
          onCopy={copyOutput}
          onSave={saveOutput}
          onShare={copyShareLink}
          suggestion={suggestion}
          onApplyCandidate={applyCandidate}
          onDismissCandidate={() =>
            suggestion.length && dispatch({ type: "dismissDetection", candidateId: suggestion[0].id })
          }
          copied={copied}
        />
        {palette}
      </>
    );
  }

  return (
    <>
      {head}
      <div className="flex h-full flex-col" style={{ background: "var(--wk-bg)", color: "var(--wk-text)" }}>
        <TitleBar onOpenPalette={() => setPaletteOpen(true)} />

        <div className="flex min-h-0 flex-1">
          <Rail
            recents={recents}
            activeIds={buffer.steps.map((s) => s.transformId)}
            onPick={addStep}
          />

          <main className="flex min-w-0 flex-1 flex-col" style={{ background: "var(--wk-bg)" }}>
            <TabStrip
              buffers={state.buffers}
              activeId={state.activeId}
              showStructure={state.showStructure}
              onSelect={(id) => dispatch({ type: "selectBuffer", id })}
              onClose={(id) => dispatch({ type: "closeBuffer", id })}
              onNew={newBuffer}
              onToggleStructure={() =>
                dispatch({ type: "setFlag", key: "showStructure", value: !state.showStructure })
              }
            />

            {suggestion.length > 0 && (
              <DetectBanner
                candidates={suggestion}
                onApply={applyCandidate}
                onDismiss={() => dispatch({ type: "dismissDetection", candidateId: suggestion[0].id })}
              />
            )}

            <PipelineBar
              steps={buffer.steps}
              results={evaluation.steps}
              focusedStepId={focusedStepId}
              stale={stale}
              copied={copied}
              canCopy={Boolean(evaluation.output)}
              totalMs={evaluation.totalMs}
              onFocusStep={(id) => setFocusedStepId((current) => (current === id ? null : id))}
              onRemoveStep={(id) => dispatch({ type: "removeStep", stepId: id })}
              onOptionChange={(stepId, key, value: Opts[string]) =>
                dispatch({ type: "setStepOpts", stepId, opts: { [key]: value } })
              }
              onAddStep={() => setPaletteOpen(true)}
              onCopy={copyOutput}
            />

            <div className="relative flex min-h-0 flex-1">
              <section
                className="flex min-w-0 flex-1 flex-col"
                style={{ borderRight: "1px solid var(--wk-line)" }}
              >
                <PaneHeader>
                  <span className="wk-label">Input</span>
                  <Mono size={10.5}>
                    {buffer.source ? `${formatBytes(sourceBytes)} · ${lineCount(buffer.source)} lines` : "empty"}
                  </Mono>
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "setSource", id: buffer.id, source: "" })}
                    className="wk-focus rounded"
                    style={{ color: "var(--wk-faint)" }}
                    title="Clear this buffer"
                    aria-label="Clear this buffer"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </PaneHeader>
                <CodePane
                  value={buffer.source}
                  language={buffer.steps.length ? "text" : evaluation.language}
                  placeholder="Paste anything — JSON, base64, a minified bundle, an encoded URL. It will tell you what it thinks it is before it touches it."
                  onChange={(value) => dispatch({ type: "setSource", id: buffer.id, source: value, rename: true })}
                />
              </section>

              <section className="flex min-w-0 flex-1 flex-col">
                <PaneHeader>
                  <span className="wk-label">Output</span>
                  <Mono size={10.5}>
                    {evaluation.output
                      ? `${formatBytes(byteLength(evaluation.output))} · ${lineCount(evaluation.output)} lines`
                      : "nothing yet"}
                  </Mono>
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={saveOutput}
                    disabled={!evaluation.output}
                    aria-label="Save the output as a file"
                    title="Save the output as a file"
                    className="wk-focus flex h-[20px] items-center gap-[5px] rounded-[5px] px-[7px]"
                    style={{ background: "var(--wk-raised)", border: "1px solid var(--wk-line)" }}
                  >
                    <span style={{ color: "var(--wk-faint)" }}>
                      <Icon name="download" size={11} />
                    </span>
                    <span className="hidden text-[10.5px] xl:inline" style={{ color: "var(--wk-dim)" }}>
                      Save as
                    </span>
                  </button>
                  {canExportPdf(evaluation.language) && (
                    <button
                      type="button"
                      onClick={savePdf}
                      disabled={!evaluation.output}
                      className="wk-focus flex h-[20px] items-center gap-[5px] rounded-[5px] px-[7px]"
                      style={{ background: "var(--wk-raised)", border: "1px solid var(--wk-line)" }}
                      title="Render the output to a PDF"
                    >
                      <span style={{ color: "var(--wk-faint)" }}>
                        <Icon name="download" size={11} />
                      </span>
                      <span className="text-[10.5px]" style={{ color: "var(--wk-dim)" }}>
                        PDF
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={copyShareLink}
                    aria-label="Copy a link to this pipeline"
                    title="Copy a link to this pipeline"
                    className="wk-focus flex h-[20px] items-center gap-[5px] rounded-[5px] px-[7px]"
                    style={{ background: "var(--wk-raised)", border: "1px solid var(--wk-line)" }}
                  >
                    <span style={{ color: "var(--wk-faint)" }}>
                      <Icon name="link" size={11} />
                    </span>
                    <span className="hidden text-[10.5px] xl:inline" style={{ color: "var(--wk-dim)" }}>
                      Share link
                    </span>
                  </button>
                </PaneHeader>

                {evaluation.error ? (
                  <div role="alert" className="flex min-h-0 flex-1 flex-col items-start gap-2 p-4">
                    <div className="flex items-start gap-[9px]">
                      <span style={{ color: "var(--wk-err)", paddingTop: 1 }}>
                        <Icon name="alert" size={14} />
                      </span>
                      <div>
                        <p className="mb-1 text-[13px]" style={{ color: "var(--wk-text)" }}>
                          {evaluation.error.message}
                          {evaluation.error.line
                            ? ` — line ${evaluation.error.line}, column ${evaluation.error.column}`
                            : ""}
                        </p>
                        {evaluation.error.hint && (
                          <p className="text-[11.5px] leading-[17px]" style={{ color: "var(--wk-faint)" }}>
                            {evaluation.error.hint}
                          </p>
                        )}
                        <p className="mt-3 text-[11.5px]" style={{ color: "var(--wk-faint)" }}>
                          Steps before this one still ran — their output is what Copy gives you.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <OutputView
                    value={evaluation.output}
                    language={evaluation.language}
                    mode={outputMode}
                    onModeChange={setOutputMode}
                    buffers={state.buffers}
                    activeBufferId={state.activeId}
                    diffAgainstId={diffAgainstId}
                    onDiffAgainstChange={setDiffAgainstId}
                    editorRef={outputRef}
                  />
                )}
              </section>

              {state.showStructure && !roomForPanel && (
                <div
                  className="absolute bottom-0 right-0 top-0 z-30 flex"
                  style={{ boxShadow: "-12px 0 32px var(--wk-shadow)" }}
                >
                  {panel}
                </div>
              )}
            </div>

            <StatusBar source={buffer.source} evaluation={evaluation} outline={outline} stale={stale} />
          </main>

          {state.showStructure && roomForPanel && panel}
        </div>
      </div>
      {palette}
    </>
  );
}
