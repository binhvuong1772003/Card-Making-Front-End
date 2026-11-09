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

// Xem trước bản nháp đã lưu của thiệp, đúng như khách sẽ thấy, ở khổ máy tính hoặc điện thoại. Chỉ người có quyền xem thiệp mở được.
export function CardPreview({ id }: { id: string }) {
  const router = useRouter();
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const card = useQuery({ queryKey: ["card", id, "preview"], queryFn: ({ signal }) => cardsApi.get(id, signal), staleTime: 0, refetchOnWindowFocus: false, retry: false });

  const signedOut = isApiError(card.error, "UNAUTHENTICATED");
  useEffect(() => {
    if (signedOut) router.replace(`/login?returnTo=${encodeURIComponent(`/cards/${id}/preview`)}`);
  }, [signedOut, router, id]);

  const document = card.data ? normalizeCardDocument(card.data.document) : undefined;
  const empty = !document?.pages.some(page => page.data.root.children.length > 0);

  const tab = (value: "desktop" | "phone", label: string, icon: React.ReactNode) => (
    <button type="button" aria-pressed={device === value} onClick={() => setDevice(value)} className={cn("inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm", device === value ? "bg-muted font-semibold text-accent-foreground" : "font-medium hover:bg-muted")}>
      {icon}
      {label}
    </button>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-page text-foreground">
      <header className="flex flex-wrap items-center gap-3 bg-background px-5 py-3 shadow-[0_1px_0_#f0e7e9]">
        <Link href={`/cards/${id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeftIcon className="size-[18px]" /> Quay lại sửa
        </Link>
        <span className="text-sm text-muted-foreground">Xem trước{card.data ? `: ${card.data.title}` : ""}</span>
        <div className="flex-1" />
        <div role="group" aria-label="Khổ xem" className="inline-flex rounded-full border border-input p-0.5">
          {tab("desktop", "Máy tính", <MonitorIcon className="size-[18px]" />)}
          {tab("phone", "Điện thoại", <DeviceMobileIcon className="size-[18px]" />)}
        </div>
      </header>
      <main className="flex flex-1 justify-center px-4 py-8">
        {card.isError && !signedOut ? (
          <p className="text-sm text-destructive">{errorMessage(card.error)}</p>
        ) : card.isPending ? (
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        ) : empty ? (
          <p className="text-sm text-muted-foreground">Thiệp chưa có nội dung để xem trước.</p>
        ) : (
          <div className={cn("w-full overflow-hidden bg-white shadow-[0_1px_2px_rgba(42,34,36,0.06),0_14px_36px_rgba(42,34,36,0.14)]", device === "phone" ? "max-w-[375px] rounded-[28px]" : "max-w-[960px] rounded-lg")}>
            <CardPlayer key={device} document={document!} mode="preview" historyKey={`preview:${id}:${device}`} device={device} />
          </div>
        )}
      </main>
    </div>
  );
}
