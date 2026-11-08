import type { ComponentDef } from "@miditor/core";
import { albumDefinitions } from "./album";
import { calendarDefinitions, RETIRED_CALENDAR_PROPS } from "./calendar";
import { mapBlock, RETIRED_MAP_PROPS } from "./map";

// Mọi loại khối riêng của CardMaking (dữ liệu thuần, không có React): thứ tự ở đây là thứ tự trong bảng "Thành phần". Editor dùng nó, và CMBE nhận
// bản sinh ra từ đây bằng `npm run blocks:export` để kiểm trang; bài test `definitions.test.ts` báo nếu bản của CMBE đã cũ.
// `hidden`: các khối này chỉ được chọn ở bảng "Thành phần" (có hình xem trước, mỗi nhóm vài kiểu), không lặp lại trong thư viện "Khối" của Miditor.
// Khối ẩn vẫn là một loại bình thường: thêm được bằng `editor.addBlock`, vẽ, lưu và kiểm như mọi khối.
const raw: Record<string, ComponentDef> = {
  ...albumDefinitions,
  Map: mapBlock,
  ...calendarDefinitions,
};

export const cardDefinitions: Record<string, ComponentDef> = Object.fromEntries(Object.entries(raw).map(([type, def]) => [type, { ...def, hidden: true }]));

// Thuộc tính đã bỏ khỏi từng loại khối. Thiệp đã lưu có thể còn giữ chúng; CMBE bỏ chúng khi kiểm trang (`retired-props.json` do `blocks:export` sinh).
export const retiredProps: Record<string, readonly string[]> = {
  Map: RETIRED_MAP_PROPS,
  ...Object.fromEntries(Object.keys(calendarDefinitions).map((type) => [type, RETIRED_CALENDAR_PROPS])),
};
