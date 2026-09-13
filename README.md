# UtilityHub

One buffer, a chain of transforms, and the result as you type.

UtilityHub is a keyboard-first developer workspace. You paste something once into a source
buffer, stack ordered transforms on top of it — format, decode, convert, rewrite — and the
output pane updates on every keystroke. Every transform runs in the browser tab: nothing you
paste is uploaded, and there is no server to upload it to.

Live at [hub.llm-util.com](https://hub.llm-util.com/).

## The pipeline model

```
source buffer  ->  step 1  ->  step 2  ->  step 3  ->  output
```

- A **buffer** holds the text you pasted plus the ordered list of steps applied to it. Up to
  12 buffers live side by side in the tab strip; each keeps its own steps.
- A **step** is one transform plus its options. Steps can be reordered, disabled, or removed
  without touching the source.
- Evaluation is **live**: `evaluate()` in `src/state/workspace.tsx` re-runs the whole chain
  whenever the source or the steps change. There is no run button.
- Each step's output becomes the next step's input, and carries a **language** with it
  (`json`, `html`, `sql`, …) so the editor highlights it and the status bar can describe it.
  Transforms declaring `produces: "same"` (the text ones) pass the incoming language through.
- **A failing step stops the chain.** The failure is reported with a message and, where the
  transform can work it out, a line, a column, and a hint. Steps after the failure are marked
  skipped and never run. The output pane keeps the last good output — the result of the step
  before the failure — so Copy still gives you something useful.

`src/state/workspace.tsx` is the whole model: reducer, `evaluate()`, persistence, and the
`useWorkspace()` context. `src/pages/Workspace.tsx` is the desktop shell that drives it.

## Transform catalogue

19 transforms across four categories. Every one is a `TransformDef`
(`src/lib/transforms/types.ts`): a pure `run(input, opts)` returning output, language,
notes and an optional structured error.

### Formatters (5)

| id | Name | What it does | Options |
|----|------|--------------|---------|
| `json-format` | JSON Format | Parse and re-print JSON, with the failure pointed at a line and column | indent (2 / 4 / tab / minify), sort keys |
| `js-format` | JavaScript Format | Re-indent JavaScript without executing a single line of it | indent (2 / 4 / tab) |
| `html-format` | HTML Format | Indent markup by nesting depth, keeping `pre`, `script` and `style` verbatim | indent (2 / 4 / tab) |
| `css-format` | CSS Format | Re-indent stylesheets, leaving strings, comments and `url()` alone | indent (2 / 4 / tab / minify) |
| `sql-format` | SQL Format | One clause per line, keywords cased, string literals left exactly as written | indent (2 / 4 / tab), upper keywords |

### Encoders (7)

| id | Name | What it does | Options |
|----|------|--------------|---------|
| `base64-encode` | Base64 Encode | Text to Base64, over UTF-8 bytes so non-ASCII survives | url-safe |
| `base64-decode` | Base64 Decode | Base64 back to text; accepts url-safe alphabets and missing padding | — |
| `url-encode` | URL Encode | Percent-encode text, as a whole URL or as a single component | scope (component / whole URL) |
| `url-decode` | URL Decode | Undo percent-encoding | `+` is space |
| `utf8-encode` | UTF-8 Escape | Every character as a `\uXXXX` escape, surrogate pairs included | non-ASCII only |
| `utf8-decode` | UTF-8 Unescape | Turn `\uXXXX` escape sequences back into characters | — |
| `xml-decode` | XML to JSON | Read an XML document into a JSON object, attributes and all | — |

### Converters (2)

| id | Name | What it does | Options |
|----|------|--------------|---------|
| `html-to-markdown` | HTML to Markdown | Convert markup to GitHub-flavoured Markdown (Turndown) | — |
| `markdown-to-html` | Markdown to HTML | Render Markdown to HTML, with GFM tables and line breaks (marked) | hard line breaks |

### Text (5)

| id | Name | What it does | Options |
|----|------|--------------|---------|
| `case` | Change Case | Upper, lower, title, sentence, camel, snake, kebab or inverted | mode |
| `whitespace` | Whitespace | Trim, collapse runs of spaces, drop blank lines or strip it all out | mode (trim lines / collapse / remove blank lines / remove all / join into one line) |
| `replace` | Find and Replace | Literal or regular-expression replacement, counted | find, replace, regex, match case |
| `lines` | Sort and Filter Lines | Sort, reverse, de-duplicate or number the lines | mode (A→Z / Z→A / numeric / reverse / unique / number) |
| `strip` | Strip Characters | Remove digits, punctuation, non-ASCII, or ANSI colour codes | mode |

To add a transform: write a `TransformDef` in the relevant
`src/lib/transforms/<category>.ts` and append it to that file's exported array.
`ALL_TRANSFORMS` in `src/lib/transforms/index.ts` picks it up, and with it the rail, the
command palette, the share link, and the exporters.

## Keyboard

Bound in `src/pages/Workspace.tsx`, on `window`:

| Keys | Action |
|------|--------|
| `Cmd/Ctrl + K` | Toggle the command palette |
| `Cmd/Ctrl + Shift + A` | Open the command palette |
| `Cmd/Ctrl + Shift + C` | Copy the output |
| `Cmd/Ctrl + N` | New buffer |
| `Alt + 1…3` | Add the *n*th recent transform as a step (matched on `event.code`, so Option+digit works on macOS) |

These only fire when the palette is closed, and only when focus is not on an input, a
textarea, a select, a button, a link, a contenteditable, or the CodeMirror editor:

| Keys | Action |
|------|--------|
| `Enter` | Apply the top paste suggestion (only while focus is on the document body, so it never steals Enter from a focused button) |
| `Escape` | Dismiss the paste suggestion (that candidate stops being offered for this buffer) |
| `Backspace` / `Delete` | Remove the focused pipeline step |
| `Alt + ↑` / `Alt + ↓` | Move the focused step earlier / later |

A step chip's label is a button: focus it and press Enter or Space to select the step, then reorder it with `Alt + ↑` / `Alt + ↓`.

Inside the command palette (`src/components/workspace/CommandPalette.tsx`):

| Keys | Action |
|------|--------|
| `↓` / `Ctrl + N` | Next result |
| `↑` / `Ctrl + P` | Previous result |
| `Enter` | Run the highlighted result |
| `Escape` | Close |

The palette fuzzy-matches four fixed groups, in this order: *Do something to this buffer*
(append a step), *Open as a tool* (replace the pipeline with just that step), *Buffers*, and
*Commands* (new buffer, clear steps, copy, save as a file, copy a share link, export a PDF,
switch the output view, replace the buffer with the result, toggle paste suggestions). The
highlighted transform is previewed against the current output before you commit to it.

The palette is a real modal: Tab is trapped inside it, and focus returns to whatever opened
it when it closes.

## Paste detection

`src/lib/detect.ts` looks at the buffer and **proposes** a pipeline in a banner. It never
applies anything on its own — you press `Enter`, click the button, or it does nothing.
Detection is skipped once the buffer already has steps, when the source is over the live
limit, and when paste suggestions are switched off from the palette.

Recognised, sorted by confidence, top four shown:

| Signal | Proposal |
|--------|----------|
| Valid JSON on one line | `json-format` |
| Starts `{`/`[` but does not parse | `json-format` — "show me where" |
| Base64 that round-trips and decodes to JSON | `base64-decode` → `json-format` |
| Base64 that round-trips to clean text | `base64-decode` |
| `%XX` sequences | `url-decode` |
| `\uXXXX` sequences | `utf8-decode` |
| An XML document | `xml-decode` |
| HTML markup | `html-format` |
| A `SELECT`/`INSERT`/`UPDATE`/`DELETE`/`CREATE TABLE`/`WITH` statement | `sql-format` |
| A line over 200 chars with `{};` in it, no JS keywords | `css-format` |
| The same, with JS keywords | `js-format` |
| Markdown headings, fences or bullets | `markdown-to-html` |

The Base64 check is deliberately strict: plain English passes a Base64 alphabet test, so the
candidate is only offered when decoding and re-encoding reproduces the input and the decoded
text contains no control characters or replacement characters.

## Export and share

The side panel's **Export** tab turns the current pipeline into a script
(`src/lib/pipelineExport.ts`), for `shell`, `node` or `python`. Only enabled steps are
emitted. Each transform supplies its own `shell()`, `node()` and `python()` fragment and may
return `null` where there is no faithful one-liner.

If **any** step in the pipeline has no faithful equivalent for the chosen target, no script is
emitted at all and the missing steps are named. Emitting the steps that do translate would hand
you a runnable command that quietly computes something different, which is worse than nothing.
Shell output also lists what it needs (`jq`, today).

Coverage is uneven by design, and a `null` is a deliberate answer rather than a gap: the
Base64 *decode* shell export, for instance, is `null` because `base64 --decode` handles neither
the url-safe alphabet nor missing padding, both of which the in-app transform accepts.

The filename in the emitted `cat` is shell-quoted — buffer names are user-editable and the
script is about to be pasted into somebody's shell.

The **Share link** button copies a URL with the pipeline in the fragment:

```
https://…/#p=<base64url of [{t: transformId, o: opts}, …]>
```

`src/lib/shareLink.ts` encodes **only the steps**. The buffer never goes into the link. Whoever
opens it gets the same pipeline and pastes their own payload; on load the steps are applied and
the fragment is stripped from the address bar with `history.replaceState`.

## Output views

The output pane (`src/components/workspace/OutputView.tsx`) has three modes:

| Mode | What it shows |
|------|---------------|
| `Raw` | The pipeline result in a read-only editor |
| `Preview` | Markdown and HTML rendered in a `sandbox=""` iframe — no scripts, no parent access. Disabled, with a reason, for every other language |
| `Diff` | A unified line diff of the result against another open buffer, with runs of unchanged lines collapsed |

Where the result is Markdown or HTML, a **PDF** button renders it through `html2pdf.js`
(`src/lib/exportPdf.ts`). The content is parsed with `DOMParser` and stripped of scripts,
frames, event attributes and `javascript:` URLs before it is put in the document to rasterise —
it is, after all, whatever you pasted.

## Persistence

Three `localStorage` keys, all written from this tab and read by nobody else:

| Key | Written by | Holds |
|-----|-----------|-------|
| `utilityhub.workspace.v2` | `src/state/workspace.tsx` | The whole workspace state — buffers, their text, their steps, the active buffer, the flags — debounced 300 ms |
| `utilityhub.recents` | `src/hooks/use-recents.ts` | The three most recently used transform ids |
| `utilityhub.theme` | `src/hooks/use-theme.ts` | `light` or `dark`; defaults to the system preference |

Nothing is sent anywhere. There is no analytics, no telemetry, and no backend. If storage is
unavailable (private mode, quota, disabled) every write fails quietly and the app keeps
working for the life of the tab. On load, any saved step whose transform no longer exists is
dropped rather than failing to boot. The side panel's **Session** tab clears the buffers.

## Old URLs still work

The pre-workspace build had a page per tool at `/tools/<slug>`. Those URLs still resolve:
`src/App.tsx` routes both `/` and `/tools/:slug` to the same `Workspace` component, and on
first mount `Workspace` looks the path up in `LEGACY_ROUTES`. A hit seeds the pipeline with
that one transform, so the link lands you in the workspace with the tool already loaded as
step one.

`LEGACY_ROUTES` is derived in `src/lib/transforms/index.ts` by folding every transform's
`legacyPaths` into a `path -> transformId` map (first transform to claim a path wins):

| Old route | Now |
|-----------|-----|
| `/tools/json-formatter`, `/tools/json-decoder` | `json-format` |
| `/tools/js-formatter` | `js-format` |
| `/tools/html-formatter` | `html-format` |
| `/tools/css-formatter`, `/tools/css-compressor` | `css-format` |
| `/tools/sql-formatter` | `sql-format` |
| `/tools/base64-encode` | `base64-encode` |
| `/tools/base64-decode` | `base64-decode` |
| `/tools/url-encode` | `url-encode` |
| `/tools/url-decode` | `url-decode` |
| `/tools/utf8-encode` | `utf8-encode` |
| `/tools/utf8-decode` | `utf8-decode` |
| `/tools/xml-decode` | `xml-decode` |
| `/tools/html-to-markdown-converter` | `html-to-markdown` |
| `/tools/markdown-to-html-converter` | `markdown-to-html` |
| `/tools/string-utilities` | `case` (the other text transforms are one keystroke away) |
| `/tools/sorting-list` | `lines` |

The standalone tool pages under `src/pages/tools/`, the tool-grid homepage, and the
card/search components that fed it have been deleted. A `/tools/<slug>` that is not in the
table still renders the workspace, just with no steps seeded.

## Project structure

```
src/
├── App.tsx                     Router: "/" and "/tools/:slug" -> Workspace
├── main.tsx                    Entry; applies the saved theme before first paint
├── index.css                   Tokens (--wk-*) and global styles
├── pages/
│   ├── Workspace.tsx           The shell: keyboard, palette commands, layout
│   └── NotFound.tsx
├── state/
│   └── workspace.tsx           Buffers, reducer, evaluate(), localStorage
├── lib/
│   ├── transforms/
│   │   ├── index.ts            ALL_TRANSFORMS, categories, LEGACY_ROUTES, UNBUILT_TOOLS
│   │   ├── types.ts            TransformDef, OptionDef, TransformResult
│   │   ├── formatters.ts       JSON, JS, HTML, CSS, SQL
│   │   ├── encoders.ts         Base64, URL, UTF-8, XML
│   │   ├── converters.ts       HTML <-> Markdown
│   │   ├── text.ts             Case, whitespace, replace, lines, strip
│   │   └── util.ts             byteLength, lineCount, formatBytes, formatMs
│   ├── detect.ts               Paste detection; proposes, never applies
│   ├── pipelineExport.ts       Pipeline -> shell / node / python
│   ├── shareLink.ts            Pipeline <-> #p= fragment
│   ├── outline.ts              JSON outline for the Structure tab
│   ├── fuzzy.ts                Palette scoring and match highlighting
│   └── utils.ts                cn()
├── components/
│   ├── workspace/
│   │   ├── TitleBar.tsx        Brand, palette launcher, theme toggle
│   │   ├── Rail.tsx            Recents and the collapsible library
│   │   ├── TabStrip.tsx        Buffer tabs
│   │   ├── PipelineBar.tsx     Step chips, inline options, timings
│   │   ├── CodePane.tsx        CodeMirror input/output panes
│   │   ├── StatusBar.tsx       Errors, sizes, timing, language
│   │   ├── SidePanel.tsx       Structure / Export / Session tabs
│   │   ├── DetectBanner.tsx    Paste proposals
│   │   ├── CommandPalette.tsx  Fuzzy palette with live preview
│   │   ├── MobileWorkspace.tsx Single-column layout under 768px
│   │   ├── Chrome.tsx          PaneHeader, Mono, IconButton
│   │   └── Icon.tsx            Inline SVG icons and Kbd
│   └── ui/                     shadcn/ui primitives
└── hooks/
    ├── use-theme.ts            Theme, persisted
    ├── use-recents.ts          Three most recent transforms, persisted
    ├── use-mobile.tsx          < 768px
    ├── use-min-width.ts        Side panel floats below 1180px
    └── use-toast.ts
```

## Development

Node 18 or newer.

```bash
npm install
npm run dev        # Vite dev server on http://localhost:8080
npm run build      # production bundle
npm run build:dev  # bundle in development mode
npm run preview    # serve the built bundle
npm run lint       # eslint .
```

Stack: React 18, TypeScript 5.5, Vite 5 (SWC), Tailwind CSS, CodeMirror 6 for both panes,
Turndown and marked for the converters, shadcn/ui and Radix for the remaining primitives.

## Still to build

`UNBUILT_TOOLS` in `src/lib/transforms/index.ts` lists the ones that have not been written:

- Test Data Generator
- Lorem Ipsum Generator
- Credit Card Generator
- Placeholder Image Generator
- QR Code Generator
- QR Code Scanner
- Code Share
- JS Compressor

They are deliberately absent from the rail and the command palette rather than listed as
"coming soon" — a tool that does nothing is worse than a tool that is not there. The list
exists so the intent is recorded in code.

## License

MIT.
