import type { CSSProperties } from "react";
import { type MarkShape, monthGrid, weekOnly } from "@/lib/cards/blocks/calendar";
import { CalendarEventButton } from "./calendar-event-button";

// Vẽ khối Lịch (mọi kiểu lịch dùng chung). Không có trạng thái nên không cần "use client": cùng một kết quả ở máy chủ, trình duyệt, editor
// và ảnh thu nhỏ. Kiểu dáng viết thẳng (inline) vì Render đặt lại kiểu của các khối bên trong.
export interface CalendarViewProps {
  date: string;
  sundayFirst: boolean;
  weekOnly: boolean;
  showTitle: boolean;
  lines: boolean;
  markShape: MarkShape;
  markColor: string;
  markTextColor: string;
  color: string;
  weekColor: string;
  size: number;
  font: string;
  titleFont: string;
  innerFrame: boolean;
  padding: number;
  /** Trong editor, ngày sai hoặc trống hiện lời nhắc; ở trang thật thì không hiện gì. */
  editing: boolean;
  /** Trang thật: nút thêm vào lịch nhận chuột. Trong editor và ảnh thu nhỏ chỉ là hình cái nút. */
  live: boolean;
  /** Chữ nút Thêm vào lịch; rỗng thì không có nút. Các thuộc tính `event*` là sự kiện nút đó thêm (ngày lấy từ `date`). */
  eventButton: string;
  eventTitle: string;
  eventTime: string;
  eventMinutes: number;
  eventPlace: string;
  eventNote: string;
}

// Phosphor "heart" và "star" (đặc, MIT).
const HEART = "M240,102c0,70-103.79,126.66-108.21,129a8,8,0,0,1-7.58,0C119.79,228.66,16,172,16,102A62.07,62.07,0,0,1,78,40c20.65,0,38.73,8.88,50,23.89C139.27,48.88,157.35,40,178,40A62.07,62.07,0,0,1,240,102Z";

const STAR = "M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.4,16.4,0,0,1,31,85.4l59-4.76,22.76-55.08a16.36,16.36,0,0,1,30.27,0l22.75,55.08,59,4.76a16.46,16.46,0,0,1,9.37,28.86Z";

function Mark({ shape, color }: { shape: MarkShape; color: string }) {
  const box: CSSProperties = { position: "absolute", height: "92%", aspectRatio: "1 / 1", maxWidth: "100%" };
  if (shape === "Tim" || shape === "Sao") {
    return (
      <svg aria-hidden="true" viewBox="0 0 256 256" fill={color} style={{ ...box, height: "100%" }}>
        <path d={shape === "Tim" ? HEART : STAR} />
      </svg>
    );
  }
  if (shape === "Vòng") return <span aria-hidden="true" style={{ ...box, height: "88%", border: `1.5px solid ${color}`, borderRadius: "50%", boxSizing: "border-box" }} />;
  return <span aria-hidden="true" style={{ ...box, background: color, borderRadius: shape === "Tròn" ? "50%" : "22%" }} />;
}

export function CalendarView(props: CalendarViewProps) {
  const { date, sundayFirst, showTitle, lines, innerFrame, markShape, markColor, markTextColor, color, weekColor, size, font, titleFont, padding, editing, live, eventButton } = props;
  const whole = monthGrid(date, sundayFirst);
  if (!whole) {
    if (!editing) return null;
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed rgba(81,20,25,0.35)", borderRadius: 12, color: "rgba(81,20,25,0.7)", fontSize: 14, fontFamily: "system-ui, sans-serif", textAlign: "center", padding: 12, boxSizing: "border-box" }}>
        Chọn ngày ở bảng bên phải.
      </div>
    );
  }
  const grid = props.weekOnly ? weekOnly(whole) : whole;
  const bodyFont = font || "inherit";
  const line = `${color}40`; // kẻ ô mảnh: cùng màu chữ, mờ hơn
  return (
    <div
      role="group"
      aria-label={grid.title}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        padding,
        color,
        fontFamily: bodyFont,
        textAlign: "center",
      }}
    >
      {innerFrame && <span aria-hidden="true" style={{ position: "absolute", inset: 6, border: `1px solid ${color}73`, pointerEvents: "none" }} />}
      {showTitle && (
        <div style={{ fontFamily: titleFont || bodyFont, fontSize: size * 1.5, lineHeight: 1.2, paddingBottom: size * 0.6 }}>{grid.title}</div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", color: weekColor, fontSize: size * 0.8, fontWeight: 600, letterSpacing: "0.04em", paddingBottom: size * 0.3 }}>
        {grid.weekdays.map((name) => (
          <div key={name}>{name}</div>
        ))}
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gridTemplateRows: `repeat(${grid.weeks.length}, 1fr)`,
          ...(lines ? { borderTop: `1px solid ${line}`, borderLeft: `1px solid ${line}` } : {}),
        }}
      >
        {grid.weeks.flat().map((day, index) => {
          const marked = day === grid.marked;
          return (
            <div
              key={index}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 0,
                fontSize: size,
                fontVariantNumeric: "tabular-nums",
                color: marked ? markTextColor : color,
                fontWeight: marked ? 600 : 400,
                ...(lines ? { boxShadow: `inset -1px -1px 0 ${line}` } : {}),
              }}
            >
              {marked && <Mark shape={markShape} color={markColor} />}
              {day !== null && <span style={{ position: "relative" }}>{day}</span>}
            </div>
          );
        })}
      </div>
      {eventButton.trim() && (
        <div style={{ flex: "none", paddingTop: size * 0.8 }}>
          <CalendarEventButton
            event={{ date, time: props.eventTime, minutes: props.eventMinutes, title: props.eventTitle, place: props.eventPlace, note: props.eventNote }}
            label={eventButton.trim()}
            background={markColor}
            color={markTextColor}
            size={size}
            live={live}
          />
        </div>
      )}
    </div>
  );
}
