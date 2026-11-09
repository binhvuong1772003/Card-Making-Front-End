import { DEFAULT_PAGE_HEIGHT, isFreeNode, PHONE_PAGE_MIN_HEIGHT, type Device } from "@miditor/core";
import type { CardPage, PageNavigation, PageTransition } from "./document";

const HISTORY_KEY = "__cmfePageNavigation";
const TRANSITIONS = new Set<PageTransition>(["none", "fade", "slide-left", "slide-right", "slide-up", "zoom"]);

export type PageHistoryEntry = {
  pageId: string;
  scrollY: number;
  transition: PageTransition;
  durationMs: number;
  index?: number;
};

type HistoryLike = Pick<History, "state" | "pushState" | "replaceState">;
type NavigationPlan = { animated: boolean; durationMs: number };

export function navigationPlan(nav: PageNavigation, reducedMotion: boolean): NavigationPlan;
export function navigationPlan(current: string, target: string, nav: PageNavigation, reducedMotion: boolean): NavigationPlan | null;
export function navigationPlan(
  currentOrNavigation: string | PageNavigation,
  targetOrReducedMotion: string | boolean,
  maybeNavigation?: PageNavigation,
  maybeReducedMotion?: boolean,
): NavigationPlan | null {
  const hasPages = typeof currentOrNavigation === "string";
  const nav = hasPages ? maybeNavigation! : currentOrNavigation;
  const reducedMotion = hasPages ? maybeReducedMotion! : targetOrReducedMotion as boolean;
  if (hasPages && currentOrNavigation === targetOrReducedMotion) return null;
  const animated = !reducedMotion && nav.transition !== "none" && nav.durationMs > 0;
  return { animated, durationMs: animated ? nav.durationMs : 0 };
}

export function createTransitionGuard() {
  let transitioning = false;
  return {
    start(plan: NavigationPlan | null): boolean {
      if (!plan || transitioning) return false;
      transitioning = plan.animated;
      return true;
    },
    finish() {
      transitioning = false;
    },
  };
}

export function mergePageHistoryState(state: unknown, historyKey: string, entry: PageHistoryEntry): Record<string, unknown> {
  const base = state && typeof state === "object" && !Array.isArray(state) ? state as Record<string, unknown> : {};
  const pages = base[HISTORY_KEY] && typeof base[HISTORY_KEY] === "object" && !Array.isArray(base[HISTORY_KEY])
    ? base[HISTORY_KEY] as Record<string, unknown>
    : {};
  return { ...base, [HISTORY_KEY]: { ...pages, [historyKey]: entry } };
}

export function pageEntryFromState(state: unknown, historyKey: string): PageHistoryEntry | null {
  if (!state || typeof state !== "object" || Array.isArray(state)) return null;
  const pages = (state as Record<string, unknown>)[HISTORY_KEY];
  if (!pages || typeof pages !== "object" || Array.isArray(pages)) return null;
  const entry = (pages as Record<string, unknown>)[historyKey];
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
  const value = entry as Record<string, unknown>;
  if (
    typeof value.pageId !== "string" ||
    typeof value.scrollY !== "number" || !Number.isFinite(value.scrollY) ||
    typeof value.transition !== "string" || !TRANSITIONS.has(value.transition as PageTransition) ||
    typeof value.durationMs !== "number" || !Number.isFinite(value.durationMs)
  ) return null;
  return value as PageHistoryEntry;
}

export function writePageHistoryState(history: HistoryLike, historyKey: string, entry: PageHistoryEntry, method: "push" | "replace") {
  const state = mergePageHistoryState(history.state, historyKey, entry);
  if (method === "push") history.pushState(state, "");
  else history.replaceState(state, "");
}

export function scrollPositionFor(entry: PageHistoryEntry): number {
  return entry.scrollY;
}

export function canStartNavigation(currentPageId: string, targetPageId: string, transitioning: boolean): boolean {
  return !transitioning && currentPageId !== targetPageId;
}

export function pageStageFloor(page: CardPage, device: Device | undefined, width: number): number {
  const root = page.data.root;
  const phone = device === "phone" || (device === undefined && width <= 640);
  const explicit = phone
    ? typeof root.styles?.phoneMinHeight === "number" ||
      (!root.children.some(isFreeNode) && typeof root.styles?.minHeight === "number")
    : typeof root.styles?.minHeight === "number";
  return explicit ? 0 : phone ? PHONE_PAGE_MIN_HEIGHT : DEFAULT_PAGE_HEIGHT;
}

export function measuredStageHeight(floor: number, ...contentHeights: number[]): number {
  return Math.max(floor, ...contentHeights);
}
