"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResendVerification } from "@/components/auth/resend-verification";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/auth/api";
import { errorMessage } from "@/lib/auth/messages";
import { registerSchema } from "@/lib/auth/schemas";

type FieldErrors = Partial<Record<"email" | "password" | "name", string>>;

export function RegisterForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const register = useMutation({
    mutationFn: authApi.register,
    onSuccess: (_data, input) => setRegisteredEmail(input.email),
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = registerSchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
      name: form.get("name") || undefined,
    });
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        next[key] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    register.mutate(parsed.data);
  }

  // Backend trả 202 giống nhau dù email đã tồn tại hay chưa, và đăng nhập bị chặn tới khi xác minh email.
  if (registeredEmail) {
    return (
      <AuthShell title="Kiểm tra email" description={`Mình đã gửi liên kết xác minh tới ${registeredEmail}.`}>
        <Alert>
          <AlertDescription>Bấm vào liên kết trong email rồi quay lại đăng nhập. Nhớ xem cả mục Spam.</AlertDescription>
        </Alert>
        <ResendVerification email={registeredEmail} />
        <Link href="/login" className="text-center text-sm underline">
          Đến trang đăng nhập
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Đăng ký" description="Tạo tài khoản CardMaking bằng email và mật khẩu.">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FieldGroup>
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">Tên (không bắt buộc)</FieldLabel>
            <Input id="name" name="name" autoComplete="name" aria-invalid={!!errors.name} />
            <FieldError>{errors.name}</FieldError>
          </Field>
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} />
            <FieldError>{errors.email}</FieldError>
          </Field>
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
            <Input id="password" name="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} />
            <FieldError>{errors.password}</FieldError>
          </Field>
        </FieldGroup>
        {register.isError && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage(register.error)}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" disabled={register.isPending}>
          {register.isPending ? "Đang đăng ký..." : "Đăng ký"}
        </Button>
      </form>
      <p className="text-center text-sm">
        Đã có tài khoản?{" "}
        <Link href="/login" className="underline">
          Đăng nhập
        </Link>
      </p>
    </AuthShell>
  );
}
