// Dáng của từng ảnh trong coverflow, đo từ thiệp mẫu: ảnh cách ảnh giữa `offset` bước thì dịch ngang offset × 60% bề rộng của chính nó,
// lùi sâu offset × 150 px, xoay offset × 45° quanh trục dọc, thu nhỏ còn 0,85 rồi 0,7, mờ dần 1 / 0,75 / 0,5 / 0,3.
export const REACH = 3;

// Ảnh `index` cách ảnh đang chọn bao nhiêu bước, quấn vòng: với 7 ảnh là -3..3.
export function offsetOf(index: number, current: number, count: number): number {
  const half = Math.floor(count / 2);
  return ((((index - current) % count) + count + half) % count) - half;
}

const SCALE = [1, 0.85, 0.7];
const OPACITY = [1, 0.75, 0.5, 0.3];

export interface SlideLook {
  visible: boolean;
  opacity: number;
  zIndex: number;
  transform: string;
}

export function slideLook(offset: number): SlideLook {
  const steps = Math.abs(offset);
  const visible = steps <= REACH;
  const center = "translate(-50%, -50%)";
  if (offset === 0) return { visible, opacity: 1, zIndex: 100, transform: center };
  const scale = SCALE[Math.min(steps, SCALE.length - 1)]!;
  return {
    visible,
    opacity: visible ? OPACITY[Math.min(steps, OPACITY.length - 1)]! : 0,
    zIndex: 100 - steps,
    transform: `${center} translate3d(${offset * 60}%, 0, ${-150 * steps}px) rotateY(${offset * 45}deg) scale(${scale})`,
  };
}
