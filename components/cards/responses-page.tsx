"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, DownloadSimpleIcon, MagnifyingGlassIcon, TrashIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { isApiError } from "@/lib/api";
import { errorMessage } from "@/lib/auth/messages";
import { cardsApi } from "@/lib/cards/api";
import { answerText, chipTone, columnsOf, isChipType, sentAt, summaryLine, type CardForm, type FormResponse, type ResponseColumn, type ResponseStatus } from "@/lib/cards/forms/responses";
import { usePublication } from "@/lib/cards/use-publication";
import { cn } from "@/lib/utils";

// Trang Phản hồi (bảng U): chủ thiệp và người sửa thiệp đọc, tìm, duyệt và xoá câu trả lời của mọi khối `Form`. Cần đăng nhập;
// người ngoài vào thẳng đường dẫn chỉ thấy lỗi của backend.
const PAGE = 20;
const CARD = "rounded-3xl bg-background shadow-[0_1px_2px_rgba(42,34,36,0.05),0_10px_30px_rgba(42,34,36,0.06)]";
const FILTERS: { value: ResponseStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "HIDDEN", label: "Đang ẩn" },
];
// Chip đáp án dùng năm màu nhạt; `chipTone` chọn màu theo nội dung nên một đáp án luôn cùng màu.
const TONES = ["bg-muted text-primary", "bg-[#eef4ec] text-[#3f6b46]", "bg-[#f3eefb] text-[#5b3f86]", "bg-[#fdf3e2] text-[#8a5a16]", "bg-[#e9f2f8] text-[#2f5d7a]"] as const;

function Answer({ column, row }: { column: ResponseColumn; row: FormResponse }) {
  const text = answerText(row.answers.find((answer) => answer.id === column.id)?.value);
  if (!text) return <span className="text-muted-foreground">—</span>;
  if (isChipType(column.type)) return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap", TONES[chipTone(text)])}>{text}</span>;
  return <span className="whitespace-pre-wrap">{text}</span>;
}

function stateLabel(status: ResponseStatus): string | null {
  return status === "PENDING" ? "Chờ duyệt" : status === "HIDDEN" ? "Đang ẩn" : null;
}

export function CardResponses({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tabId, setTabId] = useState<string | null>(null);
  const [status, setStatus] = useState<ResponseStatus | "ALL">("ALL");
  const [typed, setTyped] = useState("");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<FormResponse | null>(null);

  const header = useQuery({ queryKey: ["card-header", id], queryFn: ({ signal }) => cardsApi.header(id, signal), retry: false, refetchOnWindowFocus: false });
  const signedOut = isApiError(header.error, "UNAUTHENTICATED");
  useEffect(() => {
    if (signedOut) router.replace(`/login?returnTo=${encodeURIComponent(`/cards/${id}/responses`)}`);
  }, [signedOut, router, id]);

  const canRead = header.data ? header.data.role !== "VIEWER" : false;
  const publication = usePublication(id, canRead);
  const forms = useQuery({ queryKey: ["card-forms", id], queryFn: ({ signal }) => cardsApi.forms(id, signal), enabled: canRead, retry: false, refetchOnWindowFocus: false });

  const list = forms.data ?? [];
  const selected: CardForm | undefined = list.find((form) => form.blockId === tabId) ?? list[0];

  // Gõ tới đâu tìm tới đó, nhưng chờ 300ms cho khỏi gọi server mỗi phím.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(typed.trim()), 300);
    return () => clearTimeout(timer);
  }, [typed]);

  const responses = useInfiniteQuery({
    queryKey: ["form-responses", id, selected?.blockId ?? "", status, search],
    queryFn: ({ pageParam, signal }) =>
      cardsApi.responses(
        id,
        {
          blockId: selected!.blockId,
          ...(status === "ALL" ? {} : { status }),
          ...(search ? { search } : {}),
          first: PAGE,
          ...(pageParam ? { after: pageParam } : {}),
        },
        signal,
      ),
    initialPageParam: "",
    getNextPageParam: (last) => (last.pageInfo.hasNextPage && last.pageInfo.endCursor ? last.pageInfo.endCursor : undefined),
    enabled: Boolean(selected),
    refetchOnWindowFocus: false,
  });

  // `summary` và `counts` tính trên mọi dòng của khối nên trang nào cũng như nhau; lấy trang đầu cho gọn.
  const first = responses.data?.pages[0];
  const rows = responses.data?.pages.flatMap((page) => page.nodes) ?? [];
  const columns = selected ? columnsOf(selected, rows) : [];

  const refresh = () => Promise.all([queryClient.invalidateQueries({ queryKey: ["form-responses", id] }), queryClient.invalidateQueries({ queryKey: ["card-forms", id] })]);
  const change = useMutation({
    mutationFn: ({ responseId, next }: { responseId: string; next: ResponseStatus }) => cardsApi.setResponseStatus(responseId, next),
    onSuccess: async () => {
      toast.success("Đã cập nhật trạng thái.");
      await refresh();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  const remove = useMutation({
    mutationFn: (responseId: string) => cardsApi.deleteResponse(responseId),
    onSuccess: async () => {
      setDeleting(null);
      toast.success("Đã xoá câu trả lời.");
      await refresh();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const pick = (blockId: string) => {
    setTabId(blockId);
    setStatus("ALL");
    setTyped("");
    setSearch("");
  };

  const body = () => {
    if (signedOut) return <p className="text-sm text-muted-foreground">Đang chuyển tới trang đăng nhập...</p>;
    if (header.isError) return <p className="text-sm text-destructive">{errorMessage(header.error)}</p>;
    if (header.isPending) return <p className="text-sm text-muted-foreground">Đang tải...</p>;
    if (header.data.role === "VIEWER") return <p className="text-sm text-muted-foreground">Bạn chỉ có quyền xem thiệp này, không xem được phản hồi.</p>;
    if (publication.isPending) return <p className="text-sm text-muted-foreground">Đang tải...</p>;
    if (publication.isError) return <p className="text-sm text-destructive">{errorMessage(publication.error)}</p>;
    if (!publication.data)
      return (
        <div className={cn(CARD, "p-6 text-sm")}>
          <p className="font-semibold">Thiệp chưa được xuất bản.</p>
          <p className="mt-1 text-muted-foreground">Xuất bản thiệp để gửi liên kết cho khách; câu trả lời của họ sẽ hiện ở đây.</p>
        </div>
      );
    if (forms.isError) return <p className="text-sm text-destructive">{errorMessage(forms.error)}</p>;
    if (forms.isPending) return <p className="text-sm text-muted-foreground">Đang tải...</p>;
    if (!selected)
      return (
        <div className={cn(CARD, "p-6 text-sm")}>
          <p className="font-semibold">Thiệp chưa có biểu mẫu nào.</p>
          <p className="mt-1 text-muted-foreground">Thêm khối Biểu mẫu vào thiệp rồi xuất bản để nhận câu trả lời.</p>
        </div>
      );

    return (
      <>
        <div role="tablist" aria-label="Biểu mẫu của thiệp" className="flex flex-wrap gap-2">
          {list.map((form) => {
            const on = form.blockId === selected.blockId;
            return (
              <button
                key={form.blockId}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => pick(form.blockId)}
                className={cn("inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm transition-colors", on ? "bg-primary font-semibold text-primary-foreground" : "bg-background font-medium text-foreground hover:bg-muted")}
              >
                <span className="max-w-[220px] truncate">{form.heading || "Biểu mẫu"}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", on ? "bg-white/20" : "bg-muted text-primary")}>{form.total}</span>
                {form.removed && <span className={cn("text-xs", on ? "text-primary-foreground/80" : "text-muted-foreground")}>đã gỡ</span>}
              </button>
            );
          })}
        </div>

        <div className={cn(CARD, "mt-4 p-5")}>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Tổng số phản hồi</p>
          <p className="mt-1 text-3xl font-bold">{first ? first.counts.visible + first.counts.hidden + first.counts.pending : "—"}</p>
          {first && first.summary.length > 0 && (
            <dl className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
              {first.summary.map((view) => (
                <div key={view.fieldId} className="flex items-baseline justify-between gap-4 text-sm">
                  <dt className="min-w-0 truncate font-medium">{view.label}</dt>
                  <dd className="flex-none text-muted-foreground">{summaryLine(view)}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label className="flex h-11 min-w-[220px] flex-1 items-center gap-2 rounded-full bg-background px-4 text-muted-foreground shadow-[0_1px_2px_rgba(42,34,36,0.04)]">
            <MagnifyingGlassIcon className="size-[18px] flex-none" />
            <input type="search" value={typed} onChange={(event) => setTyped(event.target.value)} placeholder="Tìm trong câu trả lời" aria-label="Tìm trong câu trả lời" className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
          </label>
          {selected.publicList && (
            <div role="group" aria-label="Lọc theo trạng thái" className="inline-flex rounded-full border border-input bg-background p-0.5">
              {FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={status === filter.value}
                  onClick={() => setStatus(filter.value)}
                  className={cn("inline-flex h-10 items-center rounded-full px-3.5 text-sm", status === filter.value ? "bg-muted font-semibold text-accent-foreground" : "font-medium hover:bg-muted")}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}
          <Button type="button" variant="outline" disabled className="h-11 rounded-full px-4" title="Sắp có" onClick={undefined}>
            <DownloadSimpleIcon className="size-[18px]" /> Tải về CSV
          </Button>
        </div>

        <div className={cn(CARD, "mt-4 overflow-x-auto")}>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-muted/50 text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                {columns.map((column) => (
                  <th key={column.id} scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">
                    {column.label}
                  </th>
                ))}
                <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">
                  Gửi lúc
                </th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Thao tác</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id} className={cn(row.status === "PENDING" && "bg-[#fdf9ef]")}>
                  {columns.map((column) => (
                    <td key={column.id} className="max-w-[320px] px-4 py-3 align-top">
                      <Answer column={column} row={row} />
                    </td>
                  ))}
                  <td className="px-4 py-3 align-top whitespace-nowrap text-muted-foreground">
                    {sentAt(row.createdAt)}
                    {selected.publicList && <span className={cn("ml-2 rounded-full px-2 py-0.5 text-xs font-semibold", stateLabel(row.status) ? "bg-muted text-primary" : "bg-[#eef4ec] text-[#3f6b46]")}>{stateLabel(row.status) ?? "Hiện"}</span>}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex justify-end gap-1">
                      {selected.publicList && row.status === "VISIBLE" && (
                        <Button type="button" variant="ghost" size="sm" className="rounded-full" disabled={change.isPending} onClick={() => change.mutate({ responseId: row.id, next: "HIDDEN" })}>
                          Ẩn
                        </Button>
                      )}
                      {selected.publicList && row.status === "HIDDEN" && (
                        <Button type="button" variant="ghost" size="sm" className="rounded-full" disabled={change.isPending} onClick={() => change.mutate({ responseId: row.id, next: "VISIBLE" })}>
                          Hiện
                        </Button>
                      )}
                      {selected.publicList && row.status === "PENDING" && (
                        <Button type="button" variant="ghost" size="sm" className="rounded-full font-semibold text-primary" disabled={change.isPending} onClick={() => change.mutate({ responseId: row.id, next: "VISIBLE" })}>
                          Duyệt
                        </Button>
                      )}
                      <Button type="button" variant="ghost" size="icon-sm" aria-label="Xoá câu trả lời" className="rounded-full text-muted-foreground hover:text-destructive" onClick={() => setDeleting(row)}>
                        <TrashIcon className="size-[18px]" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {responses.isPending ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">Đang tải...</p>
          ) : responses.isError ? (
            <p className="px-5 py-8 text-center text-sm text-destructive">{errorMessage(responses.error)}</p>
          ) : rows.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">{search || status !== "ALL" ? "Không có câu trả lời nào khớp." : "Chưa có ai gửi. Chia sẻ liên kết thiệp để khách điền."}</p>
          ) : null}

          {responses.hasNextPage && (
            <div className="border-t border-border px-5 py-3 text-center">
              <Button type="button" variant="ghost" className="rounded-full" disabled={responses.isFetchingNextPage} onClick={() => responses.fetchNextPage()}>
                {responses.isFetchingNextPage ? "Đang tải..." : "Xem thêm"}
              </Button>
            </div>
          )}
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
        <span className="text-sm text-muted-foreground">Phản hồi{header.data ? `: ${header.data.title}` : ""}</span>
      </header>
      <main className="mx-auto w-full max-w-[1100px] px-4 py-8">{body()}</main>

      <AlertDialog open={deleting !== null} onOpenChange={(open) => (open ? undefined : setDeleting(null))}>
        <AlertDialogContent className="rounded-3xl p-8 sm:max-w-[440px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Xoá câu trả lời này?</AlertDialogTitle>
            <AlertDialogDescription>Câu trả lời sẽ bị xoá vĩnh viễn và không hiện trong tệp CSV nữa.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0">
            <AlertDialogCancel className="h-11 rounded-full px-5">Giữ lại</AlertDialogCancel>
            <AlertDialogAction
              disabled={remove.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (deleting) remove.mutate(deleting.id);
              }}
              className="h-11 rounded-full bg-destructive px-5 font-semibold text-white hover:bg-destructive/90"
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
