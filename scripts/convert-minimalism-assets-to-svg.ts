import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../public/demo/minimalism-do-dam");
const flower = "https://res.cloudinary.com/djrcgraqq/image/upload/v1794277376/cardmaking/decorations/ref-min-red-flower.webp";
const castle = "https://res.cloudinary.com/djrcgraqq/image/upload/v1794277378/cardmaking/decorations/ref-min-red-castle.webp";
const paper = "https://res.cloudinary.com/djrcgraqq/image/upload/v1794293672/cardmaking/decorations/ref-min-red-paper-texture.webp";
const envelopeBack = "https://res.cloudinary.com/djrcgraqq/image/upload/v1794293674/cardmaking/decorations/ref-min-red-envelope-open.webp";
const envelopeFront = "https://res.cloudinary.com/djrcgraqq/image/upload/v1794293675/cardmaking/decorations/ref-min-red-envelope-front.webp";
const camera = "https://res.cloudinary.com/djrcgraqq/image/upload/v1794277379/cardmaking/decorations/ref-min-red-camera.webp";
const cake = "https://res.cloudinary.com/djrcgraqq/image/upload/v1794277380/cardmaking/decorations/ref-min-red-cake.webp";
const cook = "https://res.cloudinary.com/djrcgraqq/image/upload/v1794277381/cardmaking/decorations/ref-min-red-cook.webp";
const photoIds = [
  "cdecf6cfe2eeb3cfd63829abde62f1066f10a364ec27d4c997c0f51012c8803e",
  "abd329aeb24dfdb5db34be2cd39ccbe4b5b0f943f66a89f8c855b2d615cc4e24",
  "09c78712bd94460430a8a633a8e72a0576016ea56e183d89d97c551649ee9ece",
  "d7695e2fed94d3347e78455624c26164a088b3a365bce422de1ef752fdcab2c1",
  "07db56b959aa4410010132a54bfbedd0518e911389a0c6623b946096377bbb97",
  "a054d52f9d4d1ed606a4226463f555e359dee874ba7138eab94e10a18b39ddda",
  "1cfc881768c6a5c42054d40c4239f4f56b59a159692734f3deb8e79fc55499d2",
  "e13655d0de07f307824d9dd1ad5a399434ebc0c016d86aaa4c1bde7452a4abb1",
];

async function main() {
  const assets: Array<[string, Buffer | string]> = [
    ["flower", flower], ["castle", castle], ["paper", paper],
    ["envelope-background", envelopeBack], ["envelope-cover", envelopeFront],
    ["camera", camera], ["cake", cake], ["cook", cook],
    ...photoIds.map((id, index) => [`photo-${index + 1}`, `https://assets.chungdoi.com/photo-library/design/${id}.webp`] as [string, string]),
  ];

  const converted = new Map<string, string>();
  for (const [name, source] of assets) {
    const response = typeof source === "string" && source.startsWith("https://") ? await fetch(source) : null;
    if (response && !response.ok) throw new Error(`Could not download ${name}: HTTP ${response.status}`);
    const data = response ? Buffer.from(await response.arrayBuffer()) : Buffer.isBuffer(source) ? source : readFileSync(source);
    const temp = resolve("/tmp", `cardmaking-${name}.webp`);
    writeFileSync(temp, data);
    const info = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", temp], { encoding: "utf8" });
    const width = Number(info.match(/pixelWidth: (\d+)/)?.[1]);
    const height = Number(info.match(/pixelHeight: (\d+)/)?.[1]);
    if (!width || !height) throw new Error(`Could not read dimensions for ${name}`);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><image href="data:image/webp;base64,${data.toString("base64")}" width="${width}" height="${height}" preserveAspectRatio="none"/></svg>\n`;
    converted.set(name, svg);
    writeFileSync(resolve(root, `${name}.svg`), svg);
  }
  writeFileSync(resolve(root, "flowers.svg"), converted.get("flower")!);
  writeFileSync(resolve(root, "castle.svg"), converted.get("castle")!);
  writeFileSync(resolve(root, "icon-camera.svg"), converted.get("camera")!);
  writeFileSync(resolve(root, "icon-cake.svg"), converted.get("cake")!);
  writeFileSync(resolve(root, "icon-glass.svg"), converted.get("cook")!);
  console.log(`Converted ${assets.length} source images into SVG containers.`);
}

void main();
