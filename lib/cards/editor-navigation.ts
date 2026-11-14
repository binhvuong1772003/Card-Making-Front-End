import { builtInRegistry, type PageData, type Registry, type TreeNode } from "@miditor/core";
import { cardDefinitions } from "./blocks/definitions";
import { canNavigateFrom, normalizePageNavigation } from "./page-actions";
import { type CardPage, type PageNavigation } from "./document";

export const NAVIGATION_PROP = "cmNavigation";

const baseRegistry: Registry = { ...builtInRegistry, ...cardDefinitions };
export const navigationComponents: Registry = Object.fromEntries(
  Object.entries(baseRegistry).map(([type, definition]) => {
    const probe = { id: "navigation-probe", type, props: {}, children: [] } as unknown as TreeNode;
    const withAssetReference = type === "Image" ? {
      ...definition,
      fields: { ...definition.fields, cmAssetId: { type: "text" as const, label: "", maxLength: 24, hidden: true } },
    } : definition;
    return [type, canNavigateFrom(probe) ? {
      ...withAssetReference,
      defaultProps: { ...withAssetReference.defaultProps, [NAVIGATION_PROP]: null },
      fields: { ...withAssetReference.fields, [NAVIGATION_PROP]: { type: "custom", kind: "card-navigation", label: "Điều hướng", group: "Tương tác" } },
    } : withAssetReference];
  }),
);

const walk = (node: TreeNode, visit: (node: TreeNode) => TreeNode): TreeNode => {
  const children = node.children.map(child => walk(child, visit));
  return visit(children.every((child, i) => child === node.children[i]) ? node : { ...node, children });
};

export function toEditorPage(page: CardPage): PageData {
  const root = walk(page.data.root, node => {
    const props = { ...node.props };
    delete props[NAVIGATION_PROP];
    if (canNavigateFrom(node)) props[NAVIGATION_PROP] = page.interactions[node.id] ?? null;
    const phoneProps = node.phoneProps && { ...node.phoneProps };
    if (phoneProps) delete phoneProps[NAVIGATION_PROP];
    const next = { ...node, props, ...(phoneProps ? { phoneProps } : {}) };
    if (phoneProps && !Object.keys(phoneProps).length) delete next.phoneProps;
    return next;
  });
  return { ...page.data, root };
}

export function fromEditorPage(data: PageData, pages: CardPage[]): Pick<CardPage, "data" | "interactions"> {
  const livePageIds = new Set(pages.map(page => page.id));
  const interactions: Record<string, PageNavigation> = {};
  const root = walk(data.root, node => {
    const props = { ...node.props };
    const value = props[NAVIGATION_PROP];
    delete props[NAVIGATION_PROP];
    const phoneProps = node.phoneProps && { ...node.phoneProps };
    if (phoneProps) delete phoneProps[NAVIGATION_PROP];
    if (canNavigateFrom(node) && value && typeof value === "object" && !Array.isArray(value) && "type" in value && (value.type === "go-to-page" || value.type === "open-popup")) {
      const action = normalizePageNavigation(value as Partial<PageNavigation>, pages);
      if (action && livePageIds.has(action.targetPageId)) interactions[node.id] = action;
    }
    const next = { ...node, props, ...(phoneProps ? { phoneProps } : {}) };
    if (phoneProps && !Object.keys(phoneProps).length) delete next.phoneProps;
    return next;
  });
  return { data: { ...data, root }, interactions };
}
