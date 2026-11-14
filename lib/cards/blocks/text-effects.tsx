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
  defaultProps: { ...builtInRegistry.Text!.defaultProps, effects: [], motionTarget: "" },
  fields: {
    ...builtInRegistry.Text!.fields,
    effects: { type: "custom", kind: "text-effects", label: "Hiệu ứng", group: "Hiệu ứng" },
    motionTarget: { type: "text", label: "Mục tiêu chuyển động", maxLength: 40, hidden: true, group: "Hiệu ứng" },
  },
};

const textValue = (value: unknown) => typeof value === "string" ? value : "";
const numberValue = (value: unknown, fallback: number) => typeof value === "number" && Number.isFinite(value) ? Math.max(1, Math.min(400, value)) : fallback;

export function CurvedText({ value, amount, size, bold, italic, underline }: { value: string; amount: number; size: number; bold: boolean; italic: boolean; underline: boolean }) {
  const pathId = `text-curve-${useId().replace(/:/g, "")}`;
  const width = Math.max(size * 2, [...value.replace(/\s/g, "")].length * size * 0.62);
  const amplitude = Math.abs(amount) / 100 * size * 1.25;
  const baseline = size + (amount > 0 ? amplitude * 1.4 : 0);
  const height = baseline + (amount < 0 ? amplitude * 1.4 : 0) + size * 0.25;
  const controlY = baseline - Math.sign(amount) * amplitude * 2.8;
  return (
    <svg aria-label={value} role="img" width={width} height={height} style={{ display: "block", position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", overflow: "visible", maxWidth: "none", color: "inherit", font: "inherit" }}>
      <path id={pathId} d={`M 0 ${baseline} Q ${width / 2} ${controlY} ${width} ${baseline}`} fill="none" />
      <text textAnchor="middle" dominantBaseline="alphabetic" fontSize={size} fontFamily="inherit" fontWeight={bold ? 700 : 400} fontStyle={italic ? "italic" : "normal"} textDecoration={underline ? "underline" : "none"} fill="currentColor">
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
