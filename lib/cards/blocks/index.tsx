import { isFontStack, isImageUrl, resolveColor } from "@miditor/core";
import type { Renderer } from "@miditor/render";
import { AlbumView, type AlbumMode } from "@/components/blocks/album-view";
import { AlbumGridView, AlbumPolaroidView, AlbumStripView } from "@/components/blocks/album-layouts";
import { CalendarView } from "@/components/blocks/calendar-view";
import { FormView } from "@/components/blocks/form-view";
import { DressCodeView } from "@/components/blocks/dress-code-view";
import { MapView } from "@/components/blocks/map-view";
import { PhotoFrameView } from "@/components/blocks/photo-frame-view";
import { albumBlock, cleanImages } from "./album";
import { cardDefinitions } from "./definitions";
import { DECORATION_HOVER_EFFECTS, DECORATION_IDLE_EFFECTS, hoverGroupId } from "./decoration";
import { calendarDefinitions, MARK_SHAPES } from "./calendar";
import { FRAME_WIDTH_MAX, FRAME_ZOOM, photoFrameDefinitions } from "./photo-frame";
import { DRESS_CODE_DEFAULT_COLORS, DRESS_CODE_MAX_COLORS } from "./dress-code";
import { formKeyOf } from "@/lib/cards/forms/form-id";
import { cleanFields, cleanPublicList } from "../forms/fields";
import { CurvedText, renderText } from "./text-effects";
import { CURVE_LIMITS } from "./curved-text";
import { DecorationView } from "@/components/blocks/decoration-view";
import { ParticlesView } from "@/components/blocks/particles-view";
import { BurstView } from "@/components/blocks/burst-view";
import { GradientView } from "@/components/blocks/gradient-view";
import { readGradient } from "./gradient";
import { BURST_PALETTE_NAMES, readBurstConfig } from "./burst";
import { PARTICLE_LIMITS, PARTICLE_SHAPES } from "./particles";

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
    live={modeOf(metadata) === "live"}
    eventButton={text(props.eventButton, "")}
    eventTitle={text(props.eventTitle, "")}
    eventTime={text(props.eventTime, "")}
    eventMinutes={number(props.eventMinutes, 180, 15, 1440)}
    eventPlace={text(props.eventPlace, "")}
    eventNote={text(props.eventNote, "")}
  />
);

// Địa chỉ ảnh phải qua `isImageUrl` (chỉ địa chỉ, không CSS); sai thì coi như chưa có ảnh.
const renderPhotoFrame: Renderer = ({ props, metadata, theme }) => {
  const shape = typeof props.shape === "object" && props.shape !== null ? props.shape as Record<string, unknown> : {};
  return <PhotoFrameView
    src={isImageUrl(props.src) ? props.src : ""}
    alt={text(props.alt, "")}
    shape={text(shape.id ?? props.shape, "rectangle")}
    shapeGeometry={text(shape.geometry, "rectangle")}
    shapeMaskPath={text(shape.maskPath, "")}
    zoom={number(props.zoom, 100, FRAME_ZOOM.min, FRAME_ZOOM.max)}
    posX={number(props.posX, 50, 0, 100)}
    posY={number(props.posY, 50, 0, 100)}
    frameWidth={number(props.frameWidth, 0, 0, FRAME_WIDTH_MAX)}
    frameColor={paint(props.frameColor, "#511419", theme)}
    editing={modeOf(metadata) === "edit"}
  />;
};

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
    fieldColor={paint(props.fieldColor, "#666666", theme)}
    fieldBorderColor={paint(props.fieldBorderColor, "#d1d5db", theme)}
    padding={number(props.padding, 16, 0, 40)}
    compact={props.compact === true}
    mode={modeOf(metadata)}
  />
);

const renderDressCode: Renderer = ({ props, theme }) => (
  <DressCodeView
    heading={text(props.heading, "DRESS CODE")}
    subtitle={text(props.subtitle, "Trang phục dự tiệc")}
    headingColor={paint(props.headingColor, "#203b29", theme)}
    subtitleColor={paint(props.subtitleColor, "#6d705f", theme)}
    shape={pick(["circle", "square", "diamond"] as const, props.swatchShape, "circle")}
    size={number(props.swatchSize, 48, 24, 88)}
    gap={number(props.swatchGap, 24, 0, 48)}
    colors={(Array.isArray(props.colors) ? props.colors.slice(0, DRESS_CODE_MAX_COLORS) : [props.swatch1, props.swatch2, props.swatch3])
      .map((color, index) => paint(color, DRESS_CODE_DEFAULT_COLORS[index % DRESS_CODE_DEFAULT_COLORS.length]!, theme))}
  />
);

const renderDecoration: Renderer = ({ id, props, metadata, theme }) => {
  const openingId = metadata && typeof metadata === "object" && !Array.isArray(metadata)
    ? (metadata as Record<string, unknown>).giftOpeningId
    : undefined;
  return <DecorationView
    src={isImageUrl(props.src) ? props.src : ""}
    alt={text(props.alt, "")}
    fit={text(props.fit, "contain")}
    motion={props.motion === true}
    motionStyle={props.motionStyle === "Bao lì xì" ? "envelope" : "box"}
    floatMotion={props.floatMotion === true}
    idle={DECORATION_IDLE_EFFECTS.includes(props.idleEffect as never) ? props.idleEffect as (typeof DECORATION_IDLE_EFFECTS)[number] : "Không"}
    shineRadius={number(props.shineRadius, 24, 0, 200)}
    hoverEffect={DECORATION_HOVER_EFFECTS.includes(props.hoverEffect as never) ? props.hoverEffect as (typeof DECORATION_HOVER_EFFECTS)[number] : "Không"}
    hoverGroup={hoverGroupId(props.hoverGroup) || hoverGroupId(id)}
    hoverTime={number(props.hoverTime, 1.6, 0.3, 5)}
    hoverDelay={number(props.hoverDelay, 0, 0, 3)}
    hoverRise={number(props.hoverRise, 55, 10, 200)}
    hoverSway={number(props.hoverSway, 14, -60, 60)}
    tintColor={props.tint === true ? paint(props.tintColor, "#e8f0e4", theme) : ""}
    opening={openingId === id}
  />;
};

// Hạt trôi: mọi số đo bị kẹp vào giới hạn, hình lạ thành Vuông; ở editor chỉ vẽ khung nét đứt và nhãn để tìm thấy khối.
const renderParticles: Renderer = ({ props, metadata, theme }) => (
  <ParticlesView
    shape={pick(PARTICLE_SHAPES, props.shape, "Vuông")}
    direction={props.direction === "Rơi xuống" ? "Rơi xuống" : "Bay lên"}
    color={paint(props.color, "#e8f0e4", theme)}
    count={Math.round(number(props.count, 14, PARTICLE_LIMITS.count.min, PARTICLE_LIMITS.count.max))}
    size={number(props.size, 8, PARTICLE_LIMITS.size.min, PARTICLE_LIMITS.size.max)}
    speed={number(props.speed, 100, PARTICLE_LIMITS.speed.min, PARTICLE_LIMITS.speed.max)}
    opacity={number(props.opacity, 50, PARTICLE_LIMITS.opacity.min, PARTICLE_LIMITS.opacity.max)}
    drift={number(props.drift, 20, PARTICLE_LIMITS.drift.min, PARTICLE_LIMITS.drift.max)}
    char={typeof props.char === "string" && props.char ? [...props.char].slice(0, 2).join("") : "囍"}
    palette={BURST_PALETTE_NAMES.includes(props.palette as never) ? props.palette as (typeof BURST_PALETTE_NAMES)[number] : undefined}
    editing={modeOf(metadata) === "edit"}
  />
);

// Pháo mở thiệp: trên trang thật không vẽ gì (trình phát bắn pháo khi mở thiệp), trong editor là một nhãn nét đứt.
const renderBurst: Renderer = ({ props, metadata }) => <BurstView config={readBurstConfig(props)} editing={modeOf(metadata) === "edit"} />;

const renderCurvedText: Renderer = ({ props, theme }) => (
  <div style={{ position: "relative", width: "100%", height: "100%", color: paint(props.color, "#511419", theme), fontFamily: stackOf(props.font) || "inherit" }}>
    <CurvedText value={text(props.text, "")} amount={number(props.amount, 60, CURVE_LIMITS.amount.min, CURVE_LIMITS.amount.max)} size={number(props.size, 18, CURVE_LIMITS.size.min, CURVE_LIMITS.size.max)} bold={props.bold === true} italic={props.italic === true} underline={false} circular={props.layout === "Nửa tròn"} radius={number(props.radius, 105, 100, 300)} letterSpacing={number(props.letterSpacing, 0, 0, 1)} />
  </div>
);

// Thẻ thiệp: chỉ cắt phần tràn của các khối con theo bo góc của khối (nền, viền do Miditor vẽ trên khung ngoài).
const renderCardPanel: Renderer = ({ children }) => <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: "inherit" }}>{children}</div>;

const renderGradient: Renderer = ({ props, theme }) => <GradientView config={readGradient(props, (value, fallback) => paint(value, fallback, theme))} />;

// Mỗi kiểu lịch là một loại khối riêng nhưng cùng một cách vẽ.
const calendarRenderers = Object.fromEntries(Object.keys(calendarDefinitions).map((type) => [type, renderCalendar]));
const photoFrameRenderers = Object.fromEntries(Object.keys(photoFrameDefinitions).map((type) => [type, renderPhotoFrame]));

export const cardRenderers = {
  Text: renderText,
  Album: renderAlbum,
  AlbumGrid: renderAlbumGrid,
  AlbumStrip: renderAlbumStrip,
  AlbumPolaroid: renderAlbumPolaroid,
  Map: renderMap,
  Form: renderForm,
  DressCode: renderDressCode,
  Decoration: renderDecoration,
  Particles: renderParticles,
  Burst: renderBurst,
  Gradient: renderGradient,
  CardPanel: renderCardPanel,
  CurvedText: renderCurvedText,
  ...calendarRenderers,
  ...photoFrameRenderers,
};
