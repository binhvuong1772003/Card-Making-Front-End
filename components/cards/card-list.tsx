"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/auth/messages";
import { cardsApi } from "@/lib/cards/api";

// Danh sách thiệp của người dùng và nút tạo thiệp mới (mở thẳng trang soạn thiệp).
export function CardList() {
  const router = useRouter();
  const cards = useQuery({ queryKey: ["cards"], queryFn: ({ signal }) => cardsApi.list(signal), staleTime: 0 });
  const create = useMutation({
    mutationFn: () => cardsApi.create("Thiệp chưa đặt tên"),
    onSuccess: (id) => router.push(`/cards/${id}`),
    onError: (err) => toast.error(errorMessage(err)),
  });

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">Thiệp của tôi</h2>
        <Button size="sm" disabled={create.isPending} onClick={() => create.mutate()}>
          Tạo thiệp
        </Button>
      </div>
      {cards.isError ? (
        <p className="text-sm text-destructive">{errorMessage(cards.error)}</p>
      ) : cards.isPending ? (
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      ) : cards.data.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có thiệp nào.</p>
      ) : (
        <ul className="flex flex-col divide-y rounded-md border">
          {cards.data.map((card) => (
            <li key={card.id}>
              <Link href={`/cards/${card.id}`} className="flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-muted">
                <span className="truncate">{card.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{new Date(card.updatedAt).toLocaleDateString("vi-VN")}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
