import { useCallback, useState } from "react";
import { ALL_TRANSFORMS, getTransform, type TransformDef } from "@/lib/transforms";

const KEY = "utilityhub.recents";
const MAX = 3;

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => getTransform(id)) : [];
  } catch {
    return [];
  }
}

/** Most recently used tools, so the three you actually reach for stay one key away. */
export function useRecents() {
  const [ids, setIds] = useState<string[]>(read);

  const push = useCallback((id: string) => {
    setIds((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, MAX);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable — recents just will not persist */
      }
      return next;
    });
  }, []);

  const seeded = ids.length
    ? ids
    : ["json-format", "base64-decode", "url-decode"].filter((id) => getTransform(id));

  const transforms = seeded
    .map((id) => getTransform(id))
    .filter((d): d is TransformDef => Boolean(d))
    .slice(0, MAX);

  return { recents: transforms, push, all: ALL_TRANSFORMS };
}
