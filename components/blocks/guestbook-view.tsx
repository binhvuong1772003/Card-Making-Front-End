"use client";

import { type CSSProperties, type FormEvent, useEffect, useId, useState } from "react";
import { type FieldErrors, formErrorMessage, formFieldErrors } from "@/lib/cards/forms/api";
import { fetchGuestbook, type GuestbookEntry, submitGuestbook, validateGuestbook } from "@/lib/cards/forms/guestbook";

// Vẽ khối Sổ lưu bút. Như khối Xác nhận tham dự: chỉ trang thật (`live`) có `slug` mới gọi mạng; editor, ảnh thu nhỏ và trang mẫu thấy
// form khoá cùng vài lời chúc ví dụ để chủ thiệp biết khối trông thế nào. Nền, viền, bo góc, bóng là của Miditor nên ở đây không có.
export type GuestbookMode = "live" | "edit" | "static";

export interface GuestbookViewProps {
  blockId: string;
  /** Slug của thiệp đã xuất bản; rỗng khi không phải trang thật. */
  slug: string;
  heading: string;
  intro: string;
  button: string;
  moderation: boolean;
  pageSize: number;
  color: string;
  padding: number;
  mode: GuestbookMode;
}

// Lời chúc mẫu cho bản xem thử; giờ viết sẵn để server và trình duyệt không lệch nhau khi dựng.
const SAMPLES = [
  { id: "mau-1", name: "Minh Anh", message: "Chúc hai bạn trăm năm hạnh phúc, sớm có tin vui!", time: "01/01 09:00" },
  { id: "mau-2", name: "Gia đình cô Hoa", message: "Chúc mừng ngày trọng đại của hai con.", time: "01/01 10:30" },
  { id: "mau-3", name: "Tuấn", message: "Hẹn gặp ở đám cưới nhé!", time: "01/01 12:15" },
];

const pad = (value: number) => String(value).padStart(2, "0");

// `dd/MM HH:mm` theo giờ trình duyệt của khách.
const timeOf = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export function GuestbookView(props: GuestbookViewProps) {
  const live = props.mode === "live" && props.slug !== "";
  const uid = useId();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  // Bắt đầu ở trạng thái "đang tải": tránh đặt state ngay trong effect và tránh nháy "chưa có lời chúc" trước lần tải đầu.
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState("");
  const [failed, setFailed] = useState(false);

  // Tải trang lời chúc đầu tiên sau khi gắn vào trình duyệt; bản xem thử không gọi mạng.
  useEffect(() => {
    if (!live) return;
    let cancelled = false;
    fetchGuestbook({ slug: props.slug, blockId: props.blockId, first: props.pageSize })
      .then((page) => {
        if (cancelled) return;
        setEntries(page.entries);
        setCursor(page.nextCursor);
      })
      .catch((err) => {
        if (!cancelled) {
          setNotice(formErrorMessage(err));
          setFailed(true);
        }
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [live, props.slug, props.blockId, props.pageSize]);

  const loadMore = async () => {
    if (!cursor || more) return;
    setMore(true);
    setNotice("");
    try {
      const page = await fetchGuestbook({ slug: props.slug, blockId: props.blockId, first: props.pageSize, after: cursor });
      setEntries((old) => {
        const seen = new Set(old.map((entry) => entry.id));
        return [...old, ...page.entries.filter((entry) => !seen.has(entry.id))];
      });
      setCursor(page.nextCursor);
    } catch (err) {
      setNotice(formErrorMessage(err));
      setFailed(true);
    } finally {
      setMore(false);
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending) return;
    const found = validateGuestbook({ name, message });
    setErrors(found);
    setNotice("");
    setFailed(false);
    if (Object.keys(found).length > 0) return;

    setSending(true);
    try {
      const result = await submitGuestbook({ slug: props.slug, blockId: props.blockId, name: name.trim(), message: message.trim() });
      // Chờ duyệt thì chưa có gì để chèn; chỉ báo khách.
      if (result.entry) setEntries((old) => [result.entry as GuestbookEntry, ...old]);
      setNotice(result.status === "VISIBLE" ? "Cảm ơn bạn. Lời chúc đã hiện trong sổ." : "Cảm ơn bạn. Lời chúc sẽ hiện sau khi chủ thiệp duyệt.");
      setMessage("");
    } catch (err) {
      setErrors(formFieldErrors(err));
      setNotice(formErrorMessage(err));
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  const color = props.color;
  const label: CSSProperties = { display: "block", fontSize: 13, opacity: 0.85, marginBottom: 4, textAlign: "left" };
  const field: CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    minHeight: 44,
    border: `1px solid ${color}73`,
    borderRadius: 8,
    background: "transparent",
    color,
    padding: "10px 12px",
    font: "inherit",
    fontSize: 15,
    outlineColor: color,
  };
  const problem = (name2: "name" | "message") =>
    errors[name2] ? (
      <div id={`${uid}-${name2}-error`} role="alert" style={{ color: "#b3261e", fontSize: 12, marginTop: 4, textAlign: "left" }}>
        {errors[name2]}
      </div>
    ) : null;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        padding: props.padding,
        color,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        overflowY: "auto",
        overscrollBehavior: "contain",
        textAlign: "center",
        pointerEvents: live ? "auto" : "none",
      }}
    >
      {props.heading.trim() && <div style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" }}>{props.heading}</div>}

      <form onSubmit={onSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {props.intro.trim() && <div style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.85, whiteSpace: "pre-wrap" }}>{props.intro}</div>}

        <div>
          <label htmlFor={`${uid}-name`} style={label}>
            Tên của bạn *
          </label>
          <input
            id={`${uid}-name`}
            type="text"
            autoComplete="name"
            maxLength={60}
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={!live || sending}
            aria-required="true"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${uid}-name-error` : undefined}
            style={field}
          />
          {problem("name")}
        </div>

        <div>
          <label htmlFor={`${uid}-message`} style={label}>
            Lời chúc *
          </label>
          <textarea
            id={`${uid}-message`}
            rows={3}
            maxLength={500}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={!live || sending}
            aria-required="true"
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? `${uid}-message-error` : undefined}
            style={{ ...field, minHeight: 72, resize: "vertical" }}
          />
          {message.length > 400 && (
            <div style={{ fontSize: 11, opacity: 0.7, textAlign: "right", marginTop: 2 }}>
              {message.length}/500
            </div>
          )}
          {problem("message")}
        </div>

        {/* Ô ẩn chống thư rác: người thật không thấy, máy điền mới điền; luôn gửi chuỗi rỗng. */}
        <div aria-hidden="true" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>
          <label htmlFor={`${uid}-website`}>Để trống</label>
          <input id={`${uid}-website`} type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
        </div>

        <button
          type="submit"
          disabled={!live || sending}
          style={{
            minHeight: 44,
            width: "100%",
            border: 0,
            borderRadius: 9999,
            background: color,
            color: "#fff",
            font: "inherit",
            fontSize: 15,
            fontWeight: 500,
            padding: "10px 16px",
            cursor: sending ? "default" : "pointer",
            opacity: sending ? 0.7 : 1,
          }}
        >
          {sending ? "Đang gửi…" : props.button}
        </button>
        {notice && (
          <div role={failed ? "alert" : "status"} style={{ color: failed ? "#b3261e" : color, fontSize: 13, lineHeight: 1.5 }}>
            {notice}
          </div>
        )}
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
        {!live ? (
          <>
            <div style={{ fontSize: 11, opacity: 0.6 }}>Ví dụ</div>
            {SAMPLES.map((entry) => (
              <div key={entry.id}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{entry.name}</div>
                <div style={{ fontSize: 11, opacity: 0.6 }}>{entry.time}</div>
                <div style={{ fontSize: 14, lineHeight: 1.5 }}>{entry.message}</div>
              </div>
            ))}
          </>
        ) : loading ? (
          <div style={{ fontSize: 13, opacity: 0.7, textAlign: "center" }}>Đang tải lời chúc…</div>
        ) : entries.length === 0 ? (
          ready && (
            <div style={{ fontSize: 13, opacity: 0.7, textAlign: "center" }}>{failed ? "Chưa tải được lời chúc." : "Hãy là người đầu tiên gửi lời chúc."}</div>
          )
        ) : (
          entries.map((entry) => (
            <div key={entry.id}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{entry.name}</div>
              <div style={{ fontSize: 11, opacity: 0.6 }}>{timeOf(entry.createdAt)}</div>
              <div style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{entry.message}</div>
            </div>
          ))
        )}

        {live && cursor && (
          <button
            type="button"
            onClick={loadMore}
            disabled={more}
            style={{ minHeight: 44, border: `1px solid ${color}`, borderRadius: 9999, background: "transparent", color, font: "inherit", fontSize: 14, padding: "8px 16px", cursor: more ? "default" : "pointer", opacity: more ? 0.7 : 1 }}
          >
            {more ? "Đang tải…" : "Xem thêm"}
          </button>
        )}
      </div>

      {props.mode === "edit" && <div style={{ fontSize: 11, opacity: 0.7 }}>Khách sẽ viết lời chúc trên thiệp đã xuất bản.</div>}
    </div>
  );
}
