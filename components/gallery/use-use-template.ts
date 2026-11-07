"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { errorMessage } from "@/lib/auth/messages";
import { templatesApi } from "@/lib/templates/api";

// Dùng làm mẫu: tạo thiệp mới của mình từ mẫu, báo kèm nút mở thẳng để sửa.
export function useUseTemplate() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; title: string }) => templatesApi.use(id),
    onSuccess: (cardId, { title }) => {
      void queryClient.invalidateQueries({ queryKey: ["cards"] });
      toast.success(`Đã thêm “${title}” vào thiệp của bạn.`, { action: { label: "Mở để sửa", onClick: () => router.push(`/cards/${cardId}`) } });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}
