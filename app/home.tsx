"use client";

// TRANG CHỦ MẪU, XÀI ĐỠ. Chỉ là chỗ để có nút Tạo thiệp và danh sách thiệp trong lúc trang chủ thật (bản vẽ I) chưa làm.
// Khi làm bản vẽ I thì thay cả trang này; đừng chỉnh style kỹ ở đây.

import { AppShell } from "@/components/app/app-shell";
import { CardGrid, CreateCardButton } from "@/components/cards/card-list";

export function Home() {
  return (
    <AppShell active="home">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Thiệp của tôi</h1>
          <p className="text-sm text-muted-foreground">Tạo thiệp mới hoặc mở thiệp đã làm.</p>
        </div>
        <CreateCardButton />
      </div>
      <CardGrid />
    </AppShell>
  );
}
