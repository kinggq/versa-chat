import { describe, it, expect } from "vitest";
import { sortSessionItems } from "../src/utils/sessionListModel";
import type { VIMSessionItem } from "../src/types";

function item(
  id: string,
  overrides: Partial<VIMSessionItem> = {}
): VIMSessionItem {
  return {
    id,
    title: id,
    lastMessageTime: 0,
    ...overrides
  };
}

describe("sortSessionItems", () => {
  it("puts pinned sessions first", () => {
    const list = [
      item("a", { lastMessageTime: 100 }),
      item("b", { pinned: true, lastMessageTime: 1 }),
      item("c", { lastMessageTime: 200 })
    ];
    const out = sortSessionItems(list, true, "");
    expect(out.map((x) => x.id)).toEqual(["b", "c", "a"]);
  });

  it("sorts by lastMessageTime when sortByLatest is true", () => {
    const list = [
      item("a", { lastMessageTime: 10 }),
      item("b", { lastMessageTime: 30 }),
      item("c", { lastMessageTime: 20 })
    ];
    const out = sortSessionItems(list, true, "");
    expect(out.map((x) => x.id)).toEqual(["b", "c", "a"]);
  });

  it("preserves original order when sortByLatest is false (except pinned)", () => {
    const list = [
      item("a", { lastMessageTime: 300 }),
      item("b", { pinned: true, lastMessageTime: 1 }),
      item("c", { lastMessageTime: 100 })
    ];
    const out = sortSessionItems(list, false, "");
    expect(out.map((x) => x.id)).toEqual(["b", "a", "c"]);
  });

  it("filters by search query on title or subtitle", () => {
    const list = [
      item("a", { title: "Alpha", subtitle: "x" }),
      item("b", { title: "Beta", subtitle: "findme" })
    ];
    const out = sortSessionItems(list, true, "FINDME");
    expect(out.map((x) => x.id)).toEqual(["b"]);
  });
});
