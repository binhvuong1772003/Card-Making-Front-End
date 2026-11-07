"use client";

import type { PageData } from "@miditor/core";
import { Render } from "@miditor/render";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/app-shell";
import { isApiError } from "@/lib/api";
import { adminApi, type AdminTemplate, type TemplateStatus } from "@/lib/admin/api";
import { REJECTION_REASONS, rejectionReason } from "@/lib/admin/reason";
import { errorMessage } from "@/lib/auth/messages";
import { useMe } from "@/lib/auth/use-me";
import { formatEdited } from "@/lib/cards/format";
import { OCCASION_LABEL } from "@/lib/cards/occasions";
import { cn } from "@/lib/utils";

// Trang admin duyệt thiệp công khai (bản vẽ M): ba hàng đợi, xem trước đầy đủ trên khung điện thoại, Duyệt hoặc Từ chối kèm lý do.
// Chỉ admin vào được; việc chặn thật nằm ở backend (mọi lệnh duyệt đều kiểm vai trò).
const SHADOW = "shadow-[0_1px_2px_rgba(42,34,36,0.04),0_8px_24px_rgba(42,34,36,0.07)]";
const TABS: { status: TemplateStatus; label: string }[] = [
  { status: "PENDING", label: "Chờ duyệt" },
  { status: "PUBLISHED", label: "Đang hiện" },
  { status: "REJECTED", label: "Cần sửa" },
];
const DOT: Record<string, string> = { PENDING: "border-[1.5px] border-dashed border-muted-foreground", PUBLISHED: "bg-primary", REJECTED: "bg-destructive" };
const STATE_LABEL: Record<string, string> = { PENDING: "Chờ duyệt", PUBLISHED: "Đang hiện", REJECTED: "Cần sửa" };
const STATE_TEXT: Record<string, string> = { PENDING: "text-muted-foreground", PUBLISHED: "text-primary", REJECTED: "text-destructive" };

function Detail({ template, onDone }: { template: AdminTemplate; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState<string>(REJECTION_REASONS[0]);
  const [note, setNote] = useState("");

  const refresh = () => Promise.all([queryClient.invalidateQueries({ queryKey: ["admin"] }), queryClient.invalidateQueries({ queryKey: ["templates"] })]);
  const handle = (done: string) => ({
    onSuccess: async () => {
      toast.success(done);
      setRejecting(false);
      setNote("");
      await refresh();
      onDone();
    },
    onError: async (err: unknown) => {
      if (isApiError(err, "CONFLICT")) {
        toast.error("Mẫu này vừa được xử lý ở nơi khác, danh sách đã được làm mới.");
        await refresh();
        onDone();
      } else toast.error(errorMessage(err));
    },
  });
  const approve = useMutation({ mutationFn: () => adminApi.approve(template.id), ...handle("Đã duyệt, thiệp hiện trong thư viện.") });
  const reject = useMutation({ mutationFn: () => adminApi.reject(template.id, rejectionReason(reason, note)), ...handle("Đã từ chối, chủ thiệp sẽ thấy lý do.") });
  const remove = useMutation({ mutationFn: () => adminApi.remove(template.id), ...handle("Đã gỡ khỏi thư viện.") });
  const busy = approve.isPending || reject.isPending || remove.isPending;

  return (
    <aside aria-label="Chi tiết thiệp" className={cn("flex w-full max-w-[460px] min-w-[320px] flex-[1_1_380px] flex-col gap-5 rounded-[28px] bg-background p-6", SHADOW)}>
      <div className="mx-auto h-[380px] w-[300px] max-w-full overflow-y-auto rounded-[28px] bg-white shadow-[0_0_0_8px_#F6EEF0,0_1px_2px_rgba(42,34,36,0.06)]">
        <Render data={template.snapshot as unknown as PageData} device="phone" links="inert" />
      </div>
      <div>
        <h2 className="text-xl font-bold tracking-tight">{template.title}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {OCCASION_LABEL[template.category]} · {template.authorName}
          {template.authorEmail ? ` (${template.authorEmail})` : ""} · {formatEdited(template.updatedAt).replace(/^Sửa /, "")}
        </p>
      </div>
      <div className="rounded-[20px] bg-page px-[18px] py-4 text-[13px] leading-relaxed text-muted-foreground">
        <p className="mb-1 font-semibold text-foreground">Kiểm tra trước khi duyệt</p>
        Không có số điện thoại, địa chỉ nhà hay giấy tờ thật. Ảnh đúng bản quyền. Nội dung phù hợp để mọi người xem.
      </div>

      {template.status === "PENDING" &&
        (rejecting ? (
          <div className="flex flex-col gap-2.5">
            <span className="text-[13px] font-semibold">Lý do từ chối</span>
            <div className="flex flex-wrap gap-2">
              {REJECTION_REASONS.map((item) => (
                <button key={item} type="button" aria-pressed={reason === item} onClick={() => setReason(item)} className={cn("h-[34px] rounded-full px-3.5 text-[13px]", reason === item ? "bg-[#FBE9E7] font-semibold text-destructive" : "bg-muted font-medium hover:bg-[#F0E0E4]")}>
                  {item}
                </button>
              ))}
            </div>
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
              Ghi chú gửi cho chủ thiệp
              <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} maxLength={400} placeholder="Ví dụ: Ảnh thứ hai có số điện thoại, hãy xoá rồi gửi lại." className="rounded-2xl border border-input bg-page px-3.5 py-3 text-sm font-normal outline-none focus-visible:ring-3 focus-visible:ring-ring/50" />
            </label>
            <div className="flex justify-end gap-2.5">
              <button type="button" disabled={busy} onClick={() => setRejecting(false)} className="h-11 rounded-full bg-muted px-5 text-sm font-semibold">
                Quay lại
              </button>
              <button type="button" disabled={busy} onClick={() => reject.mutate()} className="h-11 rounded-full bg-destructive px-5 text-sm font-semibold text-white hover:bg-destructive/90 disabled:opacity-60">
                Gửi lý do từ chối
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2.5">
            <button type="button" disabled={busy} onClick={() => setRejecting(true)} className="h-12 flex-1 rounded-full bg-muted text-sm font-semibold text-destructive hover:bg-[#F0E0E4]">
              Từ chối
            </button>
            <button type="button" disabled={busy} onClick={() => approve.mutate()} className="h-12 flex-[1.4] rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-[0_6px_16px_rgba(123,30,43,0.22)] hover:bg-primary/90 disabled:opacity-60">
              {approve.isPending ? "Đang duyệt..." : "Duyệt và hiện"}
            </button>
          </div>
        ))}
      {template.status === "PUBLISHED" && (
        <button type="button" disabled={busy} onClick={() => remove.mutate()} className="h-12 rounded-full bg-muted text-sm font-semibold hover:bg-[#F0E0E4] disabled:opacity-60">
          Gỡ khỏi thư viện
        </button>
      )}
      {template.status === "REJECTED" && (
        <div className="rounded-[20px] bg-[#FBE9E7] px-[18px] py-4 text-[13px] leading-relaxed text-[#8A1C14]">
          <p className="mb-1 font-semibold">Đã từ chối</p>
          {template.rejectReason}
        </div>
      )}
    </aside>
  );
}

export function AdminPage() {
  const { me } = useMe();
  const isAdmin = me.data?.role === "ADMIN";
  const [tab, setTab] = useState<TemplateStatus>("PENDING");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Ba hàng đợi tải sẵn để số trên mỗi tab luôn đúng.
  const lists = {
    PENDING: useQuery({ queryKey: ["admin", "PENDING"], queryFn: ({ signal }) => adminApi.list("PENDING", signal), enabled: isAdmin, staleTime: 0 }),
    PUBLISHED: useQuery({ queryKey: ["admin", "PUBLISHED"], queryFn: ({ signal }) => adminApi.list("PUBLISHED", signal), enabled: isAdmin, staleTime: 0 }),
    REJECTED: useQuery({ queryKey: ["admin", "REJECTED"], queryFn: ({ signal }) => adminApi.list("REJECTED", signal), enabled: isAdmin, staleTime: 0 }),
  } as const;
  const current = lists[tab as keyof typeof lists];
  const rows = current.data?.nodes ?? [];
  const selected = rows.find((row) => row.id === selectedId) ?? rows[0];
  const count = (status: keyof typeof lists) => {
    const data = lists[status].data;
    return data ? `${data.nodes.length}${data.more ? "+" : ""}` : "…";
  };

  return (
    <AppShell active="admin">
      {me.data && !isAdmin ? (
        <div className="flex flex-col items-start gap-3 text-sm">
          <p>Chỉ admin mới vào được trang này.</p>
          <Link href="/" className="font-semibold text-primary underline">
            Về trang chủ
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap items-start gap-6">
          <section className="flex min-w-0 flex-[999_1_520px] flex-col gap-5">
            <div>
              <h1 className="text-[26px] font-bold tracking-tight">Duyệt thiệp công khai</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">Thiệp chỉ hiện trong thư viện sau khi bạn duyệt.</p>
            </div>
            <div role="group" aria-label="Trạng thái" className="flex flex-wrap gap-2">
              {TABS.map(({ status, label }) => {
                const on = tab === status;
                return (
                  <button key={status} type="button" aria-pressed={on} onClick={() => { setTab(status); setSelectedId(null); }} className={cn("h-[38px] rounded-full px-4 text-sm", on ? "bg-muted font-semibold text-accent-foreground" : "bg-background font-medium shadow-[0_1px_2px_rgba(42,34,36,0.04),0_4px_12px_rgba(42,34,36,0.05)] hover:bg-muted")}>
                    {label} {count(status as keyof typeof lists)}
                  </button>
                );
              })}
            </div>
            {current.isError ? (
              <p className="text-sm text-destructive">{errorMessage(current.error)}</p>
            ) : current.isPending ? (
              <p className="text-sm text-muted-foreground">Đang tải...</p>
            ) : rows.length === 0 ? (
              <div className={cn("rounded-3xl bg-background px-6 py-12 text-center text-muted-foreground", SHADOW)}>Không có thiệp nào ở trạng thái này.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {rows.map((row) => (
                  <button key={row.id} type="button" aria-pressed={selected?.id === row.id} onClick={() => setSelectedId(row.id)} className={cn("flex w-full flex-wrap items-center gap-x-4 gap-y-2 rounded-[20px] border-2 bg-background py-3 pr-5 pl-3.5 text-left", SHADOW, selected?.id === row.id ? "border-primary" : "border-transparent")}>
                    <span className="min-w-[200px] flex-1">
                      <span className="block truncate text-[15px] font-semibold">{row.title}</span>
                      <span className="mt-0.5 block text-[13px] text-muted-foreground">
                        {OCCASION_LABEL[row.category]} · bởi {row.authorName}
                      </span>
                    </span>
                    <span className="w-[130px] flex-none text-[13px] text-muted-foreground">{formatEdited(row.updatedAt).replace(/^Sửa /, "")}</span>
                    <span className={cn("inline-flex w-[110px] flex-none items-center gap-1.5 text-[13px] font-semibold", STATE_TEXT[row.status])}>
                      <span aria-hidden="true" className={cn("size-2 rounded-full", DOT[row.status])} />
                      {STATE_LABEL[row.status] ?? row.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
          {selected && <Detail key={selected.id} template={selected} onDone={() => setSelectedId(null)} />}
        </div>
      )}
    </AppShell>
  );
}
