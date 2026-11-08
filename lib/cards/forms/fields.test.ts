import { describe, expect, it } from "vitest";
import {
  answerPayload,
  cleanFields,
  cleanPublicList,
  duplicateField,
  isClosed,
  moveField,
  newField,
  removeField,
  validateAnswers,
  visibleFields,
  type Field,
  type PublicList,
} from "./fields";

const text = (overrides: Partial<Field> = {}): Field => ({ id: "name", type: "text", label: "Họ và tên", required: true, ...overrides });
const list = (overrides: Partial<PublicList> = {}): PublicList => ({ enabled: true, nameFieldId: "name", textFieldId: "message", ...overrides });

// Bộ ô của mẫu "Xác nhận tham dự": ô số khách chỉ hiện khi khách chọn Có.
const attendance = (): Field[] => [
  text(),
  { id: "attending", type: "choice", label: "Bạn sẽ đến chứ?", required: true, options: ["Có, tôi sẽ đến", "Rất tiếc, không đến được"] },
  { id: "guests", type: "number", label: "Số khách", required: true, min: 1, max: 4, showIf: { fieldId: "attending", equals: "Có, tôi sẽ đến" } },
];

describe("cleanFields", () => {
  it("keeps good questions and drops the broken ones instead of failing the whole form", () => {
    const fields = cleanFields([
      text(),
      { id: "BAD ID", type: "text", label: "Sai mã" },
      { id: "t2", type: "unknown", label: "Sai loại" },
      { id: "t3", type: "text", label: "" },
      { ...text(), id: "name" }, // trùng mã với ô đầu
      { id: "c1", type: "choice", label: "Chọn", options: ["Một"] },
      null,
    ]);
    expect(fields.map((field) => field.id)).toEqual(["name"]);
  });

  it("fills the number bounds and keeps only a condition on an earlier choice or yes/no question", () => {
    const [number, choice, ok, tooEarly] = cleanFields([
      { id: "n", type: "number", label: "Số", required: false },
      { id: "c", type: "choice", label: "Chọn", required: false, options: ["A", "B"] },
      { id: "x", type: "text", label: "X", required: false, showIf: { fieldId: "c", equals: "A" } },
      { id: "y", type: "text", label: "Y", required: false, showIf: { fieldId: "z", equals: "A" } },
    ]);
    expect(number).toMatchObject({ min: 0, max: 100 });
    expect(choice?.options).toEqual(["A", "B"]);
    expect(ok?.showIf).toEqual({ fieldId: "c", equals: "A" });
    expect(tooEarly).not.toHaveProperty("showIf");
  });

  it("stops at twenty questions", () => {
    const raw = Array.from({ length: 25 }, (_, i) => ({ id: `q${i}`, type: "text", label: `Câu ${i}`, required: false }));
    expect(cleanFields(raw)).toHaveLength(20);
  });
});

describe("cleanPublicList", () => {
  it("reads a public list and falls back to off when the prop is missing or broken", () => {
    expect(cleanPublicList({ enabled: true, nameFieldId: "name", textFieldId: "message" })).toEqual({ enabled: true, nameFieldId: "name", textFieldId: "message" });
    expect(cleanPublicList(undefined)).toEqual({ enabled: false, nameFieldId: "", textFieldId: "" });
    expect(cleanPublicList({ enabled: "yes", nameFieldId: 3 })).toEqual({ enabled: false, nameFieldId: "", textFieldId: "" });
  });
});

describe("editing questions", () => {
  it("gives a new question an id no other question has, and defaults that work as soon as it is added", () => {
    const choice = newField("choice", ["f_abc"]);
    expect(choice).toMatchObject({ type: "choice", label: "Chọn một", required: false, options: ["Lựa chọn 1", "Lựa chọn 2"] });
    expect(choice.id).toMatch(/^f_[a-z0-9]{8}$/);
    expect(newField("number", [choice.id])).toMatchObject({ min: 0, max: 100, label: "Số" });
    expect(newField("text", [])).toMatchObject({ label: "Câu hỏi mới" });
  });

  it("moves a question, and does nothing when it would fall outside the list", () => {
    const fields = attendance();
    expect(moveField(fields, 0, 2).map((field) => field.id)).toEqual(["attending", "guests", "name"]);
    expect(moveField(fields, 0, 3).map((field) => field.id)).toEqual(["name", "attending", "guests"]);
    expect(moveField(fields, 1, 1).map((field) => field.id)).toEqual(["name", "attending", "guests"]);
  });

  it("duplicates a question right after itself with a fresh id", () => {
    const copy = duplicateField(attendance(), "attending");
    expect(copy.map((field) => field.id).slice(0, 3)).toEqual(["name", "attending", copy[2]!.id]);
    expect(copy[2]).toMatchObject({ type: "choice", options: ["Có, tôi sẽ đến", "Rất tiếc, không đến được"] });
    expect(new Set(copy.map((field) => field.id)).size).toBe(copy.length);
  });

  it("removes a question and the references that pointed at it", () => {
    const { fields, publicList } = removeField(attendance(), "name", list());
    expect(fields.map((field) => field.id)).toEqual(["attending", "guests"]);
    expect(publicList).toEqual({ enabled: true, nameFieldId: "", textFieldId: "message" });

    const guestsGone = removeField(attendance(), "attending", list()).fields;
    expect(guestsGone.find((field) => field.id === "guests")).not.toHaveProperty("showIf");
  });
});

describe("visibleFields", () => {
  it("shows a question only when the earlier answer matches, and hides what depends on a hidden question", () => {
    const chain: Field[] = [
      { id: "a", type: "choice", label: "A", required: false, options: ["Có", "Không"] },
      { id: "b", type: "choice", label: "B", required: false, options: ["X", "Y"], showIf: { fieldId: "a", equals: "Có" } },
      { id: "c", type: "text", label: "C", required: false, showIf: { fieldId: "b", equals: "X" } },
    ];
    expect(visibleFields(chain, {}).map((field) => field.id)).toEqual(["a"]);
    expect(visibleFields(chain, { a: "Có" }).map((field) => field.id)).toEqual(["a", "b"]);
    expect(visibleFields(chain, { a: "Có", b: "X" }).map((field) => field.id)).toEqual(["a", "b", "c"]);
    // B đang bị ẩn vì A là "Không": giá trị cũ của B không làm C hiện ra.
    expect(visibleFields(chain, { a: "Không", b: "X" }).map((field) => field.id)).toEqual(["a"]);
  });
});

describe("validateAnswers", () => {
  it("accepts an answer that fits every limit", () => {
    expect(
      validateAnswers(
        [
          text({ type: "longtext", id: "lt", label: "Đoạn" }),
          text({ type: "phone", id: "p", label: "Điện thoại" }),
          text({ type: "date", id: "d", label: "Ngày" }),
          { id: "c", type: "choice", label: "Chọn", required: true, options: ["A", "B"] },
          { id: "m", type: "multichoice", label: "Nhiều", required: true, options: ["X", "Y"] },
          { id: "n", type: "number", label: "Số", required: true, min: 1, max: 5 },
          { id: "y", type: "yesno", label: "Có không", required: true },
        ],
        { lt: "Dòng một\nDòng hai", p: "090 123 4567", d: "2026-12-31", c: "B", m: ["Y", "X"], n: 3, y: false },
      ),
    ).toEqual({});
  });

  it("wants every required question, and only the ones the guest can see", () => {
    expect(Object.keys(validateAnswers(attendance(), { attending: "Có, tôi sẽ đến" }))).toEqual(["name", "guests"]);
    // Chọn "không đến" thì ô số khách biến mất: không bắt buộc, và giá trị cũ không bị gửi đi.
    expect(validateAnswers(attendance(), { name: "An", attending: "Rất tiếc, không đến được", guests: 3 })).toEqual({});
    expect(answerPayload(attendance(), { name: " An ", attending: "Rất tiếc, không đến được", guests: 3 })).toEqual({ name: "An", attending: "Rất tiếc, không đến được" });
  });

  it("applies the answer limits of the contract", () => {
    const one = (field: Field, value: unknown) => validateAnswers([field], { [field.id]: value })[field.id];
    expect(one(text(), "a".repeat(201))).toBeTruthy();
    expect(one(text({ type: "longtext" }), "a".repeat(1001))).toBeTruthy();
    expect(one(text({ type: "longtext" }), "a".repeat(1000))).toBeUndefined();
    expect(one(text({ type: "text" }), "hai\ndòng")).toBeTruthy();
    expect(one(text({ type: "phone" }), "123")).toBeTruthy();
    expect(one(text({ type: "phone" }), "090-123-4567")).toBeUndefined();
    expect(one(text({ type: "date" }), "2026-02-30")).toBeTruthy();
    expect(one(text({ type: "date" }), "2026-02-28")).toBeUndefined();
    expect(one({ id: "n", type: "number", label: "Số", required: true, min: 1, max: 5 }, 2.5)).toBeTruthy();
    expect(one({ id: "n", type: "number", label: "Số", required: true, min: 1, max: 5 }, 6)).toBeTruthy();
    expect(one({ id: "c", type: "choice", label: "Chọn", required: true, options: ["A", "B"] }, "C")).toBeTruthy();
    expect(one({ id: "m", type: "multichoice", label: "Nhiều", required: false, options: ["A", "B"] }, ["A", "A"])).toBeTruthy();
    expect(one({ id: "y", type: "yesno", label: "Có không", required: true }, "yes")).toBeTruthy();
  });

  it("leaves optional questions alone when they are empty", () => {
    expect(validateAnswers([text({ required: false })], {})).toEqual({});
    expect(validateAnswers([{ id: "m", type: "multichoice", label: "Nhiều", required: false, options: ["A", "B"] }], { m: [] })).toEqual({});
  });
});

describe("isClosed", () => {
  it("ends at the last millisecond of the day in Vietnam", () => {
    expect(isClosed("", new Date("2030-01-01T00:00:00Z"))).toBe(false);
    expect(isClosed("2026-11-07", new Date("2026-11-07T16:59:59.999Z"))).toBe(false);
    expect(isClosed("2026-11-07", new Date("2026-11-07T17:00:00.000Z"))).toBe(true);
    expect(isClosed("2026-02-30", new Date("2030-01-01T00:00:00Z"))).toBe(false);
  });
});
