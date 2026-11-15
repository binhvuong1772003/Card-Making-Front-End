import { type ComponentDef, isImageUrl } from "@miditor/core";

// Khối Album ảnh, bốn kiểu: xoay 3D (coverflow, tự chạy), lưới, băng ngang (vuốt), ảnh dán (khung trắng nghiêng nhẹ). Bấm một ảnh thì phóng to.
// Dữ liệu thuần, không có React: CMBE nhận bản sinh ra từ đây (`npm run blocks:export`), không chép tay. Mỗi kiểu là một loại khối riêng
// (Miditor có một ô cho mỗi loại trong thư viện), cùng nhóm "Album". Thêm kiểu mới: thêm vào `albumDefinitions` và `lib/cards/blocks/index.tsx`.
export const ALBUM_DOT_COLOR = "#511419";

const images = { type: "custom", kind: "image-list", label: "Ảnh", group: "Nội dung" } as const;
const lightbox = { type: "boolean", label: "Phóng to ảnh", group: "Chuyển ảnh", help: "Bấm vào ảnh để xem lớn." } as const;

// Khối đầu tiên giữ tên cũ (`Album`) để thiệp đã lưu vẫn đúng.
export const albumBlock: ComponentDef = {
  label: "Album xoay 3D",
  category: "Album",
  icon: "img",
  keywords: ["album", "ảnh", "gallery", "carousel", "coverflow", "xoay"],
  size: { w: 680, h: 440 },
  canContain: false,
  defaultProps: { images: [], autoplay: true, interval: 1.5, lightbox: true, radius: 16, dotColor: ALBUM_DOT_COLOR, startAt: 1, spread: 0 },
  fields: {
    images,
    autoplay: { type: "boolean", label: "Tự chạy", group: "Chuyển ảnh" },
    interval: { type: "number", label: "Mỗi ảnh", min: 0.5, max: 10, unit: "s", group: "Chuyển ảnh" },
    startAt: { type: "number", label: "Ảnh bắt đầu", min: 1, max: 30, group: "Chuyển ảnh" },
    lightbox,
    radius: { type: "number", label: "Bo góc ảnh", min: 0, max: 48, unit: "px", group: "Kiểu dáng" },
    spread: { type: "number", label: "Ảnh tràn ra hai bên", min: 0, max: 600, unit: "px", group: "Kiểu dáng", help: "Các ảnh hai bên được thấy thêm bấy nhiêu px ngoài khung khối (đặt bằng quãng tới mép trang). 0 thì cắt đúng khung khối." },
    dotColor: { type: "color", label: "Màu chỉ số ảnh", group: "Kiểu dáng" },
  },
};

export const albumDefinitions: Record<string, ComponentDef> = {
  Album: albumBlock,
  AlbumGrid: {
    label: "Album lưới",
    category: "Album",
    icon: "grid",
    keywords: ["album", "ảnh", "lưới", "grid", "gallery"],
    size: { w: 380, h: 380 },
    canContain: false,
    defaultProps: { images: [], columns: 3, gap: 8, radius: 8, lightbox: true },
    fields: {
      images,
      columns: { type: "number", label: "Cột", min: 1, max: 4, group: "Kiểu dáng", help: "Số ảnh trên một hàng. Các ảnh chia đều chiều cao của khối." },
      gap: { type: "number", label: "Cách", min: 0, max: 24, unit: "px", group: "Kiểu dáng", help: "Khoảng cách giữa các ảnh." },
      radius: { type: "number", label: "Bo góc", min: 0, max: 32, unit: "px", group: "Kiểu dáng" },
      lightbox,
    },
  },
  AlbumStrip: {
    label: "Album băng ngang",
    category: "Album",
    icon: "img",
    keywords: ["album", "ảnh", "băng", "ngang", "slider", "cuộn"],
    size: { w: 380, h: 260 },
    canContain: false,
    defaultProps: { images: [], gap: 10, radius: 10, lightbox: true },
    fields: {
      images,
      gap: { type: "number", label: "Cách", min: 0, max: 24, unit: "px", group: "Kiểu dáng", help: "Khoảng cách giữa các ảnh." },
      radius: { type: "number", label: "Bo góc", min: 0, max: 32, unit: "px", group: "Kiểu dáng" },
      lightbox,
    },
  },
  AlbumPolaroid: {
    label: "Album ảnh dán",
    category: "Album",
    icon: "img",
    keywords: ["album", "ảnh", "dán", "polaroid", "khung"],
    size: { w: 380, h: 560 },
    canContain: false,
    defaultProps: { images: [], columns: 2, tilt: 5, frameColor: "#ffffff", radius: 2, lightbox: true },
    fields: {
      images,
      columns: { type: "number", label: "Cột", min: 1, max: 3, group: "Kiểu dáng", help: "Số ảnh trên một hàng. Các ảnh chia đều chiều cao của khối." },
      tilt: { type: "number", label: "Nghiêng", min: 0, max: 12, unit: "°", group: "Kiểu dáng", help: "Độ nghiêng lớn nhất của một ảnh. 0 là thẳng hàng." },
      radius: { type: "number", label: "Bo góc", min: 0, max: 16, unit: "px", group: "Kiểu dáng" },
      frameColor: { type: "color", label: "Màu khung ảnh", group: "Kiểu dáng" },
      lightbox,
    },
  },
};

export const MAX_ALBUM_IMAGES = 30;

// Danh sách ảnh an toàn để vẽ: chỉ chuỗi là địa chỉ ảnh hợp lệ (https), tối đa MAX_ALBUM_IMAGES.
export function cleanImages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && isImageUrl(item)).slice(0, MAX_ALBUM_IMAGES);
}
