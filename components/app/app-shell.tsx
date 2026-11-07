"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CardsIcon, HouseIcon, MagnifyingGlassIcon, PlusIcon, SignOutIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { authApi } from "@/lib/auth/api";
import { errorMessage } from "@/lib/auth/messages";
import { useMe } from "@/lib/auth/use-me";
import { useCreateCard } from "@/lib/cards/use-create-card";
import { cn } from "@/lib/utils";

// Khung chung của các trang ngoài editor (bản vẽ G, I, L): cột trái có nút Tạo, đầu trang có tên hiệu, ô tìm và tài khoản.
// Ô tìm chỉ hiện khi trang truyền `search`, để không có ô tìm chưa làm gì cả.
type Search = { value: string; onChange: (value: string) => void; placeholder: string };

function RailLink({ href, label, icon, on }: { href: string; label: string; icon: ReactNode; on: boolean }) {
  return (
    <Link href={href} aria-current={on ? "page" : undefined} className={cn("group flex w-[68px] flex-col items-center gap-1.5 text-xs", on ? "font-semibold text-accent-foreground" : "font-medium")}>
      <span className={cn("inline-flex h-9 w-12 items-center justify-center rounded-full transition-colors group-hover:bg-muted", on && "bg-muted")}>{icon}</span>
      {label}
    </Link>
  );
}

export function AppShell({ active, search, children }: { active: "home" | "cards"; search?: Search; children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { me, signedOut } = useMe();
  const create = useCreateCard();

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

  const email = me.data.email;
  const initial = (me.data.name ?? email).trim().charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen flex-wrap bg-page text-foreground">
      <nav aria-label="Điều hướng" className="flex w-[92px] flex-none flex-col items-center gap-5 bg-background px-3 py-5 shadow-[1px_0_0_#f0e7e9]">
        <button type="button" onClick={() => create.mutate(undefined)} disabled={create.isPending} className="group flex flex-col items-center gap-1.5 text-xs font-semibold disabled:opacity-60">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_6px_16px_rgba(123,30,43,0.25)] transition-colors group-hover:bg-primary/90">
            <PlusIcon className="size-6" />
          </span>
          Tạo
        </button>
        <RailLink href="/" label="Trang chủ" icon={<HouseIcon className="size-[22px]" />} on={active === "home"} />
        <RailLink href="/cards" label="Thiệp" icon={<CardsIcon className="size-[22px]" />} on={active === "cards"} />
      </nav>

      <div className="flex min-w-0 flex-[999_1_560px] flex-col">
        <header className="flex items-center gap-6 px-12 pt-5 pb-2">
          <Link href="/" className="flex-none text-lg font-bold tracking-tight whitespace-nowrap">
            CardMaking
          </Link>
          <div className="mx-auto flex max-w-xl min-w-0 flex-1">
            {search && (
              <label className="flex h-12 w-full items-center gap-2.5 rounded-full bg-background px-5 text-muted-foreground shadow-[0_1px_2px_rgba(42,34,36,0.04),0_8px_24px_rgba(42,34,36,0.07)]">
                <MagnifyingGlassIcon className="size-5 flex-none" />
                <input
                  type="search"
                  value={search.value}
                  onChange={(event) => search.onChange(event.target.value)}
                  placeholder={search.placeholder}
                  aria-label={search.placeholder}
                  className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
                />
              </label>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<button type="button" aria-label="Tài khoản" className="inline-flex size-10 flex-none items-center justify-center rounded-full bg-muted text-sm font-bold text-primary" />}>
              {initial}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="truncate">{email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={logout.isPending} onClick={() => logout.mutate()}>
                <SignOutIcon /> Đăng xuất
              </DropdownMenuItem>
              <DropdownMenuItem disabled={logoutAll.isPending} onClick={() => logoutAll.mutate()}>
                <SignOutIcon /> Đăng xuất mọi thiết bị
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-col gap-10 px-12 pt-4 pb-16">{children}</main>
      </div>
    </div>
  );
}
