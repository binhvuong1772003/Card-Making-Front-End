"use client";

import { useEditor } from "@miditor/editor";
import { Button } from "@/components/ui/button";
import { PhosphorIcon } from "./phosphor-icons";

// Thanh thu phóng nổi ở đáy vùng soạn thiệp (bản vẽ F). Thu phóng là lệnh của Miditor (`setZoom`, `fit`).
const STEP = 1.2;

export function ZoomPill() {
  const editor = useEditor();
  const zoom = useEditor((view) => view.zoom);
  return (
    <div
      role="group"
      aria-label="Thu phóng"
      className="absolute bottom-4 left-1/2 z-5 flex -translate-x-1/2 items-center gap-0.5 rounded-full border bg-background px-1.5 py-1 text-foreground shadow-[0_1px_2px_rgba(42,34,36,0.06),0_10px_28px_rgba(42,34,36,0.08)]"
    >
      <Button variant="ghost" size="icon" aria-label="Thu nhỏ" onClick={() => editor.setZoom(zoom / STEP)} className="size-8 rounded-full [&_svg]:size-[18px]">
        <PhosphorIcon name="minus" size={18} />
      </Button>
      <span className="min-w-11 text-center text-[13px] tabular-nums">{Math.round(zoom * 100)}%</span>
      <Button variant="ghost" size="icon" aria-label="Phóng to" onClick={() => editor.setZoom(zoom * STEP)} className="size-8 rounded-full [&_svg]:size-[18px]">
        <PhosphorIcon name="plusIcon" size={18} />
      </Button>
      <span aria-hidden="true" className="mx-1 h-[18px] w-px bg-border" />
      <Button variant="ghost" onClick={() => editor.fit()} className="h-[30px] gap-1.5 rounded-full px-3 text-[13px] [&_svg]:size-[18px]">
        <PhosphorIcon name="fit" size={18} />
        Vừa khung
      </Button>
    </div>
  );
}
