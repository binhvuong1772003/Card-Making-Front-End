import type { CSSProperties } from "react";
import type { ShapeGeometry } from "@miditor/core";
import { frameGeometry } from "@/lib/cards/blocks/photo-frame";

// Vẽ khối Khung ảnh (mọi kiểu dùng chung). Không có trạng thái nên không cần "use client": cùng một kết quả ở máy chủ, trình duyệt, editor và ảnh
// thu nhỏ. Hai lớp cùng hình: lớp ngoài tô màu viền, lớp trong thụt vào `frameWidth` px chứa ảnh, nên viền dày đều theo đúng hình. Hình cắt bằng
// bo góc, clip-path hoặc mặt nạ (của Miditor và hình tim); mặt nạ cần cả tiền tố -webkit- cho trình duyệt cũ. Kiểu dáng viết thẳng (inline) vì
// Render đặt lại kiểu.
export interface PhotoFrameViewProps {
  src: string;
  alt: string;
  shape: string;
  shapeGeometry?: string;
  shapeMaskPath?: string;
  zoom: number;
  posX: number;
  posY: number;
  frameWidth: number;
  frameColor: string;
  /** Trong editor, khung chưa có ảnh hiện lời nhắc; ở trang thật thì không hiện gì. */
  editing: boolean;
}

export function cutStyle(geometry: ShapeGeometry): CSSProperties {
  return {
    borderRadius: geometry.borderRadius,
    clipPath: geometry.clipPath,
    maskImage: geometry.maskImage,
    maskSize: geometry.maskSize,
    maskRepeat: geometry.maskRepeat,
    maskPosition: geometry.maskPosition,
    WebkitMaskImage: geometry.maskImage,
    WebkitMaskSize: geometry.maskSize,
    WebkitMaskRepeat: geometry.maskRepeat,
    WebkitMaskPosition: geometry.maskPosition,
  };
}

export function PhotoFrameView({ src, alt, shape, shapeGeometry, shapeMaskPath, zoom, posX, posY, frameWidth, frameColor, editing }: PhotoFrameViewProps) {
  if (!src && !editing) return null;
  const cut = cutStyle(frameGeometry(shape, shapeGeometry, shapeMaskPath));
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", boxSizing: "border-box", background: frameWidth > 0 ? frameColor : "transparent", ...cut }}>
      <div style={{ position: "absolute", inset: frameWidth, overflow: "hidden", background: src ? "transparent" : "#ede3e5", ...cut }}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- ảnh từ kho Cloudinary hoặc địa chỉ người dùng chọn; kích thước do khối quyết định
          <img
            src={src}
            alt={alt}
            draggable={false}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: `${posX}% ${posY}%`, transform: `scale(${zoom / 100})`, transformOrigin: `${posX}% ${posY}%`, userSelect: "none" }}
          />
        ) : (
          <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 12, boxSizing: "border-box", color: "#7b1e2b", fontSize: 13, fontWeight: 600, textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
            Chọn ảnh ở bảng bên phải
          </span>
        )}
      </div>
    </div>
  );
}
