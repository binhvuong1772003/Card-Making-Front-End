// Chạy SAU các bộ sinh mẫu (make-*.ts): đặt tên khối và gom từng đoạn của trang vào khối Nhóm có tên để bảng Lớp gọn. Chạy lại nhiều lần vẫn cho cùng kết quả.
// Gom nhóm bỏ số đo điện thoại của các khối trong nhóm (Miditor gom bằng groupNodes); các mẫu này không có số đo điện thoại riêng nên không mất gì.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { TreeNode } from "@miditor/core";
import { groupSections, nameLayers, type Section } from "../lib/cards/layers";

const pub = resolve(__dirname, "../public/demo");
// Hộp quà chính của Song Hỷ Đỏ và Minimalism mang mã "wedding-gift": tính vào đoạn quà.
const first = (id: string) => (id === "wedding-gift" ? "gift" : id.split("-")[0]!);
const bySection = (map: Record<string, string>, skip: readonly string[] = []): Section[] =>
  [...new Set(Object.values(map))].map((name) => ({ name, has: (id) => !skip.includes(first(id)) && map[first(id)] === name }));

const INVITATION: Record<string, string> = {
  hero: "Đầu trang", family: "Thông tin gia đình", groom: "Thông tin gia đình", bride: "Thông tin gia đình", couple: "Thông tin gia đình", info: "Thông tin lễ cưới",
  ceremony: "Lễ cưới", reception: "Tiệc cưới", banquet: "Tiệc cưới", party: "Tiệc cưới", calendar: "Lịch", venue: "Địa điểm", dress: "Dress code",
  timeline: "Lịch trình", plan: "Lịch trình", guestbook: "Sổ lưu bút", wish: "Sổ lưu bút", gift: "Hộp quà mừng", note: "Ghi chú",
};

type Page = { id: string; data: { root: TreeNode; minHeight?: number } };

function tidyPage(page: Page, sections: Section[]): void {
  let root = nameLayers(page.data.root);
  if (sections.length) {
    const height = Number(root.styles?.minHeight ?? 6000);
    root = groupSections(root, sections, { w: 960, h: height });
  }
  page.data.root = root;
}

const edit = <T>(file: string, apply: (json: T) => void) => {
  const path = resolve(pub, file);
  const json = JSON.parse(readFileSync(path, "utf8")) as T;
  apply(json);
  writeFileSync(path, JSON.stringify(json));
  console.log("sắp lớp", file);
};

for (const key of ["xanh", "do", "mdd", "hmx", "mbn", "shv2", "tdd", "mnd", "tdx", "ctv", "mgr", "lh2x", "mlt", "lp2d", "spd", "lp3d", "lpd", "sld", "vkh", "vkx", "adh", "bvd", "shd", "hkd", "ldx", "mdo", "rtt", "vxx", "lpx", "slx", "bll"]) edit<Page>(`song-hy/cover-${key}.json`, (cover) => tidyPage(cover, [
  { name: "Chữ trên thẻ", has: (id) => ["open-name1", "open-amp", "open-name2", "open-rule-left", "open-orn", "open-rule-right", "open-date", "open-invite"].includes(id) },
  { name: "Nút Mở thiệp", has: (id) => ["open-button", "open-button-shine", "open-label"].includes(id) },
  { name: "Con dấu", has: (id) => ["open-ring", "open-seal"].includes(id) },
]));
edit<Record<string, Page>>("song-hy-xanh/pages-xanh.json", (pages) => { tidyPage(pages.invitation!, bySection(INVITATION)); for (const key of ["rsvp", "giftDetails"]) tidyPage(pages[key]!, []); });
edit<Record<string, Page>>("song-hy/pages-do.json", (pages) => { tidyPage(pages.invitation!, bySection(INVITATION)); for (const key of ["rsvp", "giftDetails"]) tidyPage(pages[key]!, []); });
// Minimalism: các khối gift-*, footer-* và bg-* được CSS "sổ lưu bút tự co" đặt theo toạ độ trang (form-view.tsx), nên giữ ở ngoài nhóm.
edit<Record<string, Page>>("minimalism-do-dam/pages-mdd.json", (pages) => { tidyPage(pages.invitation!, bySection(INVITATION, ["gift", "footer", "bg"])); for (const key of ["rsvp", "giftDetails"]) tidyPage(pages[key]!, []); });
edit<Page>("hoa-moc-xanh/gift-details.json", (page) => tidyPage(page, []));
