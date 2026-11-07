// Đường dẫn công khai của thiệp: chữ thường không dấu, số, gạch nối giữa các đoạn; 3 đến 60 ký tự (khớp luật của backend).
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const isValidSlug = (value: string): boolean => value.length >= 3 && value.length <= 60 && SLUG.test(value);
