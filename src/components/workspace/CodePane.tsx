import React, { useMemo } from "react";
import CodeMirror, { EditorView, type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { json } from "@codemirror/lang-json";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { sql } from "@codemirror/lang-sql";
import { xml } from "@codemirror/lang-xml";
import { markdown } from "@codemirror/lang-markdown";
import type { Lang } from "@/lib/transforms";

/** One hue per JSON type, never reused for UI meaning. */
const highlight = HighlightStyle.define([
  { tag: [tags.propertyName, tags.definition(tags.propertyName)], color: "var(--wk-syn-key)" },
  { tag: [tags.string, tags.special(tags.string)], color: "var(--wk-syn-str)" },
  { tag: [tags.number, tags.integer, tags.float], color: "var(--wk-syn-num)" },
  { tag: [tags.bool, tags.null, tags.atom], color: "var(--wk-syn-bool)" },
  { tag: [tags.punctuation, tags.separator, tags.bracket], color: "var(--wk-syn-punct)" },
  { tag: [tags.comment, tags.lineComment, tags.blockComment], color: "var(--wk-faint)", fontStyle: "italic" },
  { tag: [tags.keyword, tags.operatorKeyword, tags.modifier], color: "var(--wk-syn-bool)" },
  { tag: [tags.tagName, tags.angleBracket], color: "var(--wk-syn-key)" },
  { tag: [tags.attributeName], color: "var(--wk-syn-num)" },
  { tag: [tags.variableName, tags.function(tags.variableName)], color: "var(--wk-text)" },
  { tag: [tags.heading], color: "var(--wk-syn-key)", fontWeight: "600" },
  { tag: [tags.link, tags.url], color: "var(--wk-accent)" },
  { tag: [tags.emphasis], fontStyle: "italic" },
  { tag: [tags.strong], fontWeight: "600" },
]);

const baseTheme = EditorView.theme({
  "&": { color: "var(--wk-text)", backgroundColor: "transparent", height: "100%" },
  ".cm-content": { padding: "8px 0" },
  ".cm-gutters": { paddingLeft: "10px", paddingRight: "8px", minWidth: "44px" },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 4px 0 8px" },
  ".cm-placeholder": { color: "var(--wk-faint)" },
});

function languageExtension(lang: Lang) {
  switch (lang) {
    case "json":
      return [json()];
    case "javascript":
      return [javascript()];
    case "html":
      return [html()];
    case "css":
      return [css()];
    case "sql":
      return [sql()];
    case "xml":
      return [xml()];
    case "markdown":
      return [markdown()];
    default:
      return [];
  }
}

export interface CodePaneProps {
  value: string;
  language: Lang;
  readOnly?: boolean;
  placeholder?: string;
  onChange?: (value: string) => void;
  onPaste?: (event: React.ClipboardEvent) => void;
  editorRef?: React.Ref<ReactCodeMirrorRef>;
}

export function CodePane({
  value,
  language,
  readOnly,
  placeholder,
  onChange,
  onPaste,
  editorRef,
}: CodePaneProps) {
  const extensions = useMemo(
    () => [
      ...languageExtension(language),
      syntaxHighlighting(highlight),
      baseTheme,
      EditorView.lineWrapping,
    ],
    [language],
  );

  return (
    <div className="min-h-0 flex-1 overflow-hidden" onPaste={onPaste}>
      <CodeMirror
        ref={editorRef}
        value={value}
        height="100%"
        readOnly={readOnly}
        editable={!readOnly}
        placeholder={placeholder}
        extensions={extensions}
        onChange={onChange}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: !readOnly,
          highlightActiveLineGutter: !readOnly,
          autocompletion: false,
          searchKeymap: true,
          highlightSelectionMatches: false,
          bracketMatching: true,
          closeBrackets: !readOnly,
        }}
      />
    </div>
  );
}
