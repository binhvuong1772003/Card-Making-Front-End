import { emptyPage, migratePage, type PageData, type TreeNode } from "@miditor/core";
import { upgradePageDocument } from "./forms/legacy";
import { formKeyOf } from "./forms/form-id";
import { canNavigateFrom } from "./page-actions";
import { upgradeLegacyPhotoFrames } from "./blocks/photo-frame";
import { upgradeLegacyDressCodeColors } from "./blocks/dress-code";
import { upgradeLegacyDecorations } from "./blocks/decoration";

export type PageTransition = "none" | "fade" | "slide-left" | "slide-right" | "slide-up" | "zoom";
export type PopupSettings = { width: number; effect: "none" | "fade" | "slide-up" | "zoom"; backdropColor: string; backdropOpacity: number };

export type PageNavigation = {
  type: "go-to-page" | "open-popup";
  targetPageId: string;
  transition: PageTransition;
  durationMs: number;
};

export type CardPage = {
  id: string;
  name: string;
  data: PageData;
  interactions: Record<string, PageNavigation>;
  popup?: PopupSettings;
  /** Bố cục: "full" trải hết bề ngang màn hình; vắng mặt là cột giữa 960 px (mặc định). */
  layout?: "full";
};

export type CardDocument = {
  kind: "card";
  version: 1;
  startPageId: string;
  pages: CardPage[];
};

const PAGE_ID = /^[A-Za-z0-9_-]{1,40}$/;
const FORM_ID = /^[A-Za-z0-9_-]{1,40}$/;
const TRANSITIONS: PageTransition[] = ["none", "fade", "slide-left", "slide-right", "slide-up", "zoom"];

export function blankCardPage(id = "page-1", name = "Trang 1"): CardPage {
  const data = emptyPage();
  return { id, name, data: { ...data, root: { ...data.root, styles: { ...data.root.styles, minHeight: 640, phoneMinHeight: 812 } } }, interactions: {} };
}

export function getStartPage(document: CardDocument): CardPage {
  return document.pages.find((page) => page.id === document.startPageId) ?? document.pages[0]!;
}

export function normalizeCardDocument(input: unknown): CardDocument {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Dữ liệu thiệp không hợp lệ.");
  const value = input as Record<string, unknown>;
  if (value.kind === "card") {
    if (value.version !== 1 || !Array.isArray(value.pages) || value.pages.length < 1 || value.pages.length > 50) throw new Error("Thiệp nhiều trang không hợp lệ.");
    const pages = value.pages.map((raw): CardPage => {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Dữ liệu trang không hợp lệ.");
      const page = raw as CardPage;
      if (typeof page.id !== "string" || !PAGE_ID.test(page.id) || typeof page.name !== "string" || !page.data || !page.interactions || typeof page.interactions !== "object" || Array.isArray(page.interactions)) throw new Error("Dữ liệu trang không hợp lệ.");
      const upgraded = upgradePageDocument(page.data as unknown as Record<string, unknown>);
      const opened = migratePage(upgraded);
      if (!opened.ok) throw new Error("Cây thành phần trang không hợp lệ.");
      if (page.popup && (
        !Number.isInteger(page.popup.width) || page.popup.width < 280 || page.popup.width > 1200 ||
        !["none", "fade", "slide-up", "zoom"].includes(page.popup.effect) ||
        !/^#[0-9a-f]{6}$/i.test(page.popup.backdropColor) || !Number.isInteger(page.popup.backdropOpacity) || page.popup.backdropOpacity < 0 || page.popup.backdropOpacity > 80
      )) throw new Error("Cấu hình popup không hợp lệ.");
      if (page.layout !== undefined && (page.layout as string) !== "column" && page.layout !== "full") throw new Error("Bố cục trang không hợp lệ.");
      // "column" là mặc định nên không lưu; chỉ giữ "full".
      const { layout, ...rest } = page;
      return { ...rest, ...(layout === "full" ? { layout } : {}), name: page.name.trim(), data: { ...opened.page, root: upgradeLegacyDecorations(upgradeLegacyDressCodeColors(upgradeLegacyPhotoFrames(opened.page.root))) } };
    });
    if (new Set(pages.map((page) => page.id)).size !== pages.length || typeof value.startPageId !== "string" || !pages.some((page) => page.id === value.startPageId)) throw new Error("Mã trang hoặc trang bắt đầu không hợp lệ.");
    if (pages.some((page) => !page.name.trim() || page.name.trim().length > 80)) throw new Error("Tên trang phải dài từ 1 đến 80 ký tự.");
    const formIds = new Set<string>();
    for (const page of pages) {
      const nodes = new Map<string, TreeNode>();
      const collect = (node: TreeNode) => {
        if (!node || typeof node.id !== "string" || nodes.has(node.id) || !Array.isArray(node.children)) throw new Error("Cây thành phần trang không hợp lệ.");
        nodes.set(node.id, node);
        if (node.type === "Form") {
          const explicitId = node.props.formId;
          if (explicitId !== undefined && (typeof explicitId !== "string" || !FORM_ID.test(explicitId))) throw new Error("Mã biểu mẫu không hợp lệ.");
          const formId = formKeyOf(explicitId, node.id);
          if (formIds.has(formId)) throw new Error("Mã biểu mẫu bị trùng.");
          formIds.add(formId);
        }
        node.children.forEach(collect);
      };
      collect(page.data.root);
      for (const [sourceId, link] of Object.entries(page.interactions)) {
        const source = nodes.get(sourceId);
        if (!source || !canNavigateFrom(source) || !link || !["go-to-page", "open-popup"].includes(link.type) || !pages.some((target) => target.id === link.targetPageId) || !TRANSITIONS.includes(link.transition) || !Number.isInteger(link.durationMs) || (link.transition === "none" ? link.durationMs !== 0 : link.durationMs < 100 || link.durationMs > 1200)) throw new Error("Liên kết trang không hợp lệ.");
      }
    }
    if (new TextEncoder().encode(JSON.stringify(input)).byteLength > 800 * 1024) throw new Error("Thiệp vượt quá giới hạn 800 KiB.");
    return { kind: "card", version: 1, startPageId: String(value.startPageId), pages };
  }
  // Legacy cards stored PageData directly (including the existing `{}` empty-card value).
  const isPageData = typeof value.schemaVersion === "number" && value.root !== undefined;
  if (Object.keys(value).length && !isPageData) throw new Error("Dữ liệu thiệp cũ không hợp lệ.");
  let data = isPageData ? (upgradePageDocument(input as Record<string, unknown>) as unknown as PageData) : blankCardPage().data;
  const opened = migratePage(data);
  if (!opened.ok) throw new Error("Cây thành phần trang không hợp lệ.");
  data = { ...opened.page, root: upgradeLegacyDecorations(upgradeLegacyDressCodeColors(upgradeLegacyPhotoFrames(opened.page.root))) };
  const used = new Set<string>();
  const materializeForms = (node: PageData["root"]): PageData["root"] => {
    let next = node;
    if (node.type === "Form") {
      const key = formKeyOf(node.props.formId, node.id);
      let formId = key;
      if (used.has(formId)) {
        formId = `${key.slice(0, Math.max(1, 40 - node.id.length - 1))}_${node.id}`.slice(0, 40);
        for (let suffix = 2; used.has(formId); suffix++) formId = `${formId.slice(0, 36)}_${suffix}`;
      }
      used.add(formId);
      next = { ...node, props: { ...node.props, formId } };
    }
    const children = next.children.map(materializeForms);
    return children.every((child, i) => child === next.children[i]) ? next : { ...next, children };
  };
  data = { ...data, root: materializeForms(data.root) };
  if (new TextEncoder().encode(JSON.stringify(data)).byteLength > 800 * 1024) throw new Error("Thiệp vượt quá giới hạn 800 KiB.");
  return {
    kind: "card",
    version: 1,
    startPageId: "page-1",
    pages: [{ ...blankCardPage(), data }],
  };
}
