// Luật của khối `Form` ở phía frontend: kiểu ô, sửa danh sách ô trong editor, và kiểm câu trả lời trước khi gửi. Hợp đồng với
// CMBE (`src/modules/cards/responses/form-fields.ts`): cùng bảng giới hạn, đổi bên nào phải đổi bên kia. Backend vẫn là nơi quyết
// định cuối cùng; phần này chỉ giúp khách thấy lỗi ngay và giúp editor giữ dữ liệu đúng dạng. Không React để test được.
export const FIELD_TYPES = ["text", "longtext", "choice", "multichoice", "number", "yesno", "date", "phone"] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

export interface ShowIf {
  fieldId: string;
  /** Chuỗi phương án của ô `choice`, hoặc "yes"/"no" của ô `yesno`. */
  equals: string;
}

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  hint?: string;
  required: boolean;
  /** Chỉ cho `choice`/`multichoice`: 2–20 phương án, không trùng. */
  options?: string[];
  /** Chỉ cho `number`; mặc định 0 và 100. */
  min?: number;
  max?: number;
  showIf?: ShowIf;
}

export interface PublicList {
  enabled: boolean;
  nameFieldId: string;
  textFieldId: string;
}

/** Giá trị khách đã điền, theo mã ô. */
export type Answers = Record<string, unknown>;
/** Lỗi theo mã ô, để hiện dưới đúng ô. */
export type AnswerErrors = Record<string, string>;

export const MAX_FIELDS = 20;
export const MAX_OPTIONS = 20;
export const MAX_TEXT = 200;
export const MAX_LONG = 1000;
const MAX_BOUND = 1_000_000;

// Nhãn mặc định của ô mới: tên loại, trừ ô chữ ngắn (ô hay thêm nhất).
export const FIELD_LABELS: Record<FieldType, string> = {
  text: "Câu hỏi mới",
  longtext: "Đoạn dài",
  choice: "Chọn một",
  multichoice: "Chọn nhiều",
  number: "Số",
  yesno: "Có hoặc không",
  date: "Ngày",
  phone: "Số điện thoại",
};

const ID = /^[a-z0-9_]{1,24}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const PHONE = /^[0-9+().\-\s]+$/;
const CONTROL_TEXT = /[\u0000-\u001F\u007F]/;
const CONTROL_LONG = /[\u0000-\u0009\u000B-\u001F\u007F]/;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const isFieldType = (value: unknown): value is FieldType => typeof value === "string" && (FIELD_TYPES as readonly string[]).includes(value);
const hasOptions = (type: FieldType): boolean => type === "choice" || type === "multichoice";

function readOptions(raw: unknown): string[] | null {
  if (!Array.isArray(raw) || raw.length < 2 || raw.length > MAX_OPTIONS) return null;
  const options: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") return null;
    const text = item.trim();
    if (text === "" || text.length > 80 || options.includes(text)) return null;
    options.push(text);
  }
  return options;
}

function readBounds(minRaw: unknown, maxRaw: unknown): { min: number; max: number } {
  const min = typeof minRaw === "number" && Number.isInteger(minRaw) && minRaw >= 0 && minRaw <= MAX_BOUND ? minRaw : 0;
  const max = typeof maxRaw === "number" && Number.isInteger(maxRaw) && maxRaw >= 0 && maxRaw <= MAX_BOUND ? maxRaw : 100;
  return min <= max ? { min, max } : { min: 0, max: 100 };
}

// Chỉ nhận điều kiện trỏ tới ô `choice`/`yesno` ĐỨNG TRƯỚC, nhờ vậy khi vẽ và khi kiểm chỉ cần một lượt từ trên xuống.
function readShowIf(raw: unknown, before: Field[]): ShowIf | undefined {
  if (!isRecord(raw)) return undefined;
  const { fieldId, equals } = raw;
  if (typeof fieldId !== "string" || typeof equals !== "string") return undefined;
  const target = before.find((item) => item.id === fieldId);
  return target && (target.type === "choice" || target.type === "yesno") ? { fieldId, equals } : undefined;
}

// Ô hỏng bị bỏ chứ không làm cả form hỏng: dữ liệu có thể đến từ thiệp lưu từ bản cũ.
function readField(raw: unknown, taken: Set<string>, before: Field[]): Field | null {
  if (!isRecord(raw)) return null;
  const { id, type, label } = raw;
  if (typeof id !== "string" || !ID.test(id) || taken.has(id)) return null;
  if (!isFieldType(type)) return null;
  if (typeof label !== "string" || label.trim() === "" || label.trim().length > 120) return null;

  const field: Field = { id, type, label: label.trim(), required: raw.required === true };
  if (typeof raw.hint === "string" && raw.hint.trim() !== "" && raw.hint.trim().length <= 160) field.hint = raw.hint.trim();
  if (hasOptions(type)) {
    const options = readOptions(raw.options);
    if (!options) return null;
    field.options = options;
  }
  if (type === "number") Object.assign(field, readBounds(raw.min, raw.max));
  const showIf = readShowIf(raw.showIf, before);
  if (showIf) field.showIf = showIf;
  return field;
}

/** Danh sách ô an toàn để vẽ và gửi: bỏ ô hỏng, ô trùng mã, quá 20 ô. */
export function cleanFields(raw: unknown): Field[] {
  if (!Array.isArray(raw)) return [];
  const fields: Field[] = [];
  const taken = new Set<string>();
  for (const item of raw) {
    if (fields.length >= MAX_FIELDS) break;
    const field = readField(item, taken, fields);
    if (field) {
      fields.push(field);
      taken.add(field.id);
    }
  }
  return fields;
}

/** Một ô mới dùng được ngay, với mã chưa trùng ô nào trong form. */
export function newField(type: FieldType, existingIds: readonly string[]): Field {
  const taken = new Set(existingIds);
  let id = "";
  do {
    id = `f_${Math.random().toString(36).slice(2, 10)}`;
  } while (id.length !== 10 || taken.has(id) || !ID.test(id));

  const field: Field = { id, type, label: FIELD_LABELS[type], required: false };
  if (hasOptions(type)) field.options = ["Lựa chọn 1", "Lựa chọn 2"];
  if (type === "number") Object.assign(field, { min: 0, max: 100 });
  return field;
}

export function moveField(fields: Field[], from: number, to: number): Field[] {
  const next = [...fields];
  if (from === to || from < 0 || to < 0 || from >= next.length || to >= next.length) return next;
  next.splice(to, 0, next.splice(from, 1)[0]!);
  return next;
}

/** Bản sao nằm ngay sau ô gốc, mã mới; điều kiện của bản sao vẫn trỏ tới ô đứng trước nên còn đúng. */
export function duplicateField(fields: Field[], id: string): Field[] {
  const index = fields.findIndex((field) => field.id === id);
  if (index < 0) return [...fields];
  const copy: Field = { ...fields[index]!, id: newField(fields[index]!.type, fields.map((field) => field.id)).id };
  return [...fields.slice(0, index + 1), copy, ...fields.slice(index + 1)];
}

// Xoá ô, bỏ điều kiện trỏ tới nó (ô kia thành luôn hiện) và dọn lựa chọn ô tên/lời của sổ công khai.
export function removeField(fields: Field[], id: string, publicList: PublicList): { fields: Field[]; publicList: PublicList } {
  const kept = fields
    .filter((field) => field.id !== id)
    .map((field) => {
      if (field.showIf?.fieldId !== id) return field;
      const { showIf: _dropped, ...rest } = field;
      return rest;
    });
  return {
    fields: kept,
    publicList: {
      ...publicList,
      nameFieldId: publicList.nameFieldId === id ? "" : publicList.nameFieldId,
      textFieldId: publicList.textFieldId === id ? "" : publicList.textFieldId,
    },
  };
}

// Đáp án của ô điều kiện, quy về chuỗi: ô yesno thành "yes"/"no". Ô đang bị ẩn cũng không có đáp án.
function conditionValue(field: Field | undefined, values: Answers): string | undefined {
  if (!field) return undefined;
  const value = values[field.id];
  if (field.type === "yesno") return value === true ? "yes" : value === false ? "no" : undefined;
  return typeof value === "string" ? value : undefined;
}

export function visibleFields(fields: Field[], values: Answers): Field[] {
  const byId = new Map(fields.map((field) => [field.id, field]));
  const visible: Field[] = [];
  const seen: Answers = {};
  for (const field of fields) {
    const condition = field.showIf;
    if (condition && conditionValue(byId.get(condition.fieldId), seen) !== condition.equals) continue;
    visible.push(field);
    seen[field.id] = values[field.id];
  }
  return visible;
}

const MISSING = Symbol("missing");
type Read = { ok: true; value: string | number | boolean | string[] } | { ok: true; value: typeof MISSING } | { ok: false; message: string };

function readValue(field: Field, raw: unknown): Read {
  switch (field.type) {
    case "text":
    case "longtext": {
      if (raw === undefined || raw === null) return { ok: true, value: MISSING };
      if (typeof raw !== "string") return { ok: false, message: "Chỉ nhận chữ." };
      const value = raw.trim();
      if (value === "") return { ok: true, value: MISSING };
      const max = field.type === "text" ? MAX_TEXT : MAX_LONG;
      if (value.length > max) return { ok: false, message: `Dài quá ${max} ký tự.` };
      if ((field.type === "text" ? CONTROL_TEXT : CONTROL_LONG).test(value)) return { ok: false, message: "Có ký tự không hợp lệ." };
      return { ok: true, value };
    }
    case "phone": {
      if (raw === undefined || raw === null) return { ok: true, value: MISSING };
      if (typeof raw !== "string") return { ok: false, message: "Số điện thoại chưa đúng." };
      const value = raw.trim();
      if (value === "") return { ok: true, value: MISSING };
      if (value.length < 6 || value.length > 20 || !PHONE.test(value)) return { ok: false, message: "Số điện thoại chưa đúng." };
      return { ok: true, value };
    }
    case "date": {
      if (raw === undefined || raw === null || raw === "") return { ok: true, value: MISSING };
      if (typeof raw !== "string" || !DATE.test(raw)) return { ok: false, message: "Ngày chưa đúng." };
      const [year, month, day] = raw.split("-").map(Number) as [number, number, number];
      const probe = new Date(Date.UTC(year, month - 1, day));
      if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) return { ok: false, message: "Ngày chưa đúng." };
      return { ok: true, value: raw };
    }
    case "number": {
      if (raw === undefined || raw === null) return { ok: true, value: MISSING };
      if (typeof raw !== "number" || !Number.isInteger(raw)) return { ok: false, message: "Nhập số nguyên." };
      const min = field.min ?? 0;
      const max = field.max ?? 100;
      if (raw < min || raw > max) return { ok: false, message: `Từ ${min} đến ${max}.` };
      return { ok: true, value: raw };
    }
    case "choice": {
      if (raw === undefined || raw === null || raw === "") return { ok: true, value: MISSING };
      if (typeof raw !== "string" || !field.options?.includes(raw)) return { ok: false, message: "Chọn một đáp án trong danh sách." };
      return { ok: true, value: raw };
    }
    case "multichoice": {
      if (raw === undefined || raw === null) return { ok: true, value: MISSING };
      if (!Array.isArray(raw)) return { ok: false, message: "Chọn đáp án trong danh sách." };
      const values: string[] = [];
      for (const item of raw) {
        if (typeof item !== "string" || !field.options?.includes(item) || values.includes(item)) return { ok: false, message: "Chọn đáp án trong danh sách." };
        values.push(item);
      }
      if (values.length === 0) return field.required ? { ok: false, message: "Câu này cần trả lời." } : { ok: true, value: MISSING };
      return { ok: true, value: values };
    }
    case "yesno": {
      if (raw === undefined || raw === null) return { ok: true, value: MISSING };
      if (typeof raw !== "boolean") return { ok: false, message: "Chọn Có hoặc Không." };
      return { ok: true, value: raw };
    }
  }
}

/** Lỗi theo mã ô; rỗng nghĩa là gửi được. Ô bị `showIf` ẩn không bắt buộc và không bị kiểm. */
export function validateAnswers(fields: Field[], values: Answers): AnswerErrors {
  const errors: AnswerErrors = {};
  for (const field of visibleFields(fields, values)) {
    const read = readValue(field, values[field.id]);
    if (!read.ok) errors[field.id] = read.message;
    else if (read.value === MISSING && field.required) errors[field.id] = "Câu này cần trả lời.";
  }
  return errors;
}

/** Phần gửi lên CMBE: chỉ ô đang hiện, đã trả lời, giá trị đã chuẩn hoá (bỏ khoảng trắng thừa). */
export function answerPayload(fields: Field[], values: Answers): Answers {
  const answers: Answers = {};
  for (const field of visibleFields(fields, values)) {
    const read = readValue(field, values[field.id]);
    if (read.ok && read.value !== MISSING) answers[field.id] = read.value;
  }
  return answers;
}

// Hết ngày hạn theo giờ Việt Nam (UTC+7), giống `isClosed` của CMBE. Ngày không có thật coi như không có hạn.
export function isClosed(deadline: string, now: Date): boolean {
  if (!deadline) return false;
  const [year, month, day] = deadline.split("-").map(Number) as [number, number, number];
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) return false;
  return now.getTime() > Date.UTC(year, month - 1, day, 16, 59, 59, 999);
}
