"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { isApiError } from "@/lib/api";
import { authApi, meQueryKey } from "@/lib/auth/api";
import { errorMessage } from "@/lib/auth/messages";

export function Home() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const me = useQuery({ queryKey: meQueryKey, queryFn: ({ signal }) => authApi.me(signal), staleTime: 60_000 });

  // apiFetch đã thử refresh một lần; còn 401 nghĩa là chưa đăng nhập hoặc phiên đã hết.
  const signedOut = isApiError(me.error, "UNAUTHENTICATED");
  useEffect(() => {
    if (signedOut) router.replace("/login");
  }, [signedOut, router]);

  const leave = {
    onSuccess: () => {
      queryClient.clear();
      router.replace("/login");
    },
    onError: (err: unknown) => toast.error(errorMessage(err)),
  };
  const logout = useMutation({ mutationFn: authApi.logout, ...leave });
  const logoutAll = useMutation({ mutationFn: authApi.logoutAll, ...leave });

  if (me.isError && !signedOut) {
    return (
      <AuthShell title="CardMaking">
        <Alert variant="destructive">
          <AlertDescription>{errorMessage(me.error)}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => me.refetch()}>
          Thử lại
        </Button>
      </AuthShell>
    );
  }

  if (!me.data) {
    return (
      <AuthShell title="CardMaking">
        <p className="text-sm">Đang tải...</p>
      </AuthShell>
    );
  }

  const user = me.data;
  const rows: Array<[string, string]> = [
    ["ID", user.id],
    ["Email", user.email],
    ["Tên", user.name ?? "(chưa có)"],
    ["Ảnh đại diện", user.avatarUrl ?? "(chưa có)"],
    ["Đã xác minh email", user.emailVerified ? "Có" : "Chưa"],
    ["Tạo lúc", new Date(user.createdAt).toLocaleString("vi-VN")],
  ];

  return (
    <AuthShell title="Đã đăng nhập" description="Dữ liệu từ GET /auth/me.">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="break-all">{value}</dd>
          </div>
        ))}
      </dl>
      <Button variant="outline" disabled={logout.isPending} onClick={() => logout.mutate()}>
        Đăng xuất
      </Button>
      <Button variant="destructive" disabled={logoutAll.isPending} onClick={() => logoutAll.mutate()}>
        Đăng xuất mọi thiết bị
      </Button>
    </AuthShell>
  );
}
