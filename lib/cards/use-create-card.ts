"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { errorMessage } from "@/lib/auth/messages";
import { cardsApi } from "./api";
import type { Occasion } from "./occasions";

// Tạo một thiệp trống rồi mở thẳng trang soạn thiệp. Dùng chung cho nút ở cột trái và các nút Tạo thiệp.
export function useCreateCard() {
  const router = useRouter();
  return useMutation({
    mutationFn: (occasion: Occasion | undefined) => cardsApi.create("Thiệp chưa đặt tên", occasion),
    onSuccess: (id) => router.push(`/cards/${id}`),
    onError: (err) => toast.error(errorMessage(err)),
  });
}
