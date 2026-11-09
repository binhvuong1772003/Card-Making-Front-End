import type { TreeNode } from "@miditor/core";
import type { CardPage, PageNavigation, PageTransition } from "./document";

const TRANSITIONS: PageTransition[] = ["none", "fade", "slide-left", "slide-right", "slide-up", "zoom"];
const INTERACTIVE = /^(Form|Input|Textarea|Select|Checkbox|Radio|Submit|RSVP|Guestbook|FormField)/i;

export function canNavigateFrom(node: TreeNode): boolean {
  if (!node || /^(Root|Page|Canvas)$/i.test(node.type)) return false;
  const supported = ['Text', 'Image', 'Shape', 'Button', 'Group', 'Container', 'PhotoFrame', 'PhotoFrameRectangle', 'PhotoFrameRounded', 'PhotoFrameCircle', 'PhotoFramePill', 'PhotoFrameArch', 'PhotoFrameSemicircle', 'PhotoFrameTriangle', 'PhotoFrameDiamond', 'PhotoFramePentagon', 'PhotoFrameHexagon', 'PhotoFrameScallop', 'PhotoFrameSeal', 'PhotoFrameHeart'];
  if (!supported.includes(node.type)) return false;
  const hasInteractiveDescendant = (candidate: TreeNode): boolean => INTERACTIVE.test(candidate.type) || candidate.children.some(hasInteractiveDescendant);
  return !INTERACTIVE.test(node.type) && !node.children.some(hasInteractiveDescendant);
}

export function normalizePageNavigation(value: Partial<PageNavigation> | undefined, pages: CardPage[]): PageNavigation | undefined {
  if (!value || !pages.some((page) => page.id === value.targetPageId)) return undefined;
  const transition = TRANSITIONS.includes(value.transition as PageTransition) ? value.transition as PageTransition : "fade";
  const durationMs = transition === "none" ? 0 : Math.min(1200, Math.max(100, Number.isFinite(value.durationMs) ? Number(value.durationMs) : 450));
  return { type: "go-to-page", targetPageId: value.targetPageId!, transition, durationMs };
}
