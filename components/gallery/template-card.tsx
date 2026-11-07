"use client";

import Link from "next/link";
import { OCCASION_LABEL } from "@/lib/cards/occasions";
import type { Template } from "@/lib/templates/api";
import { cn } from "@/lib/utils";
import { PageThumb } from "./page-thumb";
import { useUseTemplate } from "./use-use-template";

// Thẻ một mẫu công khai (bản vẽ I, L): ảnh dựng từ bản chụp, rê chuột hiện Xem và Dùng làm mẫu.
const SHADOW = "shadow-[0_1px_2px_rgba(42,34,36,0.04),0_8px_24px_rgba(42,34,36,0.07)]";

export function TemplateCard({ template }: { template: Template }) {
  const use = useUseTemplate();
  return (
    <article className="group flex flex-col gap-3">
      <div className="relative">
        <Link href={`/mau/${template.id}`} aria-label={`Xem ${template.title}`} className={cn("block h-[300px] overflow-hidden rounded-[20px] transition-shadow group-hover:shadow-[0_2px_4px_rgba(42,34,36,0.06),0_18px_40px_rgba(42,34,36,0.14)]", SHADOW)}>
          <PageThumb data={template.snapshot} className="size-full" />
        </Link>
        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <Link href={`/mau/${template.id}`} className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-background text-sm font-semibold shadow-[0_2px_8px_rgba(42,34,36,0.18)]">
            Xem
          </Link>
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
        <Link href={`/mau/${template.id}`} className="block truncate text-[15px] font-semibold">
          {template.title}
        </Link>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {OCCASION_LABEL[template.category]} · bởi {template.authorName}
        </p>
      </div>
    </article>
  );
}
