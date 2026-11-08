# CMFE

Frontend CardMaking: Next.js (App Router) + TypeScript. Backend nằm ở `../CMBE` (Express 5, REST + GraphQL + WebSocket); đọc `../CMBE/.claude/CLAUDE.md` và README của nó khi cần biết API.

## Dự án là gì

CardMaking là web app để thiết kế thiệp chúc mừng và thiệp mời trực tuyến. Người dùng đặt chữ, ảnh, hình lên một canvas, tùy chỉnh màu, font, vị trí, xoay, độ mờ, animation. Thiệp xong được publish thành một trang web công khai (dạng `domain.com/thiep/abcxyz`) để chia sẻ, không phải ảnh phẳng. Nhiều người cùng sửa một thiệp theo thời gian thực, có vai trò owner/editor/viewer và link mời.

Giao diện CHƯA chốt. Hiện chỉ là giao diện cơ bản để test các tính năng (đăng nhập, v.v.). Đừng đầu tư vào thiết kế hay thư viện component cho tới khi giao diện được chốt.

## Trạng thái hiện tại

- Đã làm: giao diện test xác thực, cổng 3001, dùng mặc định của shadcn (chưa có design system, đừng chỉnh style kỹ).
  - `/register`, `/verify-email`, `/login` (kèm nút Google).
  - `/` là trang chủ thật (bản vẽ I): chọn dịp để tạo thiệp, khám phá theo loại (3 thẻ), tiếp tục thiệp của mình, các kệ thiệp công khai. `/kham-pha/[slug]` (dam-cuoi, sinh-nhat, su-kien) là trang một loại (bản vẽ L); `/mau/[id]` xem một thiệp công khai và Dùng làm mẫu (bản vẽ J). Ảnh mẫu dựng bằng `Render` thu nhỏ (`components/gallery/page-thumb.tsx`), ảnh thiệp của mình vẫn là ô màu theo dịp. Chưa có: ô tìm trang chủ, lọc theo phong cách, trang admin.
  - `/cards` là trang quản lý thiệp thật (bản vẽ G, H): lưới và danh sách, lọc theo dịp, tìm theo tên, đổi tên, nhân bản, xoá. Dùng khung chung `components/app/app-shell.tsx`. Ảnh thu nhỏ còn là ô màu theo dịp (chưa có ảnh chụp thiệp); chưa có sắp xếp, xem trước, sao chép liên kết.
  - `/cards/[id]/responses` là trang Phản hồi (bảng U) cho owner và editor của thiệp đã xuất bản: mỗi khối `Form` một tab, thẻ tóm tắt, tìm, lọc trạng thái khi form bật sổ công khai, Ẩn/Hiện/Duyệt từng dòng, xoá có xác nhận, "Xem thêm" theo con trỏ, tải CSV bằng liên kết thẳng tới CMBE. Lối vào ở menu ⋯ của thiệp (`card-menu.tsx`) và cạnh nút Xuất bản trong editor; `VIEWER` không thấy.
  - `/thiep/[slug]` là trang công khai của thiệp đã xuất bản (dựng phía server bằng `Render`, không cần đăng nhập). Slug không có trả nội dung 404 nhưng mã HTTP là 200 (đang stream trong Suspense).
  - `/cards/[id]/preview` xem trước bản nháp đã lưu ở khổ máy tính hoặc điện thoại. Hộp thoại xuất bản nằm trong header editor (chỉ owner xuất bản; chưa có công tắc thư viện công khai).
  - `/admin` là trang admin duyệt thiệp công khai (bản vẽ M): hàng chờ, xem trước đầy đủ, Duyệt, Từ chối kèm lý do, Gỡ. Lối vào "Duyệt" ở cột trái chỉ hiện cho tài khoản có `role: ADMIN` (từ `/auth/me`). Cấp admin: `npm run grant-admin -- <email>` ở CMBE. Chỉ tải tối đa 50 mẫu mỗi hàng chờ.
  - `/cards/[id]` là trang soạn thiệp thật: Miditor với giao diện trắng và đỏ đô (bản vẽ F), tự lưu cả bản nháp. Phần của CardMaking trong editor (`card-header`, `zoom-pill`, `status-seal`) viết bằng shadcn `Button` + Tailwind, màu lấy từ lớp `.card-editor` trong `globals.css` (trắng, đỏ đô). Phần bên trong của Miditor vẫn chỉnh qua `appearance` và `editor-overrides.css`.
  - Tải ảnh (`lib/assets/upload-image.ts`) gửi kèm `transformation` do backend ký (ảnh quá lớn bị thu nhỏ khi vào kho); backend giới hạn số lần xin ký theo người dùng.
  - `lib/api/` là `apiFetch` (có refresh một lần, test bằng Vitest), `lib/auth/` là hàm gọi auth, schema Zod, thông báo lỗi tiếng Việt.
- Khối riêng của CardMaking (nhóm Album, Thiệp cưới, Lịch): Album 4 kiểu (xoay 3D, lưới, băng ngang, ảnh dán), Bản đồ (Google Maps nhúng, khung tự chỉnh, khoá `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` trong `.env.local`), Lịch 5 kiểu (tháng, trái tim, khung viền, nền đỏ đô, một tuần), và Biểu mẫu (`Form`). `Form` là MỘT loại khối mà chủ thiệp tự soạn câu hỏi: 8 kiểu ô (chữ ngắn, đoạn dài, chọn một, chọn nhiều, số, có/không, ngày, điện thoại), ô sau hiện theo đáp án của ô chọn đứng trước (`showIf`), hạn nhận, sổ lời trả lời công khai, chờ duyệt. Ba bộ câu hỏi dựng sẵn ở `lib/cards/blocks/form-presets.ts` (Xác nhận tham dự, Lời chúc, Form trống) hiện thành ba thẻ trong nhóm "Biểu mẫu" của bảng Thành phần; thẻ mẫu chỉ bấm được vì `drag.press` chỉ mang tên loại. Khối gửi thẳng API công khai của CMBE (`POST /publications/:slug/forms`, `GET /publications/:slug/forms/entries`) bằng `lib/cards/forms/` (`fields.ts` giữ luật ô và kiểm câu trả lời như backend, `submit.ts` gửi/tải, `api.ts` đọc lỗi, `legacy.ts` đổi thiệp cũ), chỉ chạy khi trang công khai truyền `metadata={{ mode: "live", slug }}` — nơi khác thấy form khoá để xem, không gọi mạng. Thiệp lưu từ trước còn `Rsvp`/`Guestbook` được `upgradePageDocument` nâng cấp ngay khi đọc (`cardsApi.get` cho editor và xem trước, `fetchPublicPage` cho trang công khai). Định nghĩa là dữ liệu thuần ở `lib/cards/blocks/{album,map,calendar,form}.ts`, gom ở `definitions.ts`; cách vẽ ở `components/blocks/` (`form-view.tsx` cho `Form`, theo `mode`); đăng ký ở `lib/cards/blocks/index.tsx` (`cardComponents`, `cardRenderers`, `EDIT_METADATA`, `STATIC_METADATA`). **Đổi định nghĩa thì chạy `npm run blocks:export`** (ghi `CMBE/src/modules/cards/components.json` cho backend kiểm trang) rồi commit cả hai repo; `definitions.test.ts` đỏ khi file đó cũ. Mọi `<Render>` phải truyền `renderers={cardRenderers}`; trong editor `metadata={EDIT_METADATA}` làm khối đứng yên, ảnh thu nhỏ dùng `STATIC_METADATA`. Ô nhập riêng ở `components/editor/` (`image-list-input.tsx`, `date-input.tsx`, `form-fields-input.tsx`; tên kiểu chỉ nhận chữ thường và gạch nối). Công cụ "Thành phần" trên thanh trái (`components/editor/elements-panel.tsx`, đăng ký ở `config.tools`) hiện các loại khối của `cardDefinitions` thành thẻ có hình xem trước thật (chính khối đó vẽ ở chế độ static rồi thu nhỏ), mỗi nhóm vài kiểu đầu kèm "Xem tất cả", bấm là thêm vào trang bằng `editor.addBlock`, kéo ra canvas là thả ở đúng chỗ (dùng `drag.press`/`drag.wasDragged` mà Miditor đưa vào `HostToolPanelProps`, nhánh `feat/host-tool-drag`); thêm kiểu mới vào `cardDefinitions` là có thẻ; riêng nhóm "Biểu mẫu" lấy ba thẻ từ `formPresets` (cùng một loại `Form`), hiện đủ ba và chỉ bấm được. Tên "Mẫu" để dành cho mẫu cả tấm thiệp. Phông cho thiệp ở `lib/cards/fonts.ts` (15 họ chữ có dấu tiếng Việt, tải bằng liên kết Google Fonts ở `app/layout.tsx`). Khối KHÔNG có nền, viền, bo góc, bóng, nghiêng riêng: dùng nhóm Nền, Viền, Hiệu ứng có sẵn của Miditor cho mọi khối; kiểu nào cần nền hay viền sẵn thì mang `defaultStyles` trong định nghĩa (tính năng Miditor thêm ở nhánh `feat/default-styles`, gói đã đóng lại ở `~/miditor-packs`); hình xem trước ở bảng Thành phần đổi nó sang CSS bằng `lib/cards/blocks/node-style.ts`. Thuộc tính đã bỏ của một khối ghi vào `RETIRED_*_PROPS` (trong `calendar.ts`, `map.ts`, gom ở `definitions.ts`) để CMBE bỏ chúng khỏi thiệp đã lưu (`retired-props.json` do `blocks:export` sinh). Lưu ý Miditor: nhãn lựa chọn hiện nguyên chữ (dùng chữ tiếng Việt làm giá trị), đúng ba lựa chọn mới thành hàng nút, nhãn ô số phải ngắn (khoảng 6 chữ) kẻo mất giá trị, ô "custom" chưa chiếm cả hàng nên có dòng CSS `:has` ép nó.
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
