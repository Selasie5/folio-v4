/** Opens the command palette from anywhere (the header buttons use this; ⌘K and / are handled by the palette). */
export const OPEN_PALETTE_EVENT = "command-palette:open";

export const openCommandPalette = () => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT));

/** One searchable entry. Server-built entries carry an href; client actions are added by the palette. */
export interface PaletteEntry {
  id: string;
  group: string;
  label: string;
  /** Quieter text after the label, e.g. a company or date. Searched too. */
  hint?: string;
  href?: string;
  external?: boolean;
}

/**
 * Fuzzy match: every query character must appear in order. Scores favour matches at the start of a
 * word and runs of consecutive characters. Returns the matched indices so the UI can underline them.
 */
export function fuzzyMatch(query: string, text: string): { score: number; indices: number[] } | null {
  const q = query.trim().toLowerCase();
  if (!q) return { score: 0, indices: [] };
  const t = text.toLowerCase();
  const indices: number[] = [];
  let score = 0;
  let from = 0;
  for (const char of q) {
    if (char === " ") continue;
    const at = t.indexOf(char, from);
    if (at === -1) return null;
    const wordStart = at === 0 || /[\s\-_/(·]/.test(t[at - 1]);
    const consecutive = indices.length > 0 && indices[indices.length - 1] === at - 1;
    score += 1 + (wordStart ? 3 : 0) + (consecutive ? 2 : 0) - Math.min(at - from, 5) * 0.1;
    indices.push(at);
    from = at + 1;
  }
  // A whole-word prefix match beats a scattered one.
  if (t.startsWith(q)) score += 5;
  return { score, indices };
}
