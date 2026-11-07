"use client";

import { useQuery } from "@tanstack/react-query";
import { PlusIcon, RowsIcon, SquaresFourIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { CardMenu } from "@/components/cards/card-menu";
import { CardThumb } from "@/components/cards/card-thumb";
import { errorMessage } from "@/lib/auth/messages";
import { cardsApi, type CardSummary } from "@/lib/cards/api";
import { formatEdited } from "@/lib/cards/format";
import { FILTER_OCCASIONS, OCCASION_LABEL, type Occasion } from "@/lib/cards/occasions";
import { useCreateCard } from "@/lib/cards/use-create-card";
import { cn } from "@/lib/utils";

// Trang quản lý thiệp (bản vẽ G): lưới hoặc danh sách thiệp của người dùng, lọc theo dịp, tìm theo tên.
// Chưa có: sắp xếp (backend chưa có), ảnh thu nhỏ thật, xem trước và sao chép liên kết (chờ bước xuất bản).
const SHADOW = "shadow-[0_1px_2px_rgba(42,34,36,0.04),0_8px_24px_rgba(42,34,36,0.07)]";
const PILL_BUTTON = "inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[0_6px_16px_rgba(123,30,43,0.22)] transition-colors hover:bg-primary/90 disabled:opacity-60";

function Status({ published, className }: { published: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", published ? "text-primary" : "text-muted-foreground", className)}>
      <span aria-hidden="true" className={cn("size-[7px] rounded-full", published ? "bg-primary" : "bg-[#b9abae]")} />
      {published ? "Đã xuất bản" : "Bản nháp"}
    </span>
  );
}

function GridCard({ card }: { card: CardSummary }) {
  return (
    <article className="group flex flex-col gap-3">
      <div className="relative">
        <Link href={`/cards/${card.id}`} aria-label={`Mở ${card.title}`} className={cn("block h-[280px] overflow-hidden rounded-[20px] transition-shadow group-hover:shadow-[0_2px_4px_rgba(42,34,36,0.06),0_18px_40px_rgba(42,34,36,0.14)]", SHADOW)}>
          <CardThumb title={card.title} occasion={card.occasion} className="size-full" />
        </Link>
        <Status published={card.published} className="absolute top-3 left-3 h-[26px] rounded-full bg-white/95 px-3" />
        <div className="absolute top-3 right-3">
          <CardMenu card={card} triggerClassName="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100" />
        </div>
      </div>
      <div className="px-1">
        <Link href={`/cards/${card.id}`} className="block truncate text-[15px] font-semibold">
          {card.title}
        </Link>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {OCCASION_LABEL[card.occasion]} · {formatEdited(card.updatedAt)}
        </p>
      </div>
    </article>
  );
}

function ListRow({ card }: { card: CardSummary }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[20px] bg-background py-2.5 pr-3 pl-4", SHADOW)}>
      <Link href={`/cards/${card.id}`} aria-label={`Mở ${card.title}`} className="h-14 w-12 flex-none overflow-hidden rounded-xl">
        <CardThumb title={card.title} occasion={card.occasion} className="size-full text-lg" />
      </Link>
      <Link href={`/cards/${card.id}`} className="min-w-[200px] flex-1 truncate text-[15px] font-semibold">
        {card.title}
      </Link>
      <span className="w-24 flex-none text-[13px] text-muted-foreground">{OCCASION_LABEL[card.occasion]}</span>
      <Status published={card.published} className="w-32 flex-none text-[13px]" />
      <span className="w-32 flex-none text-[13px] text-muted-foreground">{formatEdited(card.updatedAt)}</span>
      <CardMenu card={card} triggerClassName="bg-muted shadow-none" />
    </div>
  );
}

export function CardLibrary() {
  const create = useCreateCard();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [occasion, setOccasion] = useState<Occasion | undefined>();
  const [view, setView] = useState<"grid" | "list">("grid");

  // Gõ xong mới tìm (không gọi mỗi phím).
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const cards = useQuery({
    queryKey: ["cards", { occasion, search }],
    queryFn: ({ signal }) => cardsApi.list({ occasion, search }, signal),
    staleTime: 0,
    placeholderData: (previous) => previous, // giữ danh sách cũ khi đổi bộ lọc, không nháy trống
  });
  const filtering = Boolean(occasion || search);
  const chip = (id: Occasion | undefined, label: string) => {
    const on = occasion === id;
    return (
      <button key={label} type="button" aria-pressed={on} onClick={() => setOccasion(id)} className={cn("h-[38px] rounded-full px-4 text-sm transition-colors", on ? "bg-muted font-semibold text-accent-foreground" : "bg-background font-medium shadow-[0_1px_2px_rgba(42,34,36,0.04),0_4px_12px_rgba(42,34,36,0.05)] hover:bg-muted")}>
        {label}
      </button>
    );
  };
  const toggle = (id: "grid" | "list", label: string, icon: React.ReactNode) => (
    <button type="button" aria-label={label} aria-pressed={view === id} onClick={() => setView(id)} className={cn("inline-flex h-8 w-10 items-center justify-center rounded-full", view === id ? "bg-muted text-accent-foreground" : "hover:bg-muted")}>
      {icon}
    </button>
  );

  return (
    <AppShell active="cards" search={{ value: searchInput, onChange: setSearchInput, placeholder: "Tìm thiệp của bạn" }}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-tight font-bold tracking-tight">Thiệp của tôi</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Mở thiệp để sửa tiếp, hoặc bắt đầu một thiệp mới.</p>
        </div>
        <button type="button" className={PILL_BUTTON} disabled={create.isPending} onClick={() => create.mutate(undefined)}>
          <PlusIcon className="size-[18px]" /> Tạo thiệp
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div role="group" aria-label="Lọc theo dịp" className="flex flex-wrap gap-2">
          {chip(undefined, "Tất cả")}
          {FILTER_OCCASIONS.map((id) => chip(id, OCCASION_LABEL[id]))}
        </div>
        <div className="flex-1" />
        <div role="group" aria-label="Kiểu hiển thị" className={cn("inline-flex rounded-full bg-background p-[3px]", SHADOW)}>
          {toggle("grid", "Dạng lưới", <SquaresFourIcon className="size-5" />)}
          {toggle("list", "Dạng danh sách", <RowsIcon className="size-5" />)}
        </div>
      </div>

      {cards.isError ? (
        <p className="text-sm text-destructive">{errorMessage(cards.error)}</p>
      ) : cards.isPending ? (
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      ) : cards.data.length === 0 ? (
        filtering ? (
          <div className={cn("rounded-3xl bg-background px-6 py-12 text-center text-muted-foreground", SHADOW)}>Không có thiệp nào khớp.</div>
        ) : (
          <div className={cn("flex flex-col items-center gap-3.5 rounded-[28px] bg-background px-6 py-16 text-center", SHADOW)}>
            <h2 className="text-xl font-bold">Chưa có thiệp nào</h2>
            <p className="max-w-[400px] text-sm leading-relaxed text-muted-foreground">Bắt đầu từ một trang trắng, thêm từng khối chữ và ảnh, rồi xuất bản thành trang web để gửi cho khách.</p>
            <button type="button" className={PILL_BUTTON} disabled={create.isPending} onClick={() => create.mutate(undefined)}>
              <PlusIcon className="size-[18px]" /> Tạo thiệp đầu tiên
            </button>
          </div>
        )
      ) : view === "grid" ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-x-6 gap-y-8">
          <button type="button" disabled={create.isPending} onClick={() => create.mutate(undefined)} className="flex flex-col gap-3 text-left">
            <span className="flex h-[280px] flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed border-[#e2d3d7] text-primary transition-colors hover:bg-muted/50">
              <span className="inline-flex size-[52px] items-center justify-center rounded-full bg-muted">
                <PlusIcon className="size-[26px]" />
              </span>
              <span className="text-sm font-semibold">Tạo thiệp mới</span>
            </span>
            <span className="h-[41px]" />
          </button>
          {cards.data.map((card) => (
            <GridCard key={card.id} card={card} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {cards.data.map((card) => (
            <ListRow key={card.id} card={card} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
