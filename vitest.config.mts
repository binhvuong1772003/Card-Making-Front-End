import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Cùng bí danh `@/` với tsconfig, để file được kiểm có thể nhập như trong ứng dụng.
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts', 'components/**/*.test.ts'],
  },
});
