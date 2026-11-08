import type { JsonValue } from "@miditor/core";
import type { Field } from "../forms/fields";

// Form dựng sẵn: cùng MỘT loại khối `Form`, chỉ khác giá trị mặc định. Bảng "Thành phần" hiện chúng thành thẻ riêng (step 10 của
// kế hoạch), nên đây là chỗ duy nhất định nghĩa chúng — thêm mẫu mới là thêm một phần tử vào `formPresets`.
// Mã ô cố định (`name`, `attending`, `guests`, `message`): CMBE đổi khối `Rsvp`/`Guestbook` cũ sang `Form` bằng đúng bộ ô này
// (`src/modules/cards/responses/legacy.ts`), đổi một bên phải đổi bên kia.
export interface FormPreset {
  id: "attendance" | "wishes" | "blank";
  label: string;
  description: string;
  props: Record<string, JsonValue>;
}

const shared = {
  deadline: "",
  moderation: false,
  color: "#511419",
  padding: 16,
  publicList: { enabled: false, nameFieldId: "", textFieldId: "" },
} as const;

const ATTEND = "Có, tôi sẽ đến";

const attendance: Field[] = [
  { id: "name", type: "text", label: "Họ và tên", required: true },
  { id: "attending", type: "choice", label: "Bạn sẽ đến chứ?", required: true, options: [ATTEND, "Rất tiếc, không đến được", "Chưa chắc"] },
  {
    id: "guests",
    type: "number",
    label: "Số khách (tính cả bạn)",
    required: true,
    min: 1,
    max: 4,
    showIf: { fieldId: "attending", equals: ATTEND },
  },
];

const wishes: Field[] = [
  { id: "name", type: "text", label: "Tên của bạn", required: true },
  { id: "message", type: "longtext", label: "Lời chúc", required: true },
];

const blank: Field[] = [{ id: "name", type: "text", label: "Họ và tên", required: true }];

const fields = (list: Field[]): JsonValue => list as unknown as JsonValue;

export const formPresets: FormPreset[] = [
  {
    id: "attendance",
    label: "Xác nhận tham dự",
    description: "Hỏi khách có đến không và đi mấy người.",
    props: {
      ...shared,
      heading: "Bạn sẽ đến chứ?",
      intro: "Cô dâu chú rể rất mong có bạn.",
      button: "Gửi xác nhận",
      success: "Cảm ơn bạn, chúng mình đã nhận được xác nhận.",
      fields: fields(attendance),
    },
  },
  {
    id: "wishes",
    label: "Lời chúc",
    description: "Khách gửi lời chúc, hiện công khai dưới form.",
    props: {
      ...shared,
      heading: "Sổ lưu bút",
      intro: "Gửi vài dòng chúc mừng. Lời chúc hiện công khai trên thiệp cho mọi người cùng đọc.",
      button: "Gửi lời chúc",
      success: "Cảm ơn bạn. Lời chúc đã hiện trong sổ.",
      fields: fields(wishes),
      publicList: { enabled: true, nameFieldId: "name", textFieldId: "message" },
    },
  },
  {
    id: "blank",
    label: "Form trống",
    description: "Bắt đầu từ đầu với một ô tên.",
    props: {
      ...shared,
      heading: "Biểu mẫu",
      intro: "",
      button: "Gửi",
      success: "Cảm ơn bạn đã gửi.",
      fields: fields(blank),
    },
  },
];
