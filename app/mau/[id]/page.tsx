import { Suspense } from "react";
import { TemplateView } from "@/components/gallery/template-view";

// cacheComponents bật: đọc params phải nằm trong Suspense.
async function TemplateContent({ params }: Pick<PageProps<"/mau/[id]">, "params">) {
  const { id } = await params;
  return <TemplateView id={id} />;
}

export default function TemplateRoute({ params }: PageProps<"/mau/[id]">) {
  return (
    <Suspense>
      <TemplateContent params={params} />
    </Suspense>
  );
}
