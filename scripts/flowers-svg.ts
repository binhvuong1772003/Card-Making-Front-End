// Hoa tự vẽ (không dùng ảnh của trang mẫu): hai bông mẫu đơn đỏ rượu, một bông hồng kem, lá có gân và cành quả mọng, khổ 225x303 như hoa gốc;
// `flip` lật ngang cho bên phải. Cánh hoa là đường cong nhiều lớp, mỗi lớp nhỏ và sáng hơn lớp ngoài.
export function flowerSvg(flip: boolean): string {
  const petal = (r: number, fill: string, stroke: string, angle: number) =>
    `<path d="M0 0C${(-0.55 * r).toFixed(1)} ${(-0.25 * r).toFixed(1)} ${(-0.52 * r).toFixed(1)} ${(-0.88 * r).toFixed(1)} 0 ${(-r).toFixed(1)}C${(0.52 * r).toFixed(1)} ${(-0.88 * r).toFixed(1)} ${(0.55 * r).toFixed(1)} ${(-0.25 * r).toFixed(1)} 0 0Z" fill="${fill}" stroke="${stroke}" stroke-width=".8" stroke-opacity=".5" transform="rotate(${angle})"/>`;
  const ring = (count: number, r: number, fill: string, stroke: string, turn: number) => Array.from({ length: count }, (_, i) => petal(r, fill, stroke, turn + (360 / count) * i)).join("");
  const bloom = (cx: number, cy: number, r: number, outer: string, mid: string, inner: string, edge: string) =>
    `<g transform="translate(${cx} ${cy})">${ring(9, r, outer, edge, 0)}${ring(7, r * 0.78, mid, edge, 18)}${ring(6, r * 0.55, inner, edge, 9)}${ring(4, r * 0.3, outer, edge, 40)}<circle r="${(r * 0.09).toFixed(1)}" fill="#c9a24a"/></g>`;
  const leaf = (x: number, y: number, rot: number, len: number) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0C${len * 0.3} ${-len * 0.34} ${len * 0.75} ${-len * 0.3} ${len} 0C${len * 0.75} ${len * 0.3} ${len * 0.3} ${len * 0.34} 0 0Z" fill="#6b7d4f"/><path d="M2 0H${len * 0.92}" stroke="#8a9a6a" stroke-width="1"/></g>`;
  const berries = [[150, 22], [160, 34], [143, 38], [168, 20], [136, 26]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="#7a1f26"/>`).join("");
  const body = [
    `<path d="M24 296C62 240 96 170 150 36" stroke="#5f7048" stroke-width="2.2" fill="none"/>`,
    `<path d="M150 36C160 24 168 20 178 18M150 36C140 30 134 24 130 20" stroke="#5f7048" stroke-width="1.4" fill="none"/>`,
    berries,
    leaf(86, 236, -30, 44), leaf(98, 214, 205, 40), leaf(118, 172, -55, 38), leaf(128, 140, 215, 34), leaf(70, 262, 8, 40),
    bloom(66, 226, 44, "#7a1f26", "#8f2a32", "#a8323b", "#4a0f14"),
    bloom(112, 142, 36, "#8f2a32", "#a8323b", "#c05560", "#4a0f14"),
    bloom(148, 78, 26, "#d9cdbb", "#ece4d8", "#f6efe4", "#a8917a"),
  ].join("");
  return flip ? `<g transform="translate(225 0) scale(-1 1)">${body}</g>` : body;
}


/** Một tệp SVG hoa độc lập (225x303) để dùng như khối Trang trí. */
export const flowersDocument = (): string => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 225 303">${flowerSvg(false)}</svg>\n`;
