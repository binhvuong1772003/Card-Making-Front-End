import type { NodeStyles } from "@miditor/core";
import type { CSSProperties } from "react";

// Kiểu mặc định của một loại khối (`defaultStyles`) đổi sang CSS, để hình xem trước ở bảng "Thành phần" trông như khối thật khi thêm vào trang (khối thật
// do Render vẽ nên không cần). Chỉ các kiểu mà các kiểu lịch và bản đồ dùng; thêm khi một kiểu mới cần.
export function nodeStyleCss(styles: NodeStyles | undefined): CSSProperties {
  if (!styles) return {};
  const css: CSSProperties = {};
  if (styles.background) css.background = styles.background;
  if (styles.borderWidth) css.border = `${styles.borderWidth}px solid ${styles.borderColor ?? "currentColor"}`;
  if (styles.borderRadius) css.borderRadius = styles.borderRadius;
  if (styles.opacity !== undefined) css.opacity = styles.opacity / 100;
  return css;
}
