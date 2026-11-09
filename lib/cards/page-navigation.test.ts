import { describe, expect, it, vi } from "vitest";
import type { PageNavigation, PageTransition } from "./document";
import { blankCardPage } from "./document";
import {
  createTransitionGuard,
  mergePageHistoryState,
  navigationPlan,
  pageEntryFromState,
  scrollPositionFor,
  writePageHistoryState,
  measuredStageHeight,
  pageStageFloor,
} from "./page-navigation";

const navigation = (transition: PageTransition = "fade", durationMs = 450): PageNavigation => ({
  type: "go-to-page",
  targetPageId: "next",
  transition,
  durationMs,
});

function fakeHistory(state: unknown) {
  return {
    state,
    pushState: vi.fn(function (this: { state: unknown }, next: unknown) { this.state = next; }),
    replaceState: vi.fn(function (this: { state: unknown }, next: unknown) { this.state = next; }),
  };
}

describe("page navigation", () => {
  it("ignores rapid activations until a transition finishes", () => {
    const guard = createTransitionGuard();
    const plan = navigationPlan(navigation(), false);
    expect(guard.start(plan)).toBe(true);
    expect(guard.start(plan)).toBe(false);
    guard.finish();
    expect(guard.start(plan)).toBe(true);
  });

  it("does nothing for a self target", () => {
    expect(navigationPlan("current", "current", navigation(), false)).toBeNull();
  });

  it("completes immediately for reduced motion and none", () => {
    expect(navigationPlan("current", "next", navigation(), true)).toEqual({ animated: false, durationMs: 0 });
    expect(navigationPlan("current", "next", navigation("none", 0), false)).toEqual({ animated: false, durationMs: 0 });
  });

  it("clears the transition guard when a transition is canceled", () => {
    const guard = createTransitionGuard();
    guard.start(navigationPlan(navigation(), false));
    guard.finish();
    expect(guard.start(navigationPlan(navigation(), false))).toBe(true);
  });

  it("merges page history state without replacing Next fields", () => {
    const state = { __NA: true, tree: ["next", { url: "/card" }], custom: 1 };
    const next = mergePageHistoryState(state, "public:card", { pageId: "p2", scrollY: 0, transition: "fade", durationMs: 450 });
    expect(next).toMatchObject({ __NA: true, tree: ["next", { url: "/card" }], custom: 1 });
    expect(pageEntryFromState(next, "public:card")?.pageId).toBe("p2");
  });

  it("keeps history entries independent by historyKey", () => {
    const first = mergePageHistoryState(null, "preview:one", { pageId: "one", scrollY: 0, transition: "none", durationMs: 0 });
    const both = mergePageHistoryState(first, "public:two", { pageId: "two", scrollY: 12, transition: "slide-left", durationMs: 500 });
    expect(pageEntryFromState(both, "preview:one")?.pageId).toBe("one");
    expect(pageEntryFromState(both, "public:two")?.pageId).toBe("two");
    expect(pageEntryFromState(both, "preview:missing")).toBeNull();
  });

  it("restores saved scroll on back and forward", () => {
    const entry = { pageId: "p1", scrollY: 720, transition: "fade" as const, durationMs: 450 };
    expect(scrollPositionFor(entry)).toBe(720);
  });

  it("reads popstate data without pushing another history entry", () => {
    const history = fakeHistory({ __cmfePageNavigation: { key: { pageId: "p1", scrollY: 0, transition: "fade", durationMs: 450 } } });
    const entry = pageEntryFromState(history.state, "key");
    expect(entry?.pageId).toBe("p1");
    expect(history.pushState).not.toHaveBeenCalled();
  });

  it("writes either a replacement or a new scoped entry", () => {
    const history = fakeHistory({ keep: true });
    const entry = { pageId: "p1", scrollY: 4, transition: "none" as const, durationMs: 0 };
    writePageHistoryState(history, "key", entry, "replace");
    writePageHistoryState(history, "key", entry, "push");
    expect(history.replaceState).toHaveBeenCalledTimes(1);
    expect(history.pushState).toHaveBeenCalledTimes(1);
  });

  it("keeps an explicitly short page at its own height", () => {
    const base = blankCardPage();
    const page = { ...base, data: { ...base.data, root: { ...base.data.root, styles: { minHeight: 500 } } } };
    expect(measuredStageHeight(pageStageFloor(page, "desktop", 960), 500)).toBe(500);
  });

  it("gives auto-height free content the desktop fallback", () => {
    const base = blankCardPage();
    const page = { ...base, data: { ...base.data, root: { ...base.data.root, styles: {} } } };
    expect(measuredStageHeight(pageStageFloor(page, "desktop", 960), 342)).toBe(640);
  });
});
