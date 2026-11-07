"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/auth/messages";
import { cardsApi } from "@/lib/cards/api";
import { initials } from "@/lib/cards/initials";
import { useCreateCard } from "@/lib/cards/use-create-card";

// Nút tạo thiệp: tạo một thiệp trống rồi mở thẳng trang soạn thiệp.
export function CreateCardButton({ variant = "default" }: { variant?: "default" | "outline" }) {
  const create = useCreateCard();
  return (
    <Button variant={variant} disabled={create.isPending} onClick={() => create.mutate()}>
      Tạo thiệp
    </Button>
  );
}

// Lưới thiệp của người dùng. Ảnh nhỏ chỉ là ô giữ chỗ (chưa có ảnh chụp thiệp).
export function CardGrid() {
  const cards = useQuery({ queryKey: ["cards"], queryFn: ({ signal }) => cardsApi.list(signal), staleTime: 0 });

  if (cards.isError) return <p className="text-sm text-destructive">{errorMessage(cards.error)}</p>;
  if (cards.isPending) return <p className="text-sm text-muted-foreground">Đang tải...</p>;
  if (cards.data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm text-muted-foreground">Bạn chưa có thiệp nào.</p>
        <CreateCardButton />
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
      {cards.data.map((card) => (
        <li key={card.id}>
          <Link href={`/cards/${card.id}`} className="group flex flex-col gap-2">
            <span className="flex aspect-[3/4] items-center justify-center rounded-lg border bg-muted text-lg font-semibold text-muted-foreground group-hover:border-foreground/40">
              {initials(card.title)}
            </span>
            <span className="truncate text-sm font-medium">{card.title}</span>
            <span className="-mt-1 text-xs text-muted-foreground">{new Date(card.updatedAt).toLocaleDateString("vi-VN")}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
