import { builtInRegistry, emptyPage, insertNode, newNode, validatePage, validateRegistry, type PageData, type TreeNode } from "@miditor/core";
import { describe, expect, it } from "vitest";
import { calendarBlock, calendarDefinitions, MARK_SHAPES, monthGrid, RETIRED_CALENDAR_PROPS } from "./calendar";

const registry = { ...builtInRegistry, Calendar: calendarBlock };

function pageWith(props: Record<string, unknown>): PageData {
  const node = newNode(registry, "Calendar", "c1", { w: 680, h: 788 }) as TreeNode;
  const page = emptyPage();
  const withProps = { ...node, props: { ...node.props, ...props } } as TreeNode;
  return { ...page, root: insertNode(page.root, "root", withProps) };
}

describe("the Calendar block", () => {
  it("has a definition the registry check accepts", () => {
    expect(validateRegistry(registry)).toEqual([]);
  });

  it("keeps a page with each mark shape valid", () => {
    for (const markShape of MARK_SHAPES) expect(validatePage(registry, pageWith({ markShape }))).toEqual([]);
  });

  it("refuses a shape it does not offer and a size out of range", () => {
    expect(validatePage(registry, pageWith({ markShape: "Rồng" })).length).toBeGreaterThan(0);
    expect(validatePage(registry, pageWith({ size: 99 })).length).toBeGreaterThan(0);
  });
});

describe("the add to calendar button of the Calendar block", () => {
  it("is off by default, so calendars saved before it keep their look", () => {
    expect(calendarBlock.defaultProps.eventButton).toBe("");
    for (const def of Object.values(calendarDefinitions)) expect(def.defaultProps.eventButton, def.label).toBe("");
  });

  it("keeps a page with the event filled in valid, and refuses numbers and texts out of range", () => {
    const event = { eventButton: "Thêm vào lịch", eventTitle: "Tiệc cưới", eventTime: "18:00", eventMinutes: 180, eventPlace: "Gala Center", eventNote: "Khai tiệc 18:00" };
    expect(validatePage(registry, pageWith(event))).toEqual([]);
    expect(validatePage(registry, pageWith({ eventMinutes: 5 })).length).toBeGreaterThan(0);
    expect(validatePage(registry, pageWith({ eventMinutes: 2000 })).length).toBeGreaterThan(0);
    expect(validatePage(registry, pageWith({ eventButton: "x".repeat(41) })).length).toBeGreaterThan(0);
    expect(validatePage(registry, pageWith({ eventTitle: "x".repeat(121) })).length).toBeGreaterThan(0);
  });

  it("asks for the start time with the time input of the card editor, in its own group", () => {
    expect(calendarBlock.fields.eventTime).toMatchObject({ type: "custom", kind: "time", group: "Thêm vào lịch" });
    for (const key of ["eventButton", "eventTitle", "eventMinutes", "eventPlace", "eventNote"]) expect(calendarBlock.fields[key]).toMatchObject({ group: "Thêm vào lịch" });
  });
});

describe("the Calendar kinds", () => {
  it("have no frame of their own: nền, viền and bo góc come from the library's sections, and a kind that needs them carries default styles", () => {
    for (const [type, def] of Object.entries(calendarDefinitions)) {
      for (const prop of RETIRED_CALENDAR_PROPS) expect(Object.keys(def.fields), `${type}.${prop}`).not.toContain(prop);
    }
    expect(calendarDefinitions.CalendarDark!.defaultStyles).toEqual({ background: "#511419", borderRadius: 16 });
    expect(calendarDefinitions.CalendarFrame!.defaultStyles).toEqual({ borderWidth: 2, borderColor: "#511419", borderRadius: 4 });
    expect(calendarDefinitions.Calendar!.defaultStyles).toBeUndefined();
  });

  it("offers five mark shapes", () => {
    expect(MARK_SHAPES).toEqual(["Tròn", "Tim", "Vuông", "Vòng", "Sao"]);
  });
});

describe("monthGrid", () => {
  it("lays January 2026 out Monday first, the 3rd on a Saturday", () => {
    const grid = monthGrid("2026-01-03", false)!;
    expect(grid.title).toBe("Tháng 1 / 2026");
    expect(grid.weekdays).toEqual(["T2", "T3", "T4", "T5", "T6", "T7", "CN"]);
    expect(grid.weeks[0]).toEqual([null, null, null, 1, 2, 3, 4]);
    expect(grid.weeks.at(-1)).toEqual([26, 27, 28, 29, 30, 31, null]);
    expect(grid.weeks).toHaveLength(5);
    expect(grid.marked).toBe(3);
  });

  it("starts the week on Sunday when asked", () => {
    const grid = monthGrid("2026-01-03", true)!;
    expect(grid.weekdays[0]).toBe("CN");
    expect(grid.weeks[0]).toEqual([null, null, null, null, 1, 2, 3]);
  });

  it("puts the 1st of a month that starts on a Sunday in the last column, Monday first", () => {
    // 1 tháng 2 năm 2026 là Chủ nhật.
    const grid = monthGrid("2026-02-14", false)!;
    expect(grid.weeks[0]).toEqual([null, null, null, null, null, null, 1]);
    expect(grid.weeks).toHaveLength(5);
  });

  it("needs six rows when a 31-day month starts late in the week", () => {
    // 1 tháng 8 năm 2026 là Thứ bảy: 31 ngày trải qua sáu hàng khi Thứ hai đứng đầu.
    expect(monthGrid("2026-08-01", false)!.weeks).toHaveLength(6);
  });

  it("knows a leap February and a short one", () => {
    expect(monthGrid("2024-02-29", false)!.weeks.flat().filter((d) => d !== null)).toHaveLength(29);
    expect(monthGrid("2026-02-28", false)!.weeks.flat().filter((d) => d !== null)).toHaveLength(28);
  });

  it("gives nothing for a date that is not a real day", () => {
    for (const bad of ["", "2026-02-30", "2026-13-01", "2026-1-3", "26-01-03", "abc", null, undefined, 20260103]) {
      expect(monthGrid(bad, false)).toBeUndefined();
    }
  });

  it("does not move with the time zone of the machine", () => {
    const before = process.env.TZ;
    for (const zone of ["Pacific/Honolulu", "Asia/Ho_Chi_Minh", "Pacific/Kiritimati"]) {
      process.env.TZ = zone;
      expect(monthGrid("2026-01-03", false)!.weeks[0]).toEqual([null, null, null, 1, 2, 3, 4]);
    }
    if (before === undefined) delete process.env.TZ;
    else process.env.TZ = before;
  });
});
