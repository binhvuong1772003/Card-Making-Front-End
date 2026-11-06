# CMFE

Frontend CardMaking: Next.js (App Router) + TypeScript. Backend nằm ở `../CMBE` (Express 5, REST + GraphQL + WebSocket); đọc `../CMBE/.claude/CLAUDE.md` và README của nó khi cần biết API.

## Dự án là gì

CardMaking là web app để thiết kế thiệp chúc mừng và thiệp mời trực tuyến. Người dùng đặt chữ, ảnh, hình lên một canvas, tùy chỉnh màu, font, vị trí, xoay, độ mờ, animation. Thiệp xong được publish thành một trang web công khai (dạng `domain.com/thiep/abcxyz`) để chia sẻ, không phải ảnh phẳng. Nhiều người cùng sửa một thiệp theo thời gian thực, có vai trò owner/editor/viewer và link mời.

Giao diện CHƯA chốt. Hiện chỉ là giao diện cơ bản để test các tính năng (đăng nhập, v.v.). Đừng đầu tư vào thiết kế hay thư viện component cho tới khi giao diện được chốt.

## Trạng thái hiện tại

- Đã làm: giao diện test xác thực, cổng 3001, dùng mặc định của shadcn (chưa có design system, đừng chỉnh style kỹ).
  - `/register`, `/verify-email`, `/login` (kèm nút Google).
  - `/` là TRANG CHỦ MẪU, XÀI ĐỠ (`app/home.tsx`): đầu trang có đăng xuất, nút Tạo thiệp và lưới thiệp. Thay cả trang khi có thiết kế trang chủ, đừng chỉnh style kỹ.
  - `/cards/[id]` là trang soạn thiệp thật: Miditor với giao diện trắng và đỏ đô (bản vẽ F), tự lưu cả bản nháp.
  - `lib/api/` là `apiFetch` (có refresh một lần, test bằng Vitest), `lib/auth/` là hàm gọi auth, schema Zod, thông báo lỗi tiếng Việt.
- Đã cài: Tailwind v4, shadcn/ui (`button`, `input`, `label`, `card`, `alert`, `sonner`, `field`, `separator`), TanStack Query, Zod, Vitest, `sonner` cho thông báo.
- Chưa cài, chờ khi cần: Zustand, `graphql-request`, `react-hook-form`.
- Chạy: tạo `.env.local` từ `.env.example` (`NEXT_PUBLIC_API_URL`), rồi `npm run dev`. Test: `npm test`.
- Backend đã có xác thực, thiệp (tạo, đọc, đổi tiêu đề, xóa, lưu cả bản nháp qua GraphQL `saveCardDocument`). Publications, assets và collab còn trống.

## Stack đã chốt

| Việc | Chọn |
| --- | --- |
| Framework | Next.js, App Router |
| Ngôn ngữ | TypeScript strict |
| Package manager | npm |
| Style | Tailwind CSS v4 |
| Component UI | shadcn/ui (thêm từng component bằng CLI, mã nằm trong repo) |
| Gọi HTTP | `fetch` có sẵn, qua một hàm `apiFetch` tự viết. Không dùng axios |
| Dữ liệu từ server (cache) | TanStack Query, cho cả REST và GraphQL |
| Gọi GraphQL | `graphql-request` bọc trong TanStack Query. Không dùng Apollo Client |
| State phía client | Zustand |
| Validation | Zod |
| Form | Form thường + Zod + component `Field` của shadcn; thêm `react-hook-form` khi form phức tạp lên (hiện cài `@hookform/resolvers` bị xung đột peer với `effect`) |
| Lint | ESLint |
| Test | Vitest + Testing Library; Playwright cho luồng đăng nhập sau |

Không thêm gì ngoài bảng này khi chưa hỏi người dùng: không thư viện component khác (MUI, Chakra...), không monorepo, không Prettier. Chỉ thêm component shadcn khi trang đang làm cần đến.

## Quy tắc

- Xem `AGENTS.md` ở thư mục này: Next.js bản này khác kiến thức cũ, đọc docs trong `node_modules/next/dist/docs/` trước khi viết code.
- Chạy ở cổng 3001 (`npm run dev`). Cổng này khớp `CORS_ORIGINS` và `FRONTEND_URL` mặc định của backend; đổi cổng thì backend phải đổi theo.
- Dữ liệu từ server nằm ở TanStack Query; Zustand chỉ giữ state phía client (giao diện, thao tác đang làm). Không chép dữ liệu server vào Zustand.
- Mọi lời gọi API đi qua `apiFetch`, không gọi `fetch` thẳng tới backend ở nơi khác. `apiFetch` luôn đặt `credentials: 'include'` và tự ném lỗi khi `!res.ok` (fetch không tự ném).
- Không bao giờ lưu token ở `localStorage`/`sessionStorage` hay đọc cookie bằng JS: cookie `access` và `refresh` là httpOnly do backend đặt.
- Validate dữ liệu vào/ra bằng Zod; không dùng `any`.
- Import dùng alias `@/*` (đã cấu hình trong `tsconfig.json`).
- `next.config.ts` bật `cacheComponents`: đọc `searchParams`/`params`/cookie ở Server Component phải nằm trong `<Suspense>`, nếu không `next build` lỗi. Xem `app/login/page.tsx` làm mẫu.
- Mặc định component là Server Component; chỉ thêm `"use client"` khi cần state, effect hoặc sự kiện.
- Trang sau đăng nhập chạy ở client (cần cookie của người dùng, không cần SEO). Trang công khai của thiệp đã publish mới cần render phía server.

## Giao ước với backend (xác thực)

Các endpoint nằm dưới `/api/v1/auth` của CMBE (mặc định `http://localhost:3000`).

- `POST /register`, `POST /login`, `POST /verify-email`, `POST /resend-verification`, `POST /refresh`, `POST /logout`, `POST /logout-all`, `GET /me`.
- Đăng nhập thành công đặt cookie `access` (15 phút) và `refresh` (30 ngày trượt, trần 90 ngày). `apiFetch` phải gửi cookie.
- Khi API trả 401: gọi `POST /auth/refresh` đúng MỘT lần (chỉ một lần refresh tại một thời điểm, kể cả giữa các tab), rồi thử lại request gốc đúng một lần. Refresh token chỉ dùng được một lần, mỗi lần refresh trả cặp mới.
- `409 REFRESH_CONFLICT` nghĩa là tab khác vừa refresh xong: thử lại với cookie hiện có, đừng coi là đăng xuất. 401 từ `/refresh` nghĩa là phiên đã hết: chuyển về trang đăng nhập.
- `POST /login` trả `403 EMAIL_NOT_VERIFIED` khi email chưa xác minh (chỉ sau khi mật khẩu đúng). `POST /register` và `POST /resend-verification` luôn trả 202 như nhau.
- Có giới hạn tốc độ: lỗi `RATE_LIMITED` (HTTP 429). Hiển thị lỗi chung, đừng thử lại liên tục.
- Trang `/verify-email`: backend dựng link `FRONTEND_URL/verify-email?token=...`. Trang phải đọc token, gửi bằng `POST /auth/verify-email` (POST để bộ quét thư không ăn mất token), rồi xóa token khỏi URL.
- Đăng nhập Google là luồng chuyển hướng do backend giữ hết: bắt đầu bằng link thường hoặc `window.location` tới `GET /api/v1/auth/google/start[?returnTo=/path]`, KHÔNG dùng `fetch`. Callback luôn 302 về `FRONTEND_URL` + `returnTo` (mặc định `/`), hoặc `FRONTEND_URL/login?error=<mã>` với mã: `cancelled`, `invalid_state`, `google_failed`, `email_unverified`, `account_conflict`, `server_error`. Nếu Google chưa cấu hình, `start` trả 503. `returnTo` chỉ là đường dẫn tương đối.
- Backend kiểm origin với mọi request không phải GET/HEAD/OPTIONS: origin không nằm trong `CORS_ORIGINS` bị từ chối `403 FORBIDDEN`. Gọi từ `localhost:3001` là đủ.
- Mọi lỗi REST có dạng `{ "error": { "code", "message", "details"? } }`. Mã lỗi (`code`) là thứ để rẽ nhánh, không dựa vào `message`. Các mã hay gặp: `VALIDATION` (400, `details` là mảng `{ path, message }`), `UNAUTHENTICATED` (401), `EMAIL_NOT_VERIFIED` (403), `FORBIDDEN` (403), `NOT_FOUND` (404), `REFRESH_CONFLICT` (409), `RATE_LIMITED` (429), `INTERNAL` (500).
