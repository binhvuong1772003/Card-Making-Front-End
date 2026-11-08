import type { ComponentDef, JsonValue } from "@miditor/core";
import type { Field } from "../forms/fields";

// Khối Biểu mẫu: một form khách điền, các câu hỏi nằm trong `fields` và sửa được ở bảng thuộc tính (ô `custom` kind
// "form-fields", xem `components/editor/form-fields-input.tsx`). Cấu hình đi theo BẢN ĐÃ XUẤT BẢN; CMBE
// (`cards/responses/form-fields.ts`) đọc ô, hạn, sổ công khai từ đó, không tin khách.
// Dữ liệu thuần, không có React: CMBE nhận bản sinh ra từ đây (`npm run blocks:export`), không chép tay.
// Nền, viền, bo góc, bóng KHÔNG phải thuộc tính của khối: dùng các nhóm Nền, Viền, Hiệu ứng có sẵn của Miditor cho mọi khối.
// Ô `custom` không bị Miditor kiểm giá trị (nó nhận mọi JSON), nên trần 20 câu hỏi do `cleanFields` và CMBE giữ.
const questions = { type: "custom", kind: "form-fields", label: "Câu hỏi", group: "Câu hỏi" } as const;
const publicList = {
  type: "custom",
  kind: "form-public-list",
  label: "Sổ công khai",
  group: "Sổ công khai",
  help: "Bật thì lời trả lời hiện công khai dưới form.",
} as const;

// Mã ẩn của form (xem `lib/cards/forms/form-id.ts`): rỗng trong mặc định, bảng Thành phần điền mã ngẫu nhiên khi thêm form.
const formId = { type: "custom", kind: "form-id", label: "Mã form", group: "Nội dung" } as const;

const DEFAULT_FIELDS: Field[] = [{ id: "name", type: "text", label: "Họ và tên", required: true }];

export const formBlock: ComponentDef = {
  label: "Biểu mẫu",
  category: "Biểu mẫu",
  icon: "text",
  keywords: ["biểu mẫu", "form", "câu hỏi", "xác nhận", "lời chúc", "đăng ký", "khảo sát"],
  description: "Câu hỏi cho khách điền: xác nhận tham dự, lời chúc, đăng ký.",
  size: { w: 380, h: 560 },
  canContain: false,
  defaultProps: {
    formId: "",
    heading: "Biểu mẫu",
    intro: "",
    button: "Gửi",
    success: "Cảm ơn bạn đã gửi.",
    deadline: "",
    fields: DEFAULT_FIELDS as unknown as JsonValue,
    publicList: { enabled: false, nameFieldId: "", textFieldId: "" },
    moderation: false,
    color: "#511419",
    padding: 16,
  },
  defaultStyles: { borderWidth: 1, borderColor: "#511419", borderRadius: 4 },
  fields: {
    formId,
    heading: { type: "text", label: "Tiêu đề", maxLength: 80, group: "Nội dung", help: "Để trống thì ẩn." },
    intro: { type: "text", label: "Lời dẫn", maxLength: 300, multiline: true, group: "Nội dung", help: "Để trống thì ẩn." },
    button: { type: "text", label: "Chữ nút", maxLength: 40, group: "Nội dung" },
    success: { type: "text", label: "Lời cảm ơn", maxLength: 200, multiline: true, group: "Nội dung", help: "Hiện sau khi khách gửi." },
    deadline: { type: "custom", kind: "date", label: "Hạn", group: "Hạn và giới hạn", help: "Form đóng sau hết ngày này theo giờ Việt Nam. Để trống thì không có hạn." },
    fields: questions,
    publicList,
    moderation: { type: "boolean", label: "Duyệt trước", group: "Sổ công khai", help: "Chỉ có nghĩa khi bật sổ công khai: lời mới chờ chủ thiệp duyệt mới hiện." },
    color: { type: "color", label: "Màu chữ và nút", group: "Giao diện" },
    padding: { type: "number", label: "Đệm", min: 0, max: 40, unit: "px", group: "Giao diện" },
  },
};
