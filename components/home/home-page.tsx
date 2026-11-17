"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRightIcon, CakeIcon, CalendarStarIcon, HeartIcon, PlusIcon } from "@phosphor-icons/react";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { AppShell } from "@/components/app/app-shell";
import { CardThumb } from "@/components/cards/card-thumb";
import { BirthdayFan, CategoryBackdrop, EventFan, HeroArt, WeddingFan } from "@/components/gallery/category-art";
import { TemplateCard } from "@/components/gallery/template-card";
import { cardsApi } from "@/lib/cards/api";
import { formatEdited } from "@/lib/cards/format";
import { OCCASION_LABEL, occasionSlug, type Occasion } from "@/lib/cards/occasions";
import { useCreateCard } from "@/lib/cards/use-create-card";
import { templatesApi } from "@/lib/templates/api";
import { cn } from "@/lib/utils";

// Trang chủ (bản vẽ I): chọn dịp để tạo thiệp, khám phá theo loại, tiếp tục thiệp của mình, rồi các kệ thiệp công khai.
// Chưa có gợi ý theo thuật toán: kệ chỉ gồm thiệp đã được duyệt.
const SHADOW = "shadow-[0_1px_2px_rgba(42,34,36,0.04),0_8px_24px_rgba(42,34,36,0.07)]";

const CREATE_TILES: { occasion: Occasion | undefined; label: string; Icon: ComponentType<{ className?: string }>; bg: string; ink: string }[] = [
  { occasion: "WEDDING", label: "Đám cưới", Icon: HeartIcon, bg: "#E3EADA", ink: "#4B5A3F" },
  { occasion: "BIRTHDAY", label: "Sinh nhật", Icon: CakeIcon, bg: "#FFE3B8", ink: "#A8501C" },
  { occasion: "EVENT", label: "Sự kiện", Icon: CalendarStarIcon, bg: "#D8E2FA", ink: "#2F4A9A" },
  { occasion: undefined, label: "Trang trắng", Icon: PlusIcon, bg: "#FFFFFF", ink: "#7B1E2B" },
];

const CATEGORIES = [
  { occasion: "WEDDING", bg: "#E3EADA", ink: "#34422B", kind: "wedding", Fan: WeddingFan },
  { occasion: "BIRTHDAY", bg: "#FFE3B8", ink: "#7A3510", kind: "birthday", Fan: BirthdayFan },
  { occasion: "EVENT", bg: "#D8E2FA", ink: "#1E3470", kind: "event", Fan: EventFan },
] as const;

function SectionTitle({ id, children, action }: { id: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 id={id} className="text-xl font-bold">
        {children}
      </h2>
      {action}
    </div>
  );
}

function ViewAll({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex flex-none items-center gap-1.5 text-sm font-semibold text-primary">
      {children}
      <ArrowRightIcon className="size-4" />
    </Link>
  );
}

function Hero() {
  const create = useCreateCard();
  return (
    <section aria-labelledby="hero" className="relative flex flex-wrap items-center justify-between gap-x-10 gap-y-7 overflow-hidden rounded-[28px] bg-muted px-11 py-9">
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <span className="absolute -top-[120px] left-[60px] size-[260px] rounded-full bg-[#F8EEF0]" />
        <span className="absolute -bottom-[90px] -left-[90px] size-[300px] rounded-full bg-[#EFD9DE]" />
        <span className="absolute -top-[60px] left-[380px] size-[220px] rounded-full bg-[#F2E0E4]" />
      </span>
      <div className="relative z-10 flex flex-col gap-6">
        <div>
          <h1 id="hero" className="text-[28px] leading-tight font-bold tracking-tight">
            Hôm nay bạn muốn làm thiệp gì?
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground">Bắt đầu từ một trang trắng, hoặc lấy cảm hứng từ thiệp của mọi người bên dưới.</p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-3">
          {CREATE_TILES.map(({ occasion, label, Icon, bg, ink }) => (
            <button key={label} type="button" disabled={create.isPending} onClick={() => create.mutate(occasion)} className="group flex w-[84px] flex-col items-center gap-2.5 text-center text-[13px] font-semibold disabled:opacity-60">
              <span className="inline-flex size-16 items-center justify-center rounded-full shadow-[0_1px_2px_rgba(42,34,36,0.06)] transition-transform group-hover:scale-105" style={{ background: bg, color: ink }}>
                <Icon className="size-7" />
              </span>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="hidden lg:block">
        <HeroArt />
      </div>
    </section>
  );
}

function Categories({ counts }: { counts: Record<Occasion, number> | undefined }) {
  return (
    <section aria-labelledby="cats" className="flex flex-col gap-5">
      <SectionTitle id="cats">Khám phá theo loại thiệp</SectionTitle>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-5">
        {CATEGORIES.map(({ occasion, bg, ink, kind, Fan }) => (
          <Link key={occasion} href={`/kham-pha/${occasionSlug(occasion)}`} aria-label={`Khám phá ${OCCASION_LABEL[occasion]}`} className="group relative flex min-h-[260px] flex-col justify-between gap-5 overflow-hidden rounded-[28px] px-[30px] py-7 transition-shadow hover:shadow-[0_2px_4px_rgba(42,34,36,0.06),0_18px_40px_rgba(42,34,36,0.14)]" style={{ background: bg, color: ink }}>
            <CategoryBackdrop kind={kind} />
            <span className="relative z-10">
              <span className="block text-[22px] font-bold tracking-tight">{OCCASION_LABEL[occasion]}</span>
              <span className="mt-1 block text-sm opacity-80">{counts ? `${counts[occasion]} thiệp` : " "}</span>
            </span>
            <span className="relative z-10 inline-flex items-center gap-2 text-sm font-semibold">
              Khám phá
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-white">
                <ArrowRightIcon className="size-4" />
              </span>
            </span>
            <Fan />
          </Link>
        ))}
      </div>
    </section>
  );
}

function Recent() {
  const cards = useQuery({ queryKey: ["cards", { occasion: undefined, search: "" }], queryFn: ({ signal }) => cardsApi.list({}, signal), staleTime: 0 });
  const recent = cards.data?.slice(0, 3) ?? [];
  if (recent.length === 0) return null;
  return (
    <section aria-labelledby="mine" className="flex flex-col gap-5">
      <SectionTitle id="mine" action={<ViewAll href="/cards">Xem tất cả thiệp của tôi</ViewAll>}>
        Tiếp tục làm
      </SectionTitle>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-6 gap-y-8">
        {recent.map((card) => (
          <article key={card.id} className="flex flex-col gap-3">
            <div className="relative">
              <Link href={`/cards/${card.id}`} aria-label={`Mở ${card.title}`} className={cn("block h-[220px] overflow-hidden rounded-[20px]", SHADOW)}>
                <CardThumb title={card.title} occasion={card.occasion} className="size-full" />
              </Link>
              <span className={cn("absolute top-3 left-3 inline-flex h-[26px] items-center gap-1.5 rounded-full bg-white/95 px-3 text-xs font-semibold", card.published ? "text-primary" : "text-muted-foreground")}>
                <span aria-hidden="true" className={cn("size-[7px] rounded-full", card.published ? "bg-primary" : "bg-[#b9abae]")} />
                {card.published ? (card.publicationCount > 1 ? `Đã xuất bản · ${card.publicationCount} liên kết` : "Đã xuất bản") : "Bản nháp"}
              </span>
            </div>
            <div className="px-1">
              <Link href={`/cards/${card.id}`} className="block truncate text-[15px] font-semibold">
                {card.title}
              </Link>
              <p className="mt-0.5 text-[13px] text-muted-foreground">{formatEdited(card.updatedAt)}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// Một kệ thiệp công khai: tối đa 4 mẫu, ẩn hẳn khi chưa có mẫu nào.
function Shelf({ title, category, href, previewOnClick = false }: { title: string; category?: Occasion; href?: string; previewOnClick?: boolean }) {
  const templates = useQuery({ queryKey: ["templates", { category, first: 4 }], queryFn: ({ signal }) => templatesApi.list({ category, first: 4 }, signal), staleTime: 30_000 });
  const nodes = templates.data?.nodes ?? [];
  if (nodes.length === 0) return null;
  return (
    <section aria-label={title} className="flex flex-col gap-5">
      <SectionTitle id={`shelf-${category ?? "new"}`} action={href ? <ViewAll href={href}>Xem tất cả</ViewAll> : undefined}>
        {title}
      </SectionTitle>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-6 gap-y-8">
          {nodes.map((template) => (
            <TemplateCard key={template.id} template={template} previewOnClick={previewOnClick} />
        ))}
      </div>
    </section>
  );
}

export function HomePage() {
  const counts = useQuery({ queryKey: ["templates", "counts"], queryFn: ({ signal }) => templatesApi.counts(signal), staleTime: 30_000 });
  const total = counts.data ? Object.values(counts.data).reduce((sum, n) => sum + n, 0) : undefined;
  return (
    <AppShell active="home">
      <Hero />
      <Categories counts={counts.data} />
      <Recent />
      {total === 0 && (
        <section className={cn("flex flex-col items-center gap-3.5 rounded-[28px] bg-background px-6 py-14 text-center", SHADOW)}>
          <h2 className="text-lg font-bold">Chưa có thiệp công khai nào</h2>
          <p className="max-w-[440px] text-sm leading-relaxed text-muted-foreground">Thiệp xuất hiện ở đây sau khi chủ thiệp xuất bản, bật “Hiện trong thư viện công khai” và được duyệt.</p>
        </section>
      )}
      {total !== 0 && (
        <>
          <Shelf title="Mới xuất bản" previewOnClick />
          {CATEGORIES.map(({ occasion }) => (
            <Shelf key={occasion} title={OCCASION_LABEL[occasion]} category={occasion} href={`/kham-pha/${occasionSlug(occasion)}`} previewOnClick />
          ))}
        </>
      )}
    </AppShell>
  );
}
