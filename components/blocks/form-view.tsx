"use client";

import { type CSSProperties, type FormEvent, useEffect, useId, useState } from "react";
import { ApiError } from "@/lib/api/errors";
import { formErrorMessage } from "@/lib/cards/forms/api";
import {
  MAX_LONG,
  MAX_TEXT,
  answerPayload,
  isClosed,
  validateAnswers,
  visibleFields,
  type AnswerErrors,
  type Answers,
  type Field,
  type PublicList,
} from "@/lib/cards/forms/fields";
import { fetchEntries, serverFieldErrors, submitForm, type FormEntry } from "@/lib/cards/forms/submit";

// Vẽ khối Biểu mẫu cho khách: từng câu hỏi theo thứ tự trong `fields`, kiểm ngay dưới ô, gửi lên CMBE và kèm sổ công khai nếu
// form bật. Chỉ trang thật (`live`, có `slug`) mới gọi mạng; editor, ảnh thu nhỏ và trang mẫu thấy form khoá để xem (không gọi mạng).
// Nền, viền, bo góc, bóng là của Miditor nên ở đây không có; kiểu viết inline vì Render đặt lại kiểu.
export type FormMode = "live" | "edit" | "static";

export interface FormViewProps {
  blockId: string;
  /** Slug của thiệp đã xuất bản; rỗng khi không phải trang thật. */
  slug: string;
  heading: string;
  intro: string;
  button: string;
  success: string;
  deadline: string;
  fields: Field[];
  publicList: PublicList;
  color: string;
  padding: number;
  mode: FormMode;
}

// Hai lời mẫu cho bản xem thử, kèm giờ viết sẵn: bản xem thử có thể được dựng phía server, tính giờ máy ở đó sẽ lệch với trình duyệt.
const SAMPLES = [
  { id: "mau-1", name: "Minh Anh", text: "Chúc hai bạn trăm năm hạnh phúc, sớm có tin vui!", time: "01/01 09:00" },
  { id: "mau-2", name: "Gia đình cô Hoa", text: "Chúc mừng ngày trọng đại của hai con.", time: "01/01 10:30" },
];

const PAGE = 5;
const STORAGE_PREFIX = "cmfe-form:";

const pad = (value: number) => String(value).padStart(2, "0");
// `dd/MM HH:mm` theo giờ trình duyệt của khách.
const timeOf = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Số bắt buộc bắt đầu ở mức nhỏ nhất để khách không phải bấm mới có giá trị; ô tuỳ chọn để trống.
const initialValues = (fields: readonly Field[]): Answers => {
  const values: Answers = {};
  for (const field of fields) if (field.type === "number" && field.required) values[field.id] = field.min ?? 0;
  return values;
};

const FADE = `
.cm-fv-in{animation:cm-fv-fade .18s ease}
@keyframes cm-fv-fade{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion:reduce){.cm-fv-in{animation:none}}
`;

interface PartProps {
  field: Field;
  value: unknown;
  set: (value: unknown) => void;
  live: boolean;
  sending: boolean;
  uid: string;
  color: string;
  fieldStyle: CSSProperties;
  labelStyle: CSSProperties;
  error: string | undefined;
  describedBy: string | undefined;
}

// Một câu hỏi, chọn cách vẽ theo loại ô. Tách khỏi view để phần gửi và sổ công khai đọc được liền mạch.
function Question({ field, value, set, live, sending, uid, color, fieldStyle, labelStyle, error, describedBy }: PartProps) {
  const disabled = !live || sending;
  const id = `${uid}-${field.id}`;
  const label = (
    <>
      {field.label}
      {field.required && " *"}
    </>
  );
  const hint = field.hint ? <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2, textAlign: "left" }}>{field.hint}</div> : null;
  const problem = error ? (
    <div id={`${id}-error`} role="alert" style={{ color: "#b3261e", fontSize: 12, marginTop: 4, textAlign: "left" }}>
      {error}
    </div>
  ) : null;

  switch (field.type) {
    case "text":
    case "phone":
    case "date":
      return (
        <div>
          <label htmlFor={id} style={labelStyle}>
            {label}
          </label>
          {hint}
          <input
            id={id}
            type={field.type === "phone" ? "tel" : field.type === "date" ? "date" : "text"}
            inputMode={field.type === "phone" ? "tel" : undefined}
            autoComplete={field.type === "phone" ? "tel" : field.type === "text" ? "off" : undefined}
            maxLength={field.type === "text" ? MAX_TEXT : field.type === "phone" ? 20 : undefined}
            value={typeof value === "string" ? value : ""}
            onChange={(event) => set(event.target.value)}
            disabled={disabled}
            aria-required={field.required || undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            style={fieldStyle}
          />
          {problem}
        </div>
      );
    case "longtext": {
      const text = typeof value === "string" ? value : "";
      return (
        <div>
          <label htmlFor={id} style={labelStyle}>
            {label}
          </label>
          {hint}
          <textarea
            id={id}
            rows={3}
            maxLength={MAX_LONG}
            value={text}
            onChange={(event) => set(event.target.value)}
            disabled={disabled}
            aria-required={field.required || undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            style={{ ...fieldStyle, minHeight: 72, resize: "vertical" }}
          />
          {text.length > MAX_LONG - 40 && (
            <div style={{ fontSize: 11, opacity: 0.7, textAlign: "right", marginTop: 2 }}>
              {text.length}/{MAX_LONG}
            </div>
          )}
          {problem}
        </div>
      );
    }
    case "choice": {
      const options = field.options ?? [];
      // Tới bốn phương án thì mỗi phương án một viên thuốc bấm được; nhiều hơn thì danh sách chọn cho gọn.
      if (options.length <= 4) {
        return (
          <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
            <legend style={{ ...labelStyle, padding: 0 }}>{label}</legend>
            {hint}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
              {options.map((option) => {
                const picked = value === option;
                return (
                  <label
                    key={option}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      minHeight: 40,
                      boxSizing: "border-box",
                      border: `1px solid ${picked ? color : `${color}73`}`,
                      borderRadius: 9999,
                      padding: "6px 12px",
                      background: picked ? `${color}14` : "transparent",
                      cursor: disabled ? "default" : "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name={id}
                      value={option}
                      checked={picked}
                      onChange={() => set(option)}
                      disabled={disabled}
                      aria-describedby={describedBy}
                      style={{ accentColor: color, width: 16, height: 16, margin: 0 }}
                    />
                    <span style={{ fontSize: 14 }}>{option}</span>
                  </label>
                );
              })}
            </div>
            {problem}
          </fieldset>
        );
      }
      return (
        <div>
          <label htmlFor={id} style={labelStyle}>
            {label}
          </label>
          {hint}
          <select
            id={id}
            value={typeof value === "string" ? value : ""}
            onChange={(event) => set(event.target.value)}
            disabled={disabled}
            aria-required={field.required || undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            style={fieldStyle}
          >
            <option value="">Chọn một</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {problem}
        </div>
      );
    }
    case "multichoice": {
      const picked = Array.isArray(value) ? (value as string[]) : [];
      return (
        <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
          <legend style={{ ...labelStyle, padding: 0 }}>{label}</legend>
          {hint}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
            {(field.options ?? []).map((option) => (
              <label key={option} style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 32, cursor: disabled ? "default" : "pointer", textAlign: "left" }}>
                <input
                  type="checkbox"
                  checked={picked.includes(option)}
                  disabled={disabled}
                  aria-describedby={describedBy}
                  onChange={() => set(picked.includes(option) ? picked.filter((item) => item !== option) : [...picked, option])}
                  style={{ accentColor: color, width: 16, height: 16, margin: 0 }}
                />
                <span style={{ fontSize: 14 }}>{option}</span>
              </label>
            ))}
          </div>
          {problem}
        </fieldset>
      );
    }
    case "number": {
      const min = field.min ?? 0;
      const max = field.max ?? 100;
      const current = typeof value === "number" ? value : min;
      // Khoảng hẹp thì bấm trừ/cộng nhanh hơn gõ; khoảng rộng thì ô số.
      if (max - min <= 20) {
        return (
          <div>
            <span style={labelStyle} id={id}>
              {label}
            </span>
            {hint}
            <div role="group" aria-labelledby={id} style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginTop: 4 }}>
              <button
                type="button"
                aria-label="Bớt một"
                disabled={disabled || current <= min}
                onClick={() => set(current - 1)}
                style={{ width: 40, height: 40, borderRadius: 20, border: `1px solid ${color}73`, background: "transparent", color, font: "inherit", fontSize: 20, lineHeight: 1, cursor: disabled ? "default" : "pointer" }}
              >
                −
              </button>
              <span style={{ minWidth: 32, fontSize: 16, fontVariantNumeric: "tabular-nums" }}>{current}</span>
              <button
                type="button"
                aria-label="Thêm một"
                disabled={disabled || current >= max}
                onClick={() => set(current + 1)}
                style={{ width: 40, height: 40, borderRadius: 20, border: `1px solid ${color}73`, background: "transparent", color, font: "inherit", fontSize: 20, lineHeight: 1, cursor: disabled ? "default" : "pointer" }}
              >
                +
              </button>
            </div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>
              Từ {min} đến {max}
            </div>
            {problem}
          </div>
        );
      }
      return (
        <div>
          <label htmlFor={id} style={labelStyle}>
            {label}
          </label>
          {hint}
          <input
            id={id}
            type="number"
            min={min}
            max={max}
            step={1}
            value={typeof value === "number" ? value : ""}
            onChange={(event) => set(event.target.value === "" ? undefined : Number(event.target.value))}
            disabled={disabled}
            aria-required={field.required || undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            style={fieldStyle}
          />
          <div style={{ fontSize: 11, opacity: 0.7 }}>
            Từ {min} đến {max}
          </div>
          {problem}
        </div>
      );
    }
    case "yesno":
      return (
        <div>
          <span style={labelStyle} id={id}>
            {label}
          </span>
          {hint}
          <div role="group" aria-labelledby={id} style={{ display: "flex", gap: 8, marginTop: 4 }}>
            {[
              [true, "Có"],
              [false, "Không"],
            ].map(([answer, name]) => {
              const picked = value === answer;
              return (
                <button
                  key={name as string}
                  type="button"
                  aria-pressed={picked}
                  disabled={disabled}
                  onClick={() => set(answer)}
                  style={{
                    flex: 1,
                    minHeight: 40,
                    border: `1px solid ${picked ? color : `${color}73`}`,
                    borderRadius: 9999,
                    background: picked ? color : "transparent",
                    color: picked ? "#fff" : color,
                    font: "inherit",
                    fontSize: 14,
                    cursor: disabled ? "default" : "pointer",
                  }}
                >
                  {name as string}
                </button>
              );
            })}
          </div>
          {problem}
        </div>
      );
  }
}

export function FormView(props: FormViewProps) {
  const live = props.mode === "live" && props.slug !== "";
  const uid = useId();
  const fields = props.fields;
  const [values, setValues] = useState<Answers>(() => initialValues(fields));
  const [website, setWebsite] = useState("");
  // Bắt đầu ở "đang tải" khi có sổ công khai: tránh nháy "chưa ai gửi" trước lần tải đầu.
  const [loading, setLoading] = useState(props.publicList.enabled);
  const [entries, setEntries] = useState<FormEntry[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [more, setMore] = useState(false);
  const [closed, setClosed] = useState(false);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<AnswerErrors>({});
  const [notice, setNotice] = useState("");
  const [failed, setFailed] = useState(false);

  const key = `${STORAGE_PREFIX}${props.slug}:${props.blockId}`;

  // Hạn và lời nhắc "đã gửi" đọc sau khi gắn vào trình duyệt: giờ máy chủ khác giờ khách và React báo lệch hydration.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hạn chỉ đọc được trong trình duyệt; đặt vào state sau khi gắn là cách duy nhất không lệch hydration.
    if (live) setClosed(isClosed(props.deadline, new Date()));
  }, [live, props.deadline]);

  useEffect(() => {
    if (!live) return;
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage không có phía server: đọc sau khi gắn để hai bên dựng giống nhau.
      if (window.localStorage.getItem(key) === "1") setDone(true);
    } catch {
      // Trình duyệt chặn localStorage: chỉ mất lời nhắc, form vẫn chạy.
    }
  }, [live, key]);

  // Sổ công khai tải trang đầu sau khi gắn; bản xem thử dùng lời mẫu và không gọi mạng.
  useEffect(() => {
    if (!live || !props.publicList.enabled) return;
    let cancelled = false;
    fetchEntries({ slug: props.slug, blockId: props.blockId, first: PAGE })
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
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [live, props.publicList.enabled, props.slug, props.blockId]);

  const set = (id: string, value: unknown) => {
    setValues((old) => {
      const next = { ...old };
      if (value === undefined || value === "") delete next[id];
      else next[id] = value;
      return next;
    });
  };

  const loadMore = async () => {
    if (!cursor || more) return;
    setMore(true);
    setNotice("");
    try {
      const page = await fetchEntries({ slug: props.slug, blockId: props.blockId, first: PAGE, after: cursor });
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
    if (sending || !live) return;
    const found = validateAnswers(fields, values);
    setErrors(found);
    setNotice("");
    setFailed(false);
    if (Object.keys(found).length > 0) return;

    setSending(true);
    try {
      const result = await submitForm({ slug: props.slug, blockId: props.blockId, answers: answerPayload(fields, values), website });
      // Lời vừa duyệt sẵn thì chèn ngay lên đầu sổ; lời chờ duyệt chưa có gì để chèn.
      if (result.status === "VISIBLE" && result.entry) setEntries((old) => [result.entry as FormEntry, ...old]);
      setPending(result.status === "PENDING");
      try {
        window.localStorage.setItem(key, "1");
      } catch {
        // Không nhớ được thì thôi, lần mở sau khách thấy form trống.
      }
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError && err.code === "CONFLICT" && (err.details as { reason?: unknown } | undefined)?.reason === "CLOSED") {
        setClosed(true);
        return;
      }
      setErrors(serverFieldErrors(err, fields));
      setNotice(formErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const again = () => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Không xoá được thì lần mở sau vẫn thấy lời cảm ơn; không sao.
    }
    setDone(false);
    setPending(false);
    setValues(initialValues(fields));
    setErrors({});
    setNotice("");
  };

  const color = props.color;
  const labelStyle: CSSProperties = { display: "block", fontSize: 13, opacity: 0.85, marginBottom: 4, textAlign: "left" };
  const fieldStyle: CSSProperties = {
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
  const visible = visibleFields(fields, values);
  const showList = props.publicList.enabled;

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
      <style>{FADE}</style>
      {props.heading.trim() && <div style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" }}>{props.heading}</div>}

      {live && closed ? (
        <div role="status" style={{ fontSize: 15, lineHeight: 1.6, padding: "12px 0" }}>
          Đã hết hạn.
        </div>
      ) : live && done ? (
        <>
          <div role="status" style={{ fontSize: 15, lineHeight: 1.6, padding: "8px 0", whiteSpace: "pre-wrap" }}>
            {props.success.trim() || "Cảm ơn bạn đã gửi."}
          </div>
          {pending && <div style={{ fontSize: 13, opacity: 0.85 }}>Lời trả lời sẽ hiện sau khi chủ thiệp duyệt.</div>}
          <button
            type="button"
            onClick={again}
            style={{ minHeight: 44, border: `1px solid ${color}`, borderRadius: 9999, background: "transparent", color, font: "inherit", fontSize: 14, padding: "8px 16px", cursor: "pointer" }}
          >
            Gửi thêm một lần
          </button>
        </>
      ) : (
        <form onSubmit={onSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {props.intro.trim() && <div style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.85, whiteSpace: "pre-wrap" }}>{props.intro}</div>}

          {visible.map((field) => (
            <div key={field.id} className="cm-fv-in">
              <Question
                field={field}
                value={values[field.id]}
                set={(value) => set(field.id, value)}
                live={live}
                sending={sending}
                uid={uid}
                color={color}
                fieldStyle={fieldStyle}
                labelStyle={labelStyle}
                error={errors[field.id]}
                describedBy={errors[field.id] ? `${uid}-${field.id}-error` : undefined}
              />
            </div>
          ))}
          {fields.length === 0 && <div style={{ fontSize: 13, opacity: 0.7 }}>Biểu mẫu chưa có câu hỏi nào.</div>}

          {/* Ô ẩn chống thư rác: người thật không thấy, máy điền mới điền; KHÔNG display:none để máy vẫn tưởng điền được. */}
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
            {sending ? "Đang gửi…" : props.button.trim() || "Gửi"}
          </button>

          {notice && (
            <div role={failed ? "alert" : "status"} style={{ color: failed ? "#b3261e" : color, fontSize: 13, lineHeight: 1.5 }}>
              {notice}
            </div>
          )}
          {props.mode === "edit" && <div style={{ fontSize: 11, opacity: 0.7 }}>Khách sẽ điền form này trên thiệp đã xuất bản.</div>}
        </form>
      )}

      {showList && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left", marginTop: 4 }}>
          {!live ? (
            <>
              <div style={{ fontSize: 11, opacity: 0.6 }}>Ví dụ</div>
              {SAMPLES.map((entry) => (
                <div key={entry.id}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{entry.name}</div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>{entry.time}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{entry.text}</div>
                </div>
              ))}
            </>
          ) : loading ? (
            <div style={{ fontSize: 13, opacity: 0.7, textAlign: "center" }}>Đang tải lời trả lời…</div>
          ) : entries.length === 0 ? (
            <div style={{ fontSize: 13, opacity: 0.7, textAlign: "center" }}>{failed ? "Chưa tải được lời trả lời." : "Hãy là người đầu tiên."}</div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{entry.name}</div>
                <div style={{ fontSize: 11, opacity: 0.6 }}>{timeOf(entry.createdAt)}</div>
                <div style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{entry.text}</div>
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
      )}
    </div>
  );
}
