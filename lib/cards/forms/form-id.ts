// Khoá gắn phản hồi với một form: `props.formId` (sinh ngẫu nhiên lúc thêm form từ bảng Thành phần), không có thì dùng id của nút.
// Chỉ dùng id của nút thì không đủ: Miditor luôn cấp lại id trống nhỏ nhất (`n1`, `n2`...), nên xoá một form rồi thêm form mới sẽ trùng
// khoá và phản hồi của form cũ dính sang form mới. CMBE (`cards/responses/form-id.ts`) dùng đúng quy tắc này; đổi bên nào phải đổi bên kia.
const FORM_ID = /^[A-Za-z0-9_-]{1,40}$/;

export function newFormId(random: () => number = Math.random): string {
  let id = "f";
  for (let i = 0; i < 10; i++) id += Math.floor(random() * 36).toString(36);
  return id;
}

export function formKeyOf(formId: unknown, nodeId: string): string {
  return typeof formId === "string" && FORM_ID.test(formId) ? formId : nodeId;
}
