export interface FuzzyMatch {
  score: number;
  /** Indexes in the haystack that matched, for highlighting. */
  hits: number[];
}

/**
 * Subsequence match with a bonus for hits at word boundaries, so "b64 dec"
 * ranks "Base64 Decode" above anything that merely contains those letters.
 * Returns null when the query is not a subsequence at all — a palette that
 * lists non-matches is just a menu.
 */
export function fuzzy(query: string, haystack: string): FuzzyMatch | null {
  const q = query.toLowerCase().replace(/\s+/g, "");
  if (!q) return { score: 0, hits: [] };

  const h = haystack.toLowerCase();
  const hits: number[] = [];
  let score = 0;
  let cursor = 0;
  let streak = 0;

  for (const char of q) {
    const index = h.indexOf(char, cursor);
    if (index === -1) return null;

    const boundary = index === 0 || /[^a-z0-9]/.test(h[index - 1]);
    score += boundary ? 8 : 1;
    streak = index === cursor && cursor > 0 ? streak + 1 : 0;
    score += streak * 2;

    hits.push(index);
    cursor = index + 1;
  }

  // Prefer shorter names among equally good matches.
  score -= haystack.length * 0.05;
  return { score, hits };
}

export function highlight(text: string, hits: number[]): { text: string; match: boolean }[] {
  if (!hits.length) return [{ text, match: false }];
  const set = new Set(hits);
  const parts: { text: string; match: boolean }[] = [];
  let buffer = "";
  let current = set.has(0);

  for (let i = 0; i < text.length; i += 1) {
    const isMatch = set.has(i);
    if (isMatch !== current) {
      if (buffer) parts.push({ text: buffer, match: current });
      buffer = "";
      current = isMatch;
    }
    buffer += text[i];
  }
  if (buffer) parts.push({ text: buffer, match: current });
  return parts;
}
