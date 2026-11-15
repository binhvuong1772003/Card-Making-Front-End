"use client";

import { type CSSProperties, type FormEvent, useEffect, useId, useRef, useState } from "react";
import { ApiError } from "@/lib/api/errors";
import { useFormDraft } from "./form-drafts";
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
  fieldColor: string;
  fieldBorderColor: string;
  font: string;
  padding: number;
  compact: boolean;
  previewSampleCount: number;
  mode: FormMode;
}

// Hai lời mẫu cho bản xem thử, kèm giờ viết sẵn: bản xem thử có thể được dựng phía server, tính giờ máy ở đó sẽ lệch với trình duyệt.
const SAMPLES = [
  { id: "mau-1", name: "Minh Anh", text: "Chúc hai bạn trăm năm hạnh phúc, sớm có tin vui!", time: "01/01 09:00" },
  { id: "mau-2", name: "Gia đình cô Hoa", text: "Chúc mừng ngày trọng đại của hai con.", time: "01/01 10:30" },
];

const PAGE = 10;
// Sổ lưu bút: khung danh sách cao tối đa 420px; phần chưa dùng đến (`--cm-gb-slack`) kéo các khối bên dưới lên, xem CSS bên dưới.
const GUESTBOOK_LIST_MAX = 420;
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

// Các khối dưới sổ lưu bút của mẫu Minimalism nằm ở toạ độ cố định (đã chừa đủ chỗ cho khung danh sách đầy). Biến `--cm-gb-slack` (px) trên trang là chỗ chừa chưa dùng:
// không có lời chúc thì bằng cả khung, có hai lời chúc thì bằng phần còn lại; các khối bên dưới và chiều cao trang trừ đi đúng số đó nên không để trống.
// Chỉ áp dụng cho trang có khối "gift-castle" (mẫu Minimalism): các mẫu khác dùng cùng mã khối (gift-title, wedding-gift, footer-*) ở toạ độ khác.
const GUESTBOOK_FOLLOW = `
[data-miditor-type="Page"]:has([data-miditor-id="guestbook"]):has([data-miditor-id="gift-castle"]) [data-miditor-id="gift-background"],
[data-miditor-type="Page"]:has([data-miditor-id="guestbook"]):has([data-miditor-id="gift-castle"]) [data-miditor-id="gift-castle"]{top:calc(5660px - var(--cm-gb-slack,0px))!important}
[data-miditor-type="Page"]:has([data-miditor-id="guestbook"]):has([data-miditor-id="gift-castle"]) [data-miditor-id="gift-title"]{top:calc(5705px - var(--cm-gb-slack,0px))!important}
[data-miditor-type="Page"]:has([data-miditor-id="guestbook"]):has([data-miditor-id="gift-castle"]) [data-miditor-id="wedding-gift"]{top:calc(5740px - var(--cm-gb-slack,0px))!important}
[data-miditor-type="Page"]:has([data-miditor-id="guestbook"]):has([data-miditor-id="gift-castle"]) [data-miditor-id="footer-thanks"]{top:calc(6200px - var(--cm-gb-slack,0px))!important}
[data-miditor-type="Page"]:has([data-miditor-id="guestbook"]):has([data-miditor-id="gift-castle"]) [data-miditor-id="footer-brand"]{top:calc(6250px - var(--cm-gb-slack,0px))!important}
[data-miditor-type="Page"]:has([data-miditor-id="guestbook"]):has([data-miditor-id="gift-castle"]){min-height:calc(6276px - var(--cm-gb-slack,0px))!important}`;

const FADE = `
.cm-fv-in{animation:cm-fv-fade .18s ease}
@keyframes cm-fv-fade{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion:reduce){.cm-fv-in{animation:none}}
/* A guestbook has its own paper panel behind the form. Keep the editor block from
   drawing a second, page-height border around both the form and the messages. */
[data-miditor-type="Form"]:has(> .cm-fv-guestbook){height:auto!important;overflow:visible!important;border:0!important;border-radius:0!important;box-shadow:none!important}
/* Chung Đôi uses one transparent image for the note, its shadow, and the flowers. */
[data-miditor-type="Page"]:has([data-miditor-id="guestbook"]){overflow-x:clip!important;background-color:#f5ecdf!important;background-image:linear-gradient(rgba(248,240,228,.6),rgba(248,240,228,.6)),url("/demo/minimalism-do-dam/paper.webp")!important;background-position:center top!important;background-size:100% 100%,100% auto!important;background-repeat:no-repeat,repeat-y!important;background-blend-mode:normal!important}
[data-miditor-id="note-paper"]{z-index:0;width:650px!important;height:592px!important;left:calc(50% - 325px)!important}
[data-miditor-id="note-paper"] img{display:none!important}
[data-miditor-id="note-paper"]::before{content:"";position:absolute;inset:0;background:url("/demo/minimalism-do-dam/papernote-background.webp") center/contain no-repeat;filter:drop-shadow(4px 4px 4px rgba(0,0,0,.25));pointer-events:none}
[data-miditor-id="note-flowers"]{display:none!important}
[data-miditor-id="note-title"]{top:4771px!important}
[data-miditor-id="guestbook"]{width:380px!important;left:calc(50% - 190px)!important;top:4820px!important}
.cm-fv-guestbook input,.cm-fv-guestbook textarea{font-size:14px!important}
.cm-fv-guestbook input::placeholder,.cm-fv-guestbook textarea::placeholder{color:#9c7775;opacity:1}
`;
const COMPACT_PLACEHOLDER = `.cm-fv-compact input::placeholder,.cm-fv-compact textarea::placeholder{color:#9ca3af;opacity:1}`;

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
  compact: boolean;
  guestbook: boolean;
}

// Một câu hỏi, chọn cách vẽ theo loại ô. Tách khỏi view để phần gửi và sổ công khai đọc được liền mạch.
function Question({ field, value, set, live, sending, uid, color, fieldStyle, labelStyle, error, describedBy, compact, guestbook }: PartProps) {
  const disabled = !live || sending;
  const id = `${uid}-${field.id}`;
  const label = (
    <>
      {field.label}
      {field.required && " *"}
    </>
  );
  const placeholderText = field.id === "name" ? "tên của bạn" : field.type === "longtext" ? "lời chúc của bạn" : field.label.toLocaleLowerCase();
  const placeholder = `Nhập ${placeholderText}${field.required ? "*" : ""}`;
  const hint = field.hint ? <div style={{ fontSize: 13, marginTop: 2, textAlign: "left" }}>{field.hint}</div> : null;
  const problem = error ? (
    <div id={`${id}-error`} role="alert" style={{ color: "#b3261e", fontSize: 14, marginTop: 4, textAlign: "left" }}>
      {error}
    </div>
  ) : null;

  switch (field.type) {
    case "text":
    case "phone":
    case "date":
      return (
        <div>
          <label htmlFor={id} style={compact ? { ...labelStyle, position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 } : labelStyle}>
            {label}
          </label>
          {hint}
          <input
            id={id}
            type={field.type === "phone" ? "tel" : field.type === "date" ? "date" : "text"}
            inputMode={field.type === "phone" ? "tel" : undefined}
            autoComplete={field.type === "phone" ? "tel" : field.type === "text" ? "off" : undefined}
            maxLength={field.type === "text" ? MAX_TEXT : field.type === "phone" ? 20 : undefined}
            placeholder={compact ? placeholder : undefined}
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
          <label htmlFor={id} style={compact ? { ...labelStyle, position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 } : labelStyle}>
            {label}
          </label>
          {hint}
          <textarea
            id={id}
            rows={3}
            maxLength={MAX_LONG}
            placeholder={compact ? placeholder : undefined}
            value={text}
            onChange={(event) => set(event.target.value)}
            disabled={disabled}
            aria-required={field.required || undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            style={{ ...fieldStyle, minHeight: guestbook ? 106 : compact ? 122 : 120, resize: compact ? "none" : "vertical" }}
          />
          {text.length > MAX_LONG - 40 && (
            <div style={{ fontSize: 13, textAlign: "right", marginTop: 2 }}>
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
                      border: `1px solid ${picked ? color : `${color}99`}`,
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
                    <span style={{ fontSize: 16 }}>{option}</span>
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
                <span style={{ fontSize: 16 }}>{option}</span>
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
            <div style={{ fontSize: 13 }}>
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
          <div style={{ fontSize: 13 }}>
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
                    border: `1px solid ${picked ? color : `${color}99`}`,
                    borderRadius: 9999,
                    background: picked ? color : "transparent",
                    color: picked ? "#fff" : color,
                    font: "inherit",
                    fontSize: 16,
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
  const [draft, setDraft] = useFormDraft(props.blockId);
  const [values, setValues] = useState<Answers>(() => draft ?? initialValues(fields));
  const [website, setWebsite] = useState("");
  // Bắt đầu ở "đang tải" khi có sổ công khai: tránh nháy "chưa ai gửi" trước lần tải đầu.
  const [loading, setLoading] = useState(props.publicList.enabled);
  const [entries, setEntries] = useState<FormEntry[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const [listEl, setListEl] = useState<HTMLDivElement | null>(null);
  // Báo cho trang biết khung danh sách đang dùng bao nhiêu chỗ (không làm trong editor: ở đó bố cục giữ nguyên để dễ sửa).
  const trackSlack = props.publicList.enabled && props.mode !== "edit";
  useEffect(() => {
    const page = rootRef.current?.closest<HTMLElement>('[data-miditor-type="Page"]');
    if (!trackSlack || !page) return;
    const set = (used: number) => page.style.setProperty("--cm-gb-slack", `${Math.max(0, GUESTBOOK_LIST_MAX - Math.min(GUESTBOOK_LIST_MAX, used))}px`);
    if (!listEl) { set(0); return () => page.style.removeProperty("--cm-gb-slack"); }
    set(listEl.offsetHeight);
    const watcher = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(() => set(listEl.offsetHeight));
    watcher?.observe(listEl);
    return () => { watcher?.disconnect(); page.style.removeProperty("--cm-gb-slack"); };
  }, [trackSlack, listEl]);
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
        setEntries(page.entries.slice(0, PAGE));
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
    const next = { ...values };
    if (value === undefined || value === "") delete next[id];
    else next[id] = value;
    setValues(next);
    setDraft(next);
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
      if (result.status === "VISIBLE" && result.entry) setEntries((old) => [result.entry as FormEntry, ...old].slice(0, PAGE));
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
    const initial = initialValues(fields);
    setValues(initial);
    setDraft(undefined);
    setErrors({});
    setNotice("");
  };

  const color = props.color;
  const guestbook = props.publicList.enabled;
  const compact = props.compact || guestbook;
  const labelStyle: CSSProperties = { display: "block", fontSize: 16, fontWeight: 500, marginBottom: 6, textAlign: "left" };
  const fieldStyle: CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    minHeight: guestbook ? 46 : compact ? 50 : 48,
    border: `1px solid ${props.fieldBorderColor}`,
    borderRadius: 8,
    background: compact ? (props.fieldBorderColor === color && guestbook ? `${color}0a` : "#ffffff") : "transparent",
    color: props.fieldColor,
    padding: guestbook ? "12px 16px" : compact ? "10px 16px" : "10px 12px",
    font: "inherit",
    fontSize: 16,
    opacity: 1,
    WebkitTextFillColor: props.fieldColor,
    outlineColor: color,
  };
  const visible = visibleFields(fields, values);
  const showList = props.publicList.enabled;

  return (
    <div
      ref={rootRef}
      style={{
        position: "relative",
        width: "100%",
        height: showList ? "auto" : "100%",
        boxSizing: "border-box",
        padding: props.padding,
        fontFamily: props.font,
        fontSize: 16,
        fontWeight: compact ? 300 : 400,
        lineHeight: 1.5,
        color,
        display: "flex",
        flexDirection: "column",
        gap: compact ? 14 : 10,
        overflowY: showList ? "visible" : compact ? "hidden" : "auto",
        overscrollBehavior: "contain",
        textAlign: "center",
        pointerEvents: live ? "auto" : "none",
      }}
      className={`${guestbook ? "cm-fv-guestbook " : ""}${compact ? "cm-fv-compact" : ""}`.trim() || undefined}
    >
      <style>{FADE}{guestbook ? GUESTBOOK_FOLLOW : ""}{compact ? COMPACT_PLACEHOLDER : ""}</style>
      {props.heading.trim() && <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>{props.heading}</div>}

      {live && closed ? (
        <div role="status" style={{ fontSize: 15, lineHeight: 1.6, padding: "12px 0" }}>
          Đã hết hạn.
        </div>
      ) : live && done ? (
        <>
          <div role="status" style={{ fontSize: 15, lineHeight: 1.6, padding: "8px 0", whiteSpace: "pre-wrap" }}>
            {props.success.trim() || "Cảm ơn bạn đã gửi."}
          </div>
          {pending && <div style={{ fontSize: 14 }}>Lời trả lời sẽ hiện sau khi chủ thiệp duyệt.</div>}
          <button
            type="button"
            onClick={again}
            style={{ minHeight: 44, border: `1px solid ${color}`, borderRadius: 9999, background: "transparent", color, font: "inherit", fontSize: 14, padding: "8px 16px", cursor: "pointer" }}
          >
            Gửi thêm một lần
          </button>
        </>
      ) : (
        <form onSubmit={onSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: guestbook ? 16 : compact ? 16 : 12 }}>
          {!guestbook && props.intro.trim() && <div style={{ fontSize: 16, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{props.intro}</div>}

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
                compact={compact}
                guestbook={guestbook}
              />
            </div>
          ))}
          {fields.length === 0 && <div style={{ fontSize: 13, opacity: 0.7 }}>Biểu mẫu chưa có câu hỏi nào.</div>}

          {/* Ô ẩn chống thư rác: người thật không thấy, máy điền mới điền; KHÔNG display:none để máy vẫn tưởng điền được. */}
          <div aria-hidden="true" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>
            <label htmlFor={`${uid}-website`}>Để trống</label>
            <input id={`${uid}-website`} type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: compact ? "space-between" : "flex-end", gap: 12, marginTop: compact ? 6 : 0 }}>
            {compact && (
              <button
                type="button"
                aria-label="Gợi ý lời chúc"
                title="Gợi ý lời chúc"
                onClick={() => {
                  const wish = fields.find((field) => field.type === "longtext");
                  if (wish) set(wish.id, "Chúc hai bạn trăm năm hạnh phúc, luôn yêu thương và đồng hành cùng nhau!");
                }}
                style={{ width: 36, height: 32, border: 0, borderRadius: 8, background: props.fieldBorderColor === color ? `${color}1a` : "#eef0ef", color: props.fieldBorderColor === color ? color : "#444", display: "grid", placeItems: "center", cursor: "pointer" }}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m4 20 11-11 3 3L7 23H4z" />
                  <path d="m15 6 1-3 1 3 3 1-3 1-1 3-1-3-3-1zM20 14l.6 1.8L22.5 16l-1.9.6L20 18.5l-.6-1.9-1.9-.6 1.9-.2z" />
                </svg>
              </button>
            )}
            <button
              type="submit"
              disabled={!live || sending}
              style={{
                minHeight: guestbook ? 36 : 48,
                width: guestbook ? 152 : compact ? 166 : "100%",
                border: 0,
                borderRadius: guestbook ? 10 : 9999,
                background: color,
                color: "#fff",
                font: "inherit",
                fontSize: guestbook ? 14 : 16,
                fontWeight: 600,
                WebkitTextFillColor: "#fff",
                padding: guestbook ? "8px 24px" : "10px 16px",
                textTransform: compact ? "uppercase" : undefined,
                cursor: sending ? "default" : "pointer",
                opacity: sending ? 0.7 : 1,
                flexShrink: 0,
              }}
            >
              {sending ? "Đang gửi…" : props.button.trim() || "Gửi"}
            </button>
          </div>

          {notice && (
            <div role={failed ? "alert" : "status"} style={{ color: failed ? "#b3261e" : color, fontSize: 13, lineHeight: 1.5 }}>
              {notice}
            </div>
          )}
          {props.mode === "edit" && <div style={{ fontSize: 13 }}>Khách sẽ điền form này trên thiệp đã xuất bản.</div>}
        </form>
      )}

      {showList && (!live || loading || entries.length > 0) && (
        <div ref={guestbook ? setListEl : undefined} style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left", marginTop: guestbook ? 110 : 32, ...(guestbook ? { maxHeight: GUESTBOOK_LIST_MAX, overflowY: "auto", overscrollBehavior: "contain" } : {}) }}>
          {!live ? (
            <>
              {SAMPLES.slice(0, Math.min(PAGE, props.previewSampleCount)).map((entry) => (
                <div key={entry.id} style={{ padding: "18px 22px", border: `1px solid ${color}44`, borderRadius: 12, background: "rgba(255,252,247,.72)", boxShadow: "0 2px 8px rgba(62,30,24,.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{entry.name}</div>
                    <div style={{ fontSize: 13, opacity: 0.72, whiteSpace: "nowrap" }}>{entry.time}</div>
                  </div>
                  <div style={{ fontSize: 16, lineHeight: 1.65, whiteSpace: "pre-wrap", marginTop: 12 }}>{entry.text}</div>
                </div>
              ))}
            </>
          ) : loading ? (
            <div style={{ fontSize: 13, opacity: 0.7, textAlign: "center" }}>Đang tải lời trả lời…</div>
          ) : (
            entries.slice(0, PAGE).map((entry) => (
              <div key={entry.id} style={{ padding: "18px 22px", border: `1px solid ${color}44`, borderRadius: 12, background: "rgba(255,252,247,.72)", boxShadow: "0 2px 8px rgba(62,30,24,.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{entry.name}</div>
                  <div style={{ fontSize: 13, opacity: 0.72, whiteSpace: "nowrap" }}>{timeOf(entry.createdAt)}</div>
                </div>
                <div style={{ fontSize: 16, lineHeight: 1.65, whiteSpace: "pre-wrap", marginTop: 12 }}>{entry.text}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
