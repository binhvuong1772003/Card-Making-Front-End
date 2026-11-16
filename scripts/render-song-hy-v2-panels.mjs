// Reproduce CSS border-image: slice 270 240 fill; desktop border 122px 109px,
// mobile border 90px 80px. These PNGs are raster derivatives, not vectors.
import fs from 'node:fs/promises';
import sharp from 'sharp';
const slug = 'song-hy-v2-do';
const panels = JSON.parse(await fs.readFile(`docs/references/${slug}/panel-derivatives.json`, 'utf8'));
const input = `public/demo/${slug}/source-assets/panel.webp`;
const { width: sw, height: sh } = await sharp(input).metadata();
for (const panel of panels) {
  for (const mode of ['desktop', 'mobile']) {
    const [,, rawWidth, rawHeight] = panel[mode].rect;
    const w = Math.round(rawWidth), h = Math.round(rawHeight);
    const bx = mode === 'desktop' ? 109 : 80, by = mode === 'desktop' ? 122 : 90;
    const sx = [0, 240, sw - 240, sw], sy = [0, 270, sh - 270, sh];
    const dx = [0, bx, w - bx, w], dy = [0, by, h - by, h];
    const layers = [];
    for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) {
      const piece = await sharp(input).extract({ left: sx[x], top: sy[y], width: sx[x+1]-sx[x], height: sy[y+1]-sy[y] })
        .resize(dx[x+1]-dx[x], dy[y+1]-dy[y], { fit: 'fill' }).png().toBuffer();
      layers.push({ input: piece, left: dx[x], top: dy[y] });
    }
    const path = `public/demo/${slug}/panel-${panel.id}-${mode}.png`;
    await sharp({ create: { width: w, height: h, channels: 4, background: '#00000000' } }).composite(layers).png().toFile(path);
    console.log(`${path}: ${w} × ${h}`);
  }
}
