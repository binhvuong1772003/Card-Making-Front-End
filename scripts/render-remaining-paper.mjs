// Exact fixed-material derivative of the measured CSS paper multiply layer.
// Keep the source file; this does not flatten text, images or interactive blocks.
import sharp from 'sharp';
const input = 'public/demo/minimalism-nau-dam/source-assets/paper.webp';
const { data, info } = await sharp(input).resize(666, 1000, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const base = [247, 245, 238];
for (let i = 0; i < data.length; i++) data[i] = Math.round(base[i % 3] * (0.5 + 0.5 * data[i] / 255));
await sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } }).png().toFile('public/demo/minimalism-nau-dam/paper-multiplied.png');
