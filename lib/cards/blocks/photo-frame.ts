import { shapeGeometry, type ComponentDef, type ShapeGeometry, type TreeNode } from "@miditor/core";
import PHOTO_FRAME_CATALOG from "./photo-frame-catalog.json";

export type FrameShape = (typeof PHOTO_FRAME_CATALOG)[number]["id"];
export type FrameShapeValue = { id: string; geometry: string; maskPath?: string };

// Khối Khung ảnh: một tấm ảnh cắt theo hình dạng chọn được (vòm, tròn, tim, viền sóng, tem...), có viền vẽ đúng theo hình đó. Cách cắt là của
// Miditor (`shapeGeometry`, cùng bộ hình với khối Hình khối) cộng một hình riêng của CardMaking là Tim, nên một hình trông y nhau ở hai nơi.
// Nhóm Viền và Hiệu ứng chung của Miditor chỉ viền, đổ bóng hình chữ nhật của khối, không khớp hình đã cắt, nên khối có viền riêng
// (`frameWidth`, `frameColor`). Mọi hình dùng chung một block `PhotoFrame`; catalog riêng giữ tên, kích cỡ, hình cắt và mã chuyển đổi.
// Dữ liệu khối thuần được CMBE nhận từ đây (`npm run blocks:export`).
export const FRAME_SHAPES = PHOTO_FRAME_CATALOG.map(({ id }) => id);

/** Tên hình bằng tiếng Việt, theo thứ tự hiện trong lưới chọn hình. */
export const FRAME_SHAPE_LABELS = Object.fromEntries(PHOTO_FRAME_CATALOG.map(({ id, label }) => [id, label])) as Record<FrameShape, string>;
export const FRAME_SHAPE_ORDER = FRAME_SHAPES;

const legacyShapeByType = Object.fromEntries(PHOTO_FRAME_CATALOG.map(({ id, legacyType }) => [legacyType, id])) as Record<string, FrameShape>;
const shapeIds = new Set<string>(FRAME_SHAPES);
export const isFrameShape = (value: unknown): value is FrameShape => typeof value === "string" && shapeIds.has(value);

/** Cách một giá trị `shape` cắt khối. Giá trị lạ hoặc thiếu là hình chữ nhật, để thiệp lưu từ bản nào cũng vẽ được. */
export function frameGeometry(value: unknown, geometryOverride?: unknown, maskPathOverride?: unknown): ShapeGeometry {
  const snapshot = typeof value === "object" && value !== null ? value as Partial<FrameShapeValue> : undefined;
  const id = snapshot?.id ?? value;
  const shape = PHOTO_FRAME_CATALOG.find((item) => item.id === id);
  const geometry = typeof geometryOverride === "string" ? geometryOverride : snapshot?.geometry ?? shape?.geometry;
  const candidatePath = typeof maskPathOverride === "string" && maskPathOverride ? maskPathOverride : snapshot?.maskPath || shape?.maskPath;
  const maskPath = typeof candidatePath === "string" && candidatePath.length <= 4000 && /^[MmLlHhVvCcSsQqTtAaZz0-9+.,\-\s]+$/.test(candidatePath) ? candidatePath : undefined;
  if (maskPath) {
    const maskImage = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path fill="#fff" d="${maskPath}"/></svg>`)}")`;
    return { ...shapeGeometry("rectangle"), maskImage };
  }
  const cut = shapeGeometry(geometry ?? "rectangle");
  // A tall arch has a circular crown and straight sides, like a rounded-t-full photo.
  return geometry === "arch" ? { ...cut, borderRadius: "9999px 9999px 0 0" } : cut;
}

export function upgradeLegacyPhotoFrames(node: TreeNode): TreeNode {
  const legacyShape = legacyShapeByType[node.type];
  const rawShape = node.props.shape;
  const shapeId = typeof rawShape === "object" && rawShape !== null && "id" in rawShape && typeof rawShape.id === "string"
    ? rawShape.id
    : typeof rawShape === "string" && isFrameShape(rawShape) ? rawShape : legacyShape;
  const catalogShape = PHOTO_FRAME_CATALOG.find(({ id }) => id === shapeId) ?? PHOTO_FRAME_CATALOG[0]!;
  const shape = typeof rawShape === "object" && rawShape !== null && "geometry" in rawShape
    ? rawShape
    : { id: catalogShape.id, geometry: catalogShape.geometry, maskPath: catalogShape.maskPath ?? "" };
  const props = legacyShape || node.type === "PhotoFrame" ? { ...node.props, shape } : node.props;
  const children = node.children.map(upgradeLegacyPhotoFrames);
  if (!legacyShape && children.every((child, index) => child === node.children[index])) return node;
  return { ...node, ...(legacyShape ? { type: "PhotoFrame" } : {}), props, children };
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
  defaultProps: { src: "", alt: "", shape: { id: "rectangle", geometry: "rectangle", maskPath: "" }, zoom: 100, posX: 50, posY: 50, frameWidth: 0, frameColor: "#511419" },
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

export const photoFrameBlock: ComponentDef = { ...base, label: "Khung ảnh", size: { w: 240, h: 300 }, defaultProps: { ...base.defaultProps, shape: "rectangle" } };
export const photoFrameDefinitions: Record<string, ComponentDef> = { PhotoFrame: photoFrameBlock };
