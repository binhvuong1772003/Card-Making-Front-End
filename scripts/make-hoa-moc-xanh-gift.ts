// Tạm: sinh trang popup quà mừng của Hoa Mộc Xanh theo số đo cửa sổ gốc (576x410). Ghi public/demo/hoa-moc-xanh/gift-details.json.
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../lib/cards/blocks/definitions";

const registry = { ...builtInRegistry, ...cardDefinitions };
const K = 960 / 576;
const n = (v: number) => Math.round(v * K);
const GREEN = "#30530f";
const PAPER = "#fffaf7";
const TIMES = "'Times New Roman', serif";
const sans = "'Gotham', system-ui, sans-serif";
const mono = "ui-monospace, 'SF Mono', Menlo, monospace";
type Box = { x: number; y: number; w: number; h: number };
// Nút theo số đo gốc (px của cửa sổ 576): vị trí tính từ tâm trang 960.
const at = (left: number, top: number, w: number, h: number): Box => ({ x: n(left), y: n(top), w: n(w), h: n(h) });
function put(type: string, id: string, box: Box, props: Record<string, JsonValue>, styles: NodeStyles = {}): FreeNode {
  const node = newNode(registry, type, id, { w: 960, h: n(410) }, { props }) as FreeNode;
  node.position = { mode: "free", x: { anchor: "center", offset: Math.round(box.x + box.w / 2 - 480) }, y: { anchor: "start", offset: box.y } };
  node.size = { w: { kind: "px", v: box.w }, h: { kind: "px", v: box.h } };
  node.styles = { ...node.styles, ...styles };
  return node;
}
const text = (id: string, value: string, box: Box, size: number, color: string, font: string, bold = false) =>
  put("Text", id, box, { text: value, size: Math.round(size * K), color, font, bold, italic: false, underline: false, align: "center" });
const nodes: FreeNode[] = [
  put("Shape", "gift-popup-header", at(0, 0, 576, 76), { shape: "rectangle", fill: GREEN, motionTarget: "" }),
  text("gift-popup-title", "HỘP QUÀ MỪNG", at(24, 24, 528, 36), 24, "#ffffff", TIMES, true),
];
const columns = [
  { key: "groom", left: 24, title: "Chú Rể - Minh Quân", bank: "Vietcombank", number: "0000000000", holder: "MINH QUÂN", qr: "/demo/hoa-moc-xanh/qr-groom.png" },
  { key: "bride", left: 296, title: "Cô Dâu - Thu Hà", bank: "BIDV", number: "6665558888", holder: "THU HÀ", qr: "/demo/hoa-moc-xanh/qr-bride.png" },
];
for (const c of columns) {
  const mid = c.left + 128;
  nodes.push(
    text(`gift-popup-${c.key}-label`, c.title, at(mid - 128, 100, 256, 20), 12, GREEN, sans),
    put("Shape", `gift-popup-${c.key}-qr-card`, at(mid - 80, 140, 160, 160), { shape: "rectangle", fill: "#ffffff", motionTarget: "" }, { borderRadius: n(12) }),
    put("Image", `gift-popup-qr-${c.key}`, at(mid - 70, 150, 140, 140), { src: c.qr, alt: `Mã QR mừng cưới ${c.key === "groom" ? "chú rể" : "cô dâu"}`, fit: "contain" }),
    text(`gift-popup-${c.key}-bank`, c.bank, at(mid - 128, 308, 256, 15), 10, GREEN, sans),
    text(`gift-popup-${c.key}-number`, c.number, at(mid - 128, 325, 256, 15), 10, GREEN, mono),
    text(`gift-popup-${c.key}-holder`, c.holder, at(mid - 128, 342, 256, 15), 10, GREEN, sans, true),
    put("Shape", `gift-popup-${c.key}-save`, at(mid - 34, 363, 68, 23), { shape: "rectangle", fill: "#eeece4", motionTarget: "" }, { borderRadius: n(12) }),
    text(`gift-popup-${c.key}-save-label`, "↓ Lưu QR", at(mid - 34, 367, 68, 15), 10, GREEN, sans),
  );
}
const page = emptyPage();
const data = { ...page, root: { ...page.root, styles: { ...page.root.styles, background: PAPER, minHeight: n(410), phoneMinHeight: n(410) }, children: nodes } };
const popupPage = { id: "gift-details", name: "Mừng cưới", data, interactions: {}, popup: { width: 641, effect: "fade", backdropColor: "#17251e", backdropOpacity: 56 } };
writeFileSync(resolve(__dirname, "../public/demo/hoa-moc-xanh/gift-details.json"), JSON.stringify(popupPage));
console.log(`Đã ghi popup quà mừng Hoa Mộc Xanh với ${nodes.length} khối`);
