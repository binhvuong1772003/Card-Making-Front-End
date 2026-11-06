"use client";

import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isApiError } from "@/lib/api";
import { errorMessage } from "@/lib/auth/messages";
import { cardsApi } from "@/lib/cards/api";

// Editor chỉ chạy ở trình duyệt.
const CardEditor = dynamic(() => import("@/components/editor/card-editor").then((m) => m.CardEditor), {
  ssr: false,
  loading: () => <Notice>Đang mở editor...</Notice>,
});

function Notice({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full items-center justify-center gap-4 text-sm">{children}</div>;
}

export function CardPage({ id }: { id: string }) {
  const router = useRouter();
  // Editor chỉ đọc `data` một lần khi mở, nên bản trong bộ nhớ cũ không được dùng: luôn tải lại khi vào trang, và chỉ mở editor
  // khi tải xong (`isFetching` hết). Không đặt `gcTime: 0`: ở chế độ dev, React dựng hai lần và bản tải dở bị bỏ.
  const card = useQuery({
    queryKey: ["card", id],
    queryFn: ({ signal }) => cardsApi.get(id, signal),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const signedOut = isApiError(card.error, "UNAUTHENTICATED");
  useEffect(() => {
    if (signedOut) router.replace(`/login?returnTo=${encodeURIComponent(`/cards/${id}`)}`);
  }, [signedOut, router, id]);

  if (card.isError && !signedOut) {
    return (
      <Notice>
        <span>{errorMessage(card.error)}</span>
        <Link href="/" className="underline">
          Về trang chủ
        </Link>
      </Notice>
    );
  }
  if (!card.data || card.isFetching) return <Notice>Đang tải...</Notice>;
  return <CardEditor key={card.data.id} card={card.data} />;
}
