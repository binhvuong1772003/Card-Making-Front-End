import type { ComponentDef, NodeStyles } from "@miditor/core";

// Khối Lịch: lịch một tháng (hoặc một tuần), đánh dấu một ngày (ngày cưới, sinh nhật...). Đổi được màu, kiểu chữ, hình đánh dấu, ngày đầu
// tuần. Nền, viền, bo góc, bóng KHÔNG phải thuộc tính của khối: dùng các nhóm Nền, Viền, Hiệu ứng có sẵn của Miditor cho mọi khối, còn kiểu
// lịch nào cần nền hay viền sẵn thì mang theo `defaultStyles`. Dữ liệu thuần, không có React: CMBE nhận bản sinh ra từ đây
// (`npm run blocks:export`), không chép tay. Mỗi kiểu lịch là một loại khối riêng (Miditor có một ô cho mỗi loại trong thư viện), cùng nhóm
// "Lịch" và cùng cách vẽ, chỉ khác thiết lập mặc định. Thêm kiểu mới: thêm một mục vào `calendarDefinitions` và một dòng vào
// `lib/cards/blocks/index.tsx`. Ba lựa chọn thì Miditor vẽ thành một hàng nút đủ chữ; nhiều hơn là ô thả xuống hẹp (nhãn phải ngắn).
export const MARK_SHAPES = ["Tròn", "Tim", "Vuông", "Vòng", "Sao"] as const;
export type MarkShape = (typeof MARK_SHAPES)[number];

// Thuộc tính đã bỏ khỏi khối lịch (trước đây là khung riêng, nay là nhóm Nền, Viền của Miditor). Thiệp đã lưu có thể còn giữ chúng: CMBE bỏ chúng
// khi kiểm trang, nếu không Miditor từ chối thuộc tính không còn trong định nghĩa và lưu nháp báo lỗi.
export const RETIRED_CALENDAR_PROPS = ["filled", "fill", "borderWidth", "borderColor", "radius"] as const;

// Mọi thuộc tính một khối lịch có.
const base: ComponentDef = {
  label: "Lịch tháng",
  category: "Lịch",
  icon: "grid",
  keywords: ["lịch", "calendar", "ngày cưới", "tháng", "ngày"],
  size: { w: 340, h: 320 },
  canContain: false,
  defaultProps: {
    date: "2026-01-03",
    sundayFirst: false,
    weekOnly: false,
    showTitle: true,
    lines: false,
    innerFrame: false,
    markShape: "Tròn",
    markColor: "#511419",
    markTextColor: "#ffffff",
    color: "#511419",
    weekColor: "#8a5a5e",
    size: 16,
    padding: 0,
    font: "",
    titleFont: "",
    eventButton: "",
    eventTitle: "",
    eventTime: "",
    eventMinutes: 180,
    eventPlace: "",
    eventNote: "",
  },
  fields: {
    date: { type: "custom", kind: "date", label: "Ngày", group: "Ngày" },
    weekOnly: { type: "boolean", label: "Một tuần", group: "Ngày", help: "Chỉ hiện tuần có ngày được chọn." },
    sundayFirst: { type: "boolean", label: "Tuần từ CN", group: "Ngày", help: "Bật thì tuần bắt đầu từ Chủ nhật, tắt thì từ Thứ hai." },
    showTitle: { type: "boolean", label: "Tên tháng", group: "Ngày", help: "Hiện dòng tên tháng và năm phía trên." },
    lines: { type: "boolean", label: "Kẻ ô", group: "Ngày", help: "Kẻ đường mảnh giữa các ngày." },
    innerFrame: { type: "boolean", label: "Viền trong", group: "Ngày", help: "Một đường mảnh nằm trong khối, tạo khung đôi khi khối đã có viền ngoài." },
    markShape: { type: "select", label: "Hình", options: MARK_SHAPES, group: "Hình đánh dấu", help: "Hình bao quanh ngày được chọn." },
    markColor: { type: "color", label: "Hình đánh dấu", group: "Màu" },
    markTextColor: { type: "color", label: "Số trên hình", group: "Màu" },
    color: { type: "color", label: "Số ngày và tên tháng", group: "Màu" },
    weekColor: { type: "color", label: "Thứ trong tuần", group: "Màu" },
    font: { type: "font", label: "Chữ số và thứ", group: "Chữ" },
    titleFont: { type: "font", label: "Chữ tên tháng", group: "Chữ" },
    size: { type: "number", label: "Cỡ", min: 10, max: 32, unit: "px", group: "Chữ", help: "Cỡ chữ của số ngày; tên tháng và thứ tính theo đó." },
    padding: { type: "number", label: "Đệm", min: 0, max: 32, unit: "px", group: "Chữ", help: "Khoảng đệm giữa mép khối và lịch." },
    eventButton: { type: "text", label: "Chữ nút", maxLength: 40, group: "Thêm vào lịch", help: "Nút cho khách thêm ngày này vào Google Calendar hoặc tải tệp .ics. Để trống thì ẩn nút." },
    eventTitle: { type: "text", label: "Tên sự kiện", maxLength: 120, group: "Thêm vào lịch", help: "Tên hiện trong lịch của khách. Để trống thì là \"Sự kiện\"." },
    eventTime: { type: "custom", kind: "time", label: "Giờ bắt đầu", group: "Thêm vào lịch", help: "Giờ Việt Nam. Để trống thì là sự kiện cả ngày." },
    eventMinutes: { type: "number", label: "Dài", min: 15, max: 1440, unit: "phút", group: "Thêm vào lịch", help: "Sự kiện kéo dài bao nhiêu phút. Chỉ dùng khi có giờ bắt đầu." },
    eventPlace: { type: "text", label: "Địa điểm", maxLength: 200, group: "Thêm vào lịch" },
    eventNote: { type: "text", label: "Ghi chú", maxLength: 500, multiline: true, group: "Thêm vào lịch" },
  },
};

const variant = (
  label: string,
  overrides: Record<string, string | number | boolean>,
  options: { size?: { w: number; h: number }; styles?: NodeStyles } = {},
): ComponentDef => ({
  ...base,
  label,
  ...(options.size ? { size: options.size } : {}),
  defaultProps: { ...base.defaultProps, ...overrides },
  ...(options.styles ? { defaultStyles: options.styles } : {}),
});

// Các kiểu lịch trong thư viện, theo thứ tự hiện. Khoá là `type` lưu trong thiệp: đổi tên khoá là làm hỏng các thiệp đã lưu.
export const calendarDefinitions: Record<string, ComponentDef> = {
  Calendar: variant("Lịch tháng", {}),
  CalendarHeart: variant("Lịch trái tim", {
    markShape: "Tim",
    markColor: "#c2415b",
    color: "#7a2f3f",
    weekColor: "#c98a96",
    size: 17,
    font: "'Cormorant Garamond', serif",
    titleFont: "'Great Vibes', cursive",
  }),
  CalendarFrame: variant(
    "Lịch khung viền",
    { lines: true, markShape: "Vuông", padding: 14, font: "'Playfair Display', serif", titleFont: "'Playfair Display', serif" },
    { styles: { borderWidth: 2, borderColor: "#511419", borderRadius: 4 } },
  ),
  CalendarDark: variant(
    "Lịch nền đỏ đô",
    {
      color: "#f4e6e9",
      weekColor: "#d9a9b1",
      markColor: "#f4e6e9",
      markTextColor: "#511419",
      padding: 16,
      font: "'Montserrat', sans-serif",
      titleFont: "'Playfair Display', serif",
    },
    { styles: { background: "#511419", borderRadius: 16 } },
  ),
  CalendarWeek: variant(
    "Lịch một tuần",
    { weekOnly: true, padding: 12, size: 18, font: "'Nunito', sans-serif", titleFont: "'Cormorant Garamond', serif" },
    { size: { w: 340, h: 150 }, styles: { background: "#f6efe6", borderRadius: 16 } },
  ),
};

// Khối đầu tiên giữ tên cũ để thiệp đã lưu vẫn đúng.
export const calendarBlock = calendarDefinitions.Calendar!;

export interface MonthGrid {
  title: string;
  weekdays: readonly string[];
  /** Mỗi hàng là một tuần: số ngày hoặc `null` cho ô trống của tháng trước và sau. */
  weeks: (number | null)[][];
  /** Ngày được đánh dấu. */
  marked: number;
}

const MONDAY_FIRST = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"] as const;
const SUNDAY_FIRST = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"] as const;

// Chỉ dùng số học theo UTC: trang dựng trên máy chủ rồi dựng lại ở trình duyệt, múi giờ khác nhau không được làm đổi ngày.
// Ngày không hợp lệ (rỗng, sai dạng, 31 tháng 2) cho `undefined`; nơi gọi tự quyết hiện gì.
export function monthGrid(date: unknown, sundayFirst: boolean): MonthGrid | undefined {
  if (typeof date !== "string") return undefined;
  const found = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!found) return undefined;
  const year = Number(found[1]);
  const month = Number(found[2]);
  const day = Number(found[3]);
  if (month < 1 || month > 12 || year < 1) return undefined;
  const length = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > length) return undefined;
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(); // 0 là Chủ nhật
  const lead = sundayFirst ? first : (first + 6) % 7;
  const cells: (number | null)[] = [...Array<null>(lead).fill(null), ...Array.from({ length }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, row) => cells.slice(row * 7, row * 7 + 7));
  return { title: `Tháng ${month} / ${year}`, weekdays: sundayFirst ? SUNDAY_FIRST : MONDAY_FIRST, weeks, marked: day };
}

// Chỉ tuần có ngày được đánh dấu (cho kiểu lịch một tuần).
export function weekOnly(grid: MonthGrid): MonthGrid {
  return { ...grid, weeks: grid.weeks.filter((week) => week.includes(grid.marked)) };
}
