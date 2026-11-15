import { groupNodes, type TreeNode } from "@miditor/core";

// Sắp lại bảng Lớp của các mẫu dựng sẵn: đặt tên cho khối (`layerName`) và gom từng đoạn của trang vào một khối Nhóm có tên.
// Khối Chữ đã hiện chính chữ của nó trong bảng Lớp nên không cần tên; các khối còn lại (Trang trí, Hình khối, Ảnh...) mang tên đọc được thay cho tên loại.
// Dữ liệu thuần, không có React: dùng ở các bộ sinh mẫu (scripts/) và ở bản dựng Hoa Mộc Xanh.

const WORDS: Record<string, string> = {
  open: "", hero: "Đầu trang", flower: "hoa", flowers: "hoa", left: "trái", right: "phải", upper: "trên", lower: "dưới", middle: "giữa", top: "trên", bottom: "dưới",
  album: "album", gift: "quà", mini: "nhỏ", sparkle: "sao", confetti: "pháo giấy", hint: "gợi ý", heading: "tiêu đề", title: "tiêu đề", name: "tên", role: "vai",
  family: "gia đình", father: "bố", mother: "mẹ", address: "địa chỉ", ceremony: "lễ cưới", party: "tiệc", venue: "địa điểm", dress: "dress code", timeline: "lịch trình",
  wishes: "sổ lưu bút", wish: "lời chúc", guestbook: "sổ lưu bút", map: "bản đồ", calendar: "lịch", footer: "chân trang", thank: "cảm ơn", you: "", brand: "thương hiệu",
  paper: "nền giấy", column: "cột", band: "dải", dot: "chấm", line: "đường", time: "giờ", label: "nhãn", date: "ngày", day: "thứ", month: "tháng", year: "năm",
  invite: "lời mời", groom: "chú rể", bride: "cô dâu", portrait: "ảnh", photo: "ảnh", rsvp: "xác nhận", button: "nút", divider: "gạch", save: "lưu", popup: "", qr: "QR",
  card: "thẻ", panel: "khung", header: "thanh đầu", bank: "ngân hàng", number: "số tài khoản", holder: "chủ tài khoản", lunar: "âm lịch", arrival: "đón khách", banquet: "khai tiệc",
  castle: "lâu đài", background: "nền", bg: "nền", texture: "họa tiết", envelope: "phong bì", front: "trước", back: "sau", info: "thông tin", plan: "lịch trình", note: "ghi chú",
  wedding: "", reception: "tiệc", couple: "cặp đôi", sunburst: "tia nắng", chu: "chữ", hy: "Hỷ", motif: "họa tiết", clone: "bản sao", ring: "vòng sáng", seal: "con dấu",
  shine: "vệt sáng", burst: "pháo", particles: "hạt", rule: "đường kẻ", orn: "hoa văn", amp: "dấu &", frame: "khung", cover: "bìa", message: "lời nhắn", item: "mục", demo: "mẫu",
  orbit: "quỹ đạo", floral: "hoa văn", decoration: "trang trí", dressing: "trang phục", bar: "dải",
};

/** Tên đọc được của một khối từ mã của nó, ví dụ "gift-mini-3" thành "Quà nhỏ 3". */
export function layerLabel(id: string): string {
  const words = id.split(/[-_]/).map((part) => (/^\d+$/.test(part) ? part : Object.hasOwn(WORDS, part) ? WORDS[part]! : part)).filter((part) => part !== "");
  const line = words.join(" ").replace(/\s+/g, " ").trim();
  return line === "" ? id : line.charAt(0).toUpperCase() + line.slice(1);
}

/** Đặt `layerName` cho mọi khối không phải Chữ chưa có tên (đi sâu vào cả khối chứa). Không đổi gì nếu khối đã có tên. */
export function nameLayers(root: TreeNode): TreeNode {
  const visit = (node: TreeNode, isRoot: boolean): TreeNode => {
    const children = node.children.map((child) => visit(child, false));
    const unnamed = !isRoot && node.type !== "Text" && node.type !== "Group" && node.type !== "Button" && node.type !== "Container" && !(typeof node.props.layerName === "string" && node.props.layerName.trim() !== "");
    const props = unnamed ? { ...node.props, layerName: layerLabel(node.id) } : node.props;
    return props === node.props && children.every((child, index) => child === node.children[index]) ? node : { ...node, props, children };
  };
  return visit(root, true);
}

export type Section = { name: string; /** mã khối thuộc đoạn này */ has: (id: string) => boolean };

/** Gom từng đoạn liền nhau của khối thuộc cùng một Section vào một Group tên đó (chỉ khi từ 3 khối trở lên); đoạn không thuộc Section nào giữ nguyên. */
export function groupSections(root: TreeNode, sections: readonly Section[], container: { w: number; h: number }): TreeNode {
  const sectionOf = (id: string) => sections.find((section) => section.has(id));
  let tree = root;
  const runs: { name: string; ids: string[] }[] = [];
  for (const child of root.children) {
    const section = sectionOf(child.id);
    const last = runs[runs.length - 1];
    if (section && last && last.name === section.name) last.ids.push(child.id);
    else runs.push({ name: section?.name ?? "", ids: section ? [child.id] : [] });
  }
  let serial = 0;
  for (const run of runs) {
    if (run.name === "" || run.ids.length < 3) continue;
    serial += 1;
    const groupId = `group-${serial}`;
    const grouped = groupNodes(tree, run.ids, groupId, container);
    if (grouped === tree) continue;
    tree = nameGroup(grouped, groupId, run.name);
  }
  return tree;
}

function nameGroup(root: TreeNode, id: string, name: string): TreeNode {
  const visit = (node: TreeNode): TreeNode => (node.id === id ? { ...node, props: { ...node.props, name } } : { ...node, children: node.children.map(visit) });
  return visit(root);
}
