import { builtInRegistry, emptyPage, newNode, type FreeNode } from "@miditor/core";
import { describe, expect, it } from "vitest";
import { cardDefinitions } from "../blocks/definitions";
import { addCountdown, type CountdownSpec } from "./finish";

const registry = { ...builtInRegistry, ...cardDefinitions };
const size = { w: 900, h: 8000 };
const spec: CountdownSpec = { id: "finished", date: "2027-10-10", time: "18:00", color: "#925f44", font: "serif", align: "center", size: 18, phoneSize: 15, rect: [332, 4083, 234, 28], phone: [37, 3000, 300, 28] };
const sourceTimer = (y = 4083, date = spec.date) => {
  const node = newNode(registry, "Countdown", "measured", size, { props: { date, time: spec.time } }) as FreeNode;
  node.position = { mode: "free", x: { anchor: "start", offset: 333.1875 }, y: { anchor: "start", offset: y } };
  node.size = { w: { kind: "px", v: 233.625 }, h: { kind: "px", v: 28 } };
  return node;
};

describe("finishing a measured countdown", () => {
  it("replaces the same event at the same measured rectangle without removing other content", () => {
    const column = emptyPage().root;
    column.children = [newNode(registry, "Text", "heading", size)!, sourceTimer()];
    addCountdown(column, size, spec);
    expect(column.children.map(n => n.id)).toEqual(["heading", "finished"]);
    expect(column.children[1]!.props).toMatchObject({ date: spec.date, time: spec.time, color: spec.color, size: 18 });
    expect(column.children[1]!.phoneProps).toEqual({ size: 15 });
  });

  it("preserves a countdown for the same event elsewhere on the page", () => {
    const column = emptyPage().root;
    column.children = [sourceTimer(100)];
    addCountdown(column, size, spec);
    expect(column.children.map(n => n.id)).toEqual(["measured", "finished"]);
  });

  it("preserves another event even when its rectangle matches", () => {
    const column = emptyPage().root;
    column.children = [sourceTimer(4083, "2027-10-11")];
    addCountdown(column, size, spec);
    expect(column.children.map(n => n.id)).toEqual(["measured", "finished"]);
  });

  it("keeps a repeated finish call idempotent", () => {
    const column = emptyPage().root;
    addCountdown(column, size, spec);
    addCountdown(column, size, spec);
    expect(column.children.map(n => n.id)).toEqual(["finished"]);
  });
});
