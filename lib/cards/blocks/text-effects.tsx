import { builtInRegistry, type ComponentDef } from "@miditor/core";
import type { Renderer } from "@miditor/render";
import { useId } from "react";

export type CurveTextEffect = { id: string; type: "curve"; amount: number };

export function cleanTextEffects(value: unknown): CurveTextEffect[] {
  if (!Array.isArray(value)) return [];
  const seenTypes = new Set<string>();
  return value.slice(0, 10).flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const effect = item as Record<string, unknown>;
    if (effect.type !== "curve" || seenTypes.has(effect.type) || typeof effect.id !== "string" || !/^[\w-]{1,40}$/.test(effect.id) || typeof effect.amount !== "number" || !Number.isFinite(effect.amount)) return [];
    seenTypes.add(effect.type);
    return [{ id: effect.id, type: "curve" as const, amount: Math.max(-100, Math.min(100, Math.round(effect.amount))) }];
  });
}

export const textDefinition: ComponentDef = {
  ...builtInRegistry.Text!,
  defaultProps: { ...builtInRegistry.Text!.defaultProps, effects: [], motionTarget: "", fontWeight: "Theo nút Đậm", letterSpacing: 0, lineHeight: 0, textShadow: "Không", textShadowColor: "#000000" },
  fields: {
    ...builtInRegistry.Text!.fields,
    fontWeight: { type: "select", label: "Độ đậm", options: ["Theo nút Đậm", "100", "200", "300", "400", "500", "600", "700", "800", "900"], group: "Typography", help: "Chọn độ đậm riêng khi mẫu cần chữ mảnh hoặc đậm vừa." },
    letterSpacing: { type: "number", label: "Giãn chữ", min: -2, max: 20, unit: "px", group: "Typography" },
    lineHeight: { type: "number", label: "Chiều cao dòng", min: 0, max: 400, unit: "px", group: "Typography", help: "Để 0 để dùng chiều cao dòng mặc định." },
    textShadow: { type: "select", label: "Đổ bóng chữ", options: ["Không", "Nhẹ"], group: "Typography" },
    textShadowColor: { type: "color", label: "Màu bóng chữ", group: "Typography" },
    effects: { type: "custom", kind: "text-effects", label: "Hiệu ứng", group: "Hiệu ứng" },
    motionTarget: { type: "text", label: "Mục tiêu chuyển động", maxLength: 40, hidden: true, group: "Hiệu ứng" },
  },
};

const textValue = (value: unknown) => typeof value === "string" ? value : "";
const numberValue = (value: unknown, fallback: number) => typeof value === "number" && Number.isFinite(value) ? Math.max(1, Math.min(400, value)) : fallback;

export function CurvedText({ value, amount, size, bold, italic, underline, circular = false, radius = 105, letterSpacing = 0 }: { value: string; amount: number; size: number; bold: boolean; italic: boolean; underline: boolean; circular?: boolean; radius?: number; letterSpacing?: number }) {
  const pathId = `text-curve-${useId().replace(/:/g, "")}`;
  if (circular) {
    const r = 143 * Math.max(1, Math.min(3, radius / 100));
    return <svg aria-label={value} role="img" viewBox="0 0 286 143" preserveAspectRatio="xMidYMax meet" style={{ display: "block", width: "100%", height: "100%", overflow: "visible" }}>
      <defs><path id={pathId} d={`M ${143 - r} 143 A ${r} ${r} 0 0 1 ${143 + r} 143`} fill="none" /></defs>
      <text fill="currentColor" fontFamily="inherit" fontSize={size} fontWeight={bold ? 700 : 400} fontStyle={italic ? "italic" : "normal"} textDecoration={underline ? "underline" : "none"} letterSpacing={`${letterSpacing}em`} dominantBaseline="central">
        <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">{value.replace(/[\r\n]+/g, " ")}</textPath>
      </text>
    </svg>;
  }
  if (amount === 0) return <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", fontSize: size, fontWeight: bold ? 700 : 400, fontStyle: italic ? "italic" : "normal", textDecoration: underline ? "underline" : "none", letterSpacing: `${letterSpacing}em`, whiteSpace: "nowrap" }}>{value.replace(/[\r\n]+/g, " ")}</span>;
  const width = Math.max(size * 2, [...value.replace(/\s/g, "")].length * size * 0.62 + value.length * size * letterSpacing);
  const amplitude = Math.abs(amount) / 100 * size * 1.25;
  const baseline = size + (amount > 0 ? amplitude * 1.4 : 0);
  const height = baseline + (amount < 0 ? amplitude * 1.4 : 0) + size * 0.25;
  const controlY = baseline - Math.sign(amount) * amplitude * 2.8;
  return (
    <svg aria-label={value} role="img" width={width} height={height} style={{ display: "block", position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", overflow: "visible", maxWidth: "none", color: "inherit", font: "inherit" }}>
      <path id={pathId} d={`M 0 ${baseline} Q ${width / 2} ${controlY} ${width} ${baseline}`} fill="none" />
      <text textAnchor="middle" dominantBaseline="alphabetic" fontSize={size} fontFamily="inherit" fontWeight={bold ? 700 : 400} fontStyle={italic ? "italic" : "normal"} textDecoration={underline ? "underline" : "none"} letterSpacing={`${letterSpacing}em`} fill="currentColor">
        <textPath href={`#${pathId}`} startOffset="50%">{value.replace(/[\r\n]+/g, " ")}</textPath>
      </text>
    </svg>
  );
}

export const renderText: Renderer = ({ props }) => {
  const value = textValue(props.text);
  const curve = cleanTextEffects(props.effects).find((effect) => effect.type === "curve");
  if (!curve || !value) return value;
  return <CurvedText value={value} amount={curve.amount} size={numberValue(props.size, 24)} bold={props.bold === true} italic={props.italic === true} underline={props.underline === true} />;
};
