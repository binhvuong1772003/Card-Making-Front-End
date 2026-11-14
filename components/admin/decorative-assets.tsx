"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { catalogApi } from "@/lib/cards/catalog-api";
import { uploadCatalogImage } from "@/lib/assets/upload-image";

export function DecorativeAssets() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Hoa & lá");
  const [tags, setTags] = useState("");
  const [tintable, setTintable] = useState(false);
  const assets = useInfiniteQuery({ queryKey: ["catalog", "decorations"], initialPageParam: undefined as string | undefined, queryFn: ({ pageParam, signal }) => catalogApi.decorations({ first: 24, after: pageParam }, signal), getNextPageParam: (last) => last.pageInfo.hasNextPage ? last.pageInfo.endCursor ?? undefined : undefined });
  const add = useMutation({
    mutationFn: async () => {
      if (!file || !name.trim()) throw new Error("Chọn ảnh và nhập tên trước nhé.");
      const uploaded = await uploadCatalogImage(file);
      return catalogApi.createDecoration({ name: name.trim(), category: category.trim() || "Khác", tags: [...new Set([...tags.split(",").map((tag) => tag.trim()).filter(Boolean), ...(tintable ? ["đổi màu"] : [])])], ...uploaded, sortOrder: 0 });
    },
    onSuccess: async () => {
      toast.success("Đã thêm vào thư viện trang trí.");
      setFile(null); setName(""); setTags(""); setTintable(false);
      await queryClient.invalidateQueries({ queryKey: ["catalog", "decorations"] });
    },
    onError: (error: unknown) => toast.error(error instanceof Error ? error.message : "Không thêm được ảnh."),
  });
  const retire = useMutation({
    mutationFn: catalogApi.retireDecoration,
    onSuccess: async () => { toast.success("Đã ẩn khỏi thư viện."); await queryClient.invalidateQueries({ queryKey: ["catalog", "decorations"] }); },
    onError: () => toast.error("Không ẩn được ảnh."),
  });
  const allAssets = assets.data?.pages.flatMap((page) => page.nodes) ?? [];

  return (
    <div className="flex w-full flex-col gap-6">
      <header>
        <h1 className="text-[26px] font-bold tracking-tight">Thư viện trang trí</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Tải hoa, cành lá và chi tiết trang trí lên Cloudinary để dùng trong editor.</p>
      </header>
      <form className="grid gap-3 rounded-3xl bg-background p-5 shadow-sm sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); add.mutate(); }}>
        <label className="flex flex-col gap-1.5 text-sm font-medium">Ảnh PNG, SVG, JPG hoặc WebP
          <input type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="rounded-xl border border-input bg-page p-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">Tên
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required placeholder="Ví dụ: Cành hoa trắng" className="h-11 rounded-xl border border-input bg-page px-3 text-sm font-normal" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">Nhóm
          <input value={category} onChange={(event) => setCategory(event.target.value)} maxLength={60} className="h-11 rounded-xl border border-input bg-page px-3 text-sm font-normal" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">Từ khóa, cách nhau bằng dấu phẩy
          <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="trắng, hoa, góc trang" className="h-11 rounded-xl border border-input bg-page px-3 text-sm font-normal" />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
          <input type="checkbox" checked={tintable} onChange={(event) => setTintable(event.target.checked)} />
          Cho phép đổi màu trong trình thiết kế
        </label>
        <button type="submit" disabled={add.isPending || !file} className="h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50 sm:col-span-2">
          {add.isPending ? "Đang tải lên…" : "Thêm vào thư viện"}
        </button>
      </form>
      {assets.isPending ? <p className="text-sm text-muted-foreground">Đang tải thư viện…</p> : assets.isError ? <p role="alert" className="text-sm text-destructive">Không tải được thư viện trang trí.</p> : allAssets.length === 0 ? <p className="rounded-3xl bg-background p-8 text-center text-sm text-muted-foreground">Chưa có chi tiết trang trí nào.</p> : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {allAssets.map((asset) => <article key={asset.id} className="overflow-hidden rounded-2xl bg-background p-3 shadow-sm">
            <div className="grid aspect-square place-items-center rounded-xl bg-page p-3"><img src={asset.url} alt="" className="max-h-full max-w-full object-contain" /></div>
            <div className="mt-3 flex items-start justify-between gap-2"><div className="min-w-0"><h2 className="truncate text-sm font-semibold">{asset.name}</h2><p className="text-xs text-muted-foreground">{asset.category}</p></div>
              <button type="button" disabled={retire.isPending} onClick={() => retire.mutate(asset.id)} className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10">Ẩn</button>
            </div>
          </article>)}
          {assets.hasNextPage && <button type="button" disabled={assets.isFetchingNextPage} onClick={() => assets.fetchNextPage()} className="col-span-full mx-auto rounded-full bg-muted px-5 py-2.5 text-sm font-semibold disabled:opacity-60">{assets.isFetchingNextPage ? "Đang tải…" : "Tải thêm"}</button>}
        </div>
      )}
    </div>
  );
}
