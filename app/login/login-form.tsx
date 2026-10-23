"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResendVerification } from "@/components/auth/resend-verification";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { authApi, googleStartUrl, meQueryKey } from "@/lib/auth/api";
import { errorMessage } from "@/lib/auth/messages";
import { loginSchema } from "@/lib/auth/schemas";
import { isApiError } from "@/lib/api";

type FieldErrors = Partial<Record<"email" | "password", string>>;

export function LoginForm({ returnTo, googleError }: { returnTo?: string; googleError: string | null }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [email, setEmail] = useState("");

  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => {
      queryClient.setQueryData(meQueryKey, user);
      router.replace(returnTo ?? "/");
    },
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({ email: form.get("email"), password: form.get("password") });
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
    setEmail(parsed.data.email);
    login.mutate(parsed.data);
  }

  const notVerified = isApiError(login.error, "EMAIL_NOT_VERIFIED");

  return (
    <AuthShell title="Đăng nhập" description="Đăng nhập vào CardMaking.">
      {googleError && (
        <Alert variant="destructive">
          <AlertDescription>{googleError}</AlertDescription>
        </Alert>
      )}
      {/* Phải là điều hướng của trình duyệt (không fetch): Google đưa người dùng đi rồi quay về qua backend. */}
      <a href={googleStartUrl(returnTo)} className={buttonVariants({ variant: "outline" })}>
        Đăng nhập bằng Google
      </a>
      <Separator />
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FieldGroup>
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} />
            <FieldError>{errors.email}</FieldError>
          </Field>
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
            <Input id="password" name="password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} />
            <FieldError>{errors.password}</FieldError>
          </Field>
        </FieldGroup>
        {login.isError && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage(login.error)}</AlertDescription>
          </Alert>
        )}
        {notVerified && <ResendVerification email={email} />}
        <Button type="submit" disabled={login.isPending}>
          {login.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>
      <p className="text-center text-sm">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="underline">
          Đăng ký
        </Link>
      </p>
    </AuthShell>
  );
}
