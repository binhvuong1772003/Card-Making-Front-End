"use client";

import { normalizeCardDocument } from "@/lib/cards/document";
import { CardPlayer } from "./card-player";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, DeviceMobileIcon, MonitorIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isApiError } from "@/lib/api";
import { errorMessage } from "@/lib/auth/messages";
import { cardsApi } from "@/lib/cards/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PublishDialog } from "@/components/editor/publish-dialog";
import { usePublication } from "@/lib/cards/use-publication";

// Xem trước bản nháp đã lưu của thiệp, đúng như khách sẽ thấy, ở khổ máy tính hoặc điện thoại. Chỉ người có quyền xem thiệp mở được.
export function CardPreview({ id }: { id: string }) {
  const router = useRouter();
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const [publishing, setPublishing] = useState(false);
  const publication = usePublication(id);
  const card = useQuery({ queryKey: ["card", id, "preview"], queryFn: ({ signal }) => cardsApi.get(id, signal), staleTime: 0, refetchOnWindowFocus: false, retry: false });

  const signedOut = isApiError(card.error, "UNAUTHENTICATED");
  useEffect(() => {
    if (signedOut) router.replace(`/login?returnTo=${encodeURIComponent(`/cards/${id}/preview`)}`);
  }, [signedOut, router, id]);

  const document = card.data ? normalizeCardDocument(card.data.document) : undefined;
  const empty = !document?.pages.some(page => page.data.root.children.length > 0);

  // Công tắc khổ xem: hai nửa trong một viên thuốc, nửa đang chọn nổi trắng trên nền kem hồng.
  const tab = (value: "desktop" | "phone", label: string, icon: React.ReactNode) => (
    <button type="button" aria-pressed={device === value} onClick={() => setDevice(value)} className={cn("inline-flex h-8 items-center gap-2 rounded-full px-4 text-[13px] transition-colors", device === value ? "bg-background font-semibold text-primary shadow-[0_1px_2px_rgba(42,34,36,0.14)]" : "font-medium text-muted-foreground hover:text-foreground")}>
      {icon}
      {label}
    </button>
  );

  return (
    <div className={cn("flex min-h-dvh flex-col text-foreground", device === "desktop" ? "bg-white" : "bg-page")}>
      <header className="sticky top-0 z-[120] grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-[#f0e7e9] bg-background/95 px-5 py-2.5 backdrop-blur">
        <div className="flex min-w-0 items-center gap-3">
          <Link href={`/cards/${id}`} className="inline-flex shrink-0 items-center gap-1.5 rounded-full py-1.5 pr-3 pl-2 text-[13px] font-semibold text-primary hover:bg-muted">
            <ArrowLeftIcon className="size-4" /> Quay lại sửa
          </Link>
          <span className="h-5 w-px shrink-0 bg-[#e8dde0]" aria-hidden="true" />
          <span className="truncate text-[13px] text-muted-foreground">{card.data ? card.data.title : "Xem trước"}</span>
        </div>
        <div role="group" aria-label="Khổ xem" className="inline-flex rounded-full bg-muted p-1">
          {tab("desktop", "Máy tính", <MonitorIcon className="size-[17px]" />)}
          {tab("phone", "Điện thoại", <DeviceMobileIcon className="size-[17px]" />)}
        </div>
        <div className="flex items-center justify-end gap-3">
          <span className="hidden items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground md:inline-flex">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" /> Bản nháp đã lưu
          </span>
          {publication.data && (
            <a href={`/thiep/${publication.data.slug}`} target="_blank" rel="noreferrer" className="hidden text-xs font-semibold text-primary hover:underline lg:inline">Đã xuất bản</a>
          )}
          <Button onClick={() => setPublishing(true)} disabled={!card.data || empty} className="h-9 px-5 text-[13px] font-semibold">Xuất bản</Button>
        </div>
      </header>
      {/* Bìa toàn màn hình nằm ở tầng 100: đưa hộp thoại lên trên nó. */}
      <style>{`[data-slot="dialog-overlay"], [data-slot="dialog-content"] { z-index: 200; }`}</style>
      {card.data && <PublishDialog cardId={id} open={publishing} onOpenChange={setPublishing} isOwner={card.data.role === "OWNER"} hasContent={!empty} flushDraft={async () => {}} />}
      <main className={cn("flex flex-1 justify-center", device === "desktop" ? "" : "px-4 py-10")}>
        {card.isError && !signedOut ? (
          <p className="text-sm text-destructive">{errorMessage(card.error)}</p>
        ) : card.isPending ? (
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        ) : empty ? (
          <p className="text-sm text-muted-foreground">Thiệp chưa có nội dung để xem trước.</p>
        ) : (
          <div className={cn("w-full overflow-hidden bg-white", device === "phone" && "shadow-[0_1px_2px_rgba(42,34,36,0.06),0_14px_36px_rgba(42,34,36,0.14)]", device === "phone" ? "max-w-[375px] rounded-[32px] ring-8 ring-[#2a2224]" : "max-w-none rounded-none shadow-none")}>
            <CardPlayer key={device} document={document!} mode="preview" historyKey={`preview:${id}:${device}`} device={device} immersive />
          </div>
        )}
      </main>
    </div>
  );
}
