// Local verification only. Does not write templates, upload assets or publish.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { builtInRegistry, isPageData, validatePage, type TreeNode } from "@miditor/core";
import { cardDefinitions } from "../lib/cards/blocks/definitions";
import { renTheuTrangContentDocument } from "../lib/cards/demos/ren-theu-trang";
import { lauDaiXanhContentDocument } from "../lib/cards/demos/lau-dai-xanh";
import { songHacDoContentDocument } from "../lib/cards/demos/song-hac-do";
import { minimalismDoContentDocument } from "../lib/cards/demos/minimalism-do";
import { longPhungXanhContentDocument } from "../lib/cards/demos/long-phung-xanh";
import { anhDaoHongContentDocument } from "../lib/cards/demos/anh-dao-hong";
import { hoangKimDoContentDocument } from "../lib/cards/demos/hoang-kim-do";
import { vuonXuanXanhContentDocument } from "../lib/cards/demos/vuon-xuan-xanh";
import { baroqueV2DoDamContentDocument } from "../lib/cards/demos/baroque-v2-do-dam";
import { songLongXanhContentDocument } from "../lib/cards/demos/song-long-xanh";

const documents = {
  "ren-theu-trang": renTheuTrangContentDocument,
  "lau-dai-xanh": lauDaiXanhContentDocument,
  "song-hac-do": songHacDoContentDocument,
  "minimalism-do": minimalismDoContentDocument,
  "long-phung-xanh": longPhungXanhContentDocument,
  "anh-dao-hong": anhDaoHongContentDocument,
  "hoang-kim-do": hoangKimDoContentDocument,
  "vuon-xuan-xanh": vuonXuanXanhContentDocument,
  "baroque-v2-do-dam": baroqueV2DoDamContentDocument,
  "song-long-xanh": songLongXanhContentDocument,
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
