import type { VIMSessionItem } from "../types";

/**
 * Sort and filter session list: pinned first, then by lastMessageTime (when sortByLatest),
 * then optional search on title/subtitle.
 */
export function sortSessionItems(
  list: VIMSessionItem[],
  sortByLatest: boolean,
  searchQuery: string
): VIMSessionItem[] {
  const indexMap = new Map(list.map((it, i) => [it.id, i]));
  const items = [...list].sort((a, b) => {
    const pa = a.pinned ? 1 : 0;
    const pb = b.pinned ? 1 : 0;
    if (pa !== pb) return pb - pa;
    if (sortByLatest) {
      return (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0);
    }
    return (indexMap.get(a.id) ?? 0) - (indexMap.get(b.id) ?? 0);
  });
  const q = searchQuery.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (s) =>
      (s.title ?? "").toLowerCase().includes(q) || (s.subtitle ?? "").toLowerCase().includes(q)
  );
}
