"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CopyIcon } from "@phosphor-icons/react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { isApiError } from "@/lib/api";
import { errorMessage } from "@/lib/auth/messages";
import { cardsApi } from "@/lib/cards/api";
import { isValidSlug } from "@/lib/cards/slug";
import { publicationKey, usePublication } from "@/lib/cards/use-publication";

// Hộp thoại xuất bản (bản vẽ K), hai bước. Bước 1 "form": điền đường dẫn (đã xuất bản thì có sẵn đường dẫn hiện tại, đổi được) rồi bấm Xuất bản.
// Bước 2 "done": hiện liên kết để sao chép. Mở lại hộp thoại luôn bắt đầu ở bước 1; muốn lấy lại liên kết mà không xuất bản thì dùng dòng liên kết hiện tại.
const SLUG_HELP = "Đường dẫn chỉ gồm chữ thường không dấu, số và gạch nối, dài 3 đến 60 ký tự.";

function publishError(err: unknown): string {
  if (isApiError(err, "CONFLICT")) return "Đường dẫn này đã có người dùng, hãy chọn tên khác.";
  if (isApiError(err, "VALIDATION")) return SLUG_HELP;
  return errorMessage(err);
}

// Công tắc "Hiện trong thư viện công khai" (bản vẽ K): admin duyệt trước, người khác xem được và Dùng làm mẫu.
function GallerySwitch({ checked, onChange, disabled }: { checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-start gap-4 rounded-[20px] bg-page p-4">
      <div className="min-w-0 flex-1">
        <div id="gallery-switch" className="text-sm font-semibold">
          Hiện trong thư viện công khai
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
          Admin duyệt trước khi thiệp xuất hiện. Người khác có thể xem và Dùng làm mẫu: chữ và ảnh sẽ được sao chép về kho của họ. Hãy kiểm tra tên thật, số điện thoại và địa chỉ trong thiệp.
        </p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} aria-label="Hiện trong thư viện công khai" />
    </div>
  );
}

// Trạng thái của thiệp trong thư viện, hiện sau khi xuất bản.
function GalleryStatusNote({ status, reason }: { status: "NONE" | "PENDING" | "REJECTED" | "LIVE"; reason: string | null }) {
  if (status === "NONE") return null;
  const note = {
    PENDING: { title: "Đang chờ admin duyệt", text: "Thiệp vẫn gửi được cho khách bằng liên kết. Khi được duyệt, thiệp sẽ hiện trong thư viện công khai.", tone: "text-foreground" },
    LIVE: { title: "Đang hiện trong thư viện", text: "Đã được duyệt, ai cũng xem được và dùng làm mẫu.", tone: "text-primary" },
    REJECTED: { title: "Cần sửa để được hiện trong thư viện", text: reason ?? "", tone: "text-destructive" },
  }[status];
  return (
    <div className="rounded-[20px] bg-page px-4 py-3.5">
      <div className={`text-sm font-semibold ${note.tone}`}>{note.title}</div>
      {note.text && <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{note.text}</p>}
    </div>
  );
}

// Ô đặt đường dẫn, dùng cả lúc xuất bản lần đầu và khi đã xuất bản (đổi đường dẫn thì xuất bản lại).
function SlugField({ id, value, onChange, placeholder, origin }: { id: string; value: string; onChange: (value: string) => void; placeholder: string; origin: string }) {
  return (
    <div className="flex h-12 items-center overflow-hidden rounded-2xl border border-input bg-page focus-within:ring-3 focus-within:ring-ring/50">
      <span className="pr-1 pl-4 text-sm whitespace-nowrap text-muted-foreground">{origin.replace(/^https?:\/\//, "")}/thiep/</span>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value.toLowerCase())}
        placeholder={placeholder}
        maxLength={60}
        className="h-full min-w-0 flex-1 bg-transparent pr-3 text-[15px] outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

// Dòng liên kết với nút Sao chép.
function LinkRow({ link }: { link: string }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Đã sao chép liên kết.");
    } catch {
      toast.error("Không sao chép được, hãy chọn và sao chép liên kết bằng tay.");
    }
  };
  return (
    <div className="flex h-12 items-center gap-2 rounded-2xl border border-input bg-page pr-1.5 pl-4">
      <a href={link} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-sm hover:underline">
        {link}
      </a>
      <Button type="button" variant="outline" className="h-9 gap-1.5 rounded-full px-3.5 font-semibold" onClick={copy}>
        <CopyIcon className="size-[18px]" /> Sao chép
      </Button>
    </div>
  );
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
  const [step, setStep] = useState<"form" | "done">("form");
  // Đường dẫn đang gõ; null là chưa đụng tới (đã xuất bản thì giữ đường dẫn hiện có).
  const [slug, setSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [galleryChoice, setGalleryChoice] = useState<boolean | null>(null);
  // Mỗi lần mở hộp thoại bắt đầu lại từ bước 1 (chỉnh state ngay lúc vẽ, cách React khuyên thay cho effect).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setStep("form");
      setSlug(null);
      setError(null);
      setGalleryChoice(null);
    }
  }
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const live = publication.data;
  const link = live ? `${origin}/thiep/${live.slug}` : "";
  // Công tắc thư viện: theo lựa chọn của người dùng, chưa chọn thì theo trạng thái đang có.
  const gallery = galleryChoice ?? live?.listInGallery ?? false;
  const slugValue = (slug ?? live?.slug ?? "").trim();
  const slugChanged = !!live && slugValue !== live.slug;
  // Chưa xuất bản: để trống là tự đặt theo tên thiệp. Đã xuất bản: luôn phải có đường dẫn.
  const slugOk = live ? isValidSlug(slugValue) : slugValue === "" || isValidSlug(slugValue);

  const refresh = () => queryClient.invalidateQueries({ queryKey: publicationKey(cardId) });
  const publish = useMutation({
    mutationFn: async () => {
      await flushDraft();
      // Đã xuất bản thì chỉ gửi đường dẫn khi nó đổi (gửi lại chính đường dẫn cũ không cần thiết).
      const wanted = live ? (slugChanged ? slugValue : undefined) : slugValue || undefined;
      return cardsApi.publish(cardId, wanted, gallery);
    },
    onSuccess: () => {
      setError(null);
      setGalleryChoice(null);
      setSlug(null);
      setStep("done");
      toast.success(gallery ? "Đã xuất bản và gửi duyệt." : "Đã xuất bản thiệp.");
      return refresh();
    },
    onError: (err) => setError(publishError(err)),
  });
  const unpublish = useMutation({
    mutationFn: () => cardsApi.unpublish(cardId),
    onSuccess: () => {
      setSlug(null);
      setGalleryChoice(null);
      setStep("form");
      toast.success("Đã gỡ trang công khai.");
      return refresh();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!slugOk) return setError(SLUG_HELP);
    setError(null);
    publish.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* `min-w-0` cho con của hộp (là lưới): không có thì dòng liên kết dài không xuống dòng làm cột rộng hơn hộp và nội dung tràn ra ngoài. */}
      <DialogContent className="rounded-3xl p-8 sm:max-w-[460px] [&>*]:min-w-0">
        {publication.isPending ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Đang tải...</p>
        ) : !isOwner ? (
          <div className="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{live ? "Thiệp đã xuất bản" : "Xuất bản thiệp"}</DialogTitle>
              <DialogDescription>{live ? "Chỉ chủ thiệp mới xuất bản lại hoặc gỡ được. Liên kết để gửi cho khách:" : "Chỉ chủ thiệp mới xuất bản được."}</DialogDescription>
            </DialogHeader>
            {live && <LinkRow link={link} />}
          </div>
        ) : live && step === "done" ? (
          <div className="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Thiệp đã xuất bản</DialogTitle>
              <DialogDescription>Gửi liên kết này cho khách. Sửa thiệp xong, mở lại Xuất bản để cập nhật trang.</DialogDescription>
            </DialogHeader>
            <LinkRow link={link} />
            <GalleryStatusNote status={live.galleryStatus} reason={live.galleryRejectReason} />
            <DialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0 sm:justify-between">
              <Button type="button" variant="ghost" className="h-11 rounded-full px-5" onClick={() => setStep("form")}>
                Sửa đường dẫn
              </Button>
              <Button type="button" className="h-11 rounded-full px-5 font-semibold" onClick={() => onOpenChange(false)}>
                Xong
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{live ? "Xuất bản lại" : "Xuất bản thiệp"}</DialogTitle>
              <DialogDescription>
                {live ? "Cập nhật trang công khai theo bản nháp mới nhất. Muốn thì đổi đường dẫn." : "Thiệp sẽ có một liên kết công khai để gửi cho khách."}
              </DialogDescription>
            </DialogHeader>
            {live && <LinkRow link={link} />}
            <div className="flex flex-col gap-2">
              <label htmlFor="publish-slug" className="text-[13px] font-semibold">
                Đường dẫn
              </label>
              <SlugField
                id="publish-slug"
                value={slug ?? live?.slug ?? ""}
                onChange={(value) => {
                  setSlug(value);
                  setError(null);
                }}
                placeholder={live ? live.slug : "tự đặt theo tên thiệp"}
                origin={origin}
              />
              {error || !slugOk ? (
                <p className="text-sm text-destructive">{error ?? SLUG_HELP}</p>
              ) : slugChanged ? (
                <p className="text-[13px] text-muted-foreground">Đổi đường dẫn thì liên kết cũ ngừng mở được. Khách đã nhận liên kết cũ cần liên kết mới.</p>
              ) : (
                <p className="text-[13px] text-muted-foreground">{live ? "Giữ nguyên thì liên kết không đổi." : "Bỏ trống để tự đặt theo tên thiệp."}</p>
              )}
              {!hasContent && <p className="text-sm text-destructive">Thêm nội dung vào thiệp trước khi xuất bản.</p>}
            </div>
            <GallerySwitch checked={gallery} onChange={setGalleryChoice} disabled={publish.isPending} />
            {live && <GalleryStatusNote status={live.galleryStatus} reason={live.galleryRejectReason} />}
            <DialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0 sm:justify-between">
              {live ? (
                <Button type="button" variant="ghost" disabled={unpublish.isPending} className="h-11 rounded-full px-5 text-destructive hover:bg-destructive/10" onClick={() => unpublish.mutate()}>
                  Gỡ xuất bản
                </Button>
              ) : (
                <Button type="button" variant="secondary" className="h-11 rounded-full px-5" onClick={() => onOpenChange(false)}>
                  Huỷ
                </Button>
              )}
              <Button type="submit" disabled={publish.isPending || !hasContent || !slugOk} className="h-11 rounded-full px-5 font-semibold">
                {live ? (gallery && live.galleryStatus !== "LIVE" ? "Xuất bản lại và gửi duyệt" : "Xuất bản lại") : gallery ? "Xuất bản và gửi duyệt" : "Xuất bản"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
