import { Suspense } from "react";
import { CardResponses } from "@/components/cards/responses-page";

// cacheComponents bật: đọc params phải nằm trong Suspense.
async function ResponsesContent({ params }: Pick<PageProps<"/cards/[id]/responses">, "params">) {
  const { id } = await params;
  return <CardResponses id={id} />;
}

export default function ResponsesRoute({ params }: PageProps<"/cards/[id]/responses">) {
  return (
    <Suspense>
      <ResponsesContent params={params} />
    </Suspense>
  );
}
