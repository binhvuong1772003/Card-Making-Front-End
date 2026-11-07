"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { errorMessage } from "@/lib/auth/messages";
import { cardsApi } from "./api";

// Tạo một thiệp trống rồi mở thẳng trang soạn thiệp. Dùng chung cho nút ở cột trái và các nút Tạo thiệp.
export function useCreateCard() {
  const router = useRouter();
  return useMutation({
    mutationFn: () => cardsApi.create("Thiệp chưa đặt tên"),
    onSuccess: (id) => router.push(`/cards/${id}`),
    onError: (err) => toast.error(errorMessage(err)),
  });
}
