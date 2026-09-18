import type { TransformDef } from "./types";
import { parseJsonError } from "./util";

/**
 * btoa/atob operate on latin-1, so the previous build corrupted (or threw on)
 * anything outside ASCII. Everything here round-trips through UTF-8 bytes.
 */
function encodeBase64(text: string, urlSafe: boolean): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const base = btoa(binary);
  return urlSafe ? base.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : base;
}

/**
 * Base64 to bytes only. Turning those bytes into text is a separate step that
 * fails separately: "not Base64" and "not text" are different problems.
 */
function base64ToBytes(text: string): Uint8Array {
  let normalized = text.trim().replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  if (padding) normalized += "=".repeat(4 - padding);
  const binary = atob(normalized);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export const base64Encode: TransformDef = {
  id: "base64-encode",
  name: "Base64 Encode",
  chip: "Base64 · Encode",
  category: "encoders",
  blurb: "Text to Base64, over UTF-8 bytes so non-ASCII survives.",
  legacyPaths: ["/tools/base64-encode"],
  produces: "text",
  options: [{ key: "urlSafe", label: "url-safe", type: "toggle", default: false }],
  run(input, opts) {
    if (!input) return { output: "" };
    try {
      return { output: encodeBase64(input, Boolean(opts.urlSafe)), language: "text" };
    } catch (err) {
      return { output: "", error: { message: err instanceof Error ? err.message : String(err) } };
    }
  },
  // `basenc` is GNU-only (absent on macOS) and keeps the padding this strips,
  // so the url-safe alphabet is spelled out with tr instead. `-w0` is likewise
  // GNU-only, hence `tr -d` for the line wrapping.
  shell: (opts) =>
    opts.urlSafe ? `base64 | tr -d '\\n' | tr '+/' '-_' | tr -d '='` : `base64 | tr -d '\\n'`,
  node: (opts) =>
    `Buffer.from(input, "utf8").toString(${opts.urlSafe ? '"base64url"' : '"base64"'})`,
  python: (opts) =>
    opts.urlSafe
      ? `base64.urlsafe_b64encode(text.encode()).decode().rstrip("=")`
      : `base64.b64encode(text.encode()).decode()`,
};

export const base64Decode: TransformDef = {
  id: "base64-decode",
  name: "Base64 Decode",
  chip: "Base64 · Decode",
  category: "encoders",
  blurb: "Base64 back to text. Accepts url-safe alphabets and missing padding.",
  legacyPaths: ["/tools/base64-decode"],
  produces: "text",
  run(input) {
    if (!input.trim()) return { output: "" };
    let bytes: Uint8Array;
    try {
      bytes = base64ToBytes(input);
    } catch {
      return {
        output: "",
        error: {
          message: "Not valid Base64",
          hint: "Check for characters outside A–Z a–z 0–9 + / = (or - _ for the url-safe alphabet).",
        },
      };
    }
    try {
      // Non-fatal decoding hands back U+FFFD soup and calls it a success.
      return { output: new TextDecoder("utf-8", { fatal: true }).decode(bytes), language: "text" };
    } catch {
      return {
        output: "",
        error: {
          message: "Decoded bytes are not valid UTF-8",
          hint: "The payload looks like binary — an image, gzip or protobuf rather than text.",
        },
      };
    }
  },
  // `base64 --decode` handles neither the url-safe alphabet nor missing
  // padding, and exits 0 after quietly mangling both.
  shell: () => null,
  node: () => `new TextDecoder("utf-8", { fatal: true }).decode(Buffer.from(input, "base64"))`,
  python: () =>
    `base64.b64decode((s := "".join(text.split()).replace("-", "+").replace("_", "/")) + "=" * (-len(s) % 4)).decode()`,
};

export const urlEncode: TransformDef = {
  id: "url-encode",
  name: "URL Encode",
  chip: "URL · Encode",
  category: "encoders",
  blurb: "Percent-encode text, as a whole URL or as a single component.",
  legacyPaths: ["/tools/url-encode"],
  produces: "text",
  options: [
    {
      key: "scope",
      label: "Scope",
      type: "select",
      default: "component",
      options: [
        { value: "component", label: "component" },
        { value: "uri", label: "whole URL" },
      ],
    },
  ],
  run(input, opts) {
    if (!input) return { output: "" };
    const output = opts.scope === "uri" ? encodeURI(input) : encodeURIComponent(input);
    return { output, language: "text" };
  },
  // `jq @uri` matches neither scope: it escapes the reserved set encodeURI
  // keeps, escapes !*'() that encodeURIComponent keeps, and -sR swallows the
  // trailing newline.
  shell: () => null,
  node: (opts) => `${opts.scope === "uri" ? "encodeURI" : "encodeURIComponent"}(input)`,
  python: (opts) =>
    opts.scope === "uri"
      ? `urllib.parse.quote(text, safe=":/?#@!$&'()*+,;=")`
      : `urllib.parse.quote(text, safe="!*'()")`,
};

export const urlDecode: TransformDef = {
  id: "url-decode",
  name: "URL Decode",
  chip: "URL · Decode",
  category: "encoders",
  blurb: "Undo percent-encoding.",
  legacyPaths: ["/tools/url-decode"],
  produces: "text",
  options: [{ key: "plusAsSpace", label: "+ is space", type: "toggle", default: false }],
  run(input, opts) {
    if (!input) return { output: "" };
    try {
      const source = opts.plusAsSpace ? input.replace(/\+/g, " ") : input;
      return { output: decodeURIComponent(source), language: "text" };
    } catch {
      return {
        output: "",
        error: {
          message: "Malformed percent-encoding",
          hint: "A % must be followed by two hex digits. A bare % has to be written %25.",
        },
      };
    }
  },
  shell: () => null,
  node: () => `decodeURIComponent(input)`,
  python: () => `urllib.parse.unquote(text)`,
};

export const utf8Escape: TransformDef = {
  id: "utf8-encode",
  name: "UTF-8 Escape",
  chip: "UTF-8 · Escape",
  category: "encoders",
  blurb: "Every character as a \\uXXXX escape, surrogate pairs included.",
  legacyPaths: ["/tools/utf8-encode"],
  produces: "text",
  options: [{ key: "asciiOnly", label: "non-ASCII only", type: "toggle", default: false }],
  run(input, opts) {
    if (!input) return { output: "" };
    let output = "";
    for (const char of input) {
      const point = char.codePointAt(0) ?? 0;
      if (opts.asciiOnly && point < 128) {
        output += char;
        continue;
      }
      // Escapes are UTF-16 units, so anything astral becomes a surrogate pair.
      for (let i = 0; i < char.length; i += 1) {
        output += `\\u${char.charCodeAt(i).toString(16).padStart(4, "0")}`;
      }
    }
    return { output, language: "text" };
  },
  shell: () => null,
  node: () => null,
  // "unicode_escape" writes \xNN for latin-1, leaves ASCII alone whatever the
  // option says, and has no one-liner spelling that honours both modes.
  python: () => null,
};

export const utf8Unescape: TransformDef = {
  id: "utf8-decode",
  name: "UTF-8 Unescape",
  chip: "UTF-8 · Unescape",
  category: "encoders",
  blurb: "Turn \\uXXXX escape sequences back into characters.",
  legacyPaths: ["/tools/utf8-decode"],
  produces: "text",
  run(input) {
    if (!input.trim()) return { output: "" };
    // \uXXXX is the only sequence that means anything here. Everything else —
    // real newlines, tabs, Windows path separators — is literal, which the old
    // trip through the JSON string grammar could not express.
    if (!/\\u[0-9a-fA-F]{4}/.test(input)) {
      return { output: input, language: "text", notes: ["no \\uXXXX escapes found"] };
    }
    if (/\\u(?![0-9a-fA-F]{4})/.test(input)) {
      return {
        output: "",
        error: {
          message: "Not a valid escape sequence",
          hint: "Expected \\uXXXX with exactly four hex digits.",
        },
      };
    }
    // Escapes are UTF-16 units, and a high/low pair re-pairs on concatenation.
    const output = input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) =>
      String.fromCharCode(parseInt(hex, 16)),
    );
    return { output, language: "text" };
  },
  shell: () => null,
  node: () => null,
  python: () =>
    `re.sub(r"\\\\u([0-9a-fA-F]{4})", lambda m: chr(int(m.group(1), 16)), text).encode("utf-16", "surrogatepass").decode("utf-16")`,
};

function xmlToPlain(node: Element): unknown {
  const children = Array.from(node.children);
  if (children.length === 0 && node.attributes.length === 0) {
    return node.textContent;
  }

  const result: Record<string, unknown> = {};
  if (node.attributes.length > 0) {
    const attributes: Record<string, string> = {};
    for (const attr of Array.from(node.attributes)) attributes[attr.name] = attr.value;
    result["@attributes"] = attributes;
  }
  if (children.length === 0) {
    result["#text"] = node.textContent;
    return result;
  }

  // Mixed content: <a>hello<b>1</b></a> used to lose "hello" entirely. Only the
  // direct text children count, and only when they are more than indentation.
  const own = Array.from(node.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE || n.nodeType === Node.CDATA_SECTION_NODE)
    .map((n) => n.nodeValue ?? "")
    .join("")
    .trim();
  if (own) result["#text"] = own;

  for (const child of children) {
    const name = child.nodeName;
    const value = xmlToPlain(child);
    const existing = result[name];
    if (existing === undefined) {
      result[name] = value;
    } else if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      result[name] = [existing, value];
    }
  }
  return result;
}

export const xmlToJson: TransformDef = {
  id: "xml-decode",
  name: "XML to JSON",
  chip: "XML · To JSON",
  category: "encoders",
  blurb: "Read an XML document into a JSON object, attributes and all.",
  legacyPaths: ["/tools/xml-decode"],
  produces: "json",
  run(input) {
    if (!input.trim()) return { output: "", language: "json" };
    const doc = new DOMParser().parseFromString(input, "text/xml");
    const failure = doc.querySelector("parsererror");
    if (failure || !doc.documentElement) {
      return {
        output: "",
        language: "json",
        error: {
          message: "Not well-formed XML",
          hint: failure?.textContent?.split("\n")[0]?.trim() || "Every tag must be closed and nested.",
        },
      };
    }
    try {
      return {
        output: JSON.stringify({ [doc.documentElement.nodeName]: xmlToPlain(doc.documentElement) }, null, 2),
        language: "json",
      };
    } catch (err) {
      return { output: "", language: "json", error: parseJsonError(input, err) };
    }
  },
  shell: () => null,
  node: () => null,
  python: () => null,
};

export const encoders = [
  base64Encode,
  base64Decode,
  urlEncode,
  urlDecode,
  utf8Escape,
  utf8Unescape,
  xmlToJson,
];
