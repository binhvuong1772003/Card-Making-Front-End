"use client";

import { useEffect, useState } from "react";
import { countdownParts } from "@/lib/cards/blocks/countdown";

export type CountdownViewProps = {
  /** Mốc đếm tới (ms); thiếu thì chỉ hiện nhãn mẫu. */
  target: number | undefined;
  showSeconds: boolean;
  labels: { day: string; hour: string; minute: string; second: string };
  doneText: string;
  size: number;
  color: string;
  font: string;
  bold: boolean;
  align: "left" | "center" | "right";
  /** Khối chỉ chạy đồng hồ khi thiệp được xem thật; ở editor và ảnh thu nhỏ đứng yên tại lúc vẽ. */
  ticking: boolean;
};

export function CountdownView({ target, showSeconds, labels, doneText, size, color, font, bold, align, ticking }: CountdownViewProps) {
  // Keep prerender and the first hydration pass independent of the wall clock.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    if (!ticking) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [ticking]);

  const parts = target === undefined || now === null ? undefined : countdownParts(target, now);
  const line = !parts
    ? `0 ${labels.day} 0 ${labels.hour} 0 ${labels.minute}${showSeconds ? ` 0 ${labels.second}` : ""}`
    : parts.done
      ? doneText
      : `${parts.days} ${labels.day} ${parts.hours} ${labels.hour} ${parts.minutes} ${labels.minute}${showSeconds ? ` ${parts.seconds} ${labels.second}` : ""}`;

  return (
    <div role="timer" aria-live="off" style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center", overflow: "visible" }}>
      <p suppressHydrationWarning style={{ margin: 0, color, fontFamily: font || "inherit", fontSize: size, fontWeight: bold ? 700 : 400, lineHeight: 1.5, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{line}</p>
    </div>
  );
}
