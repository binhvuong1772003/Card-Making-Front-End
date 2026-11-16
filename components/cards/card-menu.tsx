"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowSquareOutIcon, ChatCircleTextIcon, CopyIcon, DotsThreeIcon, PencilSimpleIcon, TrashIcon, UsersThreeIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { errorMessage } from "@/lib/auth/messages";
import { cardsApi, type CardSummary } from "@/lib/cards/api";
import { cn } from "@/lib/utils";

// Menu ⋯ của một thiệp (bản vẽ G, H): mở, xem phản hồi, đổi tên, nhân bản, xoá. Đổi tên cho owner và editor, xoá chỉ cho owner:
// ẩn mục không đủ quyền cho gọn, còn việc chặn thật nằm ở backend.
export function CardMenu({ card, triggerClassName }: { card: CardSummary; triggerClassName?: string }) {
  const queryClient = useQueryClient();
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [title, setTitle] = useState(card.title);
  const canRename = card.role !== "VIEWER";
  const canDelete = card.role === "OWNER";
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["cards"] });

  const rename = useMutation({
    mutationFn: () => cardsApi.rename(card.id, title.trim()),
    onSuccess: () => {
      setRenaming(false);
      toast.success("Đã đổi tên thiệp.");
      return refresh();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  const duplicate = useMutation({
    mutationFn: () => cardsApi.duplicate(card.id),
    onSuccess: () => {
      toast.success("Đã nhân bản thiệp.");
      return refresh();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  const remove = useMutation({
    mutationFn: () => cardsApi.remove(card.id),
    onSuccess: () => {
      setDeleting(false);
      toast.success("Đã xoá thiệp.");
      return refresh();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const valid = title.trim().length >= 1 && title.trim().length <= 100;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (valid && !rename.isPending) rename.mutate();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              aria-label={`Tác vụ của ${card.title}`}
              className={cn("inline-flex size-9 items-center justify-center rounded-full bg-background text-foreground shadow-[0_2px_8px_rgba(42,34,36,0.18)] hover:bg-muted", triggerClassName)}
            />
          }
        >
          <DotsThreeIcon className="size-5" weight="bold" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
          <DropdownMenuItem render={<Link href={`/cards/${card.id}`} />}>
            <ArrowSquareOutIcon /> Mở để sửa
          </DropdownMenuItem>
          {card.published && card.role !== "VIEWER" && (
            <DropdownMenuItem render={<Link href={`/cards/${card.id}/responses`} />}>
              <ChatCircleTextIcon /> Phản hồi
            </DropdownMenuItem>
          )}
          {card.role !== "VIEWER" && (
            <DropdownMenuItem render={<Link href={`/cards/${card.id}/guests`} />}>
              <UsersThreeIcon /> Khách mời
            </DropdownMenuItem>
          )}
          {canRename && (
            <DropdownMenuItem
              onClick={() => {
                setTitle(card.title);
                setRenaming(true);
              }}
            >
              <PencilSimpleIcon /> Đổi tên
            </DropdownMenuItem>
          )}
          <DropdownMenuItem disabled={duplicate.isPending} onClick={() => duplicate.mutate()}>
            <CopyIcon /> Nhân bản
          </DropdownMenuItem>
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => setDeleting(true)}>
                <TrashIcon /> Xoá thiệp
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={renaming} onOpenChange={setRenaming}>
        <DialogContent className="rounded-3xl p-8 sm:max-w-[440px]">
          <form onSubmit={submit} className="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Đổi tên thiệp</DialogTitle>
              <DialogDescription>Tên chỉ hiện trong danh sách thiệp của bạn, khách không nhìn thấy.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <label htmlFor={`rename-${card.id}`} className="text-[13px] font-semibold">
                Tên thiệp
              </label>
              <Input id={`rename-${card.id}`} value={title} onChange={(event) => setTitle(event.target.value)} maxLength={100} autoFocus className="h-12 rounded-2xl bg-page px-4 text-[15px]" />
            </div>
            <DialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0">
              <Button type="button" variant="secondary" className="h-11 rounded-full px-5" onClick={() => setRenaming(false)}>
                Huỷ
              </Button>
              <Button type="submit" disabled={!valid || rename.isPending} className="h-11 rounded-full px-5 font-semibold">
                Lưu tên
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleting} onOpenChange={setDeleting}>
        <AlertDialogContent className="rounded-3xl p-8 sm:max-w-[440px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Xoá thiệp “{card.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Thiệp và mọi nội dung trong đó sẽ bị xoá vĩnh viễn, không khôi phục được. Nếu thiệp đã xuất bản, đường dẫn của nó cũng ngừng hoạt động.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0">
            <AlertDialogCancel className="h-11 rounded-full px-5">Giữ lại</AlertDialogCancel>
            <AlertDialogAction
              disabled={remove.isPending}
              onClick={(event) => {
                event.preventDefault();
                remove.mutate();
              }}
              className="h-11 rounded-full bg-destructive px-5 font-semibold text-white hover:bg-destructive/90"
            >
              Xoá thiệp
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
