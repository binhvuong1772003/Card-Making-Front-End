"use client";

import type { JsonValue } from "@miditor/core";
import { useEffect, useState } from "react";
import { fetchPublicGuest, guestCodeFromSearch, recordGuestOpen, withGuestMetadata, type PublicGuest } from "@/lib/cards/guests/guest";

/**
 * Trang công khai (metadata có `slug` và `mode: "live"`) mở bằng link khách `?g=<mã>`: nạp tên và lời chào của khách rồi thêm `guest` và
 * `guestCode` vào metadata. Ở editor, xem thử, ảnh thu nhỏ (không có slug) metadata giữ nguyên và các khối hiện tên mẫu.
 */
export function useGuestMetadata(metadata: JsonValue | undefined): JsonValue | undefined {
  const slug = metadata && typeof metadata === "object" && !Array.isArray(metadata) && metadata.mode === "live" && typeof metadata.slug === "string" ? metadata.slug : undefined;
  const [guest, setGuest] = useState<{ code: string; data: PublicGuest } | null>(null);

  useEffect(() => {
    if (!slug) return;
    const code = guestCodeFromSearch(window.location.search);
    if (!code) return;
    let cancelled = false;
    fetchPublicGuest(slug, code)
      .then((data) => {
        if (cancelled) return;
        setGuest({ code, data });
        // Một lượt mở mỗi phiên trình duyệt, kể cả khi khách tải lại trang.
        const key = `cm-guest-open:${slug}:${code}`;
        try {
          if (!window.sessionStorage.getItem(key)) {
            window.sessionStorage.setItem(key, "1");
            void recordGuestOpen(slug, code);
          }
        } catch {
          // sessionStorage bị chặn: bỏ qua, chỉ mất một lần đếm.
        }
      })
      .catch(() => {
        // Mã sai hay mạng lỗi: thiệp hiện như khách thường, các khối dùng chữ dự phòng.
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return guest ? (withGuestMetadata(metadata, guest.code, guest.data) as JsonValue | undefined) : metadata;
}
