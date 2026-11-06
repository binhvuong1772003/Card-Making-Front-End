"use client";

import { Editor, type PageData, type SaveStatus } from "@miditor/editor";
import { vi } from "@miditor/editor/locales/vi";
import "@miditor/editor/style.css";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { errorMessage } from "@/lib/auth/messages";
import type { CardDetail } from "@/lib/cards/api";
import { createCardSaver } from "@/lib/cards/card-saver";
import { cardAppearance } from "./card-appearance";
import { phosphorIcons } from "./phosphor-icons";
import { StatusSeal, type SealState } from "./status-seal";

// Giữ tham chiếu ổn định: Miditor đọc lại các prop này ở mỗi lần dựng.
const i18n = { locale: "vi", messages: vi };
const config = { icons: phosphorIcons };
const VIEW_ONLY = { canEdit: false, canDelete: false, canDuplicate: false, canDrag: false, canAdd: false };

const SEAL: Record<SaveStatus, { state: SealState; label: string }> = {
  saved: { state: "saved", label: "Đã lưu" },
  saving: { state: "pending", label: "Đang lưu" },
  unsaved: { state: "pending", label: "Có thay đổi chưa lưu" },
  error: { state: "error", label: "Không lưu được" },
};

const actionStyle = {
  height: 36,
  padding: "0 16px",
  borderRadius: "var(--miditor-radius)",
  fontWeight: 500,
  opacity: 0.5,
  cursor: "not-allowed",
} as const;

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
    <Editor
      data={page}
      onChange={viewOnly ? undefined : saver.save}
      onChangeDebounce={800}
      status={status}
      permissions={viewOnly ? VIEW_ONLY : undefined}
      appearance={cardAppearance}
      i18n={i18n}
      config={config}
      logo={
        <Link href="/" style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--miditor-text)", textDecoration: "none" }}>
          CardMaking
        </Link>
      }
      headerStart={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 600, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.title}</span>
          <StatusSeal title={card.title} state={seal.state} label={seal.label} />
        </span>
      }
      headerActions={
        <>
          <button type="button" disabled title="Chưa có" style={{ ...actionStyle, border: "1px solid var(--miditor-border-input)", background: "transparent", color: "var(--miditor-text)" }}>
            Xem trước
          </button>
          <button type="button" disabled title="Chưa có" style={{ ...actionStyle, border: 0, background: "var(--miditor-accent)", color: "var(--miditor-on-accent)", fontWeight: 600 }}>
            Xuất bản
          </button>
        </>
      }
    />
  );
}
