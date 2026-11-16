// Tạm: sinh trang bìa "Song Hỷ" (xanh và đỏ) theo số đo trang mẫu, nội dung giả. Ghi public/demo/song-hy/cover-{xanh,do}.json cùng các SVG theo chủ đề.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { builtInRegistry, emptyPage, newNode, type Axis, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../lib/cards/blocks/definitions";

const registry = { ...builtInRegistry, ...cardDefinitions };
const SIZE = { w: 960, h: 900 };
const serif = "'Playfair Display', serif";
const lora = "'Lora', serif";
const baskerville = "'Cormorant Garamond', serif";
const viaoda = "'Viaoda Libre', serif";
const FONT = "'Noto Serif SC','Songti SC','STSong','Source Han Serif SC','SimSun','Microsoft YaHei',serif";

type Theme = {
  key: string; gradient: [string, string, string]; card: string; border: string; borderAlpha: number; cardAlpha: number; cream: string; ink: string; dim: string; palette: string;
  name1: string; name2: string; date: string; nameFont: string; sealKind: "glyph" | "heart" | "mask"; sealFrom?: string; sealTo?: string; sealMark: string;
  particleShape: string; particleChar: string; burstChar: string; flowers?: boolean; leafCover?: boolean; accent?: string; button: string; buttonText: string; ruleKind: "solid" | "fade"; weight: number;
  // Bìa lá có hoa riêng (Minimalism Nâu): ảnh hoa, vị trí tâm so với tâm thẻ, độ mờ trong thẻ; màu lá rơi và bảng màu pháo.
  flower?: { src: string; w: number; h: number; lx: number; ly: number; rx: number; ry: number; rot: number; opL: number; opR: number; flipRight: boolean };
  leafColor?: string; burstPalette?: string;
  // Song Hỷ V2: ảnh con dấu thay chữ 囍 vẽ bằng SVG, phông riêng cho dấu & và độ mờ chữ ngày.
  sealImage?: string; ampFont?: string;
};
const themes: Theme[] = [
  { key: "shv2", gradient: ["#420000", "#420000", "#420000"], card: "#8c0000", border: "#ffe8a4", borderAlpha: 0, cardAlpha: 1, cream: "#ffe8a4", ink: "#ffe8a4", dim: "#eed4c4", accent: "#fdcb9c", palette: "Đỏ vàng", name1: "Trung Hiếu", name2: "Thanh Hà", date: "4 tháng 1, 2027", nameFont: "'Carattere', cursive", ampFont: "'Ms Madi', cursive", sealKind: "glyph", sealMark: "#8c0000", sealImage: "/demo/song-hy-v2-do/source-assets/double-happiness-light.webp", particleShape: "Chữ", particleChar: "囍", burstChar: "囍", button: "#ffe8a4", buttonText: "#8c0000", ruleKind: "fade", weight: 400,
    flower: { src: "/demo/song-hy-v2-do/source-assets/double-happiness-light.webp", w: 402, h: 396, lx: -305, ly: -127, rx: 292, ry: 171, rot: 0, opL: 15, opR: 15, flipRight: false } },
  { key: "xanh", gradient: ["#0a1f0e", "#122418", "#1f3a25"], card: "#1f3a25", border: "#e8f0e4", borderAlpha: 0.15, cardAlpha: 1, cream: "#e8f0e4", ink: "#e8f0e4", dim: "#cad5c7", palette: "Xanh lá", name1: "Minh Anh", name2: "Thu Hà", date: "30 tháng 7, 2026", nameFont: serif, sealKind: "mask", sealMark: "#1f3a25", particleShape: "Chữ", particleChar: "囍", burstChar: "囍", button: "#e8f0e4", buttonText: "#1f3a25", ruleKind: "solid", weight: 400 },
  { key: "do", gradient: ["#5a0000", "#400000", "#2a0000"], card: "#800000", border: "#ffeed2", borderAlpha: 0.15, cardAlpha: 1, cream: "#ffeed2", ink: "#ffeed2", dim: "#ecc9b2", palette: "Đỏ vàng", name1: "Gia Huy", name2: "Quỳnh Như", date: "14 tháng 6, 2026", nameFont: serif, sealKind: "glyph", sealMark: "#800000", particleShape: "Chữ", particleChar: "囍", burstChar: "囍", button: "#ffeed2", buttonText: "#800000", ruleKind: "solid", weight: 400 },
  { key: "mdd", gradient: ["#6e1a20", "#511419", "#380a0e"], card: "#fffaf3", border: "#511419", borderAlpha: 0.15, cardAlpha: 0.96, cream: "#fffaf3", ink: "#511419", dim: "#825456", palette: "Đỏ rượu", name1: "Hoàng Long", name2: "Bảo Ngọc", date: "3 tháng 1, 2026", nameFont: viaoda, sealKind: "heart", sealFrom: "#511419", sealTo: "#330000", sealMark: "#f3e8de", particleShape: "Tim", particleChar: "♥", burstChar: "♥", flowers: true, button: "#511419", buttonText: "#f3e8de", ruleKind: "fade", weight: 300 },
  // Hoa Mộc Xanh: cùng khung bìa Minimalism nhưng xanh lá; thẻ #fffaf7 @95%, hai ảnh hoa 300px (40% và 30%, ảnh sau xoay 160 độ), lá #c8dfa0 rơi và xoay.
  { key: "hmx", gradient: ["#1a3005", "#0f2003", "#081500"], card: "#fffaf7", border: "#30530f", borderAlpha: 0, cardAlpha: 0.95, cream: "#fffaf7", ink: "#30530f", dim: "#6e8555", accent: "#6b8040", palette: "Xanh lá", name1: "Minh Quân", name2: "Thu Hà", date: "24 tháng 5, 2026", nameFont: serif, sealKind: "heart", sealFrom: "#30530f", sealTo: "#123500", sealMark: "#fffaf7", particleShape: "Lá", particleChar: "", burstChar: "❦", leafCover: true, button: "#30530f", buttonText: "#fffaf7", ruleKind: "fade", weight: 400 },
  // Minimalism Nâu: khung bìa như Hoa Mộc Xanh, màu nâu be; thẻ rgba(255,250,245,.96), hoa 137,8x320 (xoay 25 độ, bản phải lật), con dấu nâu #7c6a60, lá #c9a97e.
  { key: "mbn", gradient: ["#f3e6da", "#e8d5c4", "#dcc6b2"], card: "#fffaf5", border: "#7c6a60", borderAlpha: 0, cardAlpha: 0.96, cream: "#fffaf5", ink: "#7c6a60", dim: "#a1928a", accent: "#7c6a60", palette: "Nâu be", name1: "Hoàng Nam", name2: "Thảo Vy", date: "3 tháng 1, 2026", nameFont: "'EB Garamond', serif", sealKind: "heart", sealFrom: "#7c6a60", sealTo: "#7c6a60", sealMark: "#ffffff", particleShape: "Lá", particleChar: "", burstChar: "❦", leafCover: true, button: "#7c6a60", buttonText: "#ffffff", ruleKind: "fade", weight: 400,
    flower: { src: "/demo/minimalism-nau/decoration-flower2-decoration.webp", w: 137.8, h: 320, lx: -285, ly: -78, rx: 285, ry: -77, rot: 25, opL: 70, opR: 70, flipRight: true }, leafColor: "#c9a97e", burstPalette: "Nâu be" },
];

const glyph = (x: number, y: number, size: number, rotate: number, fill: string, opacity = 1) =>
  `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${size}" font-family="${FONT}" fill="${fill}" fill-opacity="${opacity}" transform="rotate(${rotate} ${x} ${y})">囍</text>`;

function writeAssets(t: Theme) {
  const dir = resolve(__dirname, "../public/demo/song-hy");
  const sourceFlower = readFileSync(resolve(__dirname, "../public/demo/minimalism-do-dam/flower.svg"), "utf8");
  const flowerImage = sourceFlower.match(/href="(data:image\/webp;base64,[^"]+)"/)?.[1];
  if (t.flowers && !flowerImage) throw new Error("Missing saved Minimalism flower asset.");
  // Hoa đúng mã của trang gốc (lg): ảnh cao 280px, rộng tự theo tỉ lệ (811x1938), opacity .8, xoay 25 độ.
  // Trái: top -2% (= -8,4px), left -10px, dịch -11% bề rộng. Phải: bottom 35% (= đáy ở y 273), right -10px, dịch +11%, lật ngang, xoay -25 độ. Thẻ cắt theo clip-path bo 8px.
  const fh = 280;
  const fw = (fh * 811) / 1938;
  const shift = fw * 0.11;
  const image = `<image href="${flowerImage}" width="${fw.toFixed(2)}" height="${fh}" preserveAspectRatio="xMidYMid meet"/>`;
  const cx = fw / 2;
  const cy = fh / 2;
  const leftX = -10 - shift;
  const leftY = -0.02 * 420;
  const rightX = 600 + 10 - fw + shift;
  const rightY = 420 - 0.35 * 420 - fh;
  const flowers = false
    ? `<g opacity=".8" transform="translate(${leftX.toFixed(2)} ${leftY.toFixed(2)}) rotate(25 ${cx.toFixed(2)} ${cy})">${image}</g>` +
      `<g opacity=".8" transform="translate(${rightX.toFixed(2)} ${rightY.toFixed(2)}) translate(${cx.toFixed(2)} ${cy}) rotate(-25) scale(-1 1) translate(${(-cx).toFixed(2)} ${-cy})">${image}</g>`
    : "";
  const motifs = t.flowers || t.leafCover || t.flower || t.key === "xanh" ? "" : `${glyph(50, 40, 410, -18, t.cream, 0.11)}${glyph(550, 380, 410, 162, t.cream, 0.11)}`;
  // Thẻ 600x420: nền, viền mảnh và phần trang trí (hai chữ 囍 hoặc hoa) cắt theo thẻ, như trang mẫu.
  writeFileSync(resolve(dir, `card-${t.key}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420"><defs><clipPath id="c"><rect width="600" height="420" rx="8"/></clipPath></defs><rect x=".5" y=".5" width="599" height="419" rx="8" fill="${t.card}" fill-opacity="${t.cardAlpha}" stroke="${t.border}" stroke-opacity="${t.borderAlpha}"/><g clip-path="url(#c)">${motifs}${flowers}</g></svg>\n`);
  writeFileSync(resolve(dir, `xi-${t.key}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="52" text-anchor="middle" dominant-baseline="central" font-size="104" font-family="${FONT}" fill="${t.cream}">囍</text></svg>\n`);
  const emblemPng = t.sealKind === "mask"
    ? readFileSync(resolve(__dirname, "../public/demo/song-hy-xanh/chinese_happiness.png")).toString("base64")
    : "";
  const sealBody = t.leafCover
    ? `<defs><radialGradient id="g" cx=".3" cy=".3" r=".9"><stop offset="0" stop-color="${t.sealFrom}"/><stop offset="1" stop-color="${t.sealTo}"/></radialGradient></defs><circle cx="50" cy="50" r="48" fill="url(#g)"/><g transform="translate(25 25) scale(2.0833)"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="${t.sealMark}"/></g>`
    : t.sealKind === "heart"
    ? `<style>@keyframes mdd-heartbeat{0%,100%{transform:scale(.985)}50%{transform:scale(1.025)}}#seal-heart{transform-box:fill-box;transform-origin:center;animation:mdd-heartbeat 2.6s ease-in-out infinite}@media(prefers-reduced-motion:reduce){#seal-heart{animation:none}}</style><defs><radialGradient id="g" cx=".3" cy=".3" r=".9"><stop offset="0" stop-color="${t.sealFrom}"/><stop offset="1" stop-color="${t.sealTo}"/></radialGradient></defs><circle cx="50" cy="50" r="48" fill="url(#g)"/><g transform="translate(25 25) scale(2.0833)"><path id="seal-heart" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="${t.sealMark}"/></g>`
    : t.sealKind === "mask"
      ? `<defs><radialGradient id="g" cx="30%" cy="30%" r="90%"><stop offset="0" stop-color="#e8f0e4"/><stop offset="1" stop-color="#cad2c6"/></radialGradient><mask id="emblem" maskUnits="userSpaceOnUse" x="18" y="18" width="64" height="64" mask-type="alpha"><image href="data:image/png;base64,${emblemPng}" x="18" y="18" width="64" height="64" preserveAspectRatio="none"/></mask></defs><circle cx="50" cy="50" r="48" fill="url(#g)"/><rect x="18" y="18" width="64" height="64" fill="${t.sealMark}" fill-opacity=".9" mask="url(#emblem)"/>`
    : `<circle cx="50" cy="50" r="48" fill="${t.cream}"/><text x="50" y="52" text-anchor="middle" dominant-baseline="central" font-size="58" font-family="${FONT}" fill="${t.sealMark}">囍</text>`;
  writeFileSync(resolve(dir, `seal-${t.key}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${sealBody}</svg>\n`);
  writeFileSync(resolve(dir, `ring-${t.key}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46.5" fill="none" stroke="${t.sealKind === "heart" ? t.sealFrom : t.cream}" stroke-width="5.4"/></svg>\n`);
  // Nút Mở thiệp là hình pill kèm bóng vẽ trong SVG (bóng của khối Hình khối bị cắt thành ô vuông quanh nút).
  writeFileSync(resolve(dir, `button-${t.key}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 88"><defs><filter id="s" x="-30%" y="-60%" width="160%" height="240%"><feDropShadow dx="0" dy="4" stdDeviation="7" flood-color="${t.button}" flood-opacity=".35"/></filter></defs><rect x="20" y="20" width="140" height="48" rx="24" fill="${t.button}" filter="url(#s)"/></svg>\n`);
  // Đường kẻ hai bên ❦: mờ dần ra ngoài (mẫu Minimalism) hoặc nét liền mảnh.
  const fade = (left: boolean) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 1" preserveAspectRatio="none"><defs><linearGradient id="r" x1="${left ? 0 : 1}" x2="${left ? 1 : 0}"><stop offset="0" stop-color="${t.accent ?? t.ink}" stop-opacity="0"/><stop offset="1" stop-color="${t.accent ?? t.ink}"/></linearGradient></defs><rect width="40" height="1" fill="url(#r)"/></svg>\n`;
  writeFileSync(resolve(dir, `rule-${t.key}-left.svg`), fade(true));
  writeFileSync(resolve(dir, `rule-${t.key}-right.svg`), fade(false));
}

type Open = { effect: string; time: number; delay: number };
const OPEN = (effect: string, time: number, delay = 0): Open => ({ effect, time, delay });
const center = (offset: number): Axis => ({ anchor: "center", offset });
const stretch: Axis = { anchor: "stretch", start: 0, end: 0 };

function put(type: string, id: string, box: { x: number | Axis; y: number | Axis; w: number; h: number; rotation?: number }, props: Record<string, JsonValue>, open: Open | undefined, styles: NodeStyles = {}): FreeNode {
  const node = newNode(registry, type, id, SIZE, { props }) as FreeNode;
  node.position = { mode: "free", x: typeof box.x === "number" ? center(box.x) : box.x, y: typeof box.y === "number" ? center(box.y) : box.y };
  node.size = { w: { kind: "px", v: box.w }, h: { kind: "px", v: box.h } };
  node.rotation = box.rotation ?? 0;
  node.styles = { ...node.styles, ...styles };
  if (open) node.props = { ...node.props, openEffect: open.effect, openTime: open.time, openDelay: open.delay };
  return node;
}

function buildCover(t: Theme) {
  writeAssets(t);
  // Bìa hoa (Minimalism): cả tấm thẻ bay lên khỏi màn hình trong 0,8s (đo: envelope-away); các bìa khác mờ dần từ 0,9s.
  const FADE = t.flowers || t.leafCover ? OPEN("Bay lên rồi biến mất", 0.8, 0.25) : OPEN("Mờ dần", 0.7, 0.9);
  const decoration = (id: string, file: string, box: Parameters<typeof put>[2], open: Open | undefined, styles: NodeStyles = {}) =>
    put("Decoration", id, box, { src: `/demo/song-hy/${file}`, alt: "", fit: "contain", motion: false, motionTarget: "" }, open, styles);
  // Trái tim con dấu Hoa Mộc Xanh lấy nguyên path 24x24 của trang gốc (28px trong vòng 56px).
  // Con dấu tim đập nhịp tim; nút có vệt sáng quét (gốc: shine 3s, vệt 32px trên nút 140x48).
  const beat = (node: FreeNode): FreeNode => {
    if (t.leafCover) node.props = { ...node.props, idleEffect: "Thở nhẹ" };
    else if (t.sealKind === "heart") node.props = { ...node.props, idleEffect: "Đập" };
    if (t.sealKind === "mask") node.props = { ...node.props, idleEffect: "Thở nhẹ" };
    return node;
  };
  const text = (id: string, value: string, box: { x: number; y: number; w: number; h: number }, size: number, color: string, font: string, extra: Record<string, JsonValue> = {}) =>
    put("Text", id, box, { text: value, size, color, font, bold: false, italic: false, underline: false, align: "center", ...extra }, FADE);
  const rule = (id: string, side: "left" | "right") => t.ruleKind === "fade"
    ? decoration(id, `rule-${t.key}-${side}.svg`, { x: side === "left" ? -37 : 37, y: 14, w: 40, h: 1 }, FADE)
    : put("Shape", id, { x: side === "left" ? -50 : 50, y: 13, w: 60, h: 1 }, { shape: "rectangle", fill: t.cream, motionTarget: "" }, FADE, { opacity: 40 });
  const motifs = t.flowers || t.leafCover || t.flower ? [] : [
    decoration("open-motif-left", `xi-${t.key}.svg`, { x: -250, y: -170, w: 410, h: 410, rotation: -18 }, OPEN("Phóng ra rồi mờ dần", 1.3), { opacity: 0 }),
    decoration("open-motif-right", `xi-${t.key}.svg`, { x: 250, y: 170, w: 410, h: 410, rotation: 162 }, OPEN("Phóng ra rồi mờ dần", 1.3), { opacity: 0 }),
  ];
  // Hai bản sao hoa góc đứng yên, ẩn sẵn, rồi phóng to và nhoè khi mở (gốc: dragon-fly-forward 1,2s); hoa trong thẻ vẫn bay lên cùng thẻ.
  const fl = t.flower;
  const flowerClones = fl && !t.sealImage ? [
    put("Decoration", "open-flower-left", { x: fl.lx, y: fl.ly, w: fl.w, h: fl.h, rotation: fl.rot }, { src: fl.src, alt: "", fit: "contain", motion: false, motionTarget: "" }, OPEN("Phóng to rồi nhoè", 1.2), { opacity: 0 }),
    put("Decoration", "open-flower-right", { x: fl.rx, y: fl.ry, w: fl.w, h: fl.h, rotation: -fl.rot }, { src: fl.src, alt: "", fit: "contain", motion: false, motionTarget: "", flipX: fl.flipRight }, OPEN("Phóng to rồi nhoè", 1.2), { opacity: 0 }),
  ] : t.leafCover ? [
    put("Decoration", "open-flower-left", { x: -269, y: -109, w: 300, h: 300 }, { src: "/demo/hoa-moc-xanh/cover-flower.webp", alt: "", fit: "contain", motion: false, motionTarget: "" }, OPEN("Phóng to rồi nhoè", 1.2), { opacity: 0 }),
    put("Decoration", "open-flower-right", { x: 268.5, y: 119.5, w: 300, h: 300, rotation: 160 }, { src: "/demo/hoa-moc-xanh/cover-flower.webp", alt: "", fit: "contain", motion: false, motionTarget: "" }, OPEN("Phóng to rồi nhoè", 1.2), { opacity: 0 }),
  ] : t.flowers ? [
    decoration("open-flower-left", "hoa-do-ruou.svg", { x: -264.3, y: -78.4, w: 117.2, h: 280, rotation: 25 }, OPEN("Phóng to rồi nhoè", 1.2), { opacity: 0 }),
    decoration("open-flower-right", "hoa-do-ruou.svg", { x: 264.3, y: -77, w: 117.2, h: 280, rotation: -25 }, OPEN("Phóng to rồi nhoè", 1.2), { opacity: 0, flipX: true }),
  ] : [];
  // Hoa trong thẻ là hai khối riêng đặt trong khối Thẻ thiệp (cắt ở mép thẻ, bo góc 8px); cả thẻ bay lên cùng nhau khi mở.
  const panel = (() => {
    if (!t.flowers && !t.leafCover && !t.flower && t.key !== "xanh") return [] as FreeNode[];
    const node = put("CardPanel", "open-card-panel", { x: 0, y: 0, w: 600, h: 420 }, {}, FADE, { borderRadius: 8 });
    delete (node.styles as Record<string, unknown>).background;
    delete (node.styles as Record<string, unknown>).borderWidth;
    delete (node.styles as Record<string, unknown>).borderColor;
    node.children = fl ? [
      put("Decoration", "open-card-flower-left", { x: fl.lx, y: fl.ly, w: fl.w, h: fl.h, rotation: fl.rot }, { src: fl.src, alt: "", fit: "contain", motion: false, motionTarget: "" }, FADE, { opacity: fl.opL }),
      put("Decoration", "open-card-flower-right", { x: fl.rx, y: fl.ry, w: fl.w, h: fl.h, rotation: -fl.rot }, { src: fl.src, alt: "", fit: "contain", motion: false, motionTarget: "", flipX: fl.flipRight }, FADE, { opacity: fl.opR }),
    ] : t.leafCover ? [
      put("Decoration", "open-card-flower-left", { x: -269, y: -109, w: 300, h: 300 }, { src: "/demo/hoa-moc-xanh/cover-flower.webp", alt: "", fit: "contain", motion: false, motionTarget: "" }, FADE, { opacity: 40 }),
      put("Decoration", "open-card-flower-right", { x: 268.5, y: 119.5, w: 300, h: 300, rotation: 160 }, { src: "/demo/hoa-moc-xanh/cover-flower.webp", alt: "", fit: "contain", motion: false, motionTarget: "" }, FADE, { opacity: 30 }),
    ] : t.flowers ? [
      decoration("open-card-flower-left", "hoa-do-ruou.svg", { x: -264.3, y: -78.4, w: 117.2, h: 280, rotation: 25 }, OPEN("Mờ dần", 0.7, 0.25), { opacity: 80 }),
      decoration("open-card-flower-right", "hoa-do-ruou.svg", { x: 264.3, y: -77, w: 117.2, h: 280, rotation: -25 }, OPEN("Mờ dần", 0.7, 0.25), { opacity: 80, flipX: true }),
    ] : [
      put("Decoration", "open-card-chu-hy-left", { x: -280, y: -164, w: 300, h: 300, rotation: 30 }, { src: "/demo/song-hy-xanh/chu-hy.webp", alt: "", fit: "contain", motion: false, motionTarget: "" }, FADE, { opacity: 15 }),
      put("Decoration", "open-card-chu-hy-right", { x: 293, y: 164, w: 300, h: 300, rotation: 30 }, { src: "/demo/song-hy-xanh/chu-hy.webp", alt: "", fit: "contain", motion: false, motionTarget: "" }, FADE, { opacity: 15 }),
    ];
    return [node];
  })();
  const nodes: FreeNode[] = [
    put("Gradient", "open-bg", { x: stretch, y: stretch, w: 960, h: 900 }, { from: t.gradient[0], mid: t.gradient[1], to: t.gradient[2], direction: "Chéo xuống phải" }, undefined),
    put("Particles", "open-particles", { x: stretch, y: stretch, w: 960, h: 900 }, { shape: t.particleShape, direction: t.flowers || t.leafCover ? "Rơi xuống" : "Bay lên", char: t.particleChar, palette: t.leafCover ? "Một màu" : t.flowers ? "Đỏ vàng" : t.palette, color: t.leafCover ? (t.leafColor ?? "#c8dfa0") : t.cream, count: t.leafCover ? 12 : t.flowers ? 24 : 12, size: t.leafCover ? 19 : t.flowers ? 16 : 17, speed: t.leafCover ? 110 : t.flowers ? 150 : 100, opacity: t.leafCover ? 50 : t.flowers ? 100 : 50, drift: t.leafCover ? 19 : t.flowers ? 16 : 20 }, OPEN("Mờ dần", 1.3)),
    ...motifs,
    decoration("open-card", `card-${t.key}.svg`, { x: 0, y: 0, w: 600, h: 420 }, FADE, { shadow: { x: 0, y: 25, blur: 60, spread: -12, color: "#000000", opacity: 45 } }),
    ...panel,
    ...flowerClones,
    decoration("open-ring", `ring-${t.key}.svg`, { x: 0, y: -160, w: t.sealImage ? 64 : 56, h: t.sealImage ? 64 : 56 }, OPEN("Gợn sóng lan ra", 0.6)),
    // Con dấu tim có quầng bóng mềm cùng màu (gốc: 0 5px 27px #511419 @.5); bo tròn để bóng không thành ô vuông.
    beat(t.sealImage ? put("Decoration", "open-seal", { x: 0, y: -160, w: 52, h: 52 }, { src: t.sealImage, alt: "", fit: "contain", motion: false, motionTarget: "" }, OPEN("Thu nhỏ rồi biến mất", 0.5), { borderRadius: 26, shadow: { x: 0, y: 4, blur: 20, spread: 0, color: t.cream, opacity: 50 } }) : decoration("open-seal", `seal-${t.key}.svg`, { x: 0, y: -160, w: 56, h: 56 }, OPEN("Thu nhỏ rồi biến mất", 0.5), t.sealKind === "heart"
      ? { borderRadius: 28, shadow: { x: 0, y: 5, blur: 27, spread: 0, color: t.sealFrom ?? "#511419", opacity: 50 } }
      : t.sealKind === "mask" ? { borderRadius: 28, shadow: { x: 0, y: 4, blur: 20, spread: 0, color: "#e8f0e4", opacity: 50 } } : {})),
    text("open-name1", t.name1, { x: 0, y: -91, w: 500, h: 44 }, 36, t.ink, t.nameFont),
    text("open-amp", "&", { x: 0, y: -60, w: 100, h: 26 }, 20, t.ink, t.ampFont ?? baskerville),
    text("open-name2", t.name2, { x: 0, y: -26, w: 500, h: 44 }, 36, t.ink, t.nameFont),
    rule("open-rule-left", "left"),
    text("open-orn", "❦", { x: 0, y: 14, w: 40, h: 22 }, 14, t.accent ?? t.ink, baskerville),
    rule("open-rule-right", "right"),
    text("open-date", t.date, { x: 0, y: 46, w: 400, h: 30 }, 18, t.dim, lora),
    text("open-invite", "Thân Mời", { x: 0, y: 93, w: 300, h: 30 }, 18, t.dim, lora),
    decoration("open-button", `button-${t.key}.svg`, { x: 0, y: 154, w: 180, h: 88 }, FADE),
    ...(t.flowers || t.leafCover || t.flower || t.key === "xanh" ? [(() => { const shine = decoration("open-button-shine", "", { x: 0, y: 154, w: 140, h: 48 }, FADE); shine.props = { ...shine.props, src: "", idleEffect: "Ánh sáng quét", shineRadius: 24 }; return shine; })()] : []),
    text("open-label", "Mở thiệp", { x: 0, y: 154, w: 140, h: 48 }, 18, t.buttonText, lora, { motionTarget: "cover" }),
    put("Burst", "open-burst", { x: 0, y: 235, w: 96, h: 40 }, { char: t.burstChar, ...(t.leafCover ? { shape: "Lá" } : {}), count: 32, spread: 420, delay: 0.5, palette: t.leafCover ? (t.burstPalette ?? "Lá xanh") : t.palette }, undefined),
  ];
  const page = emptyPage();
  const data = { ...page, root: { ...page.root, styles: { ...page.root.styles, background: t.gradient[1], minHeight: 900, phoneMinHeight: 812 }, children: nodes } };
  const cover = { id: "cover", name: "Bìa", layout: "full", data, interactions: { "open-label": { type: "go-to-page", targetPageId: "invitation", transition: "fade", durationMs: 450 } } };
  writeFileSync(resolve(__dirname, `../public/demo/song-hy/cover-${t.key}.json`), JSON.stringify(cover));
  console.log(`Đã ghi bìa ${t.key} với ${nodes.length} khối`);
}

// Chạy một chủ đề: `npx tsx scripts/make-song-hy-covers.ts mbn`; không đối số thì sinh lại tất cả.
themes.filter((t) => !process.argv[2] || t.key === process.argv[2]).forEach(buildCover);
