"use client";

import type { PageData } from "@miditor/core";
import { Render } from "@miditor/render";
import { cardRenderers, STATIC_METADATA } from "@/lib/cards/blocks";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Ảnh thu nhỏ của một trang: dựng chính trang đó bằng Render ở bề rộng máy tính (960 px) rồi thu nhỏ vừa khung, chỉ lấy phần đầu.
// Chỉ dựng khi khung vào gần vùng nhìn thấy, để lưới nhiều mẫu không dựng hết cùng lúc. Không bấm được (xem thử, không phải trang thật).
const DESKTOP_WIDTH = 960;

export function PageThumb({ data, className }: { data: Record<string, unknown>; className?: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const resize = new ResizeObserver(([entry]) => setScale(entry!.contentRect.width / DESKTOP_WIDTH));
    resize.observe(element);
    const visible = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNear(true);
          visible.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    visible.observe(element);
    return () => {
      resize.disconnect();
      visible.disconnect();
    };
  }, []);

  return (
    <div ref={frame} aria-hidden="true" className={cn("relative overflow-hidden bg-white", className)}>
      {near && scale > 0 && (
        <div style={{ width: DESKTOP_WIDTH, transform: `scale(${scale})`, transformOrigin: "top left", pointerEvents: "none" }}>
          <Render data={data as unknown as PageData} renderers={cardRenderers} metadata={STATIC_METADATA} device="desktop" links="inert" />
        </div>
      )}
    </div>
  );
}
