import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryPage } from "@/components/gallery/category-page";
import { occasionFromSlug } from "@/lib/cards/occasions";

// cacheComponents bật: đọc params phải nằm trong Suspense.
async function CategoryContent({ params }: Pick<PageProps<"/kham-pha/[slug]">, "params">) {
  const { slug } = await params;
  const category = occasionFromSlug(slug);
  if (!category || category === "OTHER") notFound();
  return <CategoryPage category={category} />;
}

export default function CategoryRoute({ params }: PageProps<"/kham-pha/[slug]">) {
  return (
    <Suspense>
      <CategoryContent params={params} />
    </Suspense>
  );
}
