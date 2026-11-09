import { pageMeta } from "@miditor/render";
import { CardPlayer } from "@/components/cards/card-player";
import { normalizeCardDocument, getStartPage } from "@/lib/cards/document";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import { fetchPublicPage } from "@/lib/publications/public-page";
import styles from "./published-card.module.css";

// Trang công khai của thiệp đã xuất bản: dựng phía server từ bản chụp lúc xuất bản. cacheComponents bật: đọc params
// phải nằm trong Suspense. Một lần tải dùng chung cho nội dung và metadata.
const getPage = cache((slug: string) => fetchPublicPage(slug));

export async function generateMetadata({ params }: PageProps<"/thiep/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: "Không tìm thấy thiệp" };
  const meta = pageMeta(getStartPage(normalizeCardDocument(page.document)).data);
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
  // `slug` cho khối form biết gửi lên thiệp nào; nơi khác (editor, trang mẫu, ảnh thu nhỏ) không truyền nên form chỉ để xem.
  return (
    <main className={styles.viewport}>
      <div className={styles.paper}>
        <CardPlayer document={normalizeCardDocument(page.document)} mode="published" historyKey={`public:${slug}`} metadata={{ mode: "live", slug }} />
      </div>
    </main>
  );
}

export default function PublishedRoute({ params }: PageProps<"/thiep/[slug]">) {
  return (
    <Suspense>
      <PublishedCard params={params} />
    </Suspense>
  );
}
