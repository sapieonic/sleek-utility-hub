import React, { useEffect, useMemo, useRef, useState } from "react";
import { ALL_TRANSFORMS, getTransform, defaults, type Lang } from "@/lib/transforms";
import { fuzzy, highlight } from "@/lib/fuzzy";
import type { Buffer } from "@/state/workspace";
import { Icon, Kbd } from "./Icon";
import { Mono } from "./Chrome";

const GROUP_ORDER = [
  "Do something to this buffer",
  "Open as a tool",
  "Buffers",
  "Commands",
];

export interface PaletteAction {
  id: string;
  group: string;
  label: string;
  hint?: string;
  /** Transform this row would run, for the live preview. */
  previewTransformId?: string;
  run: () => void;
}

interface Scored extends PaletteAction {
  score: number;
  hits: number[];
}

export function CommandPalette({
  open,
  onClose,
  bufferName,
  currentOutput,
  currentLanguage,
  buffers,
  onAddStep,
  onUseOnly,
  onSelectBuffer,
  commands,
}: {
  open: boolean;
  onClose: () => void;
  bufferName: string;
  currentOutput: string;
  currentLanguage: Lang;
  buffers: Buffer[];
  onAddStep: (transformId: string) => void;
  onUseOnly: (transformId: string) => void;
  onSelectBuffer: (id: string) => void;
  commands: PaletteAction[];
}) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    // Remember what opened us so the keyboard does not restart at the top of
    // the document when the palette closes.
    returnFocusTo.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setIndex(0);
    window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      const target = returnFocusTo.current;
      if (target && document.contains(target)) window.setTimeout(() => target.focus(), 0);
    };
  }, [open]);

  const actions = useMemo<PaletteAction[]>(() => {
    const items: PaletteAction[] = [];

    for (const def of ALL_TRANSFORMS) {
      items.push({
        id: `add:${def.id}`,
        group: "Do something to this buffer",
        label: `Add step · ${def.name}`,
        hint: def.blurb,
        previewTransformId: def.id,
        run: () => onAddStep(def.id),
      });
    }

    for (const def of ALL_TRANSFORMS) {
      items.push({
        id: `only:${def.id}`,
        group: "Open as a tool",
        label: def.name,
        hint: `Replace the pipeline with just this step`,
        previewTransformId: def.id,
        run: () => onUseOnly(def.id),
      });
    }

    for (const buffer of buffers) {
      items.push({
        id: `buf:${buffer.id}`,
        group: "Buffers",
        label: buffer.name,
        hint: buffer.source ? `${buffer.source.length} characters` : "empty",
        run: () => onSelectBuffer(buffer.id),
      });
    }

    return [...items, ...commands];
  }, [buffers, commands, onAddStep, onUseOnly, onSelectBuffer]);

  const results = useMemo<Scored[]>(() => {
    const scored: Scored[] = [];
    for (const action of actions) {
      const match = fuzzy(query, action.label);
      if (!match) continue;
      scored.push({ ...action, score: match.score, hits: match.hits });
    }
    scored.sort((a, b) => b.score - a.score);
    const perGroup = new Map<string, number>();
    return scored.filter((item) => {
      const used = perGroup.get(item.group) ?? 0;
      if (used >= 6) return false;
      perGroup.set(item.group, used + 1);
      return true;
    });
  }, [actions, query]);

  const grouped = useMemo(() => {
    // Fixed group order. Groups that reshuffle as you type make the list
    // impossible to aim at, and adding a step should always outrank replacing
    // the pipeline — it is the non-destructive choice.
    const map = new Map<string, Scored[]>();
    for (const item of results) {
      if (!map.has(item.group)) map.set(item.group, []);
      map.get(item.group)!.push(item);
    }
    return GROUP_ORDER.filter((group) => map.has(group)).map((group) => ({
      group,
      items: map.get(group)!,
    }));
  }, [results]);

  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);
  const active = flat[Math.min(index, flat.length - 1)];

  const flatRef = useRef(flat);
  const indexRef = useRef(index);
  const onCloseRef = useRef(onClose);
  flatRef.current = flat;
  indexRef.current = index;
  onCloseRef.current = onClose;

  useEffect(() => setIndex(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [index, query]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key === "ArrowDown" || (event.key === "n" && event.ctrlKey)) {
        event.preventDefault();
        setIndex((i) => Math.min(i + 1, Math.max(0, flatRef.current.length - 1)));
        return;
      }
      if (event.key === "ArrowUp" || (event.key === "p" && event.ctrlKey)) {
        event.preventDefault();
        setIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const current = flatRef.current[Math.min(indexRef.current, flatRef.current.length - 1)];
        if (current) {
          current.run();
          onCloseRef.current();
        }
        return;
      }
      // Keep Tab inside the dialog: it is aria-modal, and letting focus walk
      // out to the page behind it is how a modal stops being one.
      if (event.key === "Tab") {
        const root = dialogRef.current;
        if (!root) return;
        const focusable = root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const activeEl = document.activeElement;
        if (!root.contains(activeEl)) {
          event.preventDefault();
          first.focus();
          return;
        }
        if (event.shiftKey && activeEl === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && activeEl === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [open]);

  const preview = useMemo(() => {
    if (!active?.previewTransformId) return null;
    const def = getTransform(active.previewTransformId);
    if (!def) return null;
    try {
      const result = def.run(currentOutput, defaults(def));
      return { def, result };
    } catch {
      return null;
    }
  }, [active, currentOutput]);


  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center px-4 pt-[12vh]"
      style={{ background: "var(--wk-scrim)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="flex max-h-[70vh] w-full max-w-[780px] flex-col overflow-hidden rounded-[12px]"
        style={{
          background: "var(--wk-panel)",
          border: "1px solid var(--wk-line-strong)",
          boxShadow: "0 24px 64px var(--wk-shadow), 0 2px 8px var(--wk-shadow)",
        }}
      >
        <div
          className="flex h-[52px] flex-none items-center gap-[10px] px-[14px]"
          style={{ borderBottom: "1px solid var(--wk-line)" }}
        >
          <Mono size={15} color="var(--wk-accent)">
            <strong>&gt;</strong>
          </Mono>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Run an action, add a step, jump to a buffer…"
            spellCheck={false}
            aria-label="Command"
            role="combobox"
            aria-expanded={flat.length > 0}
            aria-controls="wk-palette-list"
            aria-activedescendant={active ? `wk-palette-${active.id}` : undefined}
            aria-autocomplete="list"
            className="flex-1 bg-transparent outline-none"
            style={{
              fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace',
              fontSize: 15,
              color: "var(--wk-text)",
            }}
          />
          <span
            className="hidden items-center gap-[6px] rounded-[5px] px-2 py-[3px] sm:flex"
            style={{ background: "var(--wk-raised)", border: "1px solid var(--wk-line)" }}
          >
            <span className="text-[10px]" style={{ color: "var(--wk-faint)" }}>
              scope
            </span>
            <Mono size={10.5} color="var(--wk-dim)">
              {bufferName}
            </Mono>
          </span>
          <Kbd>esc</Kbd>
        </div>

        <div className="flex min-h-0 flex-1">
          <div ref={listRef} id="wk-palette-list" role="listbox" aria-label="Results" className="min-h-0 flex-1 overflow-y-auto py-2 sm:max-w-[460px]">
            {flat.length === 0 && (
              <p className="px-[14px] py-3 text-[12.5px]" style={{ color: "var(--wk-faint)" }}>
                Nothing matches “{query}”.
              </p>
            )}
            {grouped.map(({ group, items }) => (
              <div key={group} role="group" aria-label={group}>
                <div className="flex h-[24px] items-center px-[14px]">
                  <span className="wk-label">{group}</span>
                </div>
                {items.map((item) => {
                  const isActive = item.id === active?.id;
                  return (
                    <button
                      key={item.id}
                      id={`wk-palette-${item.id}`}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      tabIndex={-1}
                      data-active={isActive}
                      onMouseMove={() => setIndex(flat.findIndex((f) => f.id === item.id))}
                      onClick={() => {
                        item.run();
                        onClose();
                      }}
                      className="wk-focus mx-[6px] flex h-[36px] w-[calc(100%-12px)] items-center gap-[10px] rounded-[7px] pl-[14px] pr-[10px] text-left"
                      style={{
                        background: isActive ? "var(--wk-accent-wash)" : "transparent",
                        boxShadow: isActive ? "inset 2px 0 0 var(--wk-accent)" : undefined,
                      }}
                    >
                      <span className="flex-1 truncate text-[13px]" style={{ color: isActive ? "var(--wk-text)" : "var(--wk-dim)" }}>
                        {highlight(item.label, item.hits).map((part, i) => (
                          <span
                            key={i}
                            style={
                              part.match
                                ? { color: "var(--wk-accent)", fontWeight: 600 }
                                : undefined
                            }
                          >
                            {part.text}
                          </span>
                        ))}
                      </span>
                      {isActive && <Kbd tone="accent">⏎</Kbd>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div
            className="hidden min-h-0 flex-1 flex-col sm:flex"
            style={{ background: "var(--wk-bg)", borderLeft: "1px solid var(--wk-line)" }}
          >
            <div
              className="flex h-[32px] flex-none items-center gap-2 px-[14px]"
              style={{ borderBottom: "1px solid var(--wk-line)" }}
            >
              <span className="wk-label">Preview</span>
              <div className="flex-1" />
              <Mono size={10}>not applied yet</Mono>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden px-[14px] py-[10px]">
              {!active && <Mono size={11}>Nothing selected.</Mono>}
              {active && !preview && (
                <p className="text-[11.5px] leading-[17px]" style={{ color: "var(--wk-faint)" }}>
                  {active.hint ?? "No preview for this action."}
                </p>
              )}
              {preview && (
                <pre
                  className="overflow-hidden"
                  style={{
                    fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace',
                    fontSize: 11,
                    lineHeight: "18px",
                    color: preview.result.error ? "var(--wk-err)" : "var(--wk-dim)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                  }}
                >
                  {preview.result.error
                    ? `${preview.result.error.message}\n\n${preview.result.error.hint ?? ""}`
                    : preview.result.output.slice(0, 700) || "(empty — this buffer has nothing to work on yet)"}
                </pre>
              )}
            </div>
            {preview && !preview.result.error && preview.result.output && (
              <div className="flex-none px-[14px] pb-3 pt-[10px]" style={{ borderTop: "1px solid var(--wk-line)" }}>
                <div className="mb-[6px] flex items-center gap-[6px]" style={{ color: "var(--wk-ok)" }}>
                  <Icon name="check" size={11} />
                  <Mono size={10.5} color="var(--wk-ok)">
                    runs clean on this buffer
                  </Mono>
                </div>
                <Mono size={10.5}>
                  {currentOutput.length} → {preview.result.output.length} characters
                </Mono>
              </div>
            )}
          </div>
        </div>

        <div
          className="flex h-[40px] flex-none items-center gap-[14px] px-[14px]"
          style={{ borderTop: "1px solid var(--wk-line)", background: "var(--wk-panel)" }}
        >
          <span className="flex items-center gap-[6px]">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            <span className="text-[11px]" style={{ color: "var(--wk-faint)" }}>
              move
            </span>
          </span>
          <span className="flex items-center gap-[6px]">
            <Kbd>⏎</Kbd>
            <span className="text-[11px]" style={{ color: "var(--wk-faint)" }}>
              run
            </span>
          </span>
          <div className="flex-1" />
          <span className="hidden text-[11px] lg:inline" style={{ color: "var(--wk-faint)" }}>
            Current language: {currentLanguage}
          </span>
        </div>
      </div>
    </div>
  );
}
