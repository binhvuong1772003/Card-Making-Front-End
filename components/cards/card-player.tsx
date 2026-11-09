"use client";

import type { JsonValue, TreeNode } from "@miditor/core";
import { Render } from "@miditor/render";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type AnimationEvent } from "react";
import { canNavigateFrom, normalizePageNavigation } from "@/lib/cards/page-actions";
import { getStartPage, type CardDocument, type CardPage, type PageNavigation } from "@/lib/cards/document";
import {
  canStartNavigation,
  createTransitionGuard,
  measuredStageHeight,
  navigationPlan,
  pageEntryFromState,
  pageStageFloor,
  scrollPositionFor,
  writePageHistoryState,
  type PageHistoryEntry,
} from "@/lib/cards/page-navigation";
import { FormDraftProvider } from "@/components/blocks/form-drafts";
import { cardRenderers } from "@/lib/cards/blocks";
import styles from "./card-player.module.css";

export type CardPlayerProps = {
  document: CardDocument;
  mode: "preview" | "published";
  historyKey: string;
  device?: "desktop" | "phone";
  metadata?: JsonValue;
};

type Motion = { transition: PageNavigation["transition"]; durationMs: number };
type MoveSource = "activate" | "popstate";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pageMapOf = (document: CardDocument) => new Map(document.pages.map((page) => [page.id, page]));
const isTreeNode = (value: TreeNode): value is TreeNode => Boolean(value && Array.isArray(value.children));

export function CardPlayer(props: CardPlayerProps) {
  return <Player key={props.historyKey} {...props} />;
}

function Player({ document, mode, historyKey, device, metadata }: CardPlayerProps) {
  const initialPage = getStartPage(document);
  const [currentPageId, setCurrentPageId] = useState(initialPage.id);
  const pageMap = useMemo(() => pageMapOf(document), [document]);
  const currentPage = pageMap.get(currentPageId) ?? initialPage;
  const [outgoingPage, setOutgoingPage] = useState<CardPage | null>(null);
  const [motion, setMotion] = useState<Motion | null>(null);
  const currentRef = useRef(currentPage);
  const guardRef = useRef(createTransitionGuard());
  const currentEntryRef = useRef<PageHistoryEntry>({ pageId: initialPage.id, scrollY: 0, transition: "none", durationMs: 0, index: 0 });
  const stageRef = useRef<HTMLDivElement>(null);
  const currentElementRef = useRef<HTMLDivElement>(null);
  const outgoingElementRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const pendingScrollRef = useRef(0);
  const lastFocusedPageRef = useRef(initialPage.id);
  const showPage = useCallback((page: CardPage) => {
    currentRef.current = page;
    setCurrentPageId(page.id);
  }, []);
  useLayoutEffect(() => { currentRef.current = currentPage; }, [currentPage]);

  const measureStage = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const floor = Math.max(
      pageStageFloor(currentPage, device, stage.clientWidth),
      outgoingPage ? pageStageFloor(outgoingPage, device, stage.clientWidth) : 0,
    );
    const height = measuredStageHeight(
      floor,
      currentElementRef.current?.scrollHeight ?? 0,
      outgoingElementRef.current?.scrollHeight ?? 0,
    );
    if (stage.style.minHeight !== `${height}px`) stage.style.minHeight = `${height}px`;
  }, [currentPage, device, outgoingPage]);

  const clearTransition = useCallback(() => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    guardRef.current.finish();
  }, []);
  const finishTransition = useCallback(() => {
    clearTransition();
    setOutgoingPage(null);
    setMotion(null);
  }, [clearTransition]);

  const moveTo = useCallback((nav: PageNavigation, source: MoveSource, entry?: ReturnType<typeof pageEntryFromState>) => {
    const current = currentRef.current;
    const target = pageMap.get(nav.targetPageId);
    if (!target) return;
    const plan = navigationPlan(current.id, target.id, nav, reducedMotion());
    if (!canStartNavigation(current.id, target.id, false)) return;
    if (source === "popstate") finishTransition();
    if (!guardRef.current.start(plan)) return;

    if (source === "activate") {
      const previousEntry = currentEntryRef.current;
      writePageHistoryState(window.history, historyKey, {
        pageId: current.id,
        scrollY: window.scrollY,
        transition: previousEntry.transition,
        durationMs: previousEntry.durationMs,
        index: previousEntry.index,
      }, "replace");
      const nextEntry = {
        pageId: target.id,
        scrollY: 0,
        transition: nav.transition,
        durationMs: nav.durationMs,
        index: (previousEntry.index ?? 0) + 1,
      };
      writePageHistoryState(window.history, historyKey, nextEntry, "push");
      currentEntryRef.current = nextEntry;
      pendingScrollRef.current = 0;
    } else {
      pendingScrollRef.current = entry ? scrollPositionFor(entry) : 0;
      if (entry) currentEntryRef.current = entry;
    }

    showPage(target);
    const animate = Boolean(plan?.animated);
    setOutgoingPage(animate ? current : null);
    setMotion(animate ? { transition: nav.transition, durationMs: nav.durationMs } : null);
    if (animate) timeoutRef.current = window.setTimeout(finishTransition, nav.durationMs + 150);
    else finishTransition();
  }, [finishTransition, historyKey, pageMap, showPage]);

  useEffect(() => {
    const history = window.history;
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    writePageHistoryState(history, historyKey, {
      pageId: initialPage.id,
      scrollY: window.scrollY,
      transition: "none",
      durationMs: 0,
      index: 0,
    }, "replace");
    currentEntryRef.current = { pageId: initialPage.id, scrollY: window.scrollY, transition: "none", durationMs: 0, index: 0 };
    return () => { history.scrollRestoration = previousRestoration; };
  }, [historyKey, initialPage.id]);

  useEffect(() => {
    const stage = stageRef.current;
    const onPopState = (event: PopStateEvent) => {
      const entry = pageEntryFromState(event.state, historyKey);
      const target = entry && pageMap.get(entry.pageId);
      if (!entry || !target || target.id === currentRef.current.id) return;
      moveTo({ type: "go-to-page", targetPageId: target.id, transition: entry.transition, durationMs: entry.durationMs }, "popstate", entry);
    };
    window.addEventListener("popstate", onPopState);
    const onAnimationCancel = (event: Event) => {
      if (event.target instanceof Element && event.target.matches("[data-card-player-page]")) finishTransition();
    };
    stage?.addEventListener("animationcancel", onAnimationCancel);
    return () => {
      window.removeEventListener("popstate", onPopState);
      stage?.removeEventListener("animationcancel", onAnimationCancel);
      clearTransition();
    };
  }, [clearTransition, finishTransition, historyKey, moveTo, pageMap]);

  useEffect(() => {
    const history = window.history;
    const onScroll = () => {
      if (scrollFrameRef.current !== null) return;
      scrollFrameRef.current = window.requestAnimationFrame(() => {
        scrollFrameRef.current = null;
        const entry = pageEntryFromState(history.state, historyKey);
        if (entry) {
          const next = { ...entry, scrollY: window.scrollY };
          currentEntryRef.current = next;
          writePageHistoryState(history, historyKey, next, "replace");
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollFrameRef.current !== null) window.cancelAnimationFrame(scrollFrameRef.current);
    };
  }, [historyKey]);

  useLayoutEffect(() => {
    measureStage();
    const stage = stageRef.current;
    const observer = typeof ResizeObserver === "undefined" || !stage ? null : new ResizeObserver(measureStage);
    if (observer && stage) {
      observer.observe(stage);
      if (currentElementRef.current) observer.observe(currentElementRef.current);
      if (outgoingElementRef.current) observer.observe(outgoingElementRef.current);
    }
    window.addEventListener("resize", measureStage);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measureStage);
    };
  }, [currentPage, device, measureStage, outgoingPage]);

  useLayoutEffect(() => {
    if (outgoingPage) {
      measureStage();
      return;
    }
    if (lastFocusedPageRef.current === currentPage.id) return;
    window.scrollTo(0, pendingScrollRef.current);
    currentElementRef.current?.focus({ preventScroll: true });
    lastFocusedPageRef.current = currentPage.id;
  }, [currentPage.id, measureStage, outgoingPage]);

  const nodeActions = useMemo(() => {
    const actions: Record<string, { label: string; onActivate: () => void }> = {};
    const visit = (node: TreeNode) => {
      const interaction = currentPage.interactions[node.id];
      if (interaction && isTreeNode(node) && canNavigateFrom(node)) {
        const valid = normalizePageNavigation(interaction, document.pages);
        const target = valid && pageMap.get(valid.targetPageId);
        if (valid && target) actions[node.id] = { label: target.name, onActivate: () => moveTo(valid, "activate") };
      }
      node.children.forEach(visit);
    };
    visit(currentPage.data.root);
    return actions;
  }, [currentPage, document.pages, moveTo, pageMap]);

  const onAnimation = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) finishTransition();
  };
  const renderPage = (page: CardPage, layer: "current" | "outgoing") => (
    <div
      key={`${historyKey}:${page.id}:${layer}`}
      ref={layer === "current" ? currentElementRef : outgoingElementRef}
      className={styles.page}
      data-layer={motion && layer === "current" ? "incoming" : layer === "outgoing" ? "outgoing" : undefined}
      data-card-player-page=""
      data-transition={motion?.transition}
      style={motion ? { animationDuration: `${motion.durationMs}ms` } : undefined}
      aria-hidden={layer === "outgoing" || undefined}
      inert={layer === "outgoing" || undefined}
      tabIndex={layer === "current" ? -1 : undefined}
      role={layer === "current" ? "region" : undefined}
      aria-label={layer === "current" ? page.name : undefined}
      onAnimationEnd={onAnimation}
    >
      <Render
        data={page.data}
        renderers={cardRenderers}
        metadata={metadata ?? (mode === "preview" ? { mode: "preview" } : undefined)}
        device={device}
        responsive={device ? undefined : { scale: true }}
        nodeActions={layer === "current" ? nodeActions : undefined}
      />
    </div>
  );

  return (
    <FormDraftProvider>
      <div
        className={styles.viewport}
        data-card-player=""
        data-device={device}
        data-auto-desktop={pageStageFloor(currentPage, "desktop", 960) > 0 ? "" : undefined}
        data-auto-phone={pageStageFloor(currentPage, "phone", 375) > 0 ? "" : undefined}
      >
        <div ref={stageRef} className={styles.stage}>
          {renderPage(currentPage, "current")}
          {outgoingPage && renderPage(outgoingPage, "outgoing")}
        </div>
      </div>
    </FormDraftProvider>
  );
}
