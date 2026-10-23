import { googleErrorMessage } from "@/lib/auth/messages";
import { safeReturnTo } from "@/lib/auth/return-to";
import { LoginForm } from "./login-form";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error, returnTo } = await searchParams;
  return (
    <LoginForm
      returnTo={safeReturnTo(returnTo)}
      googleError={googleErrorMessage(typeof error === "string" ? error : undefined)}
    />
  );
}
