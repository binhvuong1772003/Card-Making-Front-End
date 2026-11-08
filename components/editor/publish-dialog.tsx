"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CopyIcon } from "@phosphor-icons/react";
import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { errorMessage } from "@/lib/auth/messages";
import { cardsApi, type PublicationInfo } from "@/lib/cards/api";
import { LIMIT_TEXT, SLUG_HELP, canAddVersion, publishErrorMessage, slugAllowed, versionTitle } from "@/lib/cards/publish-form";
import { publicationKey, usePublications } from "@/lib/cards/use-publication";
import { cn } from "@/lib/utils";

// Hộp thoại xuất bản (bản vẽ K, V). Một thiệp có tới 5 bản, mỗi bản một liên kết và một bản chụp riêng của bản nháp lúc xuất bản.
// Bước "list": danh sách các bản (sao chép liên kết, xuất bản lại một bản, gỡ, dùng làm bản nháp) và nút thêm bản mới.
// Bước "form": xuất bản bản mới (chưa có bản nào thì vào thẳng đây). Bước "done": liên kết của bản vừa xuất bản để sao chép.
// Bước "restore": xác nhận nạp một bản vào bản nháp. Mở lại hộp thoại luôn bắt đầu từ danh sách (hoặc từ form khi chưa có bản nào).
type Step = "list" | "form" | "done" | "restore";

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

const siteOf = () => (typeof window === "undefined" ? "" : window.location.origin);
const linkOf = (version: { slug: string }) => `${siteOf()}/thiep/${version.slug}`;

const fieldBox = "h-12 w-full rounded-2xl border border-input bg-page px-4 text-[15px] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground";

// Một bản trong danh sách. Mở ra (xuất bản lại) thì hiện ô tên, đường dẫn và hai việc phụ.
function VersionRow({
  version,
  index,
  open,
  label,
  slug,
  slugChanged,
  slugOk,
  busy,
  onLabel,
  onSlug,
  onOpen,
  onRestore,
  onUnpublish,
  onCopy,
}: {
  version: PublicationInfo;
  index: number;
  open: boolean;
  label: string;
  slug: string;
  slugChanged: boolean;
  slugOk: boolean;
  busy: boolean;
  onLabel: (value: string) => void;
  onSlug: (value: string) => void;
  onOpen: () => void;
  onRestore: () => void;
  onUnpublish: () => void;
  onCopy: () => void;
}) {
  const origin = siteOf();
  return (
    <div className={cn("flex flex-col gap-3 rounded-2xl border bg-background px-4 py-3.5", open ? "border-foreground" : "border-border")}>
      <div className="flex flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <b className="text-[15px]">{versionTitle(version, index)}</b>
          {version.isMain && version.label && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-primary">Bản chính</span>}
        </div>
        <span className="truncate text-[13px] text-muted-foreground">{`${origin.replace(/^https?:\/\//, "")}/thiep/${version.slug}`}</span>
      </div>
      {open ? (
        <div className="flex flex-col gap-3.5 border-t border-border pt-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold" htmlFor={`label-${version.id}`}>
              Tên bản
            </label>
            <input id={`label-${version.id}`} value={label} onChange={(event) => onLabel(event.target.value)} maxLength={40} placeholder="Ví dụ: Nhà trai" className={fieldBox} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold" htmlFor={`slug-${version.id}`}>
              Đường dẫn
            </label>
            <SlugField id={`slug-${version.id}`} value={slug} onChange={onSlug} placeholder={version.slug} origin={origin} />
            {!slugOk ? (
              <p className="text-sm text-destructive">{SLUG_HELP}</p>
            ) : slugChanged ? (
              <p className="text-[13px] text-[#7a4a00]">Đổi đường dẫn thì liên kết cũ ngừng mở được. Khách đã nhận liên kết cũ cần liên kết mới.</p>
            ) : (
              <p className="text-[13px] text-muted-foreground">Giữ nguyên thì liên kết không đổi.</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="h-9 rounded-full px-3.5" disabled={busy} onClick={onRestore}>
              Dùng làm bản nháp
            </Button>
            <Button type="button" variant="outline" className="h-9 rounded-full px-3.5 text-destructive hover:text-destructive" disabled={busy} onClick={onUnpublish}>
              Gỡ bản này
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="h-9 gap-1.5 rounded-full px-3.5" onClick={onCopy}>
            <CopyIcon className="size-4" /> Sao chép liên kết
          </Button>
          <Button type="button" variant="outline" className="h-9 rounded-full px-3.5" onClick={onOpen}>
            Xuất bản lại
          </Button>
        </div>
      )}
    </div>
  );
}

function Title({ title, text }: { title: string; text: ReactNode }) {
  return (
    <DialogHeader>
      <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
      <DialogDescription>{text}</DialogDescription>
    </DialogHeader>
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
  const publications = usePublications(cardId, open);
  const versions = publications.data ?? [];
  const [step, setStep] = useState<Step | null>(null);
  // Bản đang mở ra để xuất bản lại; các ô tên và đường dẫn là của bản đó (hoặc của bản mới ở bước "form"). null: chưa đụng tới.
  const [openId, setOpenId] = useState<string | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [galleryChoice, setGalleryChoice] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<PublicationInfo | null>(null);
  const [restoring, setRestoring] = useState<PublicationInfo | null>(null);

  const clear = () => {
    setOpenId(null);
    setLabel(null);
    setSlug(null);
    setGalleryChoice(null);
    setError(null);
  };
  // Mỗi lần mở hộp thoại bắt đầu lại (chỉnh state ngay lúc vẽ, cách React khuyên thay cho effect).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setStep(null);
      setDone(null);
      setRestoring(null);
      clear();
    }
  }

  // Chưa có bản nào thì không có danh sách để hiện: vào thẳng form.
  const shown: Step = step === "done" || step === "restore" ? step : versions.length === 0 ? "form" : (step ?? "list");
  const target = versions.find((version) => version.id === openId) ?? null;
  const canAdd = canAddVersion(versions.length);

  const labelValue = label ?? target?.label ?? "";
  const slugValue = (slug ?? target?.slug ?? "").trim();
  const slugChanged = !!target && slugValue !== target.slug;
  const slugOk = slugAllowed(slugValue, !!target);
  // Thư viện công khai chỉ gắn với bản chính: bản chính đang mở, hoặc bản đầu tiên khi chưa có bản nào.
  const galleryApplies = target ? target.isMain : versions.length === 0;
  const gallery = galleryChoice ?? target?.listInGallery ?? false;
  const galleryOf = target ?? versions[0] ?? null;

  const refresh = () => queryClient.invalidateQueries({ queryKey: publicationKey(cardId) });
  const publish = useMutation({
    mutationFn: async () => {
      await flushDraft();
      return cardsApi.publish(cardId, {
        ...(target ? { publicationId: target.id } : {}),
        // Bản đã có chỉ gửi đường dẫn khi nó đổi; bản mới để trống thì tự đặt theo tên thiệp.
        ...(target ? (slugChanged ? { slug: slugValue } : {}) : slugValue ? { slug: slugValue } : {}),
        // Tên: bản đã có gửi khi đã sửa (rỗng là bỏ tên); bản mới gửi khi có gõ.
        ...(label !== null ? { label: label.trim() } : {}),
        listInGallery: galleryApplies ? gallery : false,
      });
    },
    onSuccess: async (result) => {
      toast.success(galleryApplies && gallery ? "Đã xuất bản và gửi duyệt." : "Đã xuất bản thiệp.");
      clear();
      setDone(result);
      setStep("done");
      await refresh();
    },
    onError: (err) => setError(publishErrorMessage(err)),
  });
  const unpublish = useMutation({
    mutationFn: (version: PublicationInfo) => cardsApi.unpublish(cardId, version.id),
    onSuccess: async () => {
      clear();
      setStep("list");
      toast.success("Đã gỡ bản này.");
      await refresh();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  const restore = useMutation({
    mutationFn: (version: PublicationInfo) => cardsApi.restoreDraft(cardId, version.id),
    onSuccess: () => {
      toast.success("Đã nạp bản này vào bản nháp.");
      // Bản nháp trong trình soạn đã cũ: tải lại để mở đúng nội dung vừa nạp.
      window.location.reload();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const copy = async (version: PublicationInfo) => {
    try {
      await navigator.clipboard.writeText(linkOf(version));
      toast.success("Đã sao chép liên kết.");
    } catch {
      toast.error("Không sao chép được, hãy chọn và sao chép liên kết bằng tay.");
    }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!slugOk) return setError(SLUG_HELP);
    setError(null);
    publish.mutate();
  };
  const toList = () => {
    clear();
    setStep("list");
  };

  const footerSplit = "mx-0 mb-0 border-0 bg-transparent p-0 sm:justify-between";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* `min-w-0` cho con của hộp (là lưới): không có thì dòng liên kết dài không xuống dòng làm cột rộng hơn hộp và nội dung tràn ra ngoài. */}
      <DialogContent className="rounded-3xl p-8 sm:max-w-[460px] [&>*]:min-w-0">
        {publications.isPending ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Đang tải...</p>
        ) : !isOwner ? (
          <div className="flex flex-col gap-6">
            <Title title={versions.length ? "Thiệp đã xuất bản" : "Xuất bản thiệp"} text={versions.length ? "Chỉ chủ thiệp mới xuất bản lại hoặc gỡ được. Liên kết để gửi cho khách:" : "Chỉ chủ thiệp mới xuất bản được."} />
            {versions.map((version, index) => (
              <div key={version.id} className="flex flex-col gap-1.5">
                {versions.length > 1 && <span className="text-[13px] font-semibold">{versionTitle(version, index)}</span>}
                <LinkRow link={linkOf(version)} />
              </div>
            ))}
          </div>
        ) : shown === "done" && done ? (
          <div className="flex flex-col gap-6">
            <Title title={`Đã xuất bản${done.label ? ` bản ${done.label}` : ""}`} text="Gửi liên kết này cho khách. Bản này giữ nội dung lúc vừa xuất bản." />
            <LinkRow link={linkOf(done)} />
            {done.isMain && <GalleryStatusNote status={done.galleryStatus} reason={done.galleryRejectReason} />}
            <DialogFooter className={footerSplit}>
              <Button type="button" variant="ghost" className="h-11 rounded-full px-5" onClick={toList}>
                Về danh sách
              </Button>
              <Button type="button" className="h-11 rounded-full px-5 font-semibold" onClick={() => onOpenChange(false)}>
                Xong
              </Button>
            </DialogFooter>
          </div>
        ) : shown === "restore" && restoring ? (
          <div className="flex flex-col gap-6">
            <Title title={`Thay bản nháp bằng bản ${restoring.label || "này"}?`} text="Nội dung bản nháp hiện tại sẽ bị thay bằng nội dung đã xuất bản của bản này. Những thay đổi chưa xuất bản trong bản nháp sẽ mất." />
            <p role="alert" className="rounded-2xl bg-[#fff1d6] px-4 py-3 text-sm leading-relaxed">
              Muốn giữ bản nháp hiện tại, hãy xuất bản nó thành một bản mới trước. Các bản đã xuất bản không bị đụng tới.
            </p>
            <DialogFooter className={footerSplit}>
              <Button type="button" variant="secondary" className="h-11 rounded-full px-5" disabled={restore.isPending} onClick={toList}>
                Huỷ
              </Button>
              <Button type="button" className="h-11 rounded-full px-5 font-semibold" disabled={restore.isPending} onClick={() => restore.mutate(restoring)}>
                Thay bản nháp
              </Button>
            </DialogFooter>
          </div>
        ) : shown === "list" ? (
          <form onSubmit={submit} className="flex flex-col gap-6">
            <Title title="Các bản đã xuất bản" text="Mỗi bản có liên kết riêng và giữ nguyên nội dung lúc xuất bản. Sửa thiệp xong, bấm Xuất bản lại ở bản muốn cập nhật." />
            <div className="flex flex-col gap-2.5">
              {versions.map((version, index) => (
                <VersionRow
                  key={version.id}
                  version={version}
                  index={index}
                  open={version.id === openId}
                  label={version.id === openId ? labelValue : ""}
                  slug={version.id === openId ? (slug ?? version.slug) : version.slug}
                  slugChanged={version.id === openId && slugChanged}
                  slugOk={version.id !== openId || slugOk}
                  busy={publish.isPending || unpublish.isPending || restore.isPending}
                  onLabel={setLabel}
                  onSlug={(value) => {
                    setSlug(value);
                    setError(null);
                  }}
                  onOpen={() => {
                    clear();
                    setOpenId(version.id);
                  }}
                  onRestore={() => {
                    setRestoring(version);
                    setStep("restore");
                  }}
                  onUnpublish={() => unpublish.mutate(version)}
                  onCopy={() => void copy(version)}
                />
              ))}
            </div>
            {target?.isMain && <GallerySwitch checked={gallery} onChange={setGalleryChoice} disabled={publish.isPending} />}
            {target && galleryOf && <GalleryStatusNote status={galleryOf.galleryStatus} reason={galleryOf.galleryRejectReason} />}
            {error && <p className="text-sm text-destructive">{error}</p>}
            {!hasContent && target && <p className="text-sm text-destructive">Thêm nội dung vào thiệp trước khi xuất bản.</p>}
            {!canAdd && !target && <p className="text-[13px] text-muted-foreground">{LIMIT_TEXT}</p>}
            <DialogFooter className={footerSplit}>
              {target ? (
                <>
                  <Button type="button" variant="secondary" className="h-11 rounded-full px-5" onClick={toList}>
                    Quay lại
                  </Button>
                  <Button type="submit" disabled={publish.isPending || !hasContent || !slugOk} className="h-11 rounded-full px-5 font-semibold">
                    {target.isMain && gallery && target.galleryStatus !== "LIVE" ? "Xuất bản lại và gửi duyệt" : "Xuất bản lại bản này"}
                  </Button>
                </>
              ) : (
                <>
                  <Button type="button" variant="ghost" className="h-11 rounded-full px-5" onClick={() => onOpenChange(false)}>
                    Xong
                  </Button>
                  <Button
                    type="button"
                    disabled={!canAdd}
                    className="h-11 rounded-full px-5 font-semibold"
                    onClick={() => {
                      clear();
                      setStep("form");
                    }}
                  >
                    + Xuất bản bản mới
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-6">
            <Title
              title={versions.length ? "Xuất bản bản mới" : "Xuất bản thiệp"}
              text={versions.length ? "Bản mới chụp nội dung bản nháp hiện tại. Các bản đã xuất bản không bị đổi." : "Thiệp sẽ có một liên kết công khai để gửi cho khách."}
            />
            <div className="flex flex-col gap-2">
              <label htmlFor="publish-label" className="text-[13px] font-semibold">
                Tên bản
              </label>
              <input id="publish-label" value={label ?? ""} onChange={(event) => setLabel(event.target.value)} maxLength={40} placeholder="Ví dụ: Nhà trai" className={fieldBox} />
              <p className="text-[13px] text-muted-foreground">Không bắt buộc. Chỉ chủ thiệp thấy, khách không thấy.</p>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="publish-slug" className="text-[13px] font-semibold">
                Đường dẫn
              </label>
              <SlugField
                id="publish-slug"
                value={slug ?? ""}
                onChange={(value) => {
                  setSlug(value);
                  setError(null);
                }}
                placeholder="tự đặt theo tên thiệp"
                origin={siteOf()}
              />
              {error || !slugOk ? <p className="text-sm text-destructive">{error ?? SLUG_HELP}</p> : <p className="text-[13px] text-muted-foreground">Bỏ trống để tự đặt theo tên thiệp.</p>}
              {!hasContent && <p className="text-sm text-destructive">Thêm nội dung vào thiệp trước khi xuất bản.</p>}
            </div>
            {galleryApplies && <GallerySwitch checked={gallery} onChange={setGalleryChoice} disabled={publish.isPending} />}
            <DialogFooter className={footerSplit}>
              {versions.length ? (
                <Button type="button" variant="secondary" className="h-11 rounded-full px-5" onClick={toList}>
                  Quay lại
                </Button>
              ) : (
                <Button type="button" variant="secondary" className="h-11 rounded-full px-5" onClick={() => onOpenChange(false)}>
                  Huỷ
                </Button>
              )}
              <Button type="submit" disabled={publish.isPending || !hasContent || !slugOk || !canAdd} className="h-11 rounded-full px-5 font-semibold">
                {galleryApplies && gallery ? "Xuất bản và gửi duyệt" : "Xuất bản"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
