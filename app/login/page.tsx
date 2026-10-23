import { Suspense } from "react";
import { googleErrorMessage } from "@/lib/auth/messages";
import { safeReturnTo } from "@/lib/auth/return-to";
import { LoginForm } from "./login-form";

// cacheComponents bật: đọc searchParams phải nằm trong Suspense.
async function LoginContent({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const { error, returnTo } = await searchParams;
  return (
    <LoginForm
      returnTo={safeReturnTo(returnTo)}
      googleError={googleErrorMessage(typeof error === "string" ? error : undefined)}
    />
  );
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <Suspense>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}
