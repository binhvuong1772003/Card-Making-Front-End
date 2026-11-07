"use client";

import { Editor, EditorProvider, type PageData, type SaveStatus } from "@miditor/editor";
import { vi } from "@miditor/editor/locales/vi";
import "@miditor/editor/style.css";
import "./editor-overrides.css";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/assets/upload-image";
import { errorMessage } from "@/lib/auth/messages";
import type { CardDetail } from "@/lib/cards/api";
import { createCardSaver } from "@/lib/cards/card-saver";
import { cardAppearance } from "./card-appearance";
import { phosphorIcons } from "./phosphor-icons";
import { CardHeader } from "./card-header";
import type { SealState } from "./status-seal";
import { ZoomPill } from "./zoom-pill";

// Giữ tham chiếu ổn định: Miditor đọc lại các prop này ở mỗi lần dựng.
// Lời của trang trống theo bản vẽ; các câu còn lại là bản tiếng Việt có sẵn của Miditor.
const i18n = {
  locale: "vi",
  messages: {
    ...vi,
    "empty.title": "Trang đang trống",
    "empty.text": "Thêm một khối để bắt đầu, hoặc chọn một khối trong thư viện bên trái.",
    "empty.add": "Thêm hộp",
    "empty.open": "Mở thư viện khối",
  },
};
const config = { icons: phosphorIcons, uploadImage };
const VIEW_ONLY = { canEdit: false, canDelete: false, canDuplicate: false, canDrag: false, canAdd: false };

const SEAL: Record<SaveStatus, { state: SealState; label: string }> = {
  saved: { state: "saved", label: "Đã lưu" },
  saving: { state: "pending", label: "Đang lưu" },
  unsaved: { state: "pending", label: "Có thay đổi chưa lưu" },
  error: { state: "error", label: "Không lưu được" },
};

// Ô chứa một phần của Miditor: lưới một hàng để phần đó (panel, canvas) giãn đủ chiều cao.
const cell = { minBlockSize: 0, minInlineSize: 0, overflow: "hidden", display: "grid", gridTemplateRows: "minmax(0, 1fr)" } as const;
// Nền làm việc có lưới chấm (bản vẽ F); màu nền của Miditor được đặt trong suốt để lưới hiện ra.
const DOT_GRID = "radial-gradient(color-mix(in srgb, var(--miditor-accent) 10%, transparent) 1px, transparent 1.2px) 0 0 / 18px 18px, var(--miditor-workspace)";


// Trang soạn thiệp: Miditor với giao diện, icon, tiếng Việt và các chỗ cắm của CardMaking. Tự lưu cả bản nháp sau mỗi thay đổi.
export function CardEditor({ card }: { card: CardDetail }) {
  const [status, setStatus] = useState<SaveStatus>("saved");
  const viewOnly = card.role === "VIEWER";

  const saver = useMemo(
    () =>
      createCardSaver<PageData>(card.id, card.revision, (next, error) => {
        setStatus(next);
        if (next === "error") toast.error(errorMessage(error));
      }),
    [card.id, card.revision],
  );

  // Đang lưu dở hoặc lỗi thì báo trước khi rời trang.
  useEffect(() => {
    if (status !== "saving" && status !== "error") return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);

  const page = card.document.root ? (card.document as unknown as PageData) : undefined; // {} là thiệp mới: mở trang trống
  const seal = SEAL[status];

  return (
    <EditorProvider
      data={page}
      onChange={viewOnly ? undefined : saver.save}
      onChangeDebounce={800}
      status={status}
      permissions={viewOnly ? VIEW_ONLY : undefined}
      appearance={cardAppearance}
      i18n={i18n}
      config={config}
    >
      <div className="card-editor" style={{ display: "grid", gridTemplateRows: "auto minmax(0, 1fr)", blockSize: "100%" }}>
        <CardHeader title={card.title} seal={seal} />
        <div style={{ display: "grid", gridTemplateColumns: "auto 292px minmax(0, 1fr) auto", minBlockSize: 0 }}>
          <Editor.Rail />
          <div style={cell}>
            <Editor.StartPanel />
          </div>
          <div style={{ ...cell, position: "relative", background: DOT_GRID }}>
            <Editor.Canvas />
            <ZoomPill />
          </div>
          <div style={cell}>
            <Editor.Properties />
          </div>
        </div>
      </div>
    </EditorProvider>
  );
}
