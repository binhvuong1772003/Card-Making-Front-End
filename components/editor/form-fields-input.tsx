"use client";

import { Accessibility, defaultPreset, PointerActivationConstraints, PointerSensor } from "@dnd-kit/dom";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import type { JsonValue, TreeNode } from "@miditor/core";
import type { CustomFieldProps } from "@miditor/editor";
import { useEditor } from "@miditor/editor";
import { useMemo, useState } from "react";
import {
  cleanFields,
  cleanPublicList,
  duplicateField,
  FIELD_TYPES,
  MAX_FIELDS,
  MAX_OPTIONS,
  moveField,
  newField,
  removeField,
  type Field,
  type FieldType,
  type PublicList,
} from "@/lib/cards/forms/fields";

// Ô nhập hai prop `custom` của khối Form ở bảng thuộc tính:
// - "form-fields" (`fields`): danh sách câu hỏi. Mỗi hàng đóng hiện tay kéo, loại ô, nhãn; bấm vào mở phần sửa (nhãn, gợi ý, bắt buộc,
//   phương án, khoảng số, điều kiện hiện). Kéo để đổi thứ tự, hoặc nút Lên/Xuống cho người dùng bàn phím.
// - "form-public-list" (`publicList`): công tắc sổ công khai và hai ô chọn ô tên/ô lời. Đối tượng lồng nhau nên Miditor không có kiểu
//   dựng sẵn cho nó; là ô `custom` thứ hai như plan đã tính.
// Bản đang sửa giữ trong state riêng thay vì đọc lại `value` sau mỗi lần gõ: lúc đang gõ, nhãn hay một phương án có thể tạm trống (hợp lệ
// với người dùng, không hợp lệ với `cleanFields`), đọc lại sẽ làm ô đó biến mất giữa chừng. Chỉ nhận lại `value` khi nó đổi từ bên ngoài
// (hoàn tác, chọn khối khác, áp mẫu khác).
const CSS = `
/* Miditor xếp ô của bảng thành lưới hai cột và chưa cho ô "custom" chiếm cả hàng (giống ô ảnh, ô ngày). Nên sửa ở Miditor rồi bỏ dòng này. */
[class*="grid2"] > :has(.cm-ff-root){grid-column:1/-1}
.cm-ff-root{display:grid;gap:8px;min-width:0;width:100%}
.cm-ff-title{font-size:12px;font-weight:500;color:var(--miditor-muted,#6e6063);font-variant-numeric:tabular-nums}
.cm-ff-list{list-style:none;margin:0;padding:0;display:grid;gap:4px}
.cm-ff-row{border:1px solid var(--miditor-border-input,#d9cdd0);border-radius:var(--miditor-radius,8px);background:#fff;min-width:0}
.cm-ff-row[data-open]{border-color:var(--miditor-accent,#7b1e2b)}
.cm-ff-row[data-dragging]{opacity:.6;box-shadow:0 8px 20px rgba(42,34,36,.22)}
.cm-ff-head{display:flex;align-items:center;gap:2px;min-width:0}
.cm-ff-handle{flex:none;width:20px;height:34px;padding:0;border:0;background:none;color:var(--miditor-muted,#6e6063);cursor:grab;font-size:13px;line-height:1}
.cm-ff-handle:disabled{cursor:default;opacity:.35}
.cm-ff-toggle{flex:1;min-width:0;height:34px;padding:0 6px 0 0;border:0;background:none;display:flex;align-items:center;gap:6px;color:var(--miditor-text,#2a2224);font:inherit;font-size:13px;text-align:left;cursor:pointer}
.cm-ff-mark{flex:none;min-width:16px;height:16px;padding:0 3px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;border-radius:4px;background:var(--miditor-soft,#f4e6e9);color:var(--miditor-accent,#7b1e2b);font-size:10px;font-weight:600;line-height:1}
.cm-ff-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cm-ff-req{flex:none;color:var(--miditor-danger,#b3261e);font-weight:700}
.cm-ff-body{display:grid;gap:8px;padding:0 8px 8px;min-width:0}
.cm-ff-grid2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6px;min-width:0}
.cm-ff-field{display:grid;gap:3px;min-width:0}
.cm-ff-field > span{font-size:11px;color:var(--miditor-muted,#6e6063)}
.cm-ff-input,.cm-ff-select{width:100%;min-width:0;height:30px;box-sizing:border-box;padding:0 7px;border-radius:6px;border:1px solid var(--miditor-border-input,#d9cdd0);background:#fff;color:var(--miditor-text,#2a2224);font:inherit;font-size:13px}
.cm-ff-input:focus-visible,.cm-ff-select:focus-visible{outline:2px solid var(--miditor-focus,#2f6bff);outline-offset:1px}
.cm-ff-input:disabled,.cm-ff-select:disabled{background:var(--miditor-workspace,#f6f1f2);color:var(--miditor-muted,#6e6063)}
.cm-ff-check{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--miditor-text,#2a2224)}
.cm-ff-options{display:grid;gap:4px}
.cm-ff-option{display:flex;align-items:center;gap:4px;min-width:0}
.cm-ff-mini{flex:none;width:26px;height:30px;padding:0;border:1px solid var(--miditor-border-input,#d9cdd0);border-radius:6px;background:#fff;color:var(--miditor-text,#2a2224);font:inherit;font-size:13px;cursor:pointer}
.cm-ff-mini:disabled{opacity:.4;cursor:default}
.cm-ff-mini:hover:not(:disabled){border-color:var(--miditor-accent,#7b1e2b);color:var(--miditor-accent,#7b1e2b)}
.cm-ff-row-actions{display:flex;gap:4px;flex-wrap:wrap}
.cm-ff-act{height:28px;padding:0 8px;border:1px solid var(--miditor-border-input,#d9cdd0);border-radius:6px;background:#fff;color:var(--miditor-text,#2a2224);font:inherit;font-size:12px;cursor:pointer}
.cm-ff-act:hover:not(:disabled){border-color:var(--miditor-accent,#7b1e2b);color:var(--miditor-accent,#7b1e2b)}
.cm-ff-act:disabled{opacity:.4;cursor:default}
.cm-ff-act.cm-ff-danger{margin-left:auto;color:var(--miditor-danger,#b3261e)}
.cm-ff-add{width:100%;height:34px;border-radius:var(--miditor-radius,8px);border:1px solid var(--miditor-border-input,#d9cdd0);background:#fff;color:var(--miditor-text,#2a2224);font:inherit;font-size:13px;font-weight:500;cursor:pointer}
.cm-ff-add:hover:not(:disabled){background:var(--miditor-soft,#f4e6e9);border-color:var(--miditor-accent,#7b1e2b);color:var(--miditor-accent,#7b1e2b)}
.cm-ff-add:disabled{cursor:default;color:var(--miditor-muted,#6e6063);background:var(--miditor-workspace,#f6f1f2)}
.cm-ff-menu{list-style:none;margin:4px 0 0;padding:4px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:2px;border:1px solid var(--miditor-border,#ece3e5);border-radius:var(--miditor-radius,8px);background:#fff;box-shadow:0 6px 16px rgba(42,34,36,.12)}
.cm-ff-menu-item{width:100%;height:30px;padding:0 6px;border:0;border-radius:6px;background:none;display:flex;align-items:center;gap:6px;color:var(--miditor-text,#2a2224);font:inherit;font-size:12px;text-align:left;cursor:pointer;min-width:0}
.cm-ff-menu-item:hover{background:var(--miditor-soft,#f4e6e9);color:var(--miditor-accent,#7b1e2b)}
.cm-ff-menu-item > span{flex:none;min-width:16px;height:16px;padding:0 3px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;border-radius:4px;background:var(--miditor-soft,#f4e6e9);font-size:10px;font-weight:600;line-height:1}
.cm-ff-menu-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cm-ff-note{font-size:11px;line-height:1.4;color:var(--miditor-muted,#6e6063)}
.cm-ff-note.cm-ff-warn{color:var(--miditor-danger,#b3261e)}
.cm-ff-inline{display:flex;align-items:center;gap:6px;min-width:0}
.cm-ff-inline > .cm-ff-input{flex:1}
@media (prefers-reduced-motion:reduce){.cm-ff-row{transition:none}}
`;

// Tên loại ô trên menu "Thêm câu hỏi" (khác nhãn mặc định của ô: đó là câu hỏi, đây là loại dữ liệu).
const TYPE_NAMES: Record<FieldType, string> = {
  text: "Chữ ngắn",
  longtext: "Đoạn dài",
  choice: "Chọn một",
  multichoice: "Chọn nhiều",
  number: "Số",
  yesno: "Có hoặc không",
  date: "Ngày",
  phone: "Số điện thoại",
};

// Dấu thay cho biểu tượng loại ô: chữ một ký tự, không cần tải bộ icon nào và vẫn đọc được ở cỡ nhỏ.
const TYPE_MARKS: Record<FieldType, string> = {
  text: "Aa",
  longtext: "¶",
  choice: "◉",
  multichoice: "☑",
  number: "#",
  yesno: "◐",
  date: "▦",
  phone: "☎",
};

const isOptionType = (type: FieldType): boolean => type === "choice" || type === "multichoice";
const hasAnswer = (field: Field): boolean => field.type === "choice" || field.type === "yesno";

// Các prop khác của khối (ô này chỉ cầm một prop, nhưng cần biết sổ công khai đang trỏ vào ô nào, và ngược lại).
function blockProps(node: TreeNode, id: string): Record<string, unknown> | null {
  if (node.id === id) return node.props;
  for (const child of node.children) {
    const found = blockProps(child, id);
    if (found) return found;
  }
  return null;
}

interface RowProps {
  field: Field;
  index: number;
  count: number;
  earlier: Field[];
  open: boolean;
  readOnly: boolean;
  blocked: boolean;
  onToggle: () => void;
  onReplace: (field: Field) => void;
  onMove: (by: number) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

function QuestionRow({ field, index, count, earlier, open, readOnly, blocked, onToggle, onReplace, onMove, onDuplicate, onRemove }: RowProps) {
  // Chỉ tay kéo mới nhấc hàng: bấm vào thân hàng để mở, hai việc không giành nhau cử chỉ chuột.
  const { ref, handleRef, isDragging } = useSortable({ id: field.id, index, disabled: readOnly });

  const patch = (changes: Partial<Field>) => onReplace({ ...field, ...changes });
  const setOption = (at: number, text: string) => patch({ options: (field.options ?? []).map((option, i) => (i === at ? text : option)) });
  const addOption = () => {
    if ((field.options?.length ?? 0) < MAX_OPTIONS) patch({ options: [...(field.options ?? []), ""] });
  };
  const removeOption = (at: number) => {
    if ((field.options?.length ?? 0) > 2) patch({ options: (field.options ?? []).filter((_, i) => i !== at) });
  };
  // Khoảng số luôn hợp lệ: sửa một đầu thì kéo đầu kia theo, để không bao giờ lưu min > max.
  const setMin = (raw: string) => {
    const min = Math.min(1_000_000, Math.max(0, Math.trunc(Number(raw) || 0)));
    patch({ min, max: Math.max(min, field.max ?? 100) });
  };
  const setMax = (raw: string) => {
    const max = Math.min(1_000_000, Math.max(0, Math.trunc(Number(raw) || 0)));
    patch({ max, min: Math.min(max, field.min ?? 0) });
  };

  const target = field.showIf ? earlier.find((item) => item.id === field.showIf!.fieldId) : undefined;
  const answers: [string, string][] =
    target?.type === "yesno"
      ? [
          ["yes", "Có"],
          ["no", "Không"],
        ]
      : (target?.options ?? []).map((option) => [option, option]);

  const chooseCondition = (fieldId: string) => {
    if (fieldId === "") {
      const rest = { ...field };
      delete rest.showIf;
      onReplace(rest);
      return;
    }
    const wanted = earlier.find((item) => item.id === fieldId);
    if (!wanted) return;
    patch({ showIf: { fieldId, equals: wanted.type === "yesno" ? "yes" : (wanted.options?.[0] ?? "") } });
  };

  return (
    <li ref={ref} className="cm-ff-row" data-open={open ? "" : undefined} data-dragging={isDragging || undefined}>
      <div className="cm-ff-head">
        <button type="button" ref={handleRef} className="cm-ff-handle" aria-label={`Kéo để đổi thứ tự câu ${index + 1}`} title="Kéo để đổi thứ tự" disabled={readOnly}>
          ⠿
        </button>
        <button type="button" className="cm-ff-toggle" onClick={onToggle} aria-expanded={open}>
          <span className="cm-ff-mark" aria-hidden="true">
            {TYPE_MARKS[field.type]}
          </span>
          <span className="cm-ff-label">{field.label.trim() === "" ? "(chưa có nhãn)" : field.label}</span>
          {field.required && (
            <span className="cm-ff-req" title="Bắt buộc" aria-label="Bắt buộc">
              *
            </span>
          )}
        </button>
      </div>
      {open && (
        <div className="cm-ff-body">
          <label className="cm-ff-field">
            <span>Nhãn</span>
            <input className="cm-ff-input" value={field.label} maxLength={120} disabled={readOnly} onChange={(event) => patch({ label: event.target.value })} />
          </label>
          <label className="cm-ff-field">
            <span>Gợi ý (không bắt buộc)</span>
            <input className="cm-ff-input" value={field.hint ?? ""} maxLength={160} disabled={readOnly} onChange={(event) => patch({ hint: event.target.value })} />
          </label>
          <label className="cm-ff-check">
            <input type="checkbox" checked={field.required} disabled={readOnly} onChange={(event) => patch({ required: event.target.checked })} />
            Bắt buộc trả lời
          </label>

          {isOptionType(field.type) && (
            <div className="cm-ff-field">
              <span>Phương án (ít nhất 2)</span>
              <div className="cm-ff-options">
                {(field.options ?? []).map((option, at) => (
                  <div className="cm-ff-option" key={at}>
                    <input className="cm-ff-input" value={option} maxLength={80} disabled={readOnly} aria-label={`Phương án ${at + 1}`} onChange={(event) => setOption(at, event.target.value)} />
                    <button type="button" className="cm-ff-mini" aria-label={`Xoá phương án ${at + 1}`} title="Xoá phương án" disabled={readOnly || (field.options?.length ?? 0) <= 2} onClick={() => removeOption(at)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="cm-ff-act" disabled={readOnly || (field.options?.length ?? 0) >= MAX_OPTIONS} onClick={addOption}>
                + Thêm phương án
              </button>
            </div>
          )}

          {field.type === "number" && (
            <div className="cm-ff-grid2">
              <label className="cm-ff-field">
                <span>Nhỏ nhất</span>
                <input className="cm-ff-input" type="number" min={0} max={1_000_000} value={field.min ?? 0} disabled={readOnly} onChange={(event) => setMin(event.target.value)} />
              </label>
              <label className="cm-ff-field">
                <span>Lớn nhất</span>
                <input className="cm-ff-input" type="number" min={0} max={1_000_000} value={field.max ?? 100} disabled={readOnly} onChange={(event) => setMax(event.target.value)} />
              </label>
            </div>
          )}

          <label className="cm-ff-field">
            <span>Chỉ hiện khi</span>
            <select className="cm-ff-select" value={field.showIf?.fieldId ?? ""} disabled={readOnly || earlier.length === 0} onChange={(event) => chooseCondition(event.target.value)}>
              <option value="">{earlier.length === 0 ? "Luôn hiện (chưa có câu phía trên)" : "Luôn hiện"}</option>
              {earlier.filter(hasAnswer).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label || item.id}
                </option>
              ))}
            </select>
          </label>
          {field.showIf && (
            <select
              className="cm-ff-select"
              value={field.showIf.equals}
              disabled={readOnly}
              aria-label="Đáp án để hiện câu này"
              onChange={(event) => patch({ showIf: { fieldId: field.showIf!.fieldId, equals: event.target.value } })}
            >
              {answers.map(([value, name]) => (
                <option key={value} value={value}>
                  {name}
                </option>
              ))}
            </select>
          )}

          <div className="cm-ff-row-actions">
            <button type="button" className="cm-ff-act" disabled={readOnly || index === 0} onClick={() => onMove(-1)}>
              Lên
            </button>
            <button type="button" className="cm-ff-act" disabled={readOnly || index === count - 1} onClick={() => onMove(1)}>
              Xuống
            </button>
            <button type="button" className="cm-ff-act" disabled={readOnly || count >= MAX_FIELDS} onClick={onDuplicate}>
              Nhân đôi
            </button>
            <button type="button" className="cm-ff-act cm-ff-danger" disabled={readOnly || blocked} title={blocked ? "Câu này đang dùng cho sổ công khai. Chọn ô khác trong mục Sổ công khai trước." : "Xoá câu này"} onClick={onRemove}>
              Xoá
            </button>
          </div>
          {blocked && <span className="cm-ff-note">Câu này đang là ô tên hoặc ô lời của sổ công khai. Chọn ô khác trong mục Sổ công khai trước khi xoá.</span>}
        </div>
      )}
    </li>
  );
}

export function FormFieldsInput({ label, value, onChange, readOnly, nodeId }: CustomFieldProps) {
  const data = useEditor((view) => view.data);
  const publicList = useMemo(() => cleanPublicList(blockProps(data.root, nodeId)?.publicList), [data, nodeId]);

  const [rows, setRows] = useState<Field[]>(() => cleanFields(value));
  const [openId, setOpenId] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  // Giá trị gần nhất đã thấy, và bản đã gửi. `value` quay lại đúng bản mình vừa gửi là chuyện thường (mỗi lần gõ);
  // chỉ khi nó khác bản đã gửi mới là thay đổi từ bên ngoài (hoàn tác, đổi khối, áp mẫu).
  const [seen, setSeen] = useState<{ value: JsonValue | undefined; sent: string }>({ value, sent: "" });

  if (seen.value !== value) {
    const mine = JSON.stringify(value) === seen.sent;
    setSeen({ value, sent: seen.sent });
    if (!mine) setRows(cleanFields(value));
  }

  const commit = (next: Field[]) => {
    const payload = next as unknown as JsonValue;
    setRows(next);
    setSeen((old) => ({ value: old.value, sent: JSON.stringify(payload) }));
    onChange(payload);
  };

  const replace = (field: Field) => commit(rows.map((item) => (item.id === field.id ? field : item)));
  const move = (field: Field, by: number) => {
    const from = rows.findIndex((item) => item.id === field.id);
    commit(moveField(rows, from, from + by));
  };
  const duplicate = (field: Field) => {
    if (rows.length >= MAX_FIELDS) return;
    const next = duplicateField(rows, field.id);
    const added = next.find((item) => !rows.some((old) => old.id === item.id));
    commit(next);
    if (added) setOpenId(added.id);
  };
  const remove = (field: Field) => {
    commit(removeField(rows, field.id, publicList).fields);
    if (openId === field.id) setOpenId(null);
  };
  const add = (type: FieldType) => {
    if (rows.length >= MAX_FIELDS) return;
    const field = newField(type, rows.map((item) => item.id));
    commit([...rows, field]);
    setOpenId(field.id);
    setMenu(false);
  };

  const full = rows.length >= MAX_FIELDS;
  // Kéo chỉ bằng chuột và phải quá vài px mới tính (giống ô ảnh): bấm mở hàng không bị nuốt. Không có bàn phím cho việc kéo:
  // người dùng bàn phím đổi thứ tự bằng nút Lên/Xuống trong hàng đang mở.
  const dnd = useMemo(
    () => ({
      sensors: [PointerSensor.configure({ activationConstraints: [new PointerActivationConstraints.Distance({ value: 4 })] })],
      plugins: defaultPreset.plugins.filter((plugin) => plugin !== Accessibility),
    }),
    [],
  );

  return (
    <div className="cm-ff-root">
      <style>{CSS}</style>
      <span className="cm-ff-title">
        {label} ({rows.length}/{MAX_FIELDS})
        {rows.length > 1 && !readOnly && <span> · kéo để đổi thứ tự</span>}
      </span>
      {rows.length === 0 && <span className="cm-ff-note">Chưa có câu hỏi nào. Thêm câu hỏi đầu tiên bên dưới.</span>}
      {rows.length > 0 && (
        <DragDropProvider
          sensors={dnd.sensors}
          plugins={dnd.plugins}
          onDragEnd={(event) => {
            const { source } = event.operation;
            if (event.canceled || !isSortable(source)) return;
            if (source.initialIndex !== source.index) commit(moveField(rows, source.initialIndex, source.index));
          }}
        >
          <ul className="cm-ff-list">
            {rows.map((field, index) => (
              <QuestionRow
                key={field.id}
                field={field}
                index={index}
                count={rows.length}
                earlier={rows.slice(0, index)}
                open={openId === field.id}
                readOnly={Boolean(readOnly)}
                blocked={publicList.enabled && (publicList.nameFieldId === field.id || publicList.textFieldId === field.id)}
                onToggle={() => {
                  setOpenId(openId === field.id ? null : field.id);
                  setMenu(false);
                }}
                onReplace={replace}
                onMove={(by) => move(field, by)}
                onDuplicate={() => duplicate(field)}
                onRemove={() => remove(field)}
              />
            ))}
          </ul>
        </DragDropProvider>
      )}
      {!readOnly && (
        <>
          <button type="button" className="cm-ff-add" disabled={full} onClick={() => setMenu(!menu)} aria-expanded={menu}>
            {full ? `Đã đủ ${MAX_FIELDS} câu hỏi` : menu ? "Đóng danh sách loại" : "+ Thêm câu hỏi"}
          </button>
          {menu && !full && (
            <ul className="cm-ff-menu" role="menu" aria-label="Loại câu hỏi">
              {FIELD_TYPES.map((type) => (
                <li key={type}>
                  <button type="button" role="menuitem" className="cm-ff-menu-item" onClick={() => add(type)}>
                    <span aria-hidden="true">{TYPE_MARKS[type]}</span>
                    <span className="cm-ff-menu-name">{TYPE_NAMES[type]}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export function PublicListInput({ label, value, onChange, readOnly, nodeId }: CustomFieldProps) {
  const data = useEditor((view) => view.data);
  const choices = useMemo(() => cleanFields(blockProps(data.root, nodeId)?.fields).filter((field) => field.type === "text" || field.type === "longtext"), [data, nodeId]);
  const list = cleanPublicList(value);
  const commit = (changes: Partial<PublicList>) => onChange({ ...list, ...changes } as unknown as JsonValue);
  const gone = (id: string) => id !== "" && !choices.some((field) => field.id === id);

  return (
    <div className="cm-ff-root">
      <style>{CSS}</style>
      <span className="cm-ff-title">{label}</span>
      <label className="cm-ff-check">
        <input type="checkbox" checked={list.enabled} disabled={Boolean(readOnly)} onChange={(event) => commit({ enabled: event.target.checked })} />
        Hiện lời trả lời công khai
      </label>
      {list.enabled && (
        <>
          {choices.length === 0 ? (
            <span className="cm-ff-note">Chưa có câu trả lời kiểu chữ. Thêm một câu hỏi Chữ ngắn hoặc Đoạn dài trước.</span>
          ) : (
            <>
              <label className="cm-ff-field">
                <span>Ô tên</span>
                <select className="cm-ff-select" value={gone(list.nameFieldId) ? "" : list.nameFieldId} disabled={Boolean(readOnly)} onChange={(event) => commit({ nameFieldId: event.target.value })}>
                  <option value="">Chọn câu hỏi</option>
                  {choices.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="cm-ff-field">
                <span>Ô lời</span>
                <select className="cm-ff-select" value={gone(list.textFieldId) ? "" : list.textFieldId} disabled={Boolean(readOnly)} onChange={(event) => commit({ textFieldId: event.target.value })}>
                  <option value="">Chọn câu hỏi</option>
                  {choices.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.label}
                    </option>
                  ))}
                </select>
              </label>
              {(gone(list.nameFieldId) || gone(list.textFieldId)) && <span className="cm-ff-note cm-ff-warn">Câu hỏi đã chọn không còn trong form. Chọn lại.</span>}
              {(list.nameFieldId === "" || list.textFieldId === "") && <span className="cm-ff-note">Cần chọn đủ ô tên và ô lời thì sổ công khai mới hiện lời trả lời.</span>}
            </>
          )}
        </>
      )}
    </div>
  );
}
