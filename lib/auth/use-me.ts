"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isApiError } from "@/lib/api";
import { authApi, meQueryKey } from "./api";

// Người đang đăng nhập. apiFetch đã thử refresh một lần; còn 401 nghĩa là chưa đăng nhập hoặc phiên đã hết, nên chuyển về /login.
export function useMe() {
  const router = useRouter();
  const me = useQuery({ queryKey: meQueryKey, queryFn: ({ signal }) => authApi.me(signal), staleTime: 60_000 });
  const signedOut = isApiError(me.error, "UNAUTHENTICATED");
  useEffect(() => {
    if (signedOut) router.replace("/login");
  }, [signedOut, router]);
  return { me, signedOut };
}
