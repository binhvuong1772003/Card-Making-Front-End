"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, CopyIcon, DownloadSimpleIcon, MagnifyingGlassIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { isApiError } from "@/lib/api";
import { errorMessage } from "@/lib/auth/messages";
import { cardsApi } from "@/lib/cards/api";
import { linkName } from "@/lib/cards/forms/responses";
import { GREETING_MAX, guestLink, guestsCsv, INVITE_MAX, NAME_MAX, openedLabel, parseGuestLines, type GuestRow } from "@/lib/cards/guests/admin";
import { usePublications } from "@/lib/cards/use-publication";
import { cn } from "@/lib/utils";

// Trang Khách mời: chủ thiệp và người sửa thiệp thêm khách (từng người hoặc dán nhiều dòng), sao chép link riêng, xem ai đã mở và đã xác nhận.
// Cần đăng nhập; người xem thấy lời báo không có quyền.
const CARD = "rounded-3xl bg-background shadow-[0_1px_2px_rgba(42,34,36,0.05),0_10px_30px_rgba(42,34,36,0.06)]";
const FIELD = "w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CardGuests({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [typed, setTyped] = useState("");
  const [search, setSearch] = useState("");
  const [paste, setPaste] = useState("");
  const [editing, setEditing] = useState<GuestRow | null>(null);
  const [deleting, setDeleting] = useState<GuestRow | null>(null);
  const [linkId, setLinkId] = useState<string | null>(null);

  const header = useQuery({ queryKey: ["card-header", id], queryFn: ({ signal }) => cardsApi.header(id, signal), retry: false, refetchOnWindowFocus: false });
  const signedOut = isApiError(header.error, "UNAUTHENTICATED");
  useEffect(() => {
    if (signedOut) router.replace(`/login?returnTo=${encodeURIComponent(`/cards/${id}/guests`)}`);
  }, [signedOut, router, id]);

  const canManage = header.data ? header.data.role !== "VIEWER" : false;
  const publication = usePublications(id, canManage);
  const versions = publication.data ?? [];
  const version = versions.find((item) => item.id === linkId) ?? versions[0];

  useEffect(() => {
    const timer = setTimeout(() => setSearch(typed.trim()), 300);
    return () => clearTimeout(timer);
  }, [typed]);

  const guests = useQuery({ queryKey: ["card-guests", id, search], queryFn: ({ signal }) => cardsApi.guests(id, search, signal), enabled: canManage, retry: false, refetchOnWindowFocus: false });
  const rows = guests.data ?? [];
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["card-guests", id] });

  const parsed = parseGuestLines(paste);
  const add = useMutation({
    mutationFn: () => cardsApi.addGuests(id, parsed.guests),
    onSuccess: async (added) => {
      setPaste("");
      toast.success(`Đã thêm ${added.length} khách.`);
      await refresh();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  const remove = useMutation({
    mutationFn: (guestId: string) => cardsApi.deleteGuest(guestId),
    onSuccess: async () => {
      setDeleting(null);
      toast.success("Đã xoá khách. Link của khách đó không còn hiện tên.");
      await refresh();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const linkFor = (code: string) => (version ? guestLink(window.location.origin, version.slug, code) : "");
  const copy = async (guest: GuestRow) => {
    try {
      await navigator.clipboard.writeText(linkFor(guest.code));
      toast.success(`Đã sao chép link của ${guest.name}.`);
    } catch {
      toast.error("Không sao chép được. Chọn và sao chép link thủ công.");
    }
  };
  const download = () => {
    const blob = new Blob([guestsCsv(rows, linkFor)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "khach-moi.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const body = () => {
    if (signedOut) return <p className="text-sm text-muted-foreground">Đang chuyển tới trang đăng nhập...</p>;
    if (header.isError) return <p className="text-sm text-destructive">{errorMessage(header.error)}</p>;
    if (header.isPending) return <p className="text-sm text-muted-foreground">Đang tải...</p>;
    if (!canManage) return <p className="text-sm text-muted-foreground">Bạn chỉ có quyền xem thiệp này, không quản lý được khách mời.</p>;

    return (
      <>
        <div className={cn(CARD, "p-5")}>
          <h2 className="text-base font-bold">Thêm khách</h2>
          <p className="mt-1 text-sm text-muted-foreground">Mỗi dòng một khách: <code>Tên</code>, hoặc <code>Tên | lời chào</code>, hoặc <code>Tên | lời chào | lời mời</code>. Mỗi khách nhận một link riêng.</p>
          <textarea value={paste} onChange={(event) => setPaste(event.target.value)} rows={4} placeholder={"Anh Nam\nChị Lan | Mừng chị đến chung vui"} aria-label="Danh sách khách" className={cn(FIELD, "mt-3 resize-y")} />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button type="button" className="h-11 rounded-full px-5" disabled={parsed.guests.length === 0 || add.isPending} onClick={() => add.mutate()}>
              {add.isPending ? "Đang thêm..." : parsed.guests.length > 1 ? `Thêm ${parsed.guests.length} khách` : "Thêm khách"}
            </Button>
            {paste.trim() && (
              <span className="text-sm text-muted-foreground">
                {parsed.skipped > 0 && `${parsed.skipped} dòng bị bỏ (thiếu tên hoặc quá dài). `}
                {parsed.overflow > 0 && `Chỉ thêm 200 khách mỗi lần, còn ${parsed.overflow} khách để lần sau.`}
              </span>
            )}
          </div>
        </div>

        {publication.isSuccess && versions.length === 0 && (
          <div className={cn(CARD, "mt-4 p-5 text-sm")}>
            <p className="font-semibold">Thiệp chưa được xuất bản.</p>
            <p className="mt-1 text-muted-foreground">Xuất bản thiệp để dựng link cho từng khách. Danh sách khách vẫn lưu ở đây.</p>
          </div>
        )}
        {versions.length > 1 && (
          <div role="group" aria-label="Link của bản xuất bản" className="mt-4 inline-flex flex-wrap rounded-full border border-input bg-background p-0.5">
            {versions.map((item) => (
              <button key={item.id} type="button" aria-pressed={version?.id === item.id} onClick={() => setLinkId(item.id)} className={cn("inline-flex h-10 max-w-[200px] items-center rounded-full px-3.5 text-sm", version?.id === item.id ? "bg-muted font-semibold text-accent-foreground" : "font-medium hover:bg-muted")}>
                <span className="truncate">{linkName(item)}</span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label className="flex h-11 min-w-[220px] flex-1 items-center gap-2 rounded-full bg-background px-4 text-muted-foreground shadow-[0_1px_2px_rgba(42,34,36,0.04)]">
            <MagnifyingGlassIcon className="size-[18px] flex-none" />
            <input type="search" value={typed} onChange={(event) => setTyped(event.target.value)} placeholder="Tìm theo tên khách" aria-label="Tìm theo tên khách" className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none" />
          </label>
          <Button type="button" variant="outline" className="h-11 rounded-full px-4" disabled={!version || rows.length === 0} onClick={download}>
            <DownloadSimpleIcon className="size-[18px]" /> Tải danh sách link
          </Button>
        </div>

        <div className={cn(CARD, "mt-4 overflow-x-auto")}>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted/50 text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Khách</th>
                <th scope="col" className="px-4 py-3 font-semibold">Lời chào riêng</th>
                <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">Đã mở</th>
                <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">Xác nhận</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">Thao tác</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((guest) => (
                <tr key={guest.id}>
                  <td className="px-4 py-3 align-top font-medium">{guest.name}</td>
                  <td className="max-w-[260px] px-4 py-3 align-top text-muted-foreground"><span className="line-clamp-2">{guest.greeting || "—"}</span></td>
                  <td className="px-4 py-3 align-top whitespace-nowrap text-muted-foreground">{openedLabel(guest)}</td>
                  <td className="px-4 py-3 align-top">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap", guest.responded ? "bg-[#eef4ec] text-[#3f6b46]" : "bg-muted text-muted-foreground")}>{guest.responded ? "Đã xác nhận" : "Chưa"}</span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex justify-end gap-1">
                      <Button type="button" variant="ghost" size="sm" className="rounded-full" disabled={!version} onClick={() => copy(guest)}>
                        <CopyIcon className="size-[18px]" /> Sao chép link
                      </Button>
                      <Button type="button" variant="ghost" size="icon-sm" aria-label={`Sửa ${guest.name}`} className="rounded-full text-muted-foreground" onClick={() => setEditing(guest)}>
                        <PencilSimpleIcon className="size-[18px]" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon-sm" aria-label={`Xoá ${guest.name}`} className="rounded-full text-muted-foreground hover:text-destructive" onClick={() => setDeleting(guest)}>
                        <TrashIcon className="size-[18px]" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {guests.isPending ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">Đang tải...</p>
          ) : guests.isError ? (
            <p className="px-5 py-8 text-center text-sm text-destructive">{errorMessage(guests.error)}</p>
          ) : rows.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">{search ? "Không có khách nào khớp." : "Chưa có khách nào. Dán danh sách ở trên để bắt đầu."}</p>
          ) : null}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-dvh bg-page text-foreground">
      <header className="flex flex-wrap items-center gap-3 bg-background px-5 py-3 shadow-[0_1px_0_#f0e7e9]">
        <Link href="/cards" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeftIcon className="size-[18px]" /> Quay lại
        </Link>
        <span className="text-sm text-muted-foreground">Khách mời{header.data ? `: ${header.data.title}` : ""}</span>
        {guests.data && <span className="ml-auto text-sm text-muted-foreground">{guests.data.length} khách{search ? " khớp" : ""}</span>}
      </header>
      <main className="mx-auto w-full max-w-[1100px] px-4 py-8">{body()}</main>

      <EditGuest key={editing?.id ?? "none"} guest={editing} onClose={() => setEditing(null)} onSaved={async () => { setEditing(null); toast.success("Đã lưu."); await refresh(); }} />

      <AlertDialog open={deleting !== null} onOpenChange={(open) => (open ? undefined : setDeleting(null))}>
        <AlertDialogContent className="rounded-3xl p-8 sm:max-w-[440px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Xoá khách này?</AlertDialogTitle>
            <AlertDialogDescription>{deleting?.name}: link riêng của khách sẽ không còn hiện tên. Câu trả lời khách đã gửi vẫn được giữ.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0">
            <AlertDialogCancel className="h-11 rounded-full px-5">Giữ lại</AlertDialogCancel>
            <AlertDialogAction disabled={remove.isPending} onClick={(event) => { event.preventDefault(); if (deleting) remove.mutate(deleting.id); }} className="h-11 rounded-full bg-destructive px-5 font-semibold text-white hover:bg-destructive/90">
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EditGuest({ guest, onClose, onSaved }: { guest: GuestRow | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const [name, setName] = useState(guest?.name ?? "");
  const [greeting, setGreeting] = useState(guest?.greeting ?? "");
  const [invite, setInvite] = useState(guest?.inviteMessage ?? "");
  const save = useMutation({
    mutationFn: () => cardsApi.updateGuest(guest!.id, { name: name.trim(), greeting: greeting.trim(), inviteMessage: invite.trim() }),
    onSuccess: onSaved,
    onError: (err) => toast.error(errorMessage(err)),
  });
  return (
    <Dialog open={guest !== null} onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="rounded-3xl p-8 sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Sửa khách</DialogTitle>
          <DialogDescription>Lời chào và lời mời riêng hiện ở khối Khách mời khi khách mở link của mình. Để trống thì khối dùng chữ dự phòng.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <label className="grid gap-1 text-sm font-medium">Tên khách<input value={name} maxLength={NAME_MAX} onChange={(event) => setName(event.target.value)} className={FIELD} /></label>
          <label className="grid gap-1 text-sm font-medium">Lời chào riêng<textarea value={greeting} maxLength={GREETING_MAX} rows={2} onChange={(event) => setGreeting(event.target.value)} className={cn(FIELD, "resize-y")} /></label>
          <label className="grid gap-1 text-sm font-medium">Lời mời riêng<textarea value={invite} maxLength={INVITE_MAX} rows={3} onChange={(event) => setInvite(event.target.value)} className={cn(FIELD, "resize-y")} /></label>
        </div>
        <DialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0">
          <Button type="button" variant="outline" className="h-11 rounded-full px-5" onClick={onClose}>Huỷ</Button>
          <Button type="button" className="h-11 rounded-full px-5 font-semibold" disabled={!name.trim() || save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
