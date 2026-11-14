import { isColorValue, type ComponentDef, type TreeNode } from "@miditor/core";

export const DRESS_CODE_SHAPES = ["circle", "square", "diamond"] as const;
export const DRESS_CODE_MAX_COLORS = 8;
export const DRESS_CODE_DEFAULT_COLORS = ["#8d9d70", "#e7e8e9", "#e8dec6"] as const;
const LEGACY_COLOR_KEYS = ["swatch1", "swatch2", "swatch3"] as const;

export function upgradeLegacyDressCodeColors(node: TreeNode): TreeNode {
  const children = node.children.map(upgradeLegacyDressCodeColors);
  if (node.type !== "DressCode") return children.every((child, index) => child === node.children[index]) ? node : { ...node, children };

  const props = { ...node.props };
  if (Array.isArray(props.colors)) {
    if (props.colors.length > DRESS_CODE_MAX_COLORS) props.colors = props.colors.slice(0, DRESS_CODE_MAX_COLORS);
  }
  else props.colors = LEGACY_COLOR_KEYS.map((key, index) => isColorValue(props[key]) ? props[key] : DRESS_CODE_DEFAULT_COLORS[index]);
  LEGACY_COLOR_KEYS.forEach((key) => { delete props[key]; });
  const sameProps = Object.keys(props).length === Object.keys(node.props).length && Object.entries(props).every(([key, value]) => node.props[key] === value);
  return sameProps && children.every((child, index) => child === node.children[index]) ? node : { ...node, props, children };
}

export const dressCodeBlock: ComponentDef = {
  label: "Dress code",
  category: "Dress code",
  icon: "palette",
  keywords: ["dress code", "trang phục", "màu sắc", "swatch", "màu cưới"],
  size: { w: 340, h: 220 },
  canContain: false,
  defaultProps: {
    heading: "DRESS CODE",
    subtitle: "Trang phục dự tiệc",
    headingColor: "#203b29",
    subtitleColor: "#6d705f",
    swatchShape: "circle",
    swatchSize: 48,
    swatchGap: 24,
    colors: [...DRESS_CODE_DEFAULT_COLORS],
  },
  fields: {
    heading: { type: "text", label: "Tiêu đề", maxLength: 60, group: "Chữ" },
    subtitle: { type: "text", label: "Mô tả", maxLength: 120, group: "Chữ" },
    headingColor: { type: "color", label: "Màu tiêu đề", group: "Chữ" },
    subtitleColor: { type: "color", label: "Màu mô tả", group: "Chữ" },
    swatchShape: { type: "select", label: "Hình mẫu màu", options: DRESS_CODE_SHAPES, group: "Mẫu màu" },
    swatchSize: { type: "number", label: "Kích thước", min: 24, max: 88, unit: "px", group: "Mẫu màu" },
    swatchGap: { type: "number", label: "Khoảng cách", min: 0, max: 48, unit: "px", group: "Mẫu màu" },
    colors: { type: "array", label: "Màu trang phục", item: { type: "color", label: "Màu" }, maxItems: DRESS_CODE_MAX_COLORS, group: "Mẫu màu" },
  },
};
