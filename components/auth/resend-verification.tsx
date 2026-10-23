"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/auth/api";
import { errorMessage } from "@/lib/auth/messages";

// Backend luôn trả 202 như nhau dù email có tồn tại hay không, và giới hạn mỗi tài khoản một lần mỗi 60 giây.
export function ResendVerification({ email }: { email: string }) {
  const resend = useMutation({
    mutationFn: () => authApi.resendVerification(email),
    onSuccess: () => toast.success("Nếu tài khoản tồn tại và chưa xác minh, email mới đã được gửi."),
    onError: (err) => toast.error(errorMessage(err)),
  });

  return (
    <Button type="button" variant="outline" disabled={resend.isPending} onClick={() => resend.mutate()}>
      {resend.isPending ? "Đang gửi..." : "Gửi lại email xác minh"}
    </Button>
  );
}
