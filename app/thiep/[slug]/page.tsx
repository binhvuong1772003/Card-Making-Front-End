import { Render, pageMeta } from "@miditor/render";
import type { PageData } from "@miditor/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import { fetchPublicPage } from "@/lib/publications/public-page";

// Trang công khai của thiệp đã xuất bản: dựng phía server từ bản chụp lúc xuất bản. cacheComponents bật: đọc params
// phải nằm trong Suspense. Một lần tải dùng chung cho nội dung và metadata.
const getPage = cache((slug: string) => fetchPublicPage(slug));

export async function generateMetadata({ params }: PageProps<"/thiep/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: "Không tìm thấy thiệp" };
  const meta = pageMeta(page.document as unknown as PageData);
  const title = meta.title ?? page.title;
  return {
    title,
    description: meta.description,
    openGraph: { title, description: meta.description, images: meta.image ? [meta.image] : undefined, type: "website" },
  };
}

async function PublishedCard({ params }: Pick<PageProps<"/thiep/[slug]">, "params">) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();
  return <Render data={page.document as unknown as PageData} responsive={{ scale: true }} />;
}

export default function PublishedRoute({ params }: PageProps<"/thiep/[slug]">) {
  return (
    <Suspense>
      <PublishedCard params={params} />
    </Suspense>
  );
}
