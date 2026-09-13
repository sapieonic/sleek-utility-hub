import type { Lang } from "./transforms";

const FORBIDDEN_TAGS = new Set(["script", "iframe", "object", "embed", "link", "meta", "base", "form"]);

/**
 * The buffer is whatever someone pasted. To rasterise it we have to put it in
 * the live document, so strip anything that could execute first: DOMParser
 * itself never runs scripts or fires load handlers, and we drop every event
 * attribute and javascript: URL before the nodes are ever adopted.
 */
function sanitize(html: string): DocumentFragment {
  const parsed = new DOMParser().parseFromString(html, "text/html");

  parsed.querySelectorAll("*").forEach((element) => {
    if (FORBIDDEN_TAGS.has(element.tagName.toLowerCase())) {
      element.remove();
      return;
    }
    for (const attr of Array.from(element.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith("on")) element.removeAttribute(attr.name);
      else if ((name === "href" || name === "src" || name === "xlink:href") && value.startsWith("javascript:")) {
        element.removeAttribute(attr.name);
      } else if (name === "style" && /expression\s*\(|javascript:/i.test(attr.value)) {
        element.removeAttribute(attr.name);
      }
    }
  });

  const fragment = document.createDocumentFragment();
  Array.from(parsed.body.childNodes).forEach((node) => fragment.appendChild(node));
  return fragment;
}

const PRINT_CSS = `
  font-family: "IBM Plex Sans", "Segoe UI", system-ui, sans-serif;
  font-size: 12pt;
  line-height: 1.55;
  color: #191f25;
  background: #ffffff;
  padding: 0;
`;

export function canExportPdf(language: Lang): boolean {
  return language === "html" || language === "markdown";
}

export async function exportPdf(html: string, filename: string): Promise<void> {
  const { default: html2pdf } = await import("html2pdf.js");

  const holder = document.createElement("div");
  holder.setAttribute("aria-hidden", "true");
  holder.style.cssText = `position:fixed;left:-10000px;top:0;width:170mm;${PRINT_CSS}`;

  const style = document.createElement("style");
  style.textContent = `
    img, svg, video { max-width: 100%; height: auto; }
    pre { background: #f0f3f6; padding: 10px 12px; border-radius: 6px; overflow-wrap: break-word; white-space: pre-wrap; font-family: "JetBrains Mono", ui-monospace, Menlo, monospace; font-size: 10pt; }
    code { font-family: "JetBrains Mono", ui-monospace, Menlo, monospace; font-size: 10pt; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #dce0e5; padding: 6px 8px; text-align: left; }
    h1, h2, h3 { line-height: 1.25; }
    a { color: #0075c3; }
    blockquote { margin: 0; padding-left: 14px; border-left: 3px solid #dce0e5; color: #5e646b; }
  `;
  holder.appendChild(style);
  holder.appendChild(sanitize(html));
  document.body.appendChild(holder);

  try {
    await html2pdf()
      .set({
        margin: 20,
        filename,
        image: { type: "jpeg" as const, quality: 0.96 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
      })
      .from(holder)
      .save();
  } finally {
    holder.remove();
  }
}
