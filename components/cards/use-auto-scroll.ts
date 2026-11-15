"use client";

import { useEffect } from "react";

// Tự lướt trang như thiệp mẫu: bấm vào chỗ trống bất kỳ để trang tự cuộn xuống chậm (~50px/giây), bấm lần nữa để dừng.
// Số đo từ trang mẫu: tốc độ 49,6px/giây; cuộn tay (lăn chuột, chạm, phím) hoặc tới cuối trang thì dừng.
const SPEED = 50;
const INTERACTIVE = "a, button, input, textarea, select, label, summary, video, audio, iframe, [role='button'], [role='dialog'], [contenteditable='true'], [data-cm-no-autoscroll]";

export function useAutoScroll({ enabled, interactiveIds }: { enabled: boolean; interactiveIds: ReadonlySet<string> }) {
  useEffect(() => {
    if (!enabled) return;
    let frame: number | null = null;
    let position = 0;
    let last = 0;

    const stop = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    };
    const step = (now: number) => {
      const scroller = document.scrollingElement ?? document.documentElement;
      // Trang bị cuộn đi chỗ khác (người xem cuộn tay hoặc nhảy trang) thì không giành lại.
      if (Math.abs(scroller.scrollTop - position) > 3) return stop();
      position += (SPEED * (now - last)) / 1000;
      last = now;
      window.scrollTo(0, position);
      if (position >= scroller.scrollHeight - window.innerHeight - 1) return stop();
      frame = requestAnimationFrame(step);
    };
    const start = () => {
      const scroller = document.scrollingElement ?? document.documentElement;
      position = scroller.scrollTop;
      last = performance.now();
      frame = requestAnimationFrame(step);
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || event.defaultPrevented) return;
      if (target.closest(INTERACTIVE)) return;
      if (window.getSelection()?.toString()) return;
      // Khối đã có hành động bấm riêng (nút Mở thiệp, hộp quà...) giữ hành động đó.
      for (let node: Element | null = target; node; node = node.parentElement) {
        const id = node.getAttribute("data-miditor-id");
        if (id && interactiveIds.has(id)) return;
      }
      if (frame === null) start();
      else stop();
    };

    window.addEventListener("click", onClick);
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);
    return () => {
      stop();
      window.removeEventListener("click", onClick);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
    };
  }, [enabled, interactiveIds]);
}
