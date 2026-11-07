"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CopyIcon } from "@phosphor-icons/react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { isApiError } from "@/lib/api";
import { errorMessage } from "@/lib/auth/messages";
import { cardsApi } from "@/lib/cards/api";
import { isValidSlug } from "@/lib/cards/slug";
import { publicationKey, usePublication } from "@/lib/cards/use-publication";

// Hộp thoại xuất bản (bản vẽ K, chưa có công tắc thư viện công khai: chờ bước duyệt). Chưa xuất bản: chọn đường dẫn rồi xuất bản.
// Đã xuất bản: hiện liên kết để sao chép, xuất bản lại (cập nhật trang theo bản nháp mới nhất) hoặc gỡ.
const SLUG_HELP = "Đường dẫn chỉ gồm chữ thường không dấu, số và gạch nối, dài 3 đến 60 ký tự.";

function publishError(err: unknown): string {
  if (isApiError(err, "CONFLICT")) return "Đường dẫn này đã có người dùng, hãy chọn tên khác.";
  if (isApiError(err, "VALIDATION")) return SLUG_HELP;
  return errorMessage(err);
}

export function PublishDialog({
  cardId,
  open,
  onOpenChange,
  isOwner,
  hasContent,
  flushDraft,
}: {
  cardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isOwner: boolean;
  hasContent: boolean;
  /** Chờ bản nháp đang gõ dở được lưu xong, để trang xuất bản là bản mới nhất. */
  flushDraft: () => Promise<void>;
}) {
  const queryClient = useQueryClient();
  const publication = usePublication(cardId, open);
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const live = publication.data;
  const link = live ? `${origin}/thiep/${live.slug}` : "";

  const refresh = () => queryClient.invalidateQueries({ queryKey: publicationKey(cardId) });
  const publish = useMutation({
    mutationFn: async () => {
      await flushDraft();
      return cardsApi.publish(cardId, slug.trim() || undefined);
    },
    onSuccess: () => {
      setError(null);
      toast.success("Đã xuất bản thiệp.");
      return refresh();
    },
    onError: (err) => setError(publishError(err)),
  });
  const unpublish = useMutation({
    mutationFn: () => cardsApi.unpublish(cardId),
    onSuccess: () => {
      setSlug("");
      toast.success("Đã gỡ trang công khai.");
      return refresh();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const slugValue = slug.trim();
  const slugOk = slugValue === "" || isValidSlug(slugValue);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!slugOk) return setError(SLUG_HELP);
    setError(null);
    publish.mutate();
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Đã sao chép liên kết.");
    } catch {
      toast.error("Không sao chép được, hãy chọn và sao chép liên kết bằng tay.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl p-8 sm:max-w-[460px]">
        {publication.isPending ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Đang tải...</p>
        ) : live ? (
          <div className="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Thiệp đã xuất bản</DialogTitle>
              <DialogDescription>Gửi liên kết này cho khách. Sửa thiệp xong, bấm Xuất bản lại để cập nhật trang.</DialogDescription>
            </DialogHeader>
            <div className="flex h-12 items-center gap-2 rounded-2xl border border-input bg-page pr-1.5 pl-4">
              <a href={link} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-sm hover:underline">
                {link}
              </a>
              <Button type="button" variant="outline" className="h-9 gap-1.5 rounded-full px-3.5 font-semibold" onClick={copy}>
                <CopyIcon className="size-[18px]" /> Sao chép
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {isOwner ? (
              <DialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0 sm:justify-between">
                <Button type="button" variant="ghost" disabled={unpublish.isPending} className="h-11 rounded-full px-5 text-destructive hover:bg-destructive/10" onClick={() => unpublish.mutate()}>
                  Gỡ xuất bản
                </Button>
                <Button type="button" disabled={publish.isPending || !hasContent} className="h-11 rounded-full px-5 font-semibold" onClick={() => publish.mutate()}>
                  Xuất bản lại
                </Button>
              </DialogFooter>
            ) : (
              <p className="text-sm text-muted-foreground">Chỉ chủ thiệp mới xuất bản lại hoặc gỡ được.</p>
            )}
          </div>
        ) : !isOwner ? (
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Xuất bản thiệp</DialogTitle>
            <DialogDescription>Chỉ chủ thiệp mới xuất bản được.</DialogDescription>
          </DialogHeader>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Xuất bản thiệp</DialogTitle>
              <DialogDescription>Thiệp sẽ có một liên kết công khai để gửi cho khách.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <label htmlFor="publish-slug" className="text-[13px] font-semibold">
                Đường dẫn
              </label>
              <div className="flex h-12 items-center overflow-hidden rounded-2xl border border-input bg-page focus-within:ring-3 focus-within:ring-ring/50">
                <span className="pr-1 pl-4 text-sm whitespace-nowrap text-muted-foreground">{origin.replace(/^https?:\/\//, "")}/thiep/</span>
                <input
                  id="publish-slug"
                  value={slug}
                  onChange={(event) => {
                    setSlug(event.target.value.toLowerCase());
                    setError(null);
                  }}
                  placeholder="tự đặt theo tên thiệp"
                  maxLength={60}
                  className="h-full min-w-0 flex-1 bg-transparent pr-3 text-[15px] outline-none placeholder:text-muted-foreground"
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : <p className="text-[13px] text-muted-foreground">Bỏ trống để tự đặt theo tên thiệp.</p>}
              {!hasContent && <p className="text-sm text-destructive">Thêm nội dung vào thiệp trước khi xuất bản.</p>}
            </div>
            <DialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0">
              <Button type="button" variant="secondary" className="h-11 rounded-full px-5" onClick={() => onOpenChange(false)}>
                Huỷ
              </Button>
              <Button type="submit" disabled={publish.isPending || !hasContent} className="h-11 rounded-full px-5 font-semibold">
                Xuất bản
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
