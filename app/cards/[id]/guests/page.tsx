import { Suspense } from "react";
import { CardGuests } from "@/components/cards/guests-page";

// cacheComponents bật: đọc params phải nằm trong Suspense.
async function GuestsContent({ params }: Pick<PageProps<"/cards/[id]/guests">, "params">) {
  const { id } = await params;
  return <CardGuests id={id} />;
}

export default function GuestsRoute({ params }: PageProps<"/cards/[id]/guests">) {
  return (
    <Suspense>
      <GuestsContent params={params} />
    </Suspense>
  );
}
