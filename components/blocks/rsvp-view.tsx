"use client";

import { type CSSProperties, type FormEvent, useEffect, useId, useState } from "react";
import { ApiError } from "@/lib/api/errors";
import { type FieldErrors, formErrorMessage, formFieldErrors } from "@/lib/cards/forms/api";
import { isClosed, type RsvpAnswer, type RsvpConfig, type RsvpValues, submitRsvp, validateRsvp } from "@/lib/cards/forms/rsvp";

// Vẽ khối Xác nhận tham dự. `mode` như khối Bản đồ; chỉ trang thật (`live`) có `slug` mới gọi mạng, còn editor, ảnh thu nhỏ và trang mẫu
// thấy form khoá để chủ thiệp biết nó trông thế nào. Nền, viền, bo góc, bóng là của Miditor nên ở đây không có; kiểu viết inline vì Render
// đặt lại kiểu.
export type RsvpMode = "live" | "edit" | "static";

export interface RsvpViewProps {
  blockId: string;
  /** Slug của thiệp đã xuất bản; rỗng khi không phải trang thật. */
  slug: string;
  heading: string;
  intro: string;
  button: string;
  askGuests: boolean;
  askPhone: boolean;
  askNote: boolean;
  askMaybe: boolean;
  deadline: string;
  maxGuests: number;
  color: string;
  padding: number;
  mode: RsvpMode;
}

const ANSWERS: { value: RsvpAnswer; label: string }[] = [
  { value: "YES", label: "Có, tôi sẽ đến" },
  { value: "NO", label: "Rất tiếc, không đến được" },
  { value: "MAYBE", label: "Chưa chắc" },
];

// Lời cảm ơn theo đáp án; "Chưa chắc" mời khách gửi lại khi đã chắc.
const THANKS: Record<RsvpAnswer, string> = {
  YES: "Cảm ơn bạn, hẹn gặp bạn!",
  NO: "Cảm ơn bạn đã báo, rất tiếc không có bạn.",
  MAYBE: "Cảm ơn bạn, nếu chắc chắn hơn bạn cứ gửi lại.",
};

const storageKey = (slug: string, blockId: string) => `cmfe-rsvp:${slug}:${blockId}`;
const isAnswer = (value: string | null): value is RsvpAnswer => value === "YES" || value === "NO" || value === "MAYBE";

export function RsvpView(props: RsvpViewProps) {
  const live = props.mode === "live" && props.slug !== "";
  const config: RsvpConfig = {
    askGuests: props.askGuests,
    askPhone: props.askPhone,
    askNote: props.askNote,
    askMaybe: props.askMaybe,
    maxGuests: props.maxGuests,
  };

  const uid = useId();
  const [values, setValues] = useState<RsvpValues>({ name: "", attending: null, guests: 1, phone: "", note: "" });
  const [website, setWebsite] = useState("");
  const [sent, setSent] = useState<RsvpAnswer | null>(null);
  const [closed, setClosed] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState("");

  // Hạn và lời nhắc "đã gửi" đọc sau khi gắn vào trình duyệt: đọc lúc dựng phía server thì giờ máy chủ khác giờ khách và React báo lệch hydration.
  useEffect(() => {
    if (live) setClosed(isClosed(props.deadline, new Date()));
  }, [live, props.deadline]);

  useEffect(() => {
    if (!live) return;
    try {
      const saved = window.localStorage.getItem(storageKey(props.slug, props.blockId));
      if (isAnswer(saved)) setSent(saved);
    } catch {
      // Trình duyệt chặn localStorage: chỉ mất lời nhắc, form vẫn chạy.
    }
  }, [live, props.slug, props.blockId]);

  const set = <K extends keyof RsvpValues>(field: K, value: RsvpValues[K]) => setValues((old) => ({ ...old, [field]: value }));

  // Ô phụ chỉ hiện theo đáp án: chọn Có mới hỏi số khách; Chưa chắc hỏi điện thoại và lời nhắn; Không chỉ hỏi lời nhắn. Bản xem thử hiện
  // hết những gì khối có để chủ thiệp thấy đủ.
  const showGuests = props.askGuests && (!live || values.attending === "YES");
  const showPhone = props.askPhone && (!live || values.attending === "YES" || values.attending === "MAYBE");
  const showNote = props.askNote && (!live || values.attending !== null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending) return;
    const found = validateRsvp(values, config);
    setErrors(found);
    setNotice("");
    if (Object.keys(found).length > 0 || !values.attending) return;

    setSending(true);
    try {
      await submitRsvp({
        slug: props.slug,
        blockId: props.blockId,
        name: values.name.trim(),
        attending: values.attending,
        guests: values.attending === "YES" && props.askGuests ? (values.guests ?? 1) : undefined,
        phone: props.askPhone ? values.phone?.trim() || undefined : undefined,
        note: props.askNote ? values.note?.trim() || undefined : undefined,
      });
      try {
        window.localStorage.setItem(storageKey(props.slug, props.blockId), values.attending);
      } catch {
        // Không nhớ được thì thôi, lần sau khách thấy form trống.
      }
      setSent(values.attending);
    } catch (err) {
      if (err instanceof ApiError && err.code === "CONFLICT" && (err.details as { reason?: unknown } | undefined)?.reason === "CLOSED") {
        setClosed(true);
        return;
      }
      setErrors(formFieldErrors(err));
      setNotice(formErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const again = () => {
    try {
      window.localStorage.removeItem(storageKey(props.slug, props.blockId));
    } catch {
      // Không xoá được thì lần mở sau vẫn thấy lời cảm ơn; không sao.
    }
    setSent(null);
    setValues({ name: "", attending: null, guests: 1, phone: "", note: "" });
    setErrors({});
    setNotice("");
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
  const problem = (name: keyof RsvpValues) =>
    errors[name] ? (
      <div id={`${uid}-${name}-error`} role="alert" style={{ color: "#b3261e", fontSize: 12, marginTop: 4, textAlign: "left" }}>
        {errors[name]}
      </div>
    ) : null;
  const describedBy = (name: keyof RsvpValues) => (errors[name] ? `${uid}-${name}-error` : undefined);

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

      {live && closed ? (
        <div role="status" style={{ fontSize: 15, lineHeight: 1.6, padding: "12px 0" }}>
          Đã hết hạn xác nhận.
        </div>
      ) : live && sent ? (
        <>
          <div role="status" style={{ fontSize: 15, lineHeight: 1.6, padding: "8px 0" }}>
            {THANKS[sent]}
          </div>
          <button
            type="button"
            onClick={again}
            style={{ minHeight: 44, border: `1px solid ${color}`, borderRadius: 9999, background: "transparent", color, font: "inherit", fontSize: 14, padding: "8px 16px", cursor: "pointer" }}
          >
            Gửi thêm một xác nhận
          </button>
        </>
      ) : (
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
              maxLength={100}
              value={values.name}
              onChange={(event) => set("name", event.target.value)}
              disabled={!live || sending}
              aria-required="true"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={describedBy("name")}
              style={field}
            />
            {problem("name")}
          </div>

          <fieldset style={{ border: 0, margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            <legend style={{ ...label, padding: 0 }}>Bạn sẽ đến chứ? *</legend>
            {ANSWERS.filter((answer) => answer.value !== "MAYBE" || props.askMaybe).map((answer) => (
              <label
                key={answer.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  minHeight: 44,
                  boxSizing: "border-box",
                  border: `1px solid ${values.attending === answer.value ? color : `${color}73`}`,
                  borderRadius: 8,
                  padding: "8px 12px",
                  background: values.attending === answer.value ? `${color}14` : "transparent",
                  cursor: live ? "pointer" : "default",
                  textAlign: "left",
                }}
              >
                <input
                  type="radio"
                  name={`${uid}-attending`}
                  value={answer.value}
                  checked={values.attending === answer.value}
                  onChange={() => set("attending", answer.value)}
                  disabled={!live || sending}
                  aria-invalid={errors.attending ? true : undefined}
                  aria-describedby={describedBy("attending")}
                  style={{ accentColor: color, width: 18, height: 18, margin: 0 }}
                />
                <span style={{ fontSize: 15 }}>{answer.label}</span>
              </label>
            ))}
            {problem("attending")}
          </fieldset>

          {showGuests && (
            <div>
              <label htmlFor={`${uid}-guests`} style={label}>
                Số khách
              </label>
              <select
                id={`${uid}-guests`}
                value={values.guests ?? 1}
                onChange={(event) => set("guests", Number(event.target.value))}
                disabled={!live || sending}
                aria-invalid={errors.guests ? true : undefined}
                aria-describedby={describedBy("guests")}
                style={field}
              >
                {Array.from({ length: props.maxGuests }, (_, index) => index + 1).map((count) => (
                  <option key={count} value={count}>
                    {count} người{count === 1 ? " (chỉ bạn)" : " (tính cả bạn)"}
                  </option>
                ))}
              </select>
              {problem("guests")}
            </div>
          )}

          {showPhone && (
            <div>
              <label htmlFor={`${uid}-phone`} style={label}>
                Số điện thoại
              </label>
              <input
                id={`${uid}-phone`}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={20}
                value={values.phone ?? ""}
                onChange={(event) => set("phone", event.target.value)}
                disabled={!live || sending}
                aria-invalid={errors.phone ? true : undefined}
                aria-describedby={describedBy("phone")}
                style={field}
              />
              {problem("phone")}
            </div>
          )}

          {showNote && (
            <div>
              <label htmlFor={`${uid}-note`} style={label}>
                Lời nhắn
              </label>
              <textarea
                id={`${uid}-note`}
                rows={3}
                maxLength={500}
                value={values.note ?? ""}
                onChange={(event) => set("note", event.target.value)}
                disabled={!live || sending}
                aria-invalid={errors.note ? true : undefined}
                aria-describedby={describedBy("note")}
                style={{ ...field, minHeight: 72, resize: "vertical" }}
              />
              {problem("note")}
            </div>
          )}

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
            <div role="alert" style={{ color: "#b3261e", fontSize: 13, lineHeight: 1.5 }}>
              {notice}
            </div>
          )}
          <div style={{ fontSize: 11, opacity: 0.7, lineHeight: 1.4 }}>Tên và lời nhắn chỉ chủ thiệp xem được.</div>
          {props.mode === "edit" && <div style={{ fontSize: 11, opacity: 0.7 }}>Khách sẽ điền form này trên thiệp đã xuất bản.</div>}
        </form>
      )}
    </div>
  );
}
