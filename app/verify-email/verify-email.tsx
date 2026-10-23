"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResendVerification } from "@/components/auth/resend-verification";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/auth/api";
import { errorMessage } from "@/lib/auth/messages";
import { resendSchema } from "@/lib/auth/schemas";

export function VerifyEmail({ token: initialToken }: { token?: string }) {
  // Giữ token trong state rồi xóa khỏi URL: sau khi xóa, prop từ server sẽ rỗng.
  const [token] = useState(initialToken);
  const started = useRef(false);
  const [resendEmail, setResendEmail] = useState<string | null>(null);

  const verify = useMutation({ mutationFn: authApi.verifyEmail });

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    // Token là bí mật dùng một lần; không để lại trong thanh địa chỉ hay lịch sử.
    window.history.replaceState(null, "", "/verify-email");
    verify.mutate(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy đúng một lần cho token ban đầu
  }, [token]);

  function onResend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = resendSchema.safeParse({ email: new FormData(event.currentTarget).get("email") });
    if (parsed.success) setResendEmail(parsed.data.email);
  }

  if (!token) {
    return (
      <AuthShell title="Xác minh email">
        <Alert variant="destructive">
          <AlertDescription>Thiếu mã xác minh. Hãy mở lại liên kết trong email.</AlertDescription>
        </Alert>
        <Link href="/login" className={buttonVariants({ variant: "outline" })}>
          Đến trang đăng nhập
        </Link>
      </AuthShell>
    );
  }

  if (verify.isSuccess) {
    return (
      <AuthShell title="Đã xác minh email" description="Tài khoản của bạn đã sẵn sàng.">
        <Link href="/login" className={buttonVariants()}>
          Đăng nhập
        </Link>
      </AuthShell>
    );
  }

  if (verify.isError) {
    return (
      <AuthShell title="Không xác minh được email">
        <Alert variant="destructive">
          <AlertDescription>{errorMessage(verify.error)}</AlertDescription>
        </Alert>
        {resendEmail ? (
          <ResendVerification email={resendEmail} />
        ) : (
          <form onSubmit={onResend} className="flex flex-col gap-2">
            <Field>
              <FieldLabel htmlFor="email">Nhập email để nhận liên kết mới</FieldLabel>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </Field>
            <button type="submit" className={buttonVariants({ variant: "outline" })}>
              Tiếp tục
            </button>
          </form>
        )}
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Xác minh email">
      <p className="text-sm">Đang xác minh...</p>
    </AuthShell>
  );
}
