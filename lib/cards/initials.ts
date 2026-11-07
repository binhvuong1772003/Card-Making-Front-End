// Chữ cái đầu của hai từ đầu tên thiệp, viết hoa, cho con dấu trạng thái ("Thiệp cưới Lan và Minh" -> "TC").
export function initials(title: string): string {
  const letters = title
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/^[^\p{L}\p{N}]+/u, '')) // bỏ dấu câu đứng đầu từ: "(bản" -> "bản"
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0]!.toLocaleUpperCase('vi-VN'));
  return letters.join('') || 'T';
}
