"use client";

import { useAutoScroll } from "./use-auto-scroll";
import { parallaxCss } from "@/lib/cards/blocks/parallax";
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
import { openCss, openDurationMs } from "@/lib/cards/blocks/open-effect";
import { readBurstConfig, type BurstConfig } from "@/lib/cards/blocks/burst";
import { BurstOverlay } from "./burst-overlay";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { normalizePopupSettings } from "@/lib/cards/page-actions";
import styles from "./card-player.module.css";

export type CardPlayerProps = {
  document: CardDocument;
  mode: "preview" | "published";
  historyKey: string;
  device?: "desktop" | "phone";
  metadata?: JsonValue;
  immersive?: boolean;
  embedded?: boolean;
};

type Motion = { transition: PageNavigation["transition"]; durationMs: number };
type MoveSource = "activate" | "popstate";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pageMapOf = (document: CardDocument) => new Map(document.pages.map((page) => [page.id, page]));
const isTreeNode = (value: TreeNode): value is TreeNode => Boolean(value && Array.isArray(value.children));
const findNode = (node: TreeNode, match: (node: TreeNode) => boolean): TreeNode | undefined =>
  match(node) ? node : node.children.map((child) => findNode(child, match)).find(Boolean);
const hasNode = (node: TreeNode, id: string): boolean => node.id === id || node.children.some((child) => hasNode(child, id));

// CSS của "Khi mở thiệp" cho một trang; không có hiệu ứng nào thì không vẽ gì.
function OpenEffectStyle({ root }: { root: TreeNode }) {
  const css = useMemo(() => openCss(root), [root]);
  return css ? <style>{css}</style> : null;
}

// Trôi theo cuộn: biến `--cm-scroll` (px đã cuộn) đặt trên <html> khi trang đang hiện có khối trôi; mỗi khối tự dịch theo luật CSS riêng.
function ParallaxStyle({ root, active }: { root: TreeNode; active: boolean }) {
  const css = useMemo(() => parallaxCss(root), [root]);
  useEffect(() => {
    if (!css || !active || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame: number | null = null;
    const update = () => {
      frame = null;
      document.documentElement.style.setProperty("--cm-scroll", String(window.scrollY));
    };
    const onScroll = () => { if (frame === null) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
      document.documentElement.style.removeProperty("--cm-scroll");
    };
  }, [css, active]);
  return css && active ? <style>{css}</style> : null;
}

// Khối nào có hành động bấm (chuyển trang, mở popup...) thì hiện con trỏ bàn tay khi rê vào, kể cả các lớp con của nó.
function PointerStyle({ ids }: { ids: string[] }) {
  const safe = ids.filter((id) => /^[\w-]+$/.test(id));
  if (!safe.length) return null;
  return <style>{safe.map((id) => `[data-miditor-id="${id}"], [data-miditor-id="${id}"] * { cursor: pointer !important; }`).join("\n")}</style>;
}

export function CardPlayer(props: CardPlayerProps) {
  return <Player key={props.historyKey} {...props} />;
}

function Player({ document, mode, historyKey, device, metadata, immersive = false, embedded = false }: CardPlayerProps) {
  const initialPage = getStartPage(document);
  const [currentPageId, setCurrentPageId] = useState(initialPage.id);
  const pageMap = useMemo(() => pageMapOf(document), [document]);
  const currentPage = pageMap.get(currentPageId) ?? initialPage;
  const [outgoingPage, setOutgoingPage] = useState<CardPage | null>(null);
  const immersiveCover = (mode === "published" || immersive) && device !== "phone" && initialPage.id === "cover" && (currentPage.id === "cover" || outgoingPage?.id === "cover");
  // Màn bìa toàn màn hình lấy màu nền từ chính trang bìa (hex), và chỉ mẫu cũ có thẻ "hero-card" mới có các trái tim trôi.
  const coverBackground = /^#[0-9a-f]{6}$/i.test(initialPage.data.root.styles.background ?? "") ? initialPage.data.root.styles.background : undefined;
  const coverHearts = hasNode(initialPage.data.root, "hero-card-background");
  const [motion, setMotion] = useState<Motion | null>(null);
  const [popupPage, setPopupPage] = useState<CardPage | null>(null);
  // Tự lướt (bấm để cuộn, bấm lại để dừng) chỉ chạy ở trang thật, sau khi qua bìa, khi không có popup hay chuyển trang.
  const interactiveIds = useMemo(() => new Set(Object.keys(currentPage.interactions)), [currentPage]);
  const autoScroll = !embedded && !immersiveCover && !popupPage && !motion;
  useAutoScroll({ enabled: autoScroll, interactiveIds });
  const [giftOpeningId, setGiftOpeningId] = useState<string | null>(null);
  const [openingNodeId, setOpeningNodeId] = useState<string | null>(null);
  // Trang bìa vừa chạy xong hiệu ứng mở: lớp "đi ra" của nó giữ nguyên trạng thái cuối thay vì hiện lại rồi mờ.
  const [openedPageId, setOpenedPageId] = useState<string | null>(null);
  // Pháo bắn khi mở thiệp: lớp phủ riêng, sống tiếp khi trang chuyển.
  const [burst, setBurst] = useState<{ key: number; config: BurstConfig } | null>(null);
  const [viewportWidth, setViewportWidth] = useState(1280);
  const popupTriggerRef = useRef<HTMLElement | null>(null);
  const currentRef = useRef(currentPage);
  const embeddedRef = useRef(embedded);
  const guardRef = useRef(createTransitionGuard());
  const currentEntryRef = useRef<PageHistoryEntry>({ pageId: initialPage.id, scrollY: 0, transition: "none", durationMs: 0, index: 0 });
  const stageRef = useRef<HTMLDivElement>(null);
  const currentElementRef = useRef<HTMLDivElement>(null);
  const outgoingElementRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const giftOpenTimerRef = useRef<number | null>(null);
  const pageOpenTimerRef = useRef<number | null>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const pendingScrollRef = useRef(0);
  const lastFocusedPageRef = useRef(initialPage.id);
  const showPage = useCallback((page: CardPage) => {
    currentRef.current = page;
    setCurrentPageId(page.id);
  }, []);
  useLayoutEffect(() => { currentRef.current = currentPage; }, [currentPage]);
  useEffect(() => {
    const measure = () => setViewportWidth(window.document.documentElement.clientWidth);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

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
  useEffect(() => () => {
    if (giftOpenTimerRef.current !== null) window.clearTimeout(giftOpenTimerRef.current);
    if (pageOpenTimerRef.current !== null) window.clearTimeout(pageOpenTimerRef.current);
  }, []);
  const finishTransition = useCallback(() => {
    clearTransition();
    setOutgoingPage(null);
    setMotion(null);
    setOpenedPageId(null);
  }, [clearTransition]);

  const moveTo = useCallback((nav: PageNavigation, source: MoveSource, entry?: ReturnType<typeof pageEntryFromState>) => {
    if (giftOpenTimerRef.current !== null) window.clearTimeout(giftOpenTimerRef.current);
    giftOpenTimerRef.current = null;
    if (pageOpenTimerRef.current !== null) window.clearTimeout(pageOpenTimerRef.current);
    pageOpenTimerRef.current = null;
    setOpeningNodeId(null);
    setGiftOpeningId(null);
    const current = currentRef.current;
    const target = pageMap.get(nav.targetPageId);
    if (!target) return;
    const plan = navigationPlan(current.id, target.id, nav, reducedMotion());
    if (!canStartNavigation(current.id, target.id, false)) return;
    popupTriggerRef.current = null;
    setPopupPage(null);
    if (source === "popstate") finishTransition();
    if (!guardRef.current.start(plan)) return;

    if (source === "activate") {
      const previousEntry = currentEntryRef.current;
      if (!embeddedRef.current) {
        writePageHistoryState(window.history, historyKey, {
          pageId: current.id,
          scrollY: window.scrollY,
          transition: previousEntry.transition,
          durationMs: previousEntry.durationMs,
          index: previousEntry.index,
        }, "replace");
      }
      const nextEntry = {
        pageId: target.id,
        scrollY: 0,
        transition: nav.transition,
        durationMs: nav.durationMs,
        index: (previousEntry.index ?? 0) + 1,
      };
      if (!embeddedRef.current) writePageHistoryState(window.history, historyKey, nextEntry, "push");
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
    if (embedded) {
      currentEntryRef.current = { pageId: initialPage.id, scrollY: 0, transition: "none", durationMs: 0, index: 0 };
      return;
    }
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
  }, [embedded, historyKey, initialPage.id]);

  useEffect(() => {
    const stage = stageRef.current;
    const onPopState = (event: PopStateEvent) => {
      const entry = pageEntryFromState(event.state, historyKey);
      const target = entry && pageMap.get(entry.pageId);
      if (!entry || !target || target.id === currentRef.current.id) return;
      moveTo({ type: "go-to-page", targetPageId: target.id, transition: entry.transition, durationMs: entry.durationMs }, "popstate", entry);
    };
    if (!embedded) window.addEventListener("popstate", onPopState);
    const onAnimationCancel = (event: Event) => {
      if (event.target instanceof Element && event.target.matches("[data-card-player-page]")) finishTransition();
    };
    stage?.addEventListener("animationcancel", onAnimationCancel);
    return () => {
      if (!embedded) window.removeEventListener("popstate", onPopState);
      stage?.removeEventListener("animationcancel", onAnimationCancel);
      clearTransition();
    };
  }, [clearTransition, embedded, finishTransition, historyKey, moveTo, pageMap]);

  useEffect(() => {
    if (embedded) return;
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
  }, [embedded, historyKey]);

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
    let scrollParent = currentElementRef.current?.parentElement;
    while (scrollParent && scrollParent !== window.document.body) {
      const overflowY = window.getComputedStyle(scrollParent).overflowY;
      if ((overflowY === "auto" || overflowY === "scroll") && scrollParent.scrollHeight > scrollParent.clientHeight) {
        scrollParent.scrollTop = 0;
        break;
      }
      scrollParent = scrollParent.parentElement;
    }
    if (!embedded) window.scrollTo(0, pendingScrollRef.current);
    currentElementRef.current?.focus({ preventScroll: true });
    lastFocusedPageRef.current = currentPage.id;
  }, [currentPage.id, embedded, measureStage, outgoingPage]);

  const actionsForPage = useCallback((page: CardPage) => {
    const actions: Record<string, { label: string; onActivate: () => void }> = {};
    const visit = (node: TreeNode) => {
      const interaction = page.interactions[node.id];
      if (interaction && isTreeNode(node) && canNavigateFrom(node)) {
        const valid = normalizePageNavigation(interaction, document.pages);
        const target = valid && pageMap.get(valid.targetPageId);
        if (valid && target) actions[node.id] = { label: target.name, onActivate: () => {
          if (pageOpenTimerRef.current !== null) return;
          if (valid.type === "open-popup") {
            const openPopup = () => {
              popupTriggerRef.current = window.document.activeElement instanceof HTMLElement ? window.document.activeElement : null;
              setGiftOpeningId(null);
              setPopupPage(target);
              giftOpenTimerRef.current = null;
            };
            if (node.type === "Decoration" && node.props.motion === true) {
              if (giftOpenTimerRef.current !== null) window.clearTimeout(giftOpenTimerRef.current);
              if (reducedMotion()) { openPopup(); return; }
              setGiftOpeningId(node.id);
              giftOpenTimerRef.current = window.setTimeout(openPopup, 560);
            } else openPopup();
          } else {
            const motionTarget = typeof node.props.motionTarget === "string" ? node.props.motionTarget : null;
            if (motionTarget && !reducedMotion()) {
              setOpeningNodeId(motionTarget);
              const burstNode = findNode(page.data.root, (candidate) => candidate.type === "Burst");
              if (burstNode) setBurst({ key: Date.now(), config: readBurstConfig(burstNode.props) });
              // Chờ hiệu ứng dài nhất của trang ("Khi mở thiệp"), tối thiểu 520ms của hiệu ứng cũ.
              pageOpenTimerRef.current = window.setTimeout(() => {
                pageOpenTimerRef.current = null;
                setOpeningNodeId(null);
                setOpenedPageId(page.id);
                moveTo(valid, "activate");
              }, Math.max(520, openDurationMs(page.data.root)));
            } else moveTo(valid, "activate");
          }
        } };
      }
      node.children.forEach(visit);
    };
    visit(page.data.root);
    return actions;
  }, [document.pages, moveTo, pageMap]);
  const nodeActions = useMemo(() => actionsForPage(currentPage), [actionsForPage, currentPage]);
  const popupActions = useMemo(() => popupPage ? actionsForPage(popupPage) : undefined, [actionsForPage, popupPage]);

  useEffect(() => {
    if (popupPage) return;
    const trigger = popupTriggerRef.current;
    popupTriggerRef.current = null;
    if (trigger?.isConnected) requestAnimationFrame(() => trigger.focus());
  }, [popupPage]);

  const onAnimation = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) finishTransition();
  };
  const renderPage = (page: CardPage, layer: "current" | "outgoing" | "popup", actions = nodeActions) => (
    <div
      key={`${historyKey}:${page.id}:${layer}`}
      ref={layer === "current" ? currentElementRef : outgoingElementRef}
      className={styles.page}
      data-cover-page={initialPage.id === "cover" && page.id === "cover" ? "" : undefined}
      data-page-layout={page.layout === "full" ? "full" : undefined}
      data-layer={motion && layer === "current" ? "incoming" : layer === "outgoing" ? "outgoing" : undefined}
      data-card-player-page=""
      data-gift-motion={page.interactions["wedding-gift"]?.type === "open-popup" ? "" : undefined}
      data-opening-target={layer === "current" ? openingNodeId ?? undefined : undefined}
      data-opening-done={layer === "outgoing" && openedPageId === page.id ? "" : undefined}
      data-transition={motion?.transition}
      style={motion ? { animationDuration: `${motion.durationMs}ms` } : undefined}
      aria-hidden={layer === "outgoing" || (layer === "current" && Boolean(popupPage)) || undefined}
      inert={layer === "outgoing" || (layer === "current" && Boolean(popupPage)) || undefined}
      tabIndex={layer === "current" ? -1 : undefined}
      role={layer === "outgoing" ? undefined : "region"}
      aria-label={layer === "outgoing" ? undefined : page.name}
      onAnimationEnd={onAnimation}
    >
      {layer !== "popup" && <OpenEffectStyle root={page.data.root} />}
      {layer === "current" && !embedded && <ParallaxStyle root={page.data.root} active />}
      {layer !== "outgoing" && <PointerStyle ids={Object.keys(page.interactions)} />}
      <Render
        data={page.data}
        renderers={cardRenderers}
        metadata={{ ...(metadata && typeof metadata === "object" && !Array.isArray(metadata) ? metadata as Record<string, JsonValue> : metadata ? {} : mode === "preview" ? { mode: "preview" } : {}), giftOpeningId }}
        device={layer === "popup" ? undefined : device}
        responsive={layer === "popup" || !device ? { scale: true } : undefined}
        nodeActions={layer === "outgoing" ? undefined : actions}
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
        <div ref={stageRef} className={styles.stage} data-autoscroll={autoScroll ? "" : undefined} data-immersive-cover={immersiveCover ? "" : undefined} style={immersiveCover && coverBackground ? { "--cover-bg": coverBackground } as React.CSSProperties : undefined}>
          {immersiveCover && coverHearts && <div className={styles.coverHearts} aria-hidden="true">
            {[
              ["9%", "6%", "#a33b43", 18, "0s"], ["34%", "4%", "#a33b43", 21, "1.8s"], ["84%", "2%", "#c18b4c", 18, "3.1s"],
              ["92%", "13%", "#b17c46", 15, "2.4s"], ["17%", "47%", "#d5c1b4", 20, "4s"], ["71%", "46%", "#c18b4c", 16, "1.1s"], ["27%", "78%", "#b27b45", 20, "3.6s"],
            ].map(([left, top, color, size, delay], index) => <span key={index} className={styles.coverHeart} style={{ left: left as string, top: top as string, color: color as string, fontSize: `${size}px`, animationDelay: delay as string }}>♥</span>)}
          </div>}
          {renderPage(currentPage, "current")}
          {outgoingPage && renderPage(outgoingPage, "outgoing")}
        </div>
      </div>
      {burst && <BurstOverlay key={burst.key} config={burst.config} seed={burst.key} onDone={() => setBurst(null)} />}
      <Dialog open={Boolean(popupPage)} onOpenChange={open => { if (!open) setPopupPage(null); }}>
        {popupPage && (() => {
          const popup = normalizePopupSettings(popupPage.popup);
          const canvasWidth = viewportWidth <= 640 || popup.width <= 640 ? 375 : 960;
          const pageScale = Math.min(1, Math.max(0.1, (Math.min(popup.width, viewportWidth - 32)) / canvasWidth));
          const [red, green, blue] = popup.backdropColor.slice(1).match(/.{2}/g)!.map(value => Number.parseInt(value, 16));
          return <DialogContent
            data-popup-effect={popup.effect}
            data-popup-page={popupPage.id}
            className={`${styles.popupMotion} grid max-w-none gap-0 overflow-hidden rounded-xl border border-black/10 bg-white p-0 shadow-2xl`}
            style={{ width: `min(${popup.width}px, calc(100vw - 32px))`, maxWidth: "calc(100vw - 32px)", maxHeight: "calc(100dvh - 32px)", zIndex: 111 }}
            backdropStyle={{ backgroundColor: `rgba(${red}, ${green}, ${blue}, ${popup.backdropOpacity / 100})`, zIndex: 110 }}
          >
            <DialogTitle className="sr-only">{popupPage.name}</DialogTitle>
            <div className={styles.popupScroll}><div style={{ width: canvasWidth, zoom: pageScale, marginInline: "auto" }}><div className={styles.viewport} data-card-player="" data-auto-desktop="" data-auto-phone=""><div className={styles.stage}>{renderPage(popupPage, "popup", popupActions)}</div></div></div></div>
          </DialogContent>;
        })()}
      </Dialog>
    </FormDraftProvider>
  );
}
