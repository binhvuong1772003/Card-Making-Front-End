import { isApiError } from "@/lib/api";
import { errorMessage } from "@/lib/auth/messages";
import { isValidSlug } from "./slug";

// Quy tắc của hộp thoại xuất bản nhiều bản (bảng V), tách khỏi giao diện để test.

/** Số bản đang mở tối đa của một thiệp (khớp CMBE `MAX_LIVE_PUBLICATIONS`). */
export const MAX_VERSIONS = 5;

export const SLUG_HELP = "Đường dẫn chỉ gồm chữ thường không dấu, số và gạch nối, dài 3 đến 60 ký tự.";
export const LIMIT_TEXT = `Mỗi thiệp có tối đa ${MAX_VERSIONS} bản đang mở. Gỡ một bản để thêm bản mới.`;

/** Câu báo lỗi khi xuất bản: 409 `LIMIT` là đủ số bản, 409 còn lại là đường dẫn đã có người dùng. */
export function publishErrorMessage(err: unknown): string {
  if (isApiError(err, "CONFLICT")) {
    const reason = (err.details as { reason?: unknown } | undefined)?.reason;
    return reason === "LIMIT" ? LIMIT_TEXT : "Đường dẫn này đã có người dùng, hãy chọn tên khác.";
  }
  if (isApiError(err, "VALIDATION")) {
    const reason = (err.details as { reason?: unknown } | undefined)?.reason;
    return reason === 'DOCUMENT' ? 'Nội dung thiệp chưa hợp lệ. Kiểm tra các trang, liên kết và biểu mẫu rồi thử lại.' : SLUG_HELP;
  }
  return errorMessage(err);
}

/** Đường dẫn gõ vào có hợp lệ không: bản mới được để trống (tự đặt theo tên thiệp), bản đã có thì luôn phải có đường dẫn. */
export const slugAllowed = (value: string, existing: boolean): boolean => (existing ? isValidSlug(value) : value === "" || isValidSlug(value));

/** Còn chỗ cho một bản mới không. */
export const canAddVersion = (openCount: number): boolean => openCount < MAX_VERSIONS;

/** Tên một bản trong danh sách: tên chủ thiệp đặt, không có thì "Bản chính" cho bản đầu và "Bản 2", "Bản 3"... cho các bản sau. */
export function versionTitle(version: { label: string | null; isMain: boolean }, index: number): string {
  return version.label || (version.isMain ? "Bản chính" : `Bản ${index + 1}`);
}
