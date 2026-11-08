import { describe, expect, it } from "vitest";
import { answerText, cardForm, chipTone, columnsOf, linkName, linkOfResponse, responsesPage, sentAt, summaryLine, type CardForm, type FormResponse } from "./responses";

const form = (overrides: Partial<CardForm> = {}): CardForm => ({
  blockId: "b1",
  heading: "Xác nhận tham dự",
  fields: [
    { id: "name", label: "Họ và tên", type: "text", options: [] },
    { id: "attending", label: "Bạn sẽ đến chứ?", type: "choice", options: ["Có", "Không"] },
  ],
  publicList: false,
  moderation: false,
  removed: false,
  total: 2,
  pending: 0,
  ...overrides,
});

const row = (id: string, answers: FormResponse["answers"], createdAt = "2026-11-07T03:04:00.000Z"): FormResponse => ({
  id,
  blockId: "b1",
  publicationId: null,
  answers,
  status: "VISIBLE",
  createdAt,
});

describe("answerText", () => {
  it("writes one answer the way the table shows it", () => {
    expect(answerText("An")).toBe("An");
    expect(answerText(3)).toBe("3");
    expect(answerText(true)).toBe("Có");
    expect(answerText(false)).toBe("Không");
    expect(answerText(["Có", "Không"])).toBe("Có; Không");
    expect(answerText(undefined)).toBe("");
  });
});

describe("sentAt", () => {
  it("shows the day and time in Vietnam time, where the card lives", () => {
    expect(sentAt("2026-11-06T17:00:00.000Z")).toBe("07/11 00:00");
    expect(sentAt("2026-11-07T03:04:00.000Z")).toBe("07/11 10:04");
    expect(sentAt("không phải ngày")).toBe("");
  });
});

describe("summaryLine", () => {
  it("counts each option of a choice, and sums a number question", () => {
    expect(summaryLine({ fieldId: "a", label: "Bạn sẽ đến chứ?", type: "choice", answered: 3, counts: [{ option: "Có", count: 2 }, { option: "Không", count: 1 }], total: null })).toBe("Có: 2 · Không: 1");
    expect(summaryLine({ fieldId: "g", label: "Số khách", type: "number", answered: 2, counts: [], total: 7 })).toBe("Tổng: 7");
    expect(summaryLine({ fieldId: "m", label: "Lời chúc", type: "longtext", answered: 4, counts: [], total: null })).toBe("4 người đã trả lời");
  });
});

describe("chipTone", () => {
  it("gives the same answer the same colour, from a small palette", () => {
    expect(chipTone("Có, tôi sẽ đến")).toBe(chipTone("Có, tôi sẽ đến"));
    for (const value of ["Có", "Không", "Chưa chắc", "Rất tiếc, không đến được"]) {
      expect(chipTone(value)).toBeGreaterThanOrEqual(0);
      expect(chipTone(value)).toBeLessThan(5);
    }
  });
});

describe("columnsOf", () => {
  it("takes the columns a form declares, and rebuilds them from the answers of a form that was removed", () => {
    expect(columnsOf(form(), []).map((column) => column.id)).toEqual(["name", "attending"]);

    const old = row("r1", [
      { id: "name", label: "Tên cũ", type: "text", value: "An" },
      { id: "guests", label: "Số khách", type: "number", value: 2 },
    ]);
    const removed = form({ removed: true, fields: [] });
    expect(columnsOf(removed, [old])).toEqual([
      { id: "name", label: "Tên cũ", type: "text", options: [] },
      { id: "guests", label: "Số khách", type: "number", options: [] },
    ]);
    // Dòng thứ hai không lặp lại cột đã có.
    expect(columnsOf(removed, [old, old]).map((column) => column.id)).toEqual(["name", "guests"]);
  });
});

describe("the GraphQL shapes", () => {
  it("reads a form the server sends", () => {
    expect(
      cardForm.parse({
        blockId: "b1",
        heading: "Sổ lưu bút",
        fields: [{ id: "name", label: "Tên", type: "text", options: [] }],
        publicList: true,
        moderation: false,
        removed: false,
        total: 3,
        pending: 0,
      }),
    ).toMatchObject({ blockId: "b1", publicList: true, total: 3 });
  });

  it("reads a page of responses with its summary and counts", () => {
    const parsed = responsesPage.parse({
      nodes: [row("r1", [{ id: "name", label: "Tên", type: "text", value: "An" }])],
      pageInfo: { hasNextPage: false, endCursor: null },
      summary: [{ fieldId: "name", label: "Tên", type: "text", answered: 1, counts: [], total: null }],
      counts: { visible: 1, hidden: 0, pending: 0 },
    });
    expect(parsed.nodes[0]?.status).toBe("VISIBLE");
    expect(parsed.counts.visible).toBe(1);
  });

  it("refuses a status the server should not send", () => {
    expect(() =>
      responsesPage.parse({
        nodes: [row("r1", [], "2026-11-07T03:04:00.000Z")],
        pageInfo: { hasNextPage: false, endCursor: null },
        summary: [],
        counts: { visible: 0, hidden: 0, pending: 0 },
      }),
    ).not.toThrow();
    expect(() => responsesPage.parse({ nodes: [{ ...row("r1", []), status: "MAYBE" }], pageInfo: { hasNextPage: false, endCursor: null }, summary: [], counts: { visible: 0, hidden: 0, pending: 0 } })).toThrow();
  });
});

describe("links of a card with several versions", () => {
  const versions = [
    { id: "p1", label: "Nhà trai", slug: "nha-trai" },
    { id: "p2", label: null, slug: "ban-phu" },
  ];

  it("names a version by its label, or by its slug when it has none", () => {
    expect(linkName(versions[0]!)).toBe("Nhà trai");
    expect(linkName(versions[1]!)).toBe("ban-phu");
  });

  it("names the version an answer came through, and says so when it was taken down or never recorded", () => {
    expect(linkOfResponse("p1", versions)).toBe("Nhà trai");
    expect(linkOfResponse("p2", versions)).toBe("ban-phu");
    expect(linkOfResponse("p9", versions)).toBe("Bản đã gỡ");
    expect(linkOfResponse(null, versions)).toBe("—");
  });
});
