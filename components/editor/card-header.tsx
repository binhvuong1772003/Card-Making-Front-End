"use client";

import { useEditor } from "@miditor/editor";
import { ChatCircleTextIcon, UsersThreeIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { usePublication } from "@/lib/cards/use-publication";
import { Button } from "@/components/ui/button";
import { PhosphorIcon } from "./phosphor-icons";
import { PublishDialog } from "./publish-dialog";
import { StatusSeal, type SealState } from "./status-seal";

// Đầu trang của CardMaking (bản vẽ F): tên hiệu, tên thiệp, con dấu | hoàn tác, làm lại, máy tính hoặc điện thoại | xem trước, xuất bản.
// Dùng shadcn `Button` và Tailwind; màu lấy từ giao diện `.card-editor` trong globals.css. Lệnh điều khiển là của Miditor (`useEditor`).
const FRAME_BUTTON =
  "h-9 gap-2 rounded-none px-4 text-[13px] font-medium aria-pressed:bg-accent aria-pressed:font-semibold aria-pressed:text-accent-foreground";


export function CardHeader({
  title,
  seal,
  cardId,
  isOwner,
  canReadResponses,
  idle,
  hasCardContent,
  unreachablePages = [],
}: {
  title: string;
  seal: { state: SealState; label: string };
  cardId: string;
  isOwner: boolean;
  /** Owner và editor mới xem được phản hồi; `VIEWER` không thấy lối vào. */
  canReadResponses: boolean;
  /** Chờ tới khi bộ lưu không còn gì đang ghi. */
  idle: () => Promise<void>;
  hasCardContent?: boolean;
  unreachablePages?: string[];
}) {
  const editor = useEditor();
  const data = useEditor((view) => view.data) as { root?: { children?: unknown[] } } | undefined;
  const hasContent = hasCardContent ?? (data?.root?.children?.length ?? 0) > 0;
  const [publishing, setPublishing] = useState(false);
  const publication = usePublication(cardId);

  // Bản nháp đang gõ dở (chưa tới hạn lưu tự động) phải lưu xong trước khi xuất bản hoặc xem trước.
  const flushDraft = useCallback(() => idle(), [idle]);

  // Mở tab ngay trong lúc bấm (không bị chặn cửa sổ bật lên), rồi chuyển tab tới trang xem trước khi bản nháp đã lưu xong.
  const preview = async () => {
    const tab = window.open("about:blank", "_blank");
    try {
      await flushDraft();
    } catch {
      tab?.close();
      toast.error("Chưa lưu được bản sửa. Hãy thử lại trước khi xem trước.");
      return;
    }
    const url = `/cards/${cardId}/preview`;
    if (tab) tab.location.href = url;
    else window.open(url, "_blank");
  };
  const canUndo = useEditor((view) => view.canUndo);
  const canRedo = useEditor((view) => view.canRedo);
  const frame = useEditor((view) => view.frame);

  const frameButton = (value: "desktop" | "phone", label: string, icon: "monitorIcon" | "phoneIcon") => (
    <Button variant="ghost" aria-pressed={frame === value} onClick={() => editor.setFrame(value)} className={FRAME_BUTTON}>
      <PhosphorIcon name={icon} />
      {label}
    </Button>
  );

  return (
    <header className="flex min-h-15 flex-wrap items-center gap-x-6 gap-y-2.5 border-b bg-background px-5 text-foreground">
      <div className="flex min-w-0 flex-[1_1_260px] items-center gap-4.5">
        <Link href="/" className="text-[17px] font-bold tracking-tight whitespace-nowrap">
          CardMaking
        </Link>
        <span className="min-w-0 truncate text-[15px] font-medium">{title}</span>
        <StatusSeal title={title} state={seal.state} label={seal.label} />
        {publication.data && (
          <a href={`/thiep/${publication.data.slug}`} target="_blank" rel="noreferrer" className="inline-flex h-[26px] flex-none items-center gap-1.5 rounded-full bg-muted px-3 text-xs font-semibold text-primary">
            <span aria-hidden="true" className="size-[7px] rounded-full bg-primary" />
            Đã xuất bản
          </a>
        )}
      </div>

      <div className="flex flex-none items-center gap-4">
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" aria-label="Hoàn tác" disabled={!canUndo} onClick={() => editor.undo()} className="size-9 [&_svg]:size-5">
            <PhosphorIcon name="undoIcon" size={20} />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Làm lại" disabled={!canRedo} onClick={() => editor.redo()} className="size-9 [&_svg]:size-5">
            <PhosphorIcon name="redoIcon" size={20} />
          </Button>
        </div>
        <div role="group" aria-label="Kiểu bố cục" className="inline-flex overflow-hidden rounded-lg border border-input bg-background">
          {frameButton("desktop", "Máy tính", "monitorIcon")}
          {frameButton("phone", "Điện thoại", "phoneIcon")}
        </div>
      </div>

      <div className="flex flex-[1_1_260px] items-center justify-end gap-2.5">
        {canReadResponses && publication.data && (
          <Button variant="outline" render={<Link href={`/cards/${cardId}/responses`} />} className="h-9 gap-2 border-input px-4 text-[13px]">
            <ChatCircleTextIcon size={18} />
            Phản hồi
          </Button>
        )}
        {canReadResponses && (
          <Button variant="outline" render={<Link href={`/cards/${cardId}/guests`} />} className="h-9 gap-2 border-input px-4 text-[13px]">
            <UsersThreeIcon size={18} />
            Khách mời
          </Button>
        )}
        <Button variant="outline" onClick={preview} className="h-9 gap-2 border-input px-4 text-[13px]">
          <PhosphorIcon name="eye" />
          Xem trước
        </Button>
        <Button onClick={() => {
          if (unreachablePages.length) toast.warning(`${unreachablePages.length} trang chưa có liên kết từ trang bắt đầu: ${unreachablePages.join(', ')}.`);
          setPublishing(true);
        }} className="h-9 px-5 text-[13px] font-semibold">
          Xuất bản
        </Button>
      </div>
      <PublishDialog cardId={cardId} open={publishing} onOpenChange={setPublishing} isOwner={isOwner} hasContent={hasContent} flushDraft={flushDraft} />
    </header>
  );
}
