import { builtInRegistry, type ComponentDef } from "@miditor/core";
import { albumDefinitions } from "./album";
import { calendarDefinitions, RETIRED_CALENDAR_PROPS } from "./calendar";
import { mapBlock, RETIRED_MAP_PROPS } from "./map";
import { photoFrameDefinitions } from "./photo-frame";
import { formBlock } from "./form";
import { textDefinition } from "./text-effects";
import { dressCodeBlock } from "./dress-code";
import { decorationBlock } from "./decoration";
import { particlesBlock } from "./particles";
import { burstBlock } from "./burst";
import { gradientBlock } from "./gradient";
import { curvedTextBlock } from "./curved-text";
import { cardPanelBlock } from "./card-panel";
import { OPEN_EFFECT_TYPES, withOpenEffect } from "./open-effect";

// Mọi loại khối riêng của CardMaking (dữ liệu thuần, không có React): thứ tự ở đây là thứ tự trong bảng "Thành phần". Editor dùng nó, và CMBE nhận
// bản sinh ra từ đây bằng `npm run blocks:export` để kiểm trang; bài test `definitions.test.ts` báo nếu bản của CMBE đã cũ.
// Hầu hết khối riêng được ẩn khỏi thư viện Miditor để chọn ở bảng "Thành phần". Text giữ trong thư viện chuẩn của Miditor; định nghĩa ở đây chỉ thêm hiệu ứng riêng.
const raw: Record<string, ComponentDef> = {
  Shape: {
    ...builtInRegistry.Shape!,
    defaultProps: { ...builtInRegistry.Shape!.defaultProps, motionTarget: "" },
    fields: {
      ...builtInRegistry.Shape!.fields,
      motionTarget: { type: "text", label: "Mục tiêu chuyển động", maxLength: 40, hidden: true, group: "Hiệu ứng" },
    },
  },
  Text: textDefinition,
  DressCode: dressCodeBlock,
  Decoration: decorationBlock,
  Image: builtInRegistry.Image!,
  Particles: particlesBlock,
  Burst: burstBlock,
  Gradient: gradientBlock,
  CardPanel: cardPanelBlock,
  CurvedText: curvedTextBlock,
  ...albumDefinitions,
  Map: mapBlock,
  Form: formBlock,
  ...calendarDefinitions,
  ...photoFrameDefinitions,
};

// Khối vẽ ở trang bìa mang thêm ô "Khi mở thiệp" (open-effect.ts); Image là khối có sẵn của Miditor, vốn đã ẩn khỏi thư viện.
const withEffects = (type: string, def: ComponentDef): ComponentDef => ((OPEN_EFFECT_TYPES as readonly string[]).includes(type) ? withOpenEffect(def) : def);

export const cardDefinitions: Record<string, ComponentDef> = Object.fromEntries(Object.entries(raw).map(([type, def]) => [type, withEffects(type, type === "Text" || type === "Shape" ? def : { ...def, hidden: true })]));

// Thuộc tính đã bỏ khỏi từng loại khối. Thiệp đã lưu có thể còn giữ chúng; CMBE bỏ chúng khi kiểm trang (`retired-props.json` do `blocks:export` sinh).
export const retiredProps: Record<string, readonly string[]> = {
  Map: RETIRED_MAP_PROPS,
  DressCode: ["swatch1", "swatch2", "swatch3"],
  ...Object.fromEntries(Object.keys(calendarDefinitions).map((type) => [type, RETIRED_CALENDAR_PROPS])),
};
