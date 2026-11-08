"use client";

import { useQuery } from "@tanstack/react-query";
import { cardsApi } from "./api";

export const publicationKey = (cardId: string) => ["publications", cardId] as const;

// Các bản đang công khai của thiệp, bản chính đứng đầu (rỗng nếu chưa xuất bản hoặc đã gỡ hết). Luôn hỏi lại khi mở để không hiện bản cũ.
export function usePublications(cardId: string, enabled = true) {
  return useQuery({
    queryKey: publicationKey(cardId),
    queryFn: ({ signal }) => cardsApi.publications(cardId, signal),
    staleTime: 0,
    enabled,
  });
}

// Bản chính của thiệp (null nếu chưa xuất bản hoặc đã gỡ hết): cùng một truy vấn với `usePublications`, nên chỉ có một lần gọi mạng.
export function usePublication(cardId: string, enabled = true) {
  return useQuery({
    queryKey: publicationKey(cardId),
    queryFn: ({ signal }) => cardsApi.publications(cardId, signal),
    select: (list) => list[0] ?? null,
    staleTime: 0,
    enabled,
  });
}
