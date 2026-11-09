"use client";

import type { CustomFieldProps } from "@miditor/editor";

// Ô chọn giờ cho các khối riêng (kiểu `time`): lưu chuỗi "HH:mm" theo giờ Việt Nam, không có ngày hay múi giờ. Dùng ô ngày có sẵn của
// trình duyệt, tạo kiểu theo biến của Miditor để khớp bảng. Miditor xếp ô của bảng thành lưới hai cột và chưa cho ô "custom" chiếm cả hàng,
// nên dòng CSS dưới đây ép nó chiếm cả hàng (nên sửa ở Miditor rồi bỏ). Dòng này cùng dạng với dòng của ô ảnh.
const CSS = `
[class*="grid2"] > :has(.cm-time-root){grid-column:1/-1}
.cm-time{width:100%;height:36px;box-sizing:border-box;padding:0 10px;border-radius:var(--miditor-radius,8px);border:1px solid var(--miditor-border-input,#d9cdd0);background:#fff;color:var(--miditor-text,#2a2224);font:inherit;font-size:14px}
.cm-time:hover:not(:disabled){border-color:var(--miditor-accent,#7b1e2b)}
.cm-time:focus-visible{outline:2px solid var(--miditor-focus,#2f6bff);outline-offset:1px}
.cm-time:disabled{background:var(--miditor-workspace,#f6f1f2);color:var(--miditor-muted,#6e6063)}
`;

export function TimeInput({ label, value, onChange, readOnly }: CustomFieldProps) {
  const text = typeof value === "string" ? value : "";
  return (
    <label className="cm-time-root" style={{ display: "grid", gap: 4, minWidth: 0, width: "100%" }}>
      <style>{CSS}</style>
      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--miditor-muted, #6e6063)" }}>{label}</span>
      <input
        className="cm-time"
        type="time"
        value={text}
        disabled={Boolean(readOnly)}
        onChange={(event) => {
          // Xoá trắng ô thì trình duyệt trả chuỗi rỗng: lưu rỗng, sự kiện thành cả ngày.
          onChange(event.target.value);
        }}
      />
    </label>
  );
}
