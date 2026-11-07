"use client";

import type { PageData } from "@miditor/core";
import { Render } from "@miditor/render";
import { useQuery } from "@tanstack/react-query";
import { CopyIcon, XIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { AppShell } from "@/components/app/app-shell";
import { errorMessage } from "@/lib/auth/messages";
import { OCCASION_LABEL } from "@/lib/cards/occasions";
import { occasionSlug } from "@/lib/cards/occasions";
import { templatesApi } from "@/lib/templates/api";
import { useUseTemplate } from "./use-use-template";

// Xem một thiệp công khai (bản vẽ J): khung điện thoại cuộn được, tên người xuất bản, nút Dùng làm mẫu.
const CHIP: Record<string, { bg: string; ink: string }> = { WEDDING: { bg: "#E3EADA", ink: "#4B5A3F" }, BIRTHDAY: { bg: "#FFE3B8", ink: "#A8501C" }, EVENT: { bg: "#D8E2FA", ink: "#2F4A9A" }, OTHER: { bg: "#F4E6E9", ink: "#7B1E2B" } };

export function TemplateView({ id }: { id: string }) {
  const template = useQuery({ queryKey: ["templates", id], queryFn: ({ signal }) => templatesApi.get(id, signal), staleTime: 30_000, retry: false });
  const use = useUseTemplate();
  const data = template.data;
  const back = data && data.category !== "OTHER" ? `/kham-pha/${occasionSlug(data.category)}` : "/";

  return (
    <AppShell active="home">
      {template.isError ? (
        <div className="flex flex-col items-start gap-3 text-sm">
          <p>{template.error instanceof Error && template.error.message === "Template not found" ? "Không tìm thấy thiệp này, có thể chủ thiệp đã gỡ." : errorMessage(template.error)}</p>
          <Link href="/" className="font-semibold text-primary underline">
            Về trang chủ
          </Link>
        </div>
      ) : !data ? (
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      ) : (
        <section className="mx-auto flex w-full max-w-[1000px] flex-wrap gap-10 rounded-[28px] bg-background p-9 shadow-[0_4px_12px_rgba(42,34,36,0.08),0_32px_80px_rgba(42,34,36,0.12)]">
          <div className="mx-auto w-[340px] max-w-full flex-none">
            <div className="h-[600px] overflow-y-auto rounded-[28px] bg-white shadow-[0_0_0_8px_#F6EEF0,0_1px_2px_rgba(42,34,36,0.06)]">
              <Render data={data.snapshot as unknown as PageData} device="phone" links="inert" />
            </div>
            <p className="mt-5 text-center text-xs text-muted-foreground">Cuộn để xem cả trang</p>
          </div>

          <div className="flex min-w-[300px] flex-[1_1_320px] flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex h-[26px] items-center rounded-full px-3 text-xs font-semibold" style={{ background: CHIP[data.category]!.bg, color: CHIP[data.category]!.ink }}>
                  {OCCASION_LABEL[data.category]}
                </span>
                <h1 className="mt-3 text-[26px] leading-tight font-bold tracking-tight">{data.title}</h1>
                <p className="mt-2 text-sm text-muted-foreground">Xuất bản bởi {data.authorName}</p>
              </div>
              <Link href={back} aria-label="Đóng" className="inline-flex size-10 flex-none items-center justify-center rounded-full bg-muted">
                <XIcon className="size-5" />
              </Link>
            </div>

            <button type="button" disabled={use.isPending} onClick={() => use.mutate({ id: data.id, title: data.title })} className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-primary-foreground shadow-[0_6px_16px_rgba(123,30,43,0.22)] hover:bg-primary/90 disabled:opacity-60">
              <CopyIcon className="size-5" /> Dùng làm mẫu
            </button>

            <div className="rounded-[20px] bg-page px-5 py-4 text-sm leading-relaxed text-muted-foreground">
              <p className="mb-1 font-semibold text-foreground">Điều gì xảy ra khi bạn dùng làm mẫu?</p>
              Thiệp được sao chép về kho của bạn, kèm chữ và ảnh. Bạn sửa thoải mái, thiệp gốc không thay đổi. Hãy thay tên, ngày và ảnh bằng của bạn trước khi xuất bản.
            </div>
          </div>
        </section>
      )}
    </AppShell>
  );
}
