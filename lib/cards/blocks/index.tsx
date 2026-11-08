import { isFontStack, resolveColor } from "@miditor/core";
import type { Renderer } from "@miditor/render";
import { AlbumView, type AlbumMode } from "@/components/blocks/album-view";
import { AlbumGridView, AlbumPolaroidView, AlbumStripView } from "@/components/blocks/album-layouts";
import { CalendarView } from "@/components/blocks/calendar-view";
import { FormView } from "@/components/blocks/form-view";
import { MapView } from "@/components/blocks/map-view";
import { albumBlock, cleanImages } from "./album";
import { cardDefinitions } from "./definitions";
import { calendarDefinitions, MARK_SHAPES } from "./calendar";
import { formKeyOf } from "@/lib/cards/forms/form-id";
import { cleanFields, cleanPublicList } from "../forms/fields";

// Các khối riêng của CardMaking: định nghĩa (dữ liệu thuần, cho editor và backend) và cách vẽ (cho Render).
export const cardComponents = cardDefinitions;

// Cho biết trang đang được vẽ ở đâu: Render đưa `metadata` này tới từng khối. Không đưa gì (undefined) nghĩa là trang thật.
export const EDIT_METADATA = { mode: "edit" } as const;
export const STATIC_METADATA = { mode: "static" } as const;

const modeOf = (metadata: unknown): AlbumMode => {
  const mode = metadata && typeof metadata === "object" ? (metadata as { mode?: unknown }).mode : undefined;
  return mode === "edit" || mode === "static" ? mode : "live";
};

// Slug của thiệp: chỉ trang công khai mới truyền vào metadata; nơi khác (editor, trang mẫu, ảnh thu nhỏ) form chỉ để xem.
const slugOf = (metadata: unknown): string => {
  const slug = metadata && typeof metadata === "object" ? (metadata as { slug?: unknown }).slug : undefined;
  return typeof slug === "string" ? slug : "";
};

const number = (value: unknown, fallback: number, min: number, max: number): number =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

const renderAlbum: Renderer = ({ props, metadata }) => (
  <AlbumView
    images={cleanImages(props.images)}
    autoplay={props.autoplay !== false}
    interval={number(props.interval, 1.5, 0.5, 10)}
    lightbox={props.lightbox !== false}
    radius={number(props.radius, 16, 0, 48)}
    dotColor={typeof props.dotColor === "string" ? props.dotColor : albumBlock.defaultProps.dotColor as string}
    mode={modeOf(metadata)}
  />
);

const text = (value: unknown, fallback: string): string => (typeof value === "string" ? value : fallback);
// Màu của khối: #rrggbb, hoặc tên màu của chủ đề trang (`@primary`) đổi ra mã; luôn ra #rrggbb vì khối Bản đồ ghép thêm độ trong suốt vào sau mã màu.
const paint = (value: unknown, fallback: string, theme: Parameters<typeof resolveColor>[1]): string => resolveColor(value, theme) ?? fallback;
// Kiểu chữ: chuỗi họ chữ hợp lệ hoặc rỗng (chữ của trang).
const stackOf = (value: unknown): string => (typeof value === "string" && value !== "" && isFontStack(value) ? value : "");

const pick = <T extends string>(options: readonly T[], value: unknown, fallback: T): T => (options.includes(value as T) ? (value as T) : fallback);

const renderMap: Renderer = ({ props, metadata, theme }) => (
  <MapView
    name={text(props.name, "")}
    address={text(props.address, "")}
    showText={props.showText !== false}
    zoom={number(props.zoom, 16, 10, 20)}
    heading={text(props.heading, "")}
    divider={props.divider !== false}
    button={text(props.button, "")}
    color={paint(props.color, "#511419", theme)}
    innerFrame={props.innerFrame === true}
    padding={number(props.padding, 0, 0, 40)}
    mode={modeOf(metadata)}
    apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY || undefined}
  />
);

const renderCalendar: Renderer = ({ props, metadata, theme }) => (
  <CalendarView
    date={text(props.date, "")}
    sundayFirst={props.sundayFirst === true}
    weekOnly={props.weekOnly === true}
    showTitle={props.showTitle !== false}
    lines={props.lines === true}
    markShape={pick(MARK_SHAPES, props.markShape, "Tròn")}
    markColor={paint(props.markColor, "#511419", theme)}
    markTextColor={paint(props.markTextColor, "#ffffff", theme)}
    color={paint(props.color, "#511419", theme)}
    weekColor={paint(props.weekColor, "#8a5a5e", theme)}
    size={number(props.size, 16, 10, 32)}
    font={stackOf(props.font)}
    titleFont={stackOf(props.titleFont)}
    innerFrame={props.innerFrame === true}
    padding={number(props.padding, 0, 0, 32)}
    editing={modeOf(metadata) === "edit"}
  />
);

const common = (props: Record<string, unknown>, metadata: unknown, defaultRadius: number) => ({
  images: cleanImages(props.images),
  radius: number(props.radius, defaultRadius, 0, 48),
  lightbox: props.lightbox !== false,
  mode: modeOf(metadata),
});

const renderAlbumGrid: Renderer = ({ props, metadata }) => (
  <AlbumGridView {...common(props, metadata, 8)} columns={Math.round(number(props.columns, 3, 1, 4))} gap={number(props.gap, 8, 0, 24)} />
);
const renderAlbumStrip: Renderer = ({ props, metadata }) => <AlbumStripView {...common(props, metadata, 10)} gap={number(props.gap, 10, 0, 24)} />;
const renderAlbumPolaroid: Renderer = ({ props, metadata, theme }) => (
  <AlbumPolaroidView {...common(props, metadata, 2)} columns={Math.round(number(props.columns, 2, 1, 3))} tilt={number(props.tilt, 5, 0, 12)} frameColor={paint(props.frameColor, "#ffffff", theme)} />
);

// Form gửi thẳng lên CMBE nên cần biết mình là form nào (khoá `formId`, không có thì id của nút) và thiệp nào (`slug` chỉ có trên trang công khai).
const renderForm: Renderer = ({ id, props, metadata, theme }) => (
  <FormView
    blockId={formKeyOf(props.formId, id)}
    slug={slugOf(metadata)}
    heading={text(props.heading, "Biểu mẫu")}
    intro={text(props.intro, "")}
    button={text(props.button, "Gửi")}
    success={text(props.success, "Cảm ơn bạn đã gửi.")}
    deadline={text(props.deadline, "")}
    fields={cleanFields(props.fields)}
    publicList={cleanPublicList(props.publicList)}
    color={paint(props.color, "#511419", theme)}
    padding={number(props.padding, 16, 0, 40)}
    mode={modeOf(metadata)}
  />
);

// Mỗi kiểu lịch là một loại khối riêng nhưng cùng một cách vẽ.
const calendarRenderers = Object.fromEntries(Object.keys(calendarDefinitions).map((type) => [type, renderCalendar]));

export const cardRenderers = {
  Album: renderAlbum,
  AlbumGrid: renderAlbumGrid,
  AlbumStrip: renderAlbumStrip,
  AlbumPolaroid: renderAlbumPolaroid,
  Map: renderMap,
  Form: renderForm,
  ...calendarRenderers,
};
