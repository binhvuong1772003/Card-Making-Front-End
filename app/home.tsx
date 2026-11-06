"use client";

// TRANG CHỦ MẪU, XÀI ĐỠ. Chỉ là chỗ để có nút Tạo thiệp và danh sách thiệp trong lúc giao diện thật chưa được thiết kế.
// Khi có thiết kế trang chủ thì thay cả trang này; đừng chỉnh style kỹ ở đây. Ảnh nhỏ của thiệp cũng chỉ là ô giữ chỗ.

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { CardGrid, CreateCardButton } from "@/components/cards/card-list";
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

  return (
    <div className="min-h-screen">
      <header className="flex h-14 items-center justify-between gap-4 border-b px-6">
        <span className="font-semibold">CardMaking</span>
        <div className="flex items-center gap-2 text-sm">
          <span className="hidden text-muted-foreground sm:inline">{me.data.email}</span>
          <Button variant="outline" size="sm" disabled={logout.isPending} onClick={() => logout.mutate()}>
            Đăng xuất
          </Button>
          <Button variant="ghost" size="sm" disabled={logoutAll.isPending} onClick={() => logoutAll.mutate()}>
            Đăng xuất mọi thiết bị
          </Button>
        </div>
      </header>
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">Thiệp của tôi</h1>
            <p className="text-sm text-muted-foreground">Tạo thiệp mới hoặc mở thiệp đã làm.</p>
          </div>
          <CreateCardButton />
        </div>
        <CardGrid />
      </main>
    </div>
  );
}
