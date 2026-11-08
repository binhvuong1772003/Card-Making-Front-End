import { builtInRegistry, emptyPage, insertNode, newNode, validatePage, validateRegistry, type PageData, type TreeNode } from "@miditor/core";
import { describe, expect, it } from "vitest";
import { rsvpBlock } from "./rsvp";

const registry = { ...builtInRegistry, Rsvp: rsvpBlock };

function pageWith(props: Record<string, unknown>): PageData {
  const node = newNode(registry, "Rsvp", "r1", { w: 380, h: 560 }) as TreeNode;
  const page = emptyPage();
  const withProps = { ...node, props: { ...node.props, ...props } } as TreeNode;
  return { ...page, root: insertNode(page.root, "root", withProps) };
}

// CMBE (`responses.config.ts`) đọc đúng những thuộc tính này từ bản đã xuất bản. Đổi tên bên nào cũng phải làm bài này đỏ.
const READ_BY_SERVER = {
  deadline: "custom",
  maxGuests: "number",
  askGuests: "boolean",
  askNote: "boolean",
  askPhone: "boolean",
  askMaybe: "boolean",
} as const;

describe("the Rsvp block", () => {
  it("has a definition the registry check accepts", () => {
    expect(validateRegistry(registry)).toEqual([]);
  });

  it("arrives with a thin border from the library's own Border section, not a frame of its own", () => {
    const node = newNode(registry, "Rsvp", "r1", { w: 380, h: 560 }) as TreeNode;
    expect(node.styles).toEqual({ borderWidth: 1, borderColor: "#511419", borderRadius: 4 });
    expect(Object.keys(rsvpBlock.fields)).not.toContain("borderWidth");
  });

  it("keeps a page with the default answers valid", () => {
    expect(validatePage(registry, pageWith({}))).toEqual([]);
  });

  it("refuses numbers out of range", () => {
    expect(validatePage(registry, pageWith({ maxGuests: 0 })).length).toBeGreaterThan(0);
    expect(validatePage(registry, pageWith({ maxGuests: 21 })).length).toBeGreaterThan(0);
    expect(validatePage(registry, pageWith({ padding: 99 })).length).toBeGreaterThan(0);
  });

  it("keeps the props the server reads, under the names and types it reads", () => {
    for (const [prop, type] of Object.entries(READ_BY_SERVER)) {
      expect(rsvpBlock.defaultProps, prop).toHaveProperty(prop);
      expect(rsvpBlock.fields[prop]?.type ?? "missing", prop).toBe(type);
    }
    expect(rsvpBlock.fields.deadline).toMatchObject({ type: "custom", kind: "date" });
  });

  it("starts with the words and limits the plan asks for", () => {
    expect((newNode(registry, "Rsvp", "r1", { w: 380, h: 560 }) as TreeNode).props).toMatchObject({
      heading: "Bạn sẽ đến chứ?",
      button: "Gửi xác nhận",
      deadline: "",
      maxGuests: 4,
      askGuests: true,
      askNote: true,
      askPhone: false,
      askMaybe: true,
      color: "#511419",
      padding: 16,
    });
  });
});
