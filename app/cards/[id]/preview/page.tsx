import { Suspense } from "react";
import { CardPreview } from "@/components/cards/card-preview";

// cacheComponents bật: đọc params phải nằm trong Suspense.
async function PreviewContent({ params }: Pick<PageProps<"/cards/[id]/preview">, "params">) {
  const { id } = await params;
  return <CardPreview id={id} />;
}

export default function PreviewRoute({ params }: PageProps<"/cards/[id]/preview">) {
  return (
    <Suspense>
      <PreviewContent params={params} />
    </Suspense>
  );
}
