import { readFileSync, writeFileSync } from "node:fs";
import { builtInRegistry, validatePage } from "@miditor/core";
import { cardDefinitions } from "../lib/cards/blocks/definitions";
import type { CardDocument } from "../lib/cards/document";
const manifest = JSON.parse(readFileSync("docs/references/clone-handoffs/fifth-ten-manifest.json", "utf8"));
const registry = { ...builtInRegistry, ...cardDefinitions };
for (const t of manifest.templates) {
  const route = readFileSync(`app/demo/${t.slug}/page.tsx`, "utf8");
  const name = /import\s*\{\s*(\w+)\s*\}\s*from\s*["']@\/lib\/cards\/demos\//.exec(route)?.[1];
  if (!name) throw new Error(`Unrecognized route import ${t.slug}`);
  const exports = require(`../lib/cards/demos/${t.slug}`);
  const doc = exports[name] as CardDocument;
  const invitation = doc.pages.find(p => p.id === "invitation")!;
  const count = (node: typeof invitation.data.root): number => (node.type === "Countdown" ? 1 : 0) + node.children.reduce((sum, n) => sum + count(n), 0);
  const measured = JSON.parse(readFileSync(`lib/cards/demos/${t.slug}.measured.json`, "utf8"));
  const actualCountdowns = count(invitation.data.root);
  const sourceCountdowns = measured.nodes.filter((n: { type: string }) => n.type === "Countdown").length;
  const result = { routeExport: name, startPageId: doc.startPageId, pages: doc.pages.map(p => p.id), sourceCountdowns, actualCountdowns, possibleDuplicateCountdown: sourceCountdowns > 0 && actualCountdowns > sourceCountdowns, validation: doc.pages.flatMap(p => validatePage(registry, p.data).map(issue => ({ page: p.id, ...issue }))) };
  writeFileSync(`docs/references/${t.slug}/route-document-verification.json`, JSON.stringify(result, null, 2) + "\n");
  console.log(`${t.slug}: ${result.pages.length} routed pages, ${result.validation.length} schema issues, ${actualCountdowns}/${sourceCountdowns} actual/source countdowns`);
}
