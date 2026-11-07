"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { CakeIcon, CalendarStarIcon, CaretRightIcon, HeartIcon, PlusIcon, SquaresFourIcon } from "@phosphor-icons/react";
import Link from "next/link";
import type { ComponentType } from "react";
import { AppShell } from "@/components/app/app-shell";
import { errorMessage } from "@/lib/auth/messages";
import { OCCASION_LABEL, FILTER_OCCASIONS, occasionSlug } from "@/lib/cards/occasions";
import { useCreateCard } from "@/lib/cards/use-create-card";
import { templatesApi } from "@/lib/templates/api";
import { cn } from "@/lib/utils";
import { BirthdayFan, CategoryBackdrop, EventFan, WeddingFan } from "./category-art";
import { TemplateCard } from "./template-card";

// Trang một loại thiệp (bản vẽ L): khung tiêu đề theo màu của loại, chuyển nhanh giữa các loại, lưới mẫu công khai có "Xem thêm".
// Chưa có lọc theo phong cách (chưa có nhãn cho mẫu).
const SHADOW = "shadow-[0_1px_2px_rgba(42,34,36,0.04),0_8px_24px_rgba(42,34,36,0.07)]";

const THEME: Record<"WEDDING" | "BIRTHDAY" | "EVENT", { bg: string; ink: string; kind: "wedding" | "birthday" | "event"; Fan: ComponentType; Icon: ComponentType<{ className?: string }>; title: string; text: string; create: string }> = {
  WEDDING: { bg: "#E3EADA", ink: "#34422B", kind: "wedding", Fan: WeddingFan, Icon: HeartIcon, title: "Thiệp đám cưới", text: "Thiệp mời từ những cặp đôi đã xuất bản. Xem thử, rồi Dùng làm mẫu để đem về sửa thành của bạn.", create: "Tạo thiệp cưới trắng" },
  BIRTHDAY: { bg: "#FFE3B8", ink: "#7A3510", kind: "birthday", Fan: BirthdayFan, Icon: CakeIcon, title: "Thiệp sinh nhật", text: "Thiệp mời sinh nhật, thôi nôi và mừng thọ từ mọi người. Xem thử, rồi Dùng làm mẫu để sửa thành của bạn.", create: "Tạo thiệp sinh nhật trắng" },
  EVENT: { bg: "#D8E2FA", ink: "#1E3470", kind: "event", Fan: EventFan, Icon: CalendarStarIcon, title: "Thiệp sự kiện", text: "Thiệp mời họp lớp, hội thảo, tiệc công ty. Xem thử, rồi Dùng làm mẫu để sửa thành của bạn.", create: "Tạo thiệp sự kiện trắng" },
};

export function CategoryPage({ category }: { category: "WEDDING" | "BIRTHDAY" | "EVENT" }) {
  const theme = THEME[category];
  const create = useCreateCard();
  const counts = useQuery({ queryKey: ["templates", "counts"], queryFn: ({ signal }) => templatesApi.counts(signal), staleTime: 30_000 });
  const list = useInfiniteQuery({
    queryKey: ["templates", { category, infinite: true }],
    queryFn: ({ pageParam, signal }) => templatesApi.list({ category, first: 12, after: pageParam }, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.pageInfo.hasNextPage ? (last.pageInfo.endCursor ?? undefined) : undefined),
    staleTime: 30_000,
  });
  const nodes = list.data?.pages.flatMap((page) => page.nodes) ?? [];
  const total = counts.data?.[category];

  const tab = (href: string, label: string, Icon: ComponentType<{ className?: string }>, active: boolean, bg: string, ink: string) => (
    <Link key={label} href={href} aria-current={active ? "page" : undefined} className={cn("inline-flex h-12 items-center gap-2.5 rounded-full pr-5 pl-2 text-sm", active ? "font-bold" : "bg-background font-semibold shadow-[0_1px_2px_rgba(42,34,36,0.04),0_4px_12px_rgba(42,34,36,0.05)] hover:bg-muted")} style={active ? { background: bg, color: ink } : undefined}>
      <span className="inline-flex size-[34px] items-center justify-center rounded-full" style={{ background: active ? "rgba(255,255,255,0.75)" : bg, color: ink }}>
        <Icon className="size-[18px]" />
      </span>
      {label}
    </Link>
  );

  return (
    <AppShell active="home">
      <nav aria-label="Vị trí" className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/">Trang chủ</Link>
        <CaretRightIcon className="size-3.5" />
        <span aria-current="page" className="font-semibold text-foreground">
          {OCCASION_LABEL[category]}
        </span>
      </nav>

      <section aria-labelledby="category-title" className="relative flex flex-wrap items-center justify-between gap-7 overflow-hidden rounded-[28px] px-11 py-9" style={{ background: theme.bg, color: theme.ink }}>
        <CategoryBackdrop kind={theme.kind} />
        <div className="relative z-10 flex max-w-[520px] flex-col gap-5">
          <div>
            <h1 id="category-title" className="text-4xl leading-tight font-bold tracking-tight">
              {theme.title}
            </h1>
            <p className="mt-2.5 text-[15px] leading-relaxed">{theme.text}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <button type="button" disabled={create.isPending} onClick={() => create.mutate(category)} className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[0_6px_16px_rgba(123,30,43,0.22)] hover:bg-primary/90 disabled:opacity-60">
              <PlusIcon className="size-[18px]" /> {theme.create}
            </button>
            <span className="inline-flex h-9 items-center gap-2 rounded-full bg-white/70 px-3.5 text-[13px] font-semibold">{total === undefined ? "…" : `${total} thiệp công khai`}</span>
          </div>
        </div>
        <div className="relative z-10 hidden h-[200px] w-[270px] lg:block">
          <theme.Fan />
        </div>
      </section>

      <section aria-label="Loại thiệp" className="flex flex-wrap gap-2.5">
        {tab("/", "Tất cả loại", SquaresFourIcon, false, "#F4E6E9", "#7B1E2B")}
        {FILTER_OCCASIONS.map((occasion) => tab(`/kham-pha/${occasionSlug(occasion)}`, OCCASION_LABEL[occasion], THEME[occasion as keyof typeof THEME].Icon, occasion === category, THEME[occasion as keyof typeof THEME].bg, THEME[occasion as keyof typeof THEME].ink))}
      </section>

      <section aria-label={theme.title} className="flex flex-col gap-5">
        {list.isError ? (
          <p className="text-sm text-destructive">{errorMessage(list.error)}</p>
        ) : list.isPending ? (
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        ) : nodes.length === 0 ? (
          <div className={cn("rounded-3xl bg-background px-6 py-12 text-center text-muted-foreground", SHADOW)}>Chưa có thiệp công khai nào thuộc loại này.</div>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-6 gap-y-8">
              {nodes.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
            <div className="flex flex-col items-center gap-2">
              {list.hasNextPage && (
                <button type="button" disabled={list.isFetchingNextPage} onClick={() => list.fetchNextPage()} className={cn("inline-flex h-[46px] items-center justify-center rounded-full bg-background px-7 text-sm font-semibold disabled:opacity-60", SHADOW)}>
                  {list.isFetchingNextPage ? "Đang tải..." : "Xem thêm"}
                </button>
              )}
              {total !== undefined && (
                <span className="text-[13px] text-muted-foreground">
                  Đang xem {nodes.length} trên {total} thiệp
                </span>
              )}
            </div>
          </>
        )}
      </section>
    </AppShell>
  );
}
