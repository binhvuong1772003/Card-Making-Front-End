import { gradientCss, type GradientConfig } from "@/lib/cards/blocks/gradient";

export function GradientView({ config }: { config: GradientConfig }) {
  return <div aria-hidden="true" style={{ width: "100%", height: "100%", background: gradientCss(config) }} />;
}
