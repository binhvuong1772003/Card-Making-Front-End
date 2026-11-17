import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CountdownView, type CountdownViewProps } from "./countdown-view";

const props: CountdownViewProps = {
  target: Date.UTC(2027, 0, 4, 10, 30),
  showSeconds: true,
  labels: { day: "ngày", hour: "giờ", minute: "phút", second: "giây" },
  doneText: "Đến ngày vui rồi!",
  size: 27,
  color: "#511419",
  font: "serif",
  bold: true,
  align: "center",
  ticking: true,
};

afterEach(() => vi.useRealTimers());

describe("CountdownView prerender", () => {
  it.each([true, false])("has clock-independent initial HTML when ticking=%s", ticking => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-17T10:00:00Z"));
    const first = renderToStaticMarkup(createElement(CountdownView, { ...props, ticking }));
    vi.setSystemTime(new Date("2026-11-17T10:03:09Z"));
    const later = renderToStaticMarkup(createElement(CountdownView, { ...props, ticking }));
    expect(first).toBe(later);
    expect(first).toContain('role="timer"');
    expect(first).toContain("0 ngày 0 giờ 0 phút 0 giây");
  });

  it("keeps the empty-target placeholder and optional seconds", () => {
    const html = renderToStaticMarkup(createElement(CountdownView, { ...props, target: undefined, showSeconds: false }));
    expect(html).toContain("0 ngày 0 giờ 0 phút");
    expect(html).not.toContain("giây");
  });
});
