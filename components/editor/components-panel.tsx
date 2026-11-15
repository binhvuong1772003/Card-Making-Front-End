"use client";

import type { HostToolPanelProps } from "@miditor/editor";
import { useEffect, useState } from "react";
import { DecorationsPanel } from "./decorations-panel";
import { ElementsPanel } from "./elements-panel";

// Một tab "Thành phần" cho mọi thứ thêm được vào trang (như tab Thành phần của Canva): một ô tìm chung và hai chip.
// "Khối" là các khối chức năng (chữ cong, ảnh, lịch, biểu mẫu...); "Trang trí" là hình, họa tiết và hiệu ứng động.
// Khi đang tìm thì hiện cả hai nhóm kết quả nối nhau, không cần chọn chip.
const CHIPS = [["blocks", "Khối"], ["decorations", "Trang trí"]] as const;
type Chip = (typeof CHIPS)[number][0];

const CSS = `
.cm-comp { padding: 14px 14px 0; display: grid; gap: 10px; }
.cm-comp h2 { margin: 0; font: 700 17px/1.2 var(--font-sans, system-ui); letter-spacing: -.01em; }
.cm-comp-search { width: 100%; height: 38px; box-sizing: border-box; border: 1px solid #e4d9db; border-radius: 10px; padding: 0 12px; font: 14px/1 inherit; background: #fff; }
.cm-comp-search:focus { outline: 2px solid #7b1e2b; outline-offset: 1px; }
.cm-comp-chips { display: flex; gap: 6px; }
.cm-comp-chip { height: 30px; padding: 0 14px; border-radius: 999px; border: 1px solid #e4d9db; background: #fff; font: 600 13px/1 inherit; color: #5b4b4f; cursor: pointer; }
.cm-comp-chip[aria-pressed="true"] { background: #7b1e2b; border-color: #7b1e2b; color: #fff; }
.cm-comp-chip:focus-visible { outline: 2px solid #7b1e2b; outline-offset: 2px; }
.cm-comp-section { margin-top: 4px; }
.cm-comp-section > h3 { margin: 12px 14px 0; font: 700 12px/1 inherit; text-transform: uppercase; letter-spacing: .06em; color: #8a7b7f; }
`;

export function ComponentsPanel(props: HostToolPanelProps) {
  const [chip, setChip] = useState<Chip>("blocks");
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(input.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [input]);

  const searching = search !== "";
  return (
    <div>
      <style>{CSS}</style>
      <div className="cm-comp">
        <h2>Thành phần</h2>
        <input type="search" className="cm-comp-search" aria-label="Tìm thành phần" placeholder="Tìm chữ, ảnh, lịch, hoa, hộp quà…" value={input} onChange={(event) => setInput(event.target.value)} />
        {!searching && (
          <div className="cm-comp-chips" role="group" aria-label="Loại thành phần">
            {CHIPS.map(([value, label]) => <button key={value} type="button" className="cm-comp-chip" aria-pressed={chip === value} onClick={() => setChip(value)}>{label}</button>)}
          </div>
        )}
      </div>
      {(searching || chip === "blocks") && (
        <section className="cm-comp-section" aria-label="Khối">
          {searching && <h3>Khối</h3>}
          <ElementsPanel {...props} search={search} />
        </section>
      )}
      {(searching || chip === "decorations") && (
        <section className="cm-comp-section" aria-label="Trang trí">
          {searching && <h3>Trang trí</h3>}
          <DecorationsPanel {...props} search={search} />
        </section>
      )}
    </div>
  );
}
