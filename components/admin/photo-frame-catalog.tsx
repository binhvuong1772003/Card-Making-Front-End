"use client";

import { SHAPE_NAMES } from "@miditor/core";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { catalogApi } from "@/lib/cards/catalog-api";

export function PhotoFrameCatalog() {
  const queryClient = useQueryClient();
  const [id, setId] = useState("");
  const [label, setLabel] = useState("");
  const [geometry, setGeometry] = useState<string>(SHAPE_NAMES[0] ?? "rectangle");
  const [maskPath, setMaskPath] = useState("");
  const [width, setWidth] = useState(240);
  const [height, setHeight] = useState(240);
  const frames = useInfiniteQuery({ queryKey: ["catalog", "frames"], initialPageParam: undefined as string | undefined, queryFn: ({ pageParam, signal }) => catalogApi.frames(24, pageParam, signal), getNextPageParam: (last) => last.pageInfo.hasNextPage ? last.pageInfo.endCursor ?? undefined : undefined });
  const add = useMutation({
    mutationFn: () => catalogApi.saveFrame({ id: id.trim().toLowerCase(), label: label.trim(), category: "Khung ảnh", geometry, maskPath: geometry === "custom" ? maskPath.trim() : null, width, height, sortOrder: 0 }),
    onSuccess: async () => { toast.success("Đã lưu khung ảnh."); setId(""); setLabel(""); setMaskPath(""); await queryClient.invalidateQueries({ queryKey: ["catalog", "frames"] }); },
    onError: (error: unknown) => toast.error(error instanceof Error ? error.message : "Không lưu được khung ảnh."),
  });
  const retire = useMutation({
    mutationFn: catalogApi.retireFrame,
    onSuccess: async () => { toast.success("Đã ẩn khung ảnh khỏi thư viện."); await queryClient.invalidateQueries({ queryKey: ["catalog", "frames"] }); },
    onError: () => toast.error("Không ẩn được khung ảnh."),
  });
  const allFrames = frames.data?.pages.flatMap((page) => page.nodes) ?? [];

  return <div className="flex w-full flex-col gap-6">
    <header><h1 className="text-[26px] font-bold tracking-tight">Thư viện khung ảnh</h1><p className="mt-1.5 text-sm text-muted-foreground">Thêm hình dạng mới mà không tạo block riêng.</p></header>
    <form className="grid gap-3 rounded-3xl bg-background p-5 shadow-sm sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); add.mutate(); }}>
      <label className="flex flex-col gap-1.5 text-sm font-medium">Mã khung<input value={id} onChange={(event) => setId(event.target.value.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase())} required maxLength={80} placeholder="hoa-5-canh" className="h-11 rounded-xl border border-input bg-page px-3 text-sm font-normal" /></label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">Tên hiển thị<input value={label} onChange={(event) => setLabel(event.target.value)} required maxLength={80} placeholder="Hoa năm cánh" className="h-11 rounded-xl border border-input bg-page px-3 text-sm font-normal" /></label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">Hình nền<select value={geometry} onChange={(event) => setGeometry(event.target.value)} className="h-11 rounded-xl border border-input bg-page px-3 text-sm font-normal">{SHAPE_NAMES.map((shape) => <option key={shape} value={shape}>{shape}</option>)}<option value="custom">Silhouette SVG</option></select></label>
      {geometry === "custom" && <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2">Đường dẫn SVG d (viewBox 0 0 100 100)<textarea value={maskPath} onChange={(event) => setMaskPath(event.target.value)} required maxLength={4000} rows={3} className="rounded-xl border border-input bg-page px-3 py-2 text-sm font-normal" /></label>}
      <label className="flex flex-col gap-1.5 text-sm font-medium">Rộng<input type="number" min={40} max={2000} value={width} onChange={(event) => setWidth(Number(event.target.value))} className="h-11 rounded-xl border border-input bg-page px-3 text-sm font-normal" /></label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">Cao<input type="number" min={40} max={2000} value={height} onChange={(event) => setHeight(Number(event.target.value))} className="h-11 rounded-xl border border-input bg-page px-3 text-sm font-normal" /></label>
      <button type="submit" disabled={add.isPending} className="h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50 sm:col-span-2">{add.isPending ? "Đang lưu…" : "Thêm khung"}</button>
    </form>
    {frames.isPending ? <p className="text-sm text-muted-foreground">Đang tải thư viện…</p> : frames.isError ? <p role="alert" className="text-sm text-destructive">Không tải được thư viện khung.</p> : allFrames.length === 0 ? <p className="rounded-3xl bg-background p-8 text-center text-sm text-muted-foreground">Chưa có khung ảnh.</p> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {allFrames.map((frame) => <article key={frame.id} className="flex items-center justify-between gap-2 rounded-2xl bg-background p-4 shadow-sm"><div className="min-w-0"><p className="truncate text-sm font-semibold">{frame.label}</p><p className="truncate text-xs text-muted-foreground">{frame.id} · {frame.geometry}</p></div><button type="button" disabled={retire.isPending} onClick={() => retire.mutate(frame.id)} className="rounded-full px-2 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10">Ẩn</button></article>)}
      {frames.hasNextPage && <button type="button" disabled={frames.isFetchingNextPage} onClick={() => frames.fetchNextPage()} className="col-span-full mx-auto rounded-full bg-muted px-5 py-2.5 text-sm font-semibold disabled:opacity-60">{frames.isFetchingNextPage ? "Đang tải…" : "Tải thêm"}</button>}
    </div>}
  </div>;
}
