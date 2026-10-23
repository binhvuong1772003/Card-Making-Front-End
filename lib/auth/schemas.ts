import { z } from 'zod';

// Khớp luật của CMBE (auth.schema.ts). Backend vẫn là nơi quyết định cuối cùng; đây chỉ để báo lỗi sớm.
const email = z.string().trim().toLowerCase().pipe(z.email('Email không hợp lệ'));

export const registerSchema = z.object({
  email,
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự').max(128, 'Mật khẩu tối đa 128 ký tự'),
  name: z.string().trim().max(100, 'Tên tối đa 100 ký tự').optional(),
});

// Đăng nhập không kiểm độ dài tối thiểu, để không lộ chính sách mật khẩu.
export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Nhập mật khẩu'),
});

export const resendSchema = z.object({ email });

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  emailVerified: z.boolean(),
  createdAt: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type User = z.infer<typeof userSchema>;
