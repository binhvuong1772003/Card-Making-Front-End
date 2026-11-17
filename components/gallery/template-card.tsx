"use client";

import { useState } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { CardPlayer } from "@/components/cards/card-player";
import { normalizeCardDocument } from "@/lib/cards/document";
import { OCCASION_LABEL } from "@/lib/cards/occasions";
import type { Template } from "@/lib/templates/api";
import { cn } from "@/lib/utils";
import { PageThumb } from "./page-thumb";
import { useUseTemplate } from "./use-use-template";

// Thẻ một mẫu công khai (bản vẽ I, L): ảnh dựng từ bản chụp, rê chuột hiện Xem và Dùng làm mẫu.
const SHADOW = "shadow-[0_1px_2px_rgba(42,34,36,0.04),0_8px_24px_rgba(42,34,36,0.07)]";

export function TemplateCard({ template, previewOnClick = false }: { template: Template; previewOnClick?: boolean }) {
  const use = useUseTemplate();
  const [previewOpen, setPreviewOpen] = useState(false);
  const open = () => setPreviewOpen(true);
  return (
    <>
      <article className="group flex flex-col gap-3">
        <div className="relative">
          {previewOnClick ? (
            <button type="button" onClick={open} aria-label={`Xem ${template.title}`} className={cn("block h-[300px] w-full overflow-hidden rounded-[20px] text-left transition-shadow group-hover:shadow-[0_2px_4px_rgba(42,34,36,0.06),0_18px_40px_rgba(42,34,36,0.14)]", SHADOW)}>
              <PageThumb data={template.snapshot} className="size-full" />
            </button>
          ) : (
            <Link href={`/mau/${template.id}`} aria-label={`Xem ${template.title}`} className={cn("block h-[300px] overflow-hidden rounded-[20px] transition-shadow group-hover:shadow-[0_2px_4px_rgba(42,34,36,0.06),0_18px_40px_rgba(42,34,36,0.14)]", SHADOW)}>
              <PageThumb data={template.snapshot} className="size-full" />
            </Link>
          )}
          <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
            {previewOnClick ? (
              <button type="button" onClick={open} className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-background text-sm font-semibold shadow-[0_2px_8px_rgba(42,34,36,0.18)]">
                Xem
              </button>
            ) : (
              <Link href={`/mau/${template.id}`} className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-background text-sm font-semibold shadow-[0_2px_8px_rgba(42,34,36,0.18)]">
                Xem
              </Link>
            )}
            <button
              type="button"
              disabled={use.isPending}
              onClick={() => use.mutate({ id: template.id, title: template.title })}
              className="h-10 flex-[1.4] rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-[0_2px_8px_rgba(42,34,36,0.25)] hover:bg-primary/90 disabled:opacity-60"
            >
              Dùng làm mẫu
            </button>
          </div>
        </div>
        <div className="px-1">
          {previewOnClick ? (
            <button type="button" onClick={open} className="block max-w-full truncate text-left text-[15px] font-semibold">
              {template.title}
            </button>
          ) : (
            <Link href={`/mau/${template.id}`} className="block truncate text-[15px] font-semibold">
              {template.title}
            </Link>
          )}
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {OCCASION_LABEL[template.category]} · bởi {template.authorName}
          </p>
        </div>
      </article>

      {previewOnClick && (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="grid w-[min(1100px,calc(100vw-2rem))] max-w-none max-h-[92dvh] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-[24px] p-0 sm:max-w-none">
            <div className="flex items-center justify-between gap-12 border-b px-6 py-4">
              <div className="min-w-0">
                <DialogTitle className="truncate text-base font-semibold">{template.title}</DialogTitle>
                <DialogDescription className="mt-1">{OCCASION_LABEL[template.category]} · bởi {template.authorName}</DialogDescription>
              </div>
              <button
                type="button"
                disabled={use.isPending}
                onClick={() => use.mutate({ id: template.id, title: template.title })}
                className="mr-8 inline-flex h-10 flex-none items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                Dùng làm mẫu
              </button>
            </div>
            <div className="min-h-0 overflow-y-auto overscroll-contain bg-page">
              <CardPlayer document={normalizeCardDocument(template.snapshot)} mode="preview" historyKey={`homepage-template:${template.id}`} device="desktop" embedded />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
