import type { ComponentDef, JsonValue, TreeNode } from "@miditor/core";

// "Khi mở thiệp": hiệu ứng của một khối trên trang bìa lúc khách bấm nút Mở thiệp. Lưu thành ba thuộc tính của khối
// (như `motionTarget`), trình phát đọc rồi sinh CSS theo id khối. Số đo lấy từ trang mẫu (logo vỡ trong 0,55s, họa tiết phóng gấp 3 trong 1,3s, thẻ mờ từ 0,9s).
export const OPEN_EFFECTS = ["Giữ nguyên", "Mờ dần", "Thu nhỏ rồi biến mất", "Phóng ra rồi mờ dần", "Phóng to rồi nhoè", "Bay lên rồi biến mất", "Gợn sóng lan ra"] as const;
export type OpenEffect = (typeof OPEN_EFFECTS)[number];

export const OPEN_LIMITS = { time: { min: 0.2, max: 3 }, delay: { min: 0, max: 3 } } as const;
export const OPEN_DEFAULTS = { openEffect: "Giữ nguyên", openTime: 1, openDelay: 0 } as const;

// Chỉ các khối vẽ ở trang bìa mang ô này.
export const OPEN_EFFECT_TYPES = ["Shape", "Text", "Decoration", "Image", "Particles", "CardPanel"] as const;

const openFields = {
  openEffect: { type: "select", label: "Hiệu ứng", options: OPEN_EFFECTS, group: "Khi mở thiệp", help: "Chạy khi khách bấm nút mở thiệp, rồi thiệp chuyển sang trang kế." },
  openTime: { type: "number", label: "Thời gian", min: OPEN_LIMITS.time.min, max: OPEN_LIMITS.time.max, unit: "s", group: "Khi mở thiệp" },
  openDelay: { type: "number", label: "Trễ", min: OPEN_LIMITS.delay.min, max: OPEN_LIMITS.delay.max, unit: "s", group: "Khi mở thiệp", help: "Chờ bao lâu sau khi bấm thì hiệu ứng mới bắt đầu." },
} as const;

// Thêm ba ô vào định nghĩa của một loại khối (giữ nguyên mọi thứ khác).
export function withOpenEffect(def: ComponentDef): ComponentDef {
  return { ...def, defaultProps: { ...def.defaultProps, ...OPEN_DEFAULTS }, fields: { ...def.fields, ...openFields } };
}

type Step = { id: string; effect: Exclude<OpenEffect, "Giữ nguyên">; time: number; delay: number };

const clamp = (value: unknown, fallback: number, min: number, max: number): number =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

// id vào selector CSS nên chỉ nhận ký tự an toàn; id lạ thì bỏ qua hiệu ứng thay vì thoát chuỗi.
const SAFE_ID = /^[A-Za-z0-9_-]{1,80}$/;

export function openSteps(root: TreeNode): Step[] {
  const steps: Step[] = [];
  const visit = (node: TreeNode) => {
    const effect = node.props.openEffect as JsonValue | undefined;
    if (typeof effect === "string" && effect !== "Giữ nguyên" && (OPEN_EFFECTS as readonly string[]).includes(effect) && SAFE_ID.test(node.id)) {
      steps.push({
        id: node.id,
        effect: effect as Step["effect"],
        time: clamp(node.props.openTime, OPEN_DEFAULTS.openTime, OPEN_LIMITS.time.min, OPEN_LIMITS.time.max),
        delay: clamp(node.props.openDelay, OPEN_DEFAULTS.openDelay, OPEN_LIMITS.delay.min, OPEN_LIMITS.delay.max),
      });
    }
    node.children.forEach(visit);
  };
  visit(root);
  return steps;
}

/** Khi nào hiệu ứng cuối cùng xong (mili giây); 0 nếu trang không có hiệu ứng nào. */
export function openDurationMs(root: TreeNode): number {
  return Math.round(Math.max(0, ...openSteps(root).map((step) => (step.delay + step.time) * 1000)));
}

const ANIMATION = {
  "Mờ dần": "cm-open-fade",
  "Thu nhỏ rồi biến mất": "cm-open-shrink",
  "Phóng ra rồi mờ dần": "cm-open-burst",
  "Phóng to rồi nhoè": "cm-open-bloom",
  "Bay lên rồi biến mất": "cm-open-rise",
  "Gợn sóng lan ra": "cm-open-ring",
} as const;
const EASING = { "Mờ dần": "linear", "Thu nhỏ rồi biến mất": "ease-out", "Phóng ra rồi mờ dần": "cubic-bezier(.45, .1, .85, .7)", "Phóng to rồi nhoè": "linear", "Bay lên rồi biến mất": "linear", "Gợn sóng lan ra": "ease-out" } as const;

// `!important`: Miditor đặt sẵn `animation: revert` trong style của mỗi khối, nên luật thường không thắng được.
// "Phóng to rồi nhoè" (hoa góc, 1,2s) và "Bay lên rồi biến mất" (cả tấm thẻ, 0,8s) là keyframe `dragon-fly-forward` và `envelope-away` của trang mẫu, đo trực tiếp.
// Khối đã lật ngang (Miditor đặt `scale: -1 1` và `--cm-flip: -1`) giữ nguyên lật trong lúc chạy vì keyframe nhân với `--cm-flip`.
// Dùng thuộc tính `scale` riêng (không phải `transform`) để không đè góc xoay mà Miditor đặt trong `transform`.
// "Thu nhỏ rồi biến mất" và "Gợn sóng lan ra" là keyframe `seal-break` và `seal-ring` của trang mẫu (0,6s ease-out).
const KEYFRAMES = `
@keyframes cm-open-fade { to { opacity: 0; } }
@keyframes cm-open-shrink { 30% { scale: calc(var(--cm-flip, 1) * 1.15) 1.15; rotate: 5deg; opacity: .9; filter: brightness(1.3); } 60% { scale: calc(var(--cm-flip, 1) * 1.05) 1.05; rotate: -3deg; opacity: .5; filter: brightness(1.5); } 100% { scale: calc(var(--cm-flip, 1) * 0) 0; rotate: 15deg; opacity: 0; filter: brightness(2); } }
@keyframes cm-open-burst { from { opacity: .7; } to { scale: calc(var(--cm-flip, 1) * 3) 3; opacity: 0; } }
@keyframes cm-open-bloom { 0% { scale: calc(var(--cm-flip, 1) * 1) 1; opacity: .7; filter: blur(0); } 40% { scale: calc(var(--cm-flip, 1) * 1.6) 1.6; opacity: .5; filter: blur(2px); } 100% { scale: calc(var(--cm-flip, 1) * 3) 3; opacity: 0; filter: blur(10px); } }
@keyframes cm-open-rise { 0% { translate: 0 0; rotate: 0deg; opacity: 1; } 15% { translate: 0 10px; rotate: .5deg; opacity: 1; } 100% { translate: 0 -120vh; rotate: -2deg; opacity: 0; } }
@keyframes cm-open-ring { 0% { scale: calc(var(--cm-flip, 1) * .8) .8; opacity: .8; } 100% { scale: calc(var(--cm-flip, 1) * 2.5) 2.5; opacity: 0; } }`;

/** CSS chạy hiệu ứng cho trang; rỗng nếu không khối nào có hiệu ứng. Chỉ có tác dụng khi trang mang `data-opening-target`. */
export function openCss(root: TreeNode): string {
  const steps = openSteps(root);
  if (steps.length === 0) return "";
  const rules = steps.map((step) =>
    `[data-card-player-page][data-opening-target] [data-miditor-id="${step.id}"] { animation: ${ANIMATION[step.effect]} ${step.time}s ${EASING[step.effect]} ${step.delay}s both !important; }`,
  );
  // Lớp "đi ra" của trang bìa (`data-opening-done`) nhảy thẳng tới trạng thái cuối: nó là phần tử mới nên nếu không sẽ hiện lại rồi mới mờ.
  const done = steps.map((step) => `[data-card-player-page][data-opening-done] [data-miditor-id="${step.id}"] { animation: ${ANIMATION[step.effect]} 0s linear 0s both !important; }`);
  return `${KEYFRAMES}\n${rules.join("\n")}\n${done.join("\n")}\n@media (prefers-reduced-motion: reduce) { [data-card-player-page][data-opening-target] [data-miditor-id] { animation-duration: 1ms !important; animation-delay: 0s !important; } }`;
}
