"use client";

import { useQuery } from "@tanstack/react-query";
import { cardsApi } from "./api";

export const publicationKey = (cardId: string) => ["publication", cardId] as const;

// Liên kết đang công khai của thiệp (null nếu chưa xuất bản hoặc đã gỡ). Luôn hỏi lại khi mở để không hiện bản cũ.
export function usePublication(cardId: string, enabled = true) {
  return useQuery({
    queryKey: publicationKey(cardId),
    queryFn: ({ signal }) => cardsApi.publication(cardId, signal),
    staleTime: 0,
    enabled,
  });
}
