import { SHAPE_NAMES, shapeGeometry, type ComponentDef, type ShapeGeometry } from "@miditor/core";

// Khối Khung ảnh: một tấm ảnh cắt theo hình dạng chọn được (vòm, tròn, tim, viền sóng, tem...), có viền vẽ đúng theo hình đó. Cách cắt là của
// Miditor (`shapeGeometry`, cùng bộ hình với khối Hình khối) cộng một hình riêng của CardMaking là Tim, nên một hình trông y nhau ở hai nơi.
// Nhóm Viền và Hiệu ứng chung của Miditor chỉ viền, đổ bóng hình chữ nhật của khối, không khớp hình đã cắt, nên khối có viền riêng
// (`frameWidth`, `frameColor`). Mỗi kiểu trong thư viện là một loại khối riêng cùng nhóm "Khung ảnh" và cùng cách vẽ, chỉ khác hình
// mặc định; đổi hình lúc nào cũng được. Dữ liệu thuần, không có React: CMBE nhận bản sinh ra từ đây (`npm run blocks:export`).
export const FRAME_SHAPES = [...SHAPE_NAMES.filter((shape) => shape !== "crescent"), "heart"] as const;
export type FrameShape = (typeof FRAME_SHAPES)[number];

/** Tên hình bằng tiếng Việt, theo thứ tự hiện trong lưới chọn hình. */
export const FRAME_SHAPE_LABELS: Record<FrameShape, string> = {
  rectangle: "Chữ nhật",
  rounded: "Bo góc",
  ellipse: "Tròn",
  pill: "Viên thuốc",
  arch: "Vòm",
  semicircle: "Bán nguyệt",
  triangle: "Tam giác",
  diamond: "Thoi",
  pentagon: "Ngũ giác",
  hexagon: "Lục giác",
  scallop: "Viền sóng",
  seal: "Tem răng cưa",
  heart: "Tim",
};
export const FRAME_SHAPE_ORDER: readonly FrameShape[] = ["rectangle", "rounded", "ellipse", "pill", "arch", "semicircle", "triangle", "diamond", "pentagon", "hexagon", "scallop", "seal", "heart"];

// Hình tim: đường viền vẽ trong khung 100 x 100, khối kéo giãn theo cỡ của nó (cùng cách với các hình dùng mặt nạ của Miditor).
const HEART_PATH = "M50 92C12 62 0 40 0 24C0 9 12 0 26 0C37 0 46 6 50 14C54 6 63 0 74 0C88 0 100 9 100 24C100 40 88 62 50 92Z";
const HEART_MASK = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path fill="#fff" d="${HEART_PATH}"/></svg>`)}")`;

/** Cách một giá trị `shape` cắt khối. Giá trị lạ hoặc thiếu là hình chữ nhật, để thiệp lưu từ bản nào cũng vẽ được. */
export function frameGeometry(value: unknown): ShapeGeometry {
  if (value === "heart") return { ...shapeGeometry("rectangle"), maskImage: HEART_MASK };
  return shapeGeometry(value);
}

export const FRAME_ZOOM = { min: 100, max: 300 } as const;
export const FRAME_WIDTH_MAX = 24;

// Ảnh chọn bằng ô riêng vì Miditor không vẽ trường kiểu `image` ở bảng thuộc tính. Giá trị phải là địa chỉ ảnh hợp lệ hoặc rỗng: CMBE kiểm
// (`cards/page-document.ts`) vì trường `custom` không bị Miditor kiểm.
const srcField = { type: "custom", kind: "single-image", label: "Ảnh", group: "Ảnh" } as const;
const shapeField = { type: "custom", kind: "frame-shape", label: "Hình dạng", group: "Hình dạng" } as const;

const base: ComponentDef = {
  label: "Khung ảnh",
  category: "Khung ảnh",
  icon: "img",
  keywords: ["khung ảnh", "ảnh", "hình", "vòm", "tròn", "tim", "viền sóng", "tem", "photo", "frame"],
  size: { w: 240, h: 300 },
  canContain: false,
  defaultProps: { src: "", alt: "", shape: "arch", zoom: 100, posX: 50, posY: 50, frameWidth: 0, frameColor: "#511419" },
  fields: {
    src: srcField,
    alt: { type: "text", label: "Mô tả ảnh", maxLength: 500, group: "Ảnh", help: "Cho người đọc màn hình và khi ảnh không tải được." },
    shape: shapeField,
    zoom: { type: "number", label: "Phóng", min: FRAME_ZOOM.min, max: FRAME_ZOOM.max, unit: "%", group: "Cắt ảnh", help: "Phóng to ảnh trong khung, từ 100% đến 300%." },
    posX: { type: "number", label: "Ngang", min: 0, max: 100, group: "Cắt ảnh", help: "Phần ảnh nằm trong khung theo chiều ngang: 0 là mép trái, 100 là mép phải." },
    posY: { type: "number", label: "Dọc", min: 0, max: 100, group: "Cắt ảnh", help: "Phần ảnh nằm trong khung theo chiều dọc: 0 là mép trên, 100 là mép dưới." },
    frameWidth: { type: "number", label: "Dày", min: 0, max: FRAME_WIDTH_MAX, unit: "px", group: "Viền khung", help: "Viền vẽ đúng theo hình dạng. 0 là không viền. Không dùng nhóm Viền chung: nó chỉ viền hình chữ nhật." },
    frameColor: { type: "color", label: "Màu viền", group: "Viền khung" },
  },
};

const variant = (label: string, shape: FrameShape, size: { w: number; h: number }): ComponentDef => ({ ...base, label, size, defaultProps: { ...base.defaultProps, shape } });

// Các kiểu trong thư viện; giữ khoá cũ để thiệp đã lưu tiếp tục mở đúng.
const FRAME_VARIANTS: Record<FrameShape, { type: string; label: string; size: { w: number; h: number } }> = {
  rectangle: { type: "PhotoFrameRectangle", label: "Khung chữ nhật", size: { w: 240, h: 300 } },
  rounded: { type: "PhotoFrameRounded", label: "Bo góc", size: { w: 240, h: 300 } },
  ellipse: { type: "PhotoFrameCircle", label: "Khung tròn", size: { w: 240, h: 240 } },
  pill: { type: "PhotoFramePill", label: "Khung viên thuốc", size: { w: 240, h: 140 } },
  arch: { type: "PhotoFrameArch", label: "Khung vòm", size: { w: 240, h: 300 } },
  semicircle: { type: "PhotoFrameSemicircle", label: "Khung bán nguyệt", size: { w: 240, h: 240 } },
  triangle: { type: "PhotoFrameTriangle", label: "Khung tam giác", size: { w: 240, h: 240 } },
  diamond: { type: "PhotoFrameDiamond", label: "Khung thoi", size: { w: 240, h: 240 } },
  pentagon: { type: "PhotoFramePentagon", label: "Khung ngũ giác", size: { w: 240, h: 240 } },
  hexagon: { type: "PhotoFrameHexagon", label: "Khung lục giác", size: { w: 240, h: 240 } },
  scallop: { type: "PhotoFrameScallop", label: "Viền sóng", size: { w: 240, h: 240 } },
  seal: { type: "PhotoFrameSeal", label: "Tem răng cưa", size: { w: 240, h: 240 } },
  heart: { type: "PhotoFrameHeart", label: "Khung tim", size: { w: 240, h: 220 } },
};

export const photoFrameDefinitions: Record<string, ComponentDef> = Object.fromEntries(
  FRAME_SHAPE_ORDER.map((shape) => {
    const { type, label, size } = FRAME_VARIANTS[shape];
    return [type, variant(label, shape, size)];
  }),
);
