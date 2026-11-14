import type { TreeNode } from "@miditor/core";
import type { CardPage, PageNavigation, PageTransition } from "./document";
import type { PopupSettings } from "./document";

const TRANSITIONS: PageTransition[] = ["none", "fade", "slide-left", "slide-right", "slide-up", "zoom"];
const POPUP_EFFECTS: PopupSettings["effect"][] = ["none", "fade", "slide-up", "zoom"];
const INTERACTIVE = /^(Form|Input|Textarea|Select|Checkbox|Radio|Submit|RSVP|Guestbook|FormField)/i;

export function canNavigateFrom(node: TreeNode): boolean {
  if (!node || /^(Root|Page|Canvas)$/i.test(node.type)) return false;
  const supported = ['Text', 'Image', 'Decoration', 'Shape', 'Button', 'Group', 'Container', 'PhotoFrame'];
  if (!supported.includes(node.type)) return false;
  const hasInteractiveDescendant = (candidate: TreeNode): boolean => INTERACTIVE.test(candidate.type) || candidate.children.some(hasInteractiveDescendant);
  return !INTERACTIVE.test(node.type) && !node.children.some(hasInteractiveDescendant);
}

export function normalizePageNavigation(value: Partial<PageNavigation> | undefined, pages: CardPage[]): PageNavigation | undefined {
  if (!value || !pages.some((page) => page.id === value.targetPageId)) return undefined;
  const type = value.type === "open-popup" ? "open-popup" : "go-to-page";
  const transition = TRANSITIONS.includes(value.transition as PageTransition) ? value.transition as PageTransition : "fade";
  const durationMs = transition === "none" ? 0 : Math.min(1200, Math.max(100, Number.isFinite(value.durationMs) ? Number(value.durationMs) : 450));
  return { type, targetPageId: value.targetPageId!, transition, durationMs };
}

export function normalizePopupSettings(value?: Partial<PopupSettings> | null): PopupSettings {
  const width = Number(value?.width);
  const opacity = Number(value?.backdropOpacity);
  return {
    width: Number.isFinite(width) ? Math.min(1200, Math.max(280, Math.round(width))) : 640,
    effect: POPUP_EFFECTS.includes(value?.effect as PopupSettings["effect"]) ? value!.effect as PopupSettings["effect"] : "fade",
    backdropColor: /^#[0-9a-f]{6}$/i.test(value?.backdropColor ?? "") ? value!.backdropColor! : "#17251e",
    backdropOpacity: Number.isFinite(opacity) ? Math.min(80, Math.max(0, Math.round(opacity))) : 56,
  };
}
