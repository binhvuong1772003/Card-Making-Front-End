import { Suspense } from "react";
import { VerifyEmail } from "./verify-email";

// cacheComponents bật: đọc searchParams phải nằm trong Suspense.
async function VerifyEmailContent({ searchParams }: Pick<PageProps<"/verify-email">, "searchParams">) {
  const { token } = await searchParams;
  return <VerifyEmail token={typeof token === "string" ? token : undefined} />;
}

export default function VerifyEmailPage({ searchParams }: PageProps<"/verify-email">) {
  return (
    <Suspense>
      <VerifyEmailContent searchParams={searchParams} />
    </Suspense>
  );
}
