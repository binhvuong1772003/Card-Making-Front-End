"use client";

import type { ComponentDef } from "@miditor/core";
import type { HostToolPanelProps } from "@miditor/editor";
import { useEffect, useRef, useState } from "react";
import { cardRenderers, STATIC_METADATA } from "@/lib/cards/blocks";
import { cardDefinitions } from "@/lib/cards/blocks/definitions";
import { nodeStyleCss } from "@/lib/cards/blocks/node-style";

// Công cụ "Thành phần" trên thanh trái: các kiểu khối của CardMaking (lịch, album, bản đồ) dưới dạng thẻ có hình xem trước thật, bấm để thêm vào trang.
// Mỗi nhóm chỉ hiện vài kiểu đầu (FEATURED) kèm nút "Xem tất cả" mở trang riêng của nhóm đó, để bảng không tràn khi có nhiều kiểu. Tên "Mẫu" để
// dành cho mẫu cả tấm thiệp.
// Hình xem trước là chính khối đó vẽ ở chế độ "static" (không chạy hoạt ảnh, không tải bản đồ) rồi thu nhỏ vừa thẻ. Thư viện "Khối" mặc định của
// Miditor chỉ có chữ và icon; bảng này không thay nó, chỉ thêm một cách chọn bằng mắt. Thêm kiểu mới vào `cardDefinitions` là bảng tự có thẻ.
const SAMPLE_IMAGES = ["sample", "cld-sample", "cld-sample-2", "cld-sample-3", "cld-sample-4", "cld-sample-5"].map(
  (name) => `https://res.cloudinary.com/demo/image/upload/c_fill,w_240,h_320/${name}.jpg`,
);

// Thuộc tính để vẽ thẻ: mặc định của kiểu, cộng ảnh mẫu và địa điểm mẫu để thẻ không trống. Chỉ để xem; khối thêm vào trang vẫn bắt đầu bằng mặc định.
function sampleProps(type: string, def: ComponentDef) {
  const props: Record<string, unknown> = { ...def.defaultProps };
  if ("images" in props) props.images = SAMPLE_IMAGES;
  if (type === "Map") Object.assign(props, { name: "Trung tâm Hội nghị White Palace", address: "194 Hoàng Văn Thụ, Phú Nhuận" });
  return props;
}

function Thumb({ type, def }: { type: string; def: ComponentDef }) {
  const { w, h } = def.size ?? { w: 340, h: 300 };
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setScale(entry.contentRect.width / w);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [w]);

  const draw = cardRenderers[type as keyof typeof cardRenderers];
  return (
    <div ref={box} style={{ position: "relative", width: "100%", height: h * scale, overflow: "hidden", borderRadius: 8, background: "#fff", boxShadow: "inset 0 0 0 1px var(--miditor-border, #ece3e5)" }}>
      <div aria-hidden="true" inert style={{ position: "absolute", left: 0, top: 0, width: w, height: h, boxSizing: "border-box", transform: `scale(${scale})`, transformOrigin: "top left", pointerEvents: "none", ...nodeStyleCss(def.defaultStyles) }}>
        {draw?.({ id: type, props: sampleProps(type, def) as never, device: "desktop", responsive: false, theme: undefined, metadata: STATIC_METADATA, children: null })}
      </div>
    </div>
  );
}

// Các nhóm theo thứ tự xuất hiện đầu tiên trong `cardDefinitions`.
function groups() {
  const byCategory = new Map<string, [string, ComponentDef][]>();
  for (const [type, def] of Object.entries(cardDefinitions)) {
    const category = def.category ?? "Khác";
    byCategory.set(category, [...(byCategory.get(category) ?? []), [type, def]]);
  }
  return [...byCategory];
}

const GROUPS = groups();

// Số kiểu hiện sẵn trong mỗi nhóm; nhóm có nhiều hơn thì có nút "Xem tất cả".
const FEATURED = 2;

const CSS = `
.cm-tpl{height:100%;overflow-y:auto;padding:12px;box-sizing:border-box;color:var(--miditor-text,#2a2224)}
.cm-tpl h3{margin:0;font-size:13px;font-weight:600;color:var(--miditor-muted,#6e6063)}
.cm-tpl-head{display:flex;align-items:baseline;justify-content:space-between;margin:16px 0 8px}
.cm-tpl-head:first-child{margin-top:0}
.cm-tpl-head h3{margin:0}
.cm-tpl-all{border:0;background:transparent;padding:2px 4px;border-radius:6px;color:var(--miditor-accent,#7b1e2b);font:inherit;font-size:12px;font-weight:500;cursor:pointer}
.cm-tpl-all:hover{background:var(--miditor-soft,#f4e6e9)}
.cm-tpl-all:focus-visible,.cm-tpl-back:focus-visible{outline:2px solid var(--miditor-focus,#2f6bff);outline-offset:1px}
.cm-tpl-back{display:inline-flex;align-items:center;gap:4px;border:0;background:transparent;padding:4px 6px 4px 2px;margin-bottom:8px;border-radius:6px;color:var(--miditor-text,#2a2224);font:inherit;font-size:14px;font-weight:600;cursor:pointer}
.cm-tpl-back:hover{background:var(--miditor-soft,#f4e6e9)}
.cm-tpl-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;align-items:start}
.cm-tpl-card{display:grid;gap:6px;padding:6px;border:1px solid transparent;border-radius:10px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;transition:background-color .15s ease,border-color .15s ease;user-select:none;-webkit-user-select:none}
.cm-tpl-card:hover{background:var(--miditor-soft,#f4e6e9);border-color:var(--miditor-border,#ece3e5)}
.cm-tpl-card:focus-visible{outline:2px solid var(--miditor-focus,#2f6bff);outline-offset:1px}
.cm-tpl-name{font-size:12px;font-weight:500;line-height:1.3}
@media (prefers-reduced-motion:reduce){.cm-tpl-card{transition:none}}
`;

function Card({ type, def, editor, drag }: { type: string; def: ComponentDef; editor: HostToolPanelProps["editor"]; drag: HostToolPanelProps["drag"] }) {
  // Thẻ là div có vai trò nút, không phải <button>: hình xem trước chứa nút thật (mũi tên, chấm của album), và nút không được lồng trong nút.
  return (
    <div
      role="button"
      tabIndex={0}
      className="cm-tpl-card"
      aria-label={`Thêm ${def.label}`}
      // Bấm thì thêm; kéo ra canvas thì thả ở đâu khối vào đó (Miditor lo phần kéo, kể cả bỏ qua cú bấm kết thúc cú kéo).
      onPointerDown={(event) => drag.press(event, type, def.label)}
      onClick={() => {
        if (drag.wasDragged()) return;
        editor.addBlock(type);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          editor.addBlock(type);
        }
      }}
    >
      <Thumb type={type} def={def} />
      <span className="cm-tpl-name">{def.label}</span>
    </div>
  );
}

const LEFT = "M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z";

export function ElementsPanel({ editor, drag }: HostToolPanelProps) {
  const [open, setOpen] = useState<string | null>(null);
  const group = open === null ? undefined : GROUPS.find(([category]) => category === open);

  if (group) {
    return (
      <div className="cm-tpl">
        <style>{CSS}</style>
        <button type="button" className="cm-tpl-back" aria-label="Quay lại danh sách thành phần" onClick={() => setOpen(null)}>
          <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d={LEFT} />
          </svg>
          {group[0]}
        </button>
        <div className="cm-tpl-grid">
          {group[1].map(([type, def]) => (
            <Card key={type} type={type} def={def} editor={editor} drag={drag} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="cm-tpl">
      <style>{CSS}</style>
      {GROUPS.map(([category, items]) => (
        <section key={category} aria-label={category}>
          <div className="cm-tpl-head">
            <h3>{category}</h3>
            {items.length > FEATURED && (
              <button type="button" className="cm-tpl-all" aria-label={`Xem tất cả ${items.length} kiểu ${category}`} onClick={() => setOpen(category)}>
                Xem tất cả ({items.length})
              </button>
            )}
          </div>
          <div className="cm-tpl-grid">
            {items.slice(0, FEATURED).map(([type, def]) => (
              <Card key={type} type={type} def={def} editor={editor} drag={drag} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
