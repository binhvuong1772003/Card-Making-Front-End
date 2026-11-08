import { builtInRegistry, emptyPage, insertNode, newNode, validatePage, validateRegistry, type PageData, type TreeNode } from "@miditor/core";
import { describe, expect, it } from "vitest";
import { guestbookBlock } from "./guestbook";

const registry = { ...builtInRegistry, Guestbook: guestbookBlock };

function pageWith(props: Record<string, unknown>): PageData {
  const node = newNode(registry, "Guestbook", "g1", { w: 380, h: 640 }) as TreeNode;
  const page = emptyPage();
  const withProps = { ...node, props: { ...node.props, ...props } } as TreeNode;
  return { ...page, root: insertNode(page.root, "root", withProps) };
}

// CMBE (`responses.config.ts`) đọc đúng thuộc tính này từ bản đã xuất bản. Đổi tên bên nào cũng phải làm bài này đỏ.
const READ_BY_SERVER = { moderation: "boolean" } as const;

describe("the Guestbook block", () => {
  it("has a definition the registry check accepts", () => {
    expect(validateRegistry(registry)).toEqual([]);
  });

  it("arrives with a thin border from the library's own Border section, not a frame of its own", () => {
    const node = newNode(registry, "Guestbook", "g1", { w: 380, h: 640 }) as TreeNode;
    expect(node.styles).toEqual({ borderWidth: 1, borderColor: "#511419", borderRadius: 4 });
    expect(Object.keys(guestbookBlock.fields)).not.toContain("borderWidth");
  });

  it("keeps a page with the default answers valid", () => {
    expect(validatePage(registry, pageWith({}))).toEqual([]);
  });

  it("refuses numbers out of range", () => {
    expect(validatePage(registry, pageWith({ pageSize: 2 })).length).toBeGreaterThan(0);
    expect(validatePage(registry, pageWith({ pageSize: 21 })).length).toBeGreaterThan(0);
    expect(validatePage(registry, pageWith({ padding: 99 })).length).toBeGreaterThan(0);
  });

  it("keeps the prop the server reads, under the name and type it reads", () => {
    for (const [prop, type] of Object.entries(READ_BY_SERVER)) {
      expect(guestbookBlock.defaultProps, prop).toHaveProperty(prop);
      expect(guestbookBlock.fields[prop]?.type ?? "missing", prop).toBe(type);
    }
  });

  it("starts with the words and limits the plan asks for", () => {
    expect((newNode(registry, "Guestbook", "g1", { w: 380, h: 640 }) as TreeNode).props).toMatchObject({
      heading: "Sổ lưu bút",
      button: "Gửi lời chúc",
      moderation: false,
      pageSize: 5,
      color: "#511419",
      padding: 16,
    });
  });
});
