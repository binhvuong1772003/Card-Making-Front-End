// Lý do từ chối gửi cho chủ thiệp: một lý do có sẵn, kèm ghi chú nếu có. Backend nhận tối đa 500 ký tự.
export const REJECTION_REASONS = ["Có thông tin cá nhân", "Nội dung không phù hợp", "Ảnh vi phạm bản quyền", "Khác"] as const;
export const MAX_REASON = 500;

export function rejectionReason(reason: string, note: string): string {
  const trimmed = note.trim();
  return (trimmed ? `${reason}: ${trimmed}` : reason).slice(0, MAX_REASON);
}
