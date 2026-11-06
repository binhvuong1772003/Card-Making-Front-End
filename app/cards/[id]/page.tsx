import { Suspense } from "react";
import { editorFont } from "@/components/editor/fonts";
import { CardPage } from "./card-page";

// cacheComponents bật: đọc params phải nằm trong Suspense.
async function CardContent({ params }: Pick<PageProps<"/cards/[id]">, "params">) {
  const { id } = await params;
  return <CardPage id={id} />;
}

export default function CardRoute({ params }: PageProps<"/cards/[id]">) {
  return (
    <div className={editorFont.variable} style={{ height: "100dvh" }}>
      <Suspense>
        <CardContent params={params} />
      </Suspense>
    </div>
  );
}
