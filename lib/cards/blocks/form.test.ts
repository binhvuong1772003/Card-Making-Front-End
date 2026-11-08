import { builtInRegistry, emptyPage, insertNode, newNode, validatePage, validateRegistry, type PageData, type TreeNode } from "@miditor/core";
import { describe, expect, it } from "vitest";
import { formBlock } from "./form";
import { formPresets } from "./form-presets";

const registry = { ...builtInRegistry, Form: formBlock };

function pageWith(props: Record<string, unknown> = {}): PageData {
  const node = newNode(registry, "Form", "f1", { w: 380, h: 560 }) as TreeNode;
  const page = emptyPage();
  return { ...page, root: insertNode(page.root, "root", { ...node, props: { ...node.props, ...props } } as TreeNode) };
}

// CMBE (`responses.config.ts` + `form-fields.ts`) đọc đúng những thuộc tính này từ bản đã xuất bản.
const READ_BY_SERVER = {
  heading: "text",
  intro: "text",
  button: "text",
  success: "text",
  deadline: "custom",
  fields: "custom",
  publicList: "custom",
  moderation: "boolean",
  color: "color",
  padding: "number",
} as const;

describe("the Form block", () => {
  it("has a definition the registry check accepts", () => {
    expect(validateRegistry(registry)).toEqual([]);
  });

  it("keeps a page with the default answers valid", () => {
    expect(validatePage(registry, pageWith())).toEqual([]);
  });

  it("keeps the props the server reads, under the names and types it reads", () => {
    for (const [prop, type] of Object.entries(READ_BY_SERVER)) {
      expect(formBlock.defaultProps, prop).toHaveProperty(prop);
      expect(formBlock.fields[prop]?.type ?? "missing", prop).toBe(type);
    }
    expect(formBlock.fields.deadline).toMatchObject({ type: "custom", kind: "date" });
    expect(formBlock.fields.fields).toMatchObject({ type: "custom", kind: "form-fields" });
    // `publicList` là đối tượng lồng nên cũng đi qua ô `custom`; bảng thuộc tính của Miditor không có kiểu đối tượng.
    expect(formBlock.fields.publicList).toMatchObject({ type: "custom", kind: "form-public-list" });
  });

  it("starts with the words the plan asks for", () => {
    expect(formBlock.defaultProps).toMatchObject({
      heading: "Biểu mẫu",
      intro: "",
      button: "Gửi",
      success: "Cảm ơn bạn đã gửi.",
      deadline: "",
      publicList: { enabled: false, nameFieldId: "", textFieldId: "" },
      moderation: false,
      color: "#511419",
      padding: 16,
    });
  });

  it("leaves the question list to the server's rules, since a custom prop is not checked here", () => {
    const many = Array.from({ length: 25 }, (_, i) => ({ id: `q${i}`, type: "text", label: `Câu ${i}`, required: false }));
    expect(validatePage(registry, pageWith({ fields: many }))).toEqual([]);
  });

  it("has presets that each make a valid page", () => {
    expect(formPresets.map((preset) => preset.id)).toEqual(["attendance", "wishes", "blank"]);
    for (const preset of formPresets) expect(validatePage(registry, pageWith(preset.props)), preset.id).toEqual([]);
  });

  it("gives each preset the questions the plan asks for", () => {
    const attendance = formPresets.find((preset) => preset.id === "attendance")!.props;
    expect(attendance).toMatchObject({ heading: "Bạn sẽ đến chứ?", button: "Gửi xác nhận" });
    expect(attendance.fields).toEqual([
      { id: "name", type: "text", label: "Họ và tên", required: true },
      {
        id: "attending",
        type: "choice",
        label: "Bạn sẽ đến chứ?",
        required: true,
        options: ["Có, tôi sẽ đến", "Rất tiếc, không đến được", "Chưa chắc"],
      },
      {
        id: "guests",
        type: "number",
        label: "Số khách (tính cả bạn)",
        required: true,
        min: 1,
        max: 4,
        showIf: { fieldId: "attending", equals: "Có, tôi sẽ đến" },
      },
    ]);

    const wishes = formPresets.find((preset) => preset.id === "wishes")!.props;
    expect(wishes.publicList).toEqual({ enabled: true, nameFieldId: "name", textFieldId: "message" });
    expect(wishes.fields).toEqual([
      { id: "name", type: "text", label: "Tên của bạn", required: true },
      { id: "message", type: "longtext", label: "Lời chúc", required: true },
    ]);
  });
});
