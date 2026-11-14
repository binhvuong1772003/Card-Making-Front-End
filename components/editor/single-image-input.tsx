"use client";

import type { CustomFieldProps } from "@miditor/editor";
import { useRef, useState } from "react";
import { uploadImage } from "@/lib/assets/upload-image";

// Ô chọn một ảnh cho các khối riêng (kiểu `single-image`): lưu địa chỉ ảnh sau khi tải lên kho. Miditor không vẽ trường kiểu `image` ở bảng
// thuộc tính (ảnh vào qua bảng Hình ảnh) nên khối Khung ảnh cần ô này. Rỗng là chưa có ảnh. Miditor xếp ô của bảng thành lưới hai cột và chưa
// cho ô "custom" chiếm cả hàng, nên dòng CSS đầu ép nó chiếm cả hàng (nên sửa ở Miditor rồi bỏ), cùng dạng với `date-input.tsx`.
const CSS = `
[class*="grid2"] > :has(.cm-si-root){grid-column:1/-1}
.cm-si-btn{height:32px;padding:0 12px;border-radius:99px;border:1px solid var(--miditor-border-input,#d9cdd0);background:#fff;color:var(--miditor-text,#2a2224);font:inherit;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap}
.cm-si-btn:hover:not(:disabled){border-color:var(--miditor-accent,#7b1e2b)}
.cm-si-btn:focus-visible{outline:2px solid var(--miditor-focus,#2f6bff);outline-offset:1px}
.cm-si-btn:disabled{opacity:.5;cursor:default}
.cm-si-danger{color:#b3261e}
`;

export function SingleImageInput({ label, value, onChange, readOnly }: CustomFieldProps) {
  const src = typeof value === "string" ? value : "";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const picker = useRef<HTMLInputElement>(null);

  const choose = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      onChange(await uploadImage(file));
    } catch (failure) {
      setError(`Tải lên không thành công: ${failure instanceof Error ? failure.message : "lỗi không rõ"}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cm-si-root" style={{ display: "grid", gap: 6, minWidth: 0, width: "100%" }}>
      <style>{CSS}</style>
      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--miditor-muted, #6e6063)" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          aria-hidden="true"
          style={{ flex: "none", width: 56, height: 56, borderRadius: 8, border: "1px solid var(--miditor-border-input, #d9cdd0)", background: src ? `center / cover no-repeat url("${src.replace(/"/g, "%22")}")` : "var(--miditor-soft, #f4e6e9)" }}
        />
        {!readOnly && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <input ref={picker} type="file" accept="image/*" hidden onChange={(event) => { void choose(event.target.files); event.target.value = ""; }} />
            <button type="button" className="cm-si-btn" disabled={busy} onClick={() => picker.current?.click()}>
              {busy ? "Đang tải…" : src ? "Đổi ảnh" : "Chọn ảnh"}
            </button>
            {src && !busy && (
              <button type="button" className="cm-si-btn cm-si-danger" onClick={() => onChange("")}>
                Bỏ ảnh
              </button>
            )}
          </div>
        )}
      </div>
      {error && (
        <span role="alert" style={{ fontSize: 12, color: "#b3261e" }}>
          {error}
        </span>
      )}
    </div>
  );
}

export function FixedImageInput(props: CustomFieldProps) {
  return <SingleImageInput {...props} readOnly />;
}
