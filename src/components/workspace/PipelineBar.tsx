import React from "react";
import { getTransform, type Opts, type OptionDef } from "@/lib/transforms";
import type { PipelineStep } from "@/lib/pipelineExport";
import type { StepOutput } from "@/state/workspace";
import { Icon, Kbd } from "./Icon";
import { Pill } from "./Chrome";

function StepOption({
  option,
  value,
  onChange,
}: {
  option: OptionDef;
  value: Opts[string];
  onChange: (value: Opts[string]) => void;
}) {
  if (option.type === "toggle") {
    const on = Boolean(value);
    return (
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={option.label}
        onClick={() => onChange(!on)}
        className="wk-focus flex h-[22px] flex-none items-center gap-[5px] rounded-[5px] px-[6px]"
        style={{ background: "var(--wk-bg)", border: "1px solid var(--wk-line-control)" }}
      >
        <span
          style={{
            fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace',
            fontSize: 10.5,
            color: on ? "var(--wk-text)" : "var(--wk-dim)",
          }}
        >
          {option.label}
        </span>
        <span
          className="flex h-[9px] w-[16px] items-center rounded-full px-[1px]"
          style={{ background: on ? "var(--wk-accent-dim)" : "var(--wk-line)", justifyContent: on ? "flex-end" : "flex-start" }}
        >
          <span
            className="h-[7px] w-[7px] rounded-full"
            style={{ background: on ? "var(--wk-text)" : "var(--wk-faint)" }}
          />
        </span>
      </button>
    );
  }

  if (option.type === "text") {
    return (
      <input
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        placeholder={option.placeholder}
        aria-label={option.label}
        spellCheck={false}
        className="wk-focus h-[22px] flex-none rounded-[5px] px-[6px]"
        style={{
          width: option.width ?? 110,
          background: "var(--wk-bg)",
          border: "1px solid var(--wk-line-control)",
          fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace',
          fontSize: 10.5,
          color: "var(--wk-text)",
        }}
      />
    );
  }

  return (
    <span
      className="relative flex h-[22px] flex-none items-center gap-[5px] rounded-[5px] px-[6px]"
      style={{ background: "var(--wk-bg)", border: "1px solid var(--wk-line-control)" }}
    >
      <span
        aria-hidden="true"
        style={{
          fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace',
          fontSize: 10.5,
          color: "var(--wk-dim)",
        }}
      >
        {option.options?.find((o) => o.value === value)?.label ?? String(value)}
      </span>
      <span aria-hidden="true" style={{ color: "var(--wk-faint)" }}>
        <Icon name="chevronDown" size={9} />
      </span>
      <select
        aria-label={option.label}
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        className="wk-focus absolute inset-0 cursor-pointer opacity-0"
      >
        {option.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </span>
  );
}

export function StepChip({
  step,
  index,
  result,
  focused,
  onFocus,
  onRemove,
  onOptionChange,
}: {
  step: PipelineStep;
  index: number;
  result?: StepOutput;
  focused: boolean;
  onFocus: () => void;
  onRemove: () => void;
  onOptionChange: (key: string, value: Opts[string]) => void;
}) {
  const def = getTransform(step.transformId);
  if (!def) return null;

  const failed = Boolean(result?.error);
  const skipped = Boolean(result?.skipped) && step.enabled;

  return (
    <div
      className="flex h-[30px] flex-none items-center gap-2 rounded-[7px] pl-[7px] pr-[7px]"
      style={{
        background: failed ? "var(--wk-panel)" : "var(--wk-raised)",
        border: `1px solid ${failed ? "color-mix(in srgb, var(--wk-err) 45%, transparent)" : focused ? "var(--wk-line-strong)" : "var(--wk-line)"}`,
        boxShadow: focused && !failed ? "0 0 0 1px var(--wk-accent-wash)" : undefined,
        opacity: skipped ? 0.5 : 1,
      }}
    >
      <button
        type="button"
        onClick={onFocus}
        aria-pressed={focused}
        aria-label={`${focused ? "Deselect" : "Select"} step ${index + 1}, ${def.name}`}
        title="Select to reorder with ⌥↑ / ⌥↓"
        className="wk-focus flex h-[24px] items-center gap-2 rounded"
      >
      <span style={{ color: "var(--wk-faint)" }}>
        <Icon name="grip" size={11} />
      </span>
      <span
        className="flex h-[16px] w-[16px] flex-none items-center justify-center rounded"
        style={{
          fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace',
          fontSize: 10,
          fontWeight: 700,
          background: failed ? "var(--wk-err-wash)" : focused ? "var(--wk-accent)" : "var(--wk-accent-wash)",
          color: failed ? "var(--wk-err)" : focused ? "var(--wk-accent-ink)" : "var(--wk-accent)",
        }}
      >
        {index + 1}
      </span>
      <span
        className="flex-none text-[12.5px]"
        style={{
          color: failed ? "var(--wk-err)" : focused ? "var(--wk-text)" : "var(--wk-dim)",
          fontWeight: focused ? 500 : 400,
        }}
      >
        {def.chip}
      </span>
      </button>

      {def.options?.map((option) => (
        <StepOption
          key={option.key}
          option={option}
          value={step.opts[option.key]}
          onChange={(value) => onOptionChange(option.key, value)}
        />
      ))}

      {failed && (
        <span
          style={{
            fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace',
            fontSize: 10,
            color: "var(--wk-err)",
          }}
        >
          {result?.error?.message}
        </span>
      )}

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${def.name}`}
        title={`Remove ${def.name}`}
        className="wk-focus flex h-[24px] w-[24px] items-center justify-center rounded"
        style={{ color: "var(--wk-faint)" }}
      >
        <Icon name="close" size={12} />
      </button>
    </div>
  );
}

export function PipelineBar({
  steps,
  results,
  focusedStepId,
  stale,
  copied,
  canCopy,
  totalMs,
  onFocusStep,
  onRemoveStep,
  onOptionChange,
  onAddStep,
  onCopy,
}: {
  steps: PipelineStep[];
  results: StepOutput[];
  focusedStepId: string | null;
  stale: boolean;
  copied: boolean;
  canCopy: boolean;
  totalMs: number;
  onFocusStep: (id: string) => void;
  onRemoveStep: (id: string) => void;
  onOptionChange: (stepId: string, key: string, value: Opts[string]) => void;
  onAddStep: () => void;
  onCopy: () => void;
}) {
  const failed = results.some((r) => r.error);

  return (
    <div
      className="flex h-[48px] flex-none items-center"
      style={{ background: "var(--wk-bg)", borderBottom: "1px solid var(--wk-line)" }}
    >
      {/* Only the steps scroll. The result pill and Copy stay reachable at any
          window width — scrolling the primary action off-screen is not a choice. */}
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto px-3">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {index > 0 && (
            <span className="flex-none" style={{ color: "var(--wk-line-strong)" }}>
              <Icon name="arrowRight" size={13} />
            </span>
          )}
          <StepChip
            step={step}
            index={index}
            result={results[index]}
            focused={focusedStepId === step.id}
            onFocus={() => onFocusStep(step.id)}
            onRemove={() => onRemoveStep(step.id)}
            onOptionChange={(key, value) => onOptionChange(step.id, key, value)}
          />
        </React.Fragment>
      ))}

      {steps.length > 0 && (
        <span className="flex-none" style={{ color: "var(--wk-line-strong)" }}>
          <Icon name="arrowRight" size={13} />
        </span>
      )}

      <button
        type="button"
        onClick={onAddStep}
        className="wk-focus flex h-[30px] flex-none items-center gap-[7px] rounded-[7px] px-[10px] transition-colors"
        style={{ border: "1px dashed var(--wk-line-control)", color: "var(--wk-dim)" }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--wk-accent)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--wk-line-control)")}
      >
        <Icon name="plus" size={12} />
        <span className="text-[12.5px]">Add step</span>
        <Kbd>⌘⇧A</Kbd>
      </button>
      </div>

      <div
        className="flex flex-none items-center gap-2 py-2 pl-2 pr-3"
        style={{ borderLeft: steps.length ? "1px solid var(--wk-line)" : undefined }}
      >
      {steps.length > 0 && (
        <Pill tone={failed ? "err" : stale ? "accent" : "ok"} dot>
          {failed
            ? `Step ${results.findIndex((r) => r.error) + 1} failed`
            : stale
              ? "catching up…"
              : `${steps.length} ${steps.length === 1 ? "step" : "steps"} · ${totalMs < 1 ? "<1" : Math.round(totalMs)} ms`}
        </Pill>
      )}

      <button
        type="button"
        onClick={onCopy}
        disabled={!canCopy}
        className="wk-focus flex h-[30px] flex-none items-center gap-2 rounded-md pl-[11px] pr-2 transition-opacity"
        style={{
          background: canCopy ? "var(--wk-accent)" : "var(--wk-raised)",
          color: canCopy ? "var(--wk-accent-ink)" : "var(--wk-faint)",
          cursor: canCopy ? "pointer" : "not-allowed",
        }}
      >
        <Icon name={copied ? "check" : "copy"} size={13} />
        <span className="text-[12.5px] font-semibold">{copied ? "Copied" : "Copy output"}</span>
        <span
          style={{
            fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace',
            fontSize: 10,
            borderRadius: 4,
            padding: "3px 5px",
            background: canCopy ? "color-mix(in srgb, var(--wk-accent-ink) 18%, transparent)" : "transparent",
            color: "inherit",
          }}
        >
          ⌘⇧C
        </span>
      </button>
      </div>
    </div>
  );
}
