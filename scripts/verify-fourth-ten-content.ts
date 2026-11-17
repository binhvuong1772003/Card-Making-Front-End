// Local verification only. Does not write templates, upload assets or publish.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { builtInRegistry, isPageData, validatePage, type TreeNode } from "@miditor/core";
import { cardDefinitions } from "../lib/cards/blocks/definitions";
import { chibiRedContentDocument } from "../lib/cards/demos/chibi-red";
import { hoaRumTrangContentDocument } from "../lib/cards/demos/hoa-rum-trang";
import { thanhDiepXanhContentDocument } from "../lib/cards/demos/thanh-diep-xanh";
import { vuonXuanDoContentDocument } from "../lib/cards/demos/vuon-xuan-do";
import { minimalismLamDamContentDocument } from "../lib/cards/demos/minimalism-lam-dam";
import { hoaMocHongContentDocument } from "../lib/cards/demos/hoa-moc-hong";
import { songPhungXanhContentDocument } from "../lib/cards/demos/song-phung-xanh";
import { lauDaiLamContentDocument } from "../lib/cards/demos/lau-dai-lam";
import { toDuyenHongContentDocument } from "../lib/cards/demos/to-duyen-hong";
import { nhatBinhDoContentDocument } from "../lib/cards/demos/nhat-binh-do";

const documents = {
  "chibi-red": chibiRedContentDocument,
  "hoa-rum-trang": hoaRumTrangContentDocument,
  "thanh-diep-xanh": thanhDiepXanhContentDocument,
  "vuon-xuan-do": vuonXuanDoContentDocument,
  "minimalism-lam-dam": minimalismLamDamContentDocument,
  "hoa-moc-hong": hoaMocHongContentDocument,
  "song-phung-xanh": songPhungXanhContentDocument,
  "lau-dai-lam": lauDaiLamContentDocument,
  "to-duyen-hong": toDuyenHongContentDocument,
  "nhat-binh-do": nhatBinhDoContentDocument,
};
const registry = { ...builtInRegistry, ...cardDefinitions };
let failed = false;
for (const [slug, document] of Object.entries(documents)) {
  const page = document.pages[0]!;
  const spec = JSON.parse(readFileSync(`lib/cards/demos/${slug}.measured.json`, "utf8"));
  const missingAssets: string[] = [];
  const visit = (node: TreeNode) => {
    for (const url of [node.props.src, node.styles.backgroundImage, ...(Array.isArray(node.props.images) ? node.props.images : [])]) {
      if (typeof url === "string" && url.startsWith("/") && !existsSync(`public${url}`)) missingAssets.push(url);
    }
    node.children.forEach(visit);
  };
  visit(page.data.root);
  const unsupportedPhoneOverrides = spec.nodes.flatMap((node: { id: string; type: string; props: Record<string, unknown>; phoneProps: Record<string, unknown> }) =>
    Object.entries(node.phoneProps).filter(([key, value]) => JSON.stringify(value) !== JSON.stringify(node.props[key]) && registry[node.type]?.fields[key]?.perDevice !== true)
      .map(([key]) => ({ id: node.id, type: node.type, key })),
  );
  const result = {
    isPageData: isPageData(page.data),
    validationIssues: validatePage(registry, page.data),
    contentOnly: document.pages.length === 1 && document.startPageId === "invitation" && page.id === "invitation" && Object.keys(page.interactions).length === 0,
    missingAssets,
    nodeCount: spec.nodes.length,
    unsupportedPhoneOverrides,
    visualStatus: "working draft; source/local comparison recorded, not approved",
    catalogStatus: "not uploaded or verified",
    snapshotStatus: "not created",
  };
  writeFileSync(`docs/references/${slug}/verification-20261116.json`, `${JSON.stringify(result, null, 2)}\n`);
  const ok = result.isPageData && result.validationIssues.length === 0 && result.contentOnly && missingAssets.length === 0;
  console.log(`${slug}: ${ok ? "PASS" : "FAIL"} structure/local assets; ${unsupportedPhoneOverrides.length} mobile property gaps`);
  if (!ok) failed = true;
}
if (failed) process.exitCode = 1;
