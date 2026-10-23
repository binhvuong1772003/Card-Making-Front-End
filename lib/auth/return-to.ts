// Chỉ nhận đường dẫn tương đối của chính trang này (chặn "//", "/\" và schema). Backend kiểm lại phía Google.
export function safeReturnTo(value: string | string[] | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return undefined;
  return value.length <= 200 ? value : undefined;
}
