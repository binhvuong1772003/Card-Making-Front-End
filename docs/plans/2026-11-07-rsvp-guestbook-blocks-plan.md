# Plan: khối Xác nhận tham dự (Rsvp) và Sổ lưu bút (Guestbook)

Bước 2 của việc "form cho khách". Bước 1 (backend `CMBE/src/modules/cards/responses`) đã xong, đã commit, đã có trên Atlas. Bước 3 (trang "Phản hồi" cho chủ thiệp) KHÔNG nằm trong plan này.

## Mục tiêu

Thêm hai loại khối vào editor và trang công khai `/thiep/[slug]`:

- `Rsvp`: khách điền họ tên, chọn Có / Không đến / Chưa chắc, tuỳ chọn số khách, điện thoại, lời nhắn. Gửi xong form đổi thành lời cảm ơn ngay trên thiệp.
- `Guestbook`: form gửi lời chúc + danh sách lời chúc đã hiện, có nút "Xem thêm".

Không làm: trang chủ thiệp xem phản hồi, tải CSV, thông báo cho chủ thiệp, Captcha.

## Đọc trước khi viết code

1. `CMFE/AGENTS.md`: Next.js ở đây khác bản bạn biết, đọc `node_modules/next/dist/docs/` khi đụng tới API của Next.
2. Mẫu để bắt chước: khối Bản đồ. `lib/cards/blocks/map.ts` (định nghĩa thuần, không React), `map.test.ts`, `components/blocks/map-view.tsx` (view), phần `renderMap` trong `lib/cards/blocks/index.tsx`, `lib/cards/blocks/definitions.ts`.
3. Hợp đồng với backend: `CMBE/src/modules/cards/responses/responses.config.ts` (tên loại khối và thuộc tính), `responses.schema.ts` (giới hạn đầu vào), `responses.routes.ts`, `responses.service.ts` (hình dạng phản hồi và lỗi), `CMBE/src/http/error-handler.ts` (hình dạng JSON lỗi).
4. Thiết kế đã duyệt: bảng P (form xác nhận) và Q (sổ lưu bút) trong artifact thiết kế https://claude.ai/artifact/1G5j6ijo1mV4gfzkzbGous (file `project/P.dc.html`, `Q.dc.html`). Nếu không mở được, làm theo mô tả ở mục "Giao diện" bên dưới.
5. `docs/plans/2026-11-07-library-gallery-plan.md` để biết giọng và cách làm của các plan trước.

## Quy tắc của dự án (bắt buộc)

- Comment trong code viết bằng tiếng Việt, ngắn, nói VÌ SAO chứ không nói cái gì. Chữ trên giao diện là tiếng Việt.
- Commit nhỏ, mỗi commit một thay đổi có nghĩa. Thông điệp ngắn, tiếng Anh, thể mệnh lệnh, kiểu `feat:`, `fix:`, `test:`. KHÔNG nhắc AI, KHÔNG có `Co-Authored-By`, KHÔNG có dòng "Generated with". KHÔNG push, KHÔNG force-push.
- Không sửa `CMBE`. Nếu thấy backend thiếu gì, dừng lại và báo, đừng tự đổi.
- Không sửa `components.json` của CMBE bằng tay: chạy `npm run blocks:export` ở CMFE.
- Không thêm thư viện mới.
- Định nghĩa khối là dữ liệu thuần (không import React) vì CMBE dùng bản sinh ra từ đó.

## Hợp đồng (không được đổi tên)

Tên loại khối và thuộc tính phải KHỚP `responses.config.ts`, backend đọc chúng từ bản đã xuất bản.

`Rsvp`

| prop | kiểu | mặc định | ghi chú |
|---|---|---|---|
| `heading` | text ≤ 80 | `Bạn sẽ đến chứ?` | |
| `intro` | text ≤ 300, nhiều dòng | `Cô dâu chú rể rất mong có bạn.` | để trống thì ẩn |
| `button` | text ≤ 40 | `Gửi xác nhận` | |
| `deadline` | `"YYYY-MM-DD"` hoặc `""` | `""` | backend đóng form sau hết ngày này (giờ Việt Nam); view cũng phải hiện "đã đóng" |
| `maxGuests` | số 1–20 | 4 | số khách tối đa mỗi lần gửi |
| `askGuests` | boolean | true | hỏi số khách |
| `askNote` | boolean | true | hỏi lời nhắn |
| `askPhone` | boolean | false | hỏi số điện thoại |
| `askMaybe` | boolean | true | có lựa chọn "Chưa chắc" |
| `color` | color | `#511419` | màu chữ và nút |
| `padding` | số 0–40 | 16 | |

`Guestbook`

| prop | kiểu | mặc định | ghi chú |
|---|---|---|---|
| `heading` | text ≤ 80 | `Sổ lưu bút` | |
| `intro` | text ≤ 300 | `Gửi vài dòng chúc mừng. Lời chúc hiện công khai trên thiệp cho mọi người cùng đọc.` | |
| `button` | text ≤ 40 | `Gửi lời chúc` | |
| `moderation` | boolean | false | bật thì lời chúc chờ chủ thiệp duyệt mới hiện |
| `pageSize` | số 3–20 | 5 | số lời chúc mỗi lần tải |
| `color` | color | `#511419` | |
| `padding` | số 0–40 | 16 | |

Cả hai: `category: "Thiệp cưới"`, `canContain: false`, `size` khoảng `{ w: 380, h: 560 }` (Rsvp) và `{ w: 380, h: 640 }` (Guestbook), `defaultStyles` như `Map` (viền mảnh `#511419`). Nhóm trường trong bảng thuộc tính: "Nội dung", "Câu hỏi", "Hạn và giới hạn" (Rsvp); "Nội dung", "Duyệt" (Guestbook), và "Giao diện" cho màu và đệm. Nhớ các quirk của bảng thuộc tính: nhãn select hiện nguyên chữ, đúng 3 lựa chọn thì ra hàng nút, ≥4 thì dropdown hẹp, nhãn ô số ≤ ~6 ký tự, ô `date-input` có sẵn ở `components/editor/date-input.tsx` (xem cách `calendar.ts` dùng nó cho trường `date`; dùng lại cho `deadline`).

API công khai (gọi từ TRÌNH DUYỆT tới `API_URL` trong `lib/api/config.ts`, JSON, không cookie):

- `POST {API_URL}/api/v1/publications/:slug/rsvps` body `{ blockId, name, attending: "YES"|"NO"|"MAYBE", guests?, phone?, note?, website? }` → 201 `{ id }`.
- `POST .../:slug/guestbook` body `{ blockId, name, message, website? }` → 201 `{ id, status, entry }`; `status` là `VISIBLE` (hiện ngay, `entry` có dữ liệu để chèn lên đầu danh sách) hoặc `PENDING` (chờ duyệt, `entry` là `null`).
- `GET .../:slug/guestbook?blockId=&first=&after=` → `{ entries: [{ id, name, message, createdAt }], nextCursor, total }`.
- `website` là ô ẩn chống thư rác: LUÔN gửi chuỗi rỗng từ form thật; ô input tương ứng ẩn khỏi người dùng (`position:absolute; left:-9999px; tabindex=-1; aria-hidden; autocomplete=off`), KHÔNG dùng `display:none` (máy điền tự động bỏ qua).
- Giới hạn đầu vào: tên Rsvp 1–100, tên lưu bút 1–60, lời chúc 1–500, lời nhắn 1–500, điện thoại 6–20 ký tự `0-9 + ( ) . - khoảng trắng`, số khách 1–100 (cũng không vượt `maxGuests` của khối). Kiểm ở client để báo lỗi sớm, nhưng backend mới là chỗ quyết định.
- Lỗi: 429 (gửi quá nhiều), 409 với `reason` là `CLOSED` hoặc `FULL`, 400 (đầu vào sai), 404 (thiệp đã gỡ hoặc khối không còn trong bản xuất bản). Đọc `error-handler.ts` để biết JSON lỗi trông thế nào, rồi map ra câu tiếng Việt thân thiện (xem "Trạng thái").

## Làm thế nào để view biết `slug` và `blockId`

- `blockId`: cần id của nút (node) trong cây trang. Kiểm `Renderer` của `@miditor/render` xem có đưa `node.id` vào tham số không (đọc `node_modules/@miditor/render` kiểu `Renderer`). Nếu không có, DỪNG và báo: có thể phải sửa Miditor (repo `MiDito`), đó là quyết định của chủ dự án.
- `slug`: truyền qua `metadata` của `<Render>`: ở `app/thiep/[slug]/page.tsx` đặt `metadata={{ mode: "live", slug }}`. Sửa `modeOf` ở `lib/cards/blocks/index.tsx` giữ nguyên, thêm hàm `slugOf(metadata)`.
- Không có `slug` (editor, xem thử trong editor, trang `/mau/[id]`, `/kham-pha/[slug]`, ảnh thu nhỏ `static`): view vẽ form ở dạng xem thử, các ô và nút bị khoá (disabled), KHÔNG gọi mạng. Trong editor thêm dòng nhỏ "Khách sẽ điền form này trên thiệp đã xuất bản." Lưu bút ở chế độ xem thử hiện 2–3 lời chúc mẫu cố định (gán nhãn "Ví dụ" bằng `aria-label` hoặc chữ nhỏ), không gọi `GET`.

## Giao diện (từ bảng P và Q)

Màu theo thiệp: dùng prop `color` cho chữ, nút, viền ô nhập (độ trong suốt như `Map`: `${color}73`), nền trong suốt để thấy nền thiệp. Font kế thừa từ thiệp. Mọi kiểu viết inline như `map-view.tsx` (Render đặt lại kiểu). Mục tiêu chạm tối thiểu 44px chiều cao cho ô nhập và nút.

Rsvp, theo thứ tự:
1. `heading` (chữ hoa nhỏ giãn chữ như Map), `intro`.
2. Ô "Tên của bạn" (bắt buộc, có dấu `*` và nhãn thật, không chỉ placeholder).
3. "Bạn sẽ đến chứ?" ba (hoặc hai nếu tắt `askMaybe`) nút chọn dạng radio: Có, tôi sẽ đến / Rất tiếc, không đến được / Chưa chắc. Đúng một lựa chọn, bắt buộc.
4. Hiện dần theo đáp án: chọn "Có" thì hiện "Số khách" (nếu `askGuests`, bộ chọn số 1…`maxGuests`, gồm cả người điền) và "Số điện thoại" (nếu `askPhone`) và "Lời nhắn" (nếu `askNote`); chọn "Chưa chắc" chỉ hiện lời nhắn và điện thoại; chọn "Không" chỉ hiện lời nhắn. `guests` chỉ gửi khi đáp án là YES và `askGuests` bật.
5. Nút gửi (chữ `button`), dòng nhỏ riêng tư: "Tên và lời nhắn chỉ chủ thiệp xem được."
6. Đã gửi: thay cả form bằng lời cảm ơn theo đáp án ("Cảm ơn bạn, hẹn gặp bạn!" / "Cảm ơn bạn đã báo, rất tiếc không có bạn." / "Cảm ơn bạn, nếu chắc chắn hơn bạn cứ gửi lại.") và nút chữ "Gửi thêm một xác nhận" mở lại form trống. Ghi nhớ trong `localStorage` (khoá theo `slug:blockId`, bọc try/catch) rằng đã gửi để lần sau mở thiệp vẫn thấy lời cảm ơn; mỗi lần gửi vẫn là một dòng mới ở backend.
7. Quá hạn (`deadline` đã qua theo giờ Việt Nam, tính bằng cùng công thức `isClosed` của backend: hết 23:59:59.999 UTC+7): hiện "Đã hết hạn xác nhận" thay form, không có nút.

Guestbook, theo thứ tự:
1. `heading`, `intro`.
2. Form: "Tên của bạn" (1–60), "Lời chúc" (textarea 1–500, đếm ký tự khi gần giới hạn), nút gửi.
3. Danh sách lời chúc, mới nhất trước: tên đậm, ngày giờ nhỏ (định dạng `dd/MM HH:mm`, theo giờ trình duyệt), nội dung xuống dòng giữ nguyên (`white-space: pre-wrap`, KHÔNG dùng `dangerouslySetInnerHTML`). Nút "Xem thêm" khi `nextCursor` khác null, tải trang kế tiếp và nối vào cuối. Trống: "Hãy là người đầu tiên gửi lời chúc."
4. Gửi xong: nếu `status` là `VISIBLE` chèn `entry` lên đầu danh sách ngay và hiện "Cảm ơn bạn. Lời chúc đã hiện trong sổ."; nếu `PENDING` hiện "Cảm ơn bạn. Lời chúc sẽ hiện sau khi chủ thiệp duyệt." và không chèn gì. Xoá ô lời chúc, giữ tên.

Trạng thái chung cho cả hai: đang gửi (nút mờ, chữ "Đang gửi…", chặn gửi lần hai), lỗi mạng ("Chưa gửi được, kiểm tra mạng rồi thử lại." giữ nguyên chữ đã gõ), 429 ("Bạn gửi hơi nhanh, thử lại sau ít phút." giữ nguyên chữ), 409 `FULL` ("Thiệp này đã nhận đủ phản hồi."), 409 `CLOSED` ("Đã hết hạn xác nhận."), 400 (hiện lỗi cạnh ô liên quan nếu map được, nếu không thì câu chung). Lỗi hiện gần ô liên quan và liên kết bằng `aria-describedby`; thông báo thành công/lỗi trong vùng `role="status"` hoặc `role="alert"`. Mọi ô có `<label>` thật, `autocomplete` đúng (`name`, `tel`), `inputmode`/`type="tel"` cho điện thoại, thứ tự Tab theo thứ tự nhìn, focus thấy rõ, tôn trọng `prefers-reduced-motion`.

## Các bước (mỗi bước một commit, chạy `npm test` và `npx tsc --noEmit` trước mỗi commit)

1. **Định nghĩa và test.** Tạo `lib/cards/blocks/rsvp.ts` và `guestbook.ts` (dữ liệu thuần), thêm vào `definitions.ts` (`Rsvp`, `Guestbook` sau `Map`). Test theo mẫu `map.test.ts`: định nghĩa qua `validateRegistry`, trang mặc định hợp lệ, số ngoài khoảng bị từ chối, và một test "hợp đồng" kiểm các prop mà backend đọc (`deadline`, `maxGuests`, `askGuests`, `askNote`, `askPhone`, `askMaybe`, `moderation`) có trong `defaultProps` và `fields` với đúng kiểu, để đổi tên bên nào cũng làm test đỏ. Commit: `feat: add Rsvp and Guestbook block definitions`.
2. **Sinh dữ liệu cho backend.** `npm run blocks:export` (ghi `CMBE/src/modules/cards/components.json`). Chạy test CMFE (`definitions.test.ts` phải xanh) và test CMBE (`cd ../CMBE && npx vitest run`, chạy một lần, chờ nó kết thúc, dùng thư mục CMBE làm cwd). Commit hai bên riêng: CMFE (nếu có thay đổi) và CMBE `chore: regenerate custom block definitions`. Nhớ CMBE là repo git riêng.
3. **Phần tính thuần của form** (không React) trong `lib/cards/forms/`: kiểm đầu vào (`validateRsvp`, `validateGuestbook`) giống `responses.schema.ts`, `isClosed(deadline, now)` giống backend, hàm map lỗi API → câu tiếng Việt, client gọi API (`submitRsvp`, `submitGuestbook`, `fetchGuestbook` nhận `fetch` tiêm vào để test). Test đầy đủ, gồm biên của hạn (23:59:59.999 UTC+7), điện thoại sai, 429/409/400, lỗi mạng. Commit: `feat: add guest form client and validation`.
4. **View Rsvp** `components/blocks/rsvp-view.tsx` + renderer trong `index.tsx` (`Rsvp: renderRsvp`). Có `mode` như Map; có `slug`/`blockId` từ bước "Làm thế nào…". Commit: `feat: render the Rsvp block`.
5. **View Guestbook** `components/blocks/guestbook-view.tsx` + renderer. Commit: `feat: render the Guestbook block`.
6. **Nối slug vào trang công khai.** `app/thiep/[slug]/page.tsx` truyền `metadata={{ mode: "live", slug }}`. Xác nhận `/mau/[id]`, `/kham-pha/[slug]` và xem thử trong editor KHÔNG truyền slug (form khoá). Commit: `feat: pass the slug to guest form blocks`.
7. **Bảng "Thành phần".** `elements-panel.tsx` tự có thẻ nhóm "Thiệp cưới" mới vì lấy từ `cardDefinitions`; chỉ cần thêm dữ liệu mẫu trong `sampleProps` nếu thẻ xem trước trống (Guestbook cần vài lời chúc mẫu vì ở `static` view không gọi mạng). Kiểm bằng mắt. Commit: `feat: show form blocks in the elements panel`.
8. **Kiểm cả luồng** (xem dưới), sửa lỗi, rồi cập nhật tài liệu: mô tả ngắn hai khối trong `CMFE` README hoặc nơi các khối khác đang được mô tả (xem `rg "Calendar" --glob '*.md'`).

## Kiểm cả luồng (bắt buộc, báo kết quả thật)

Chạy CMBE (`npm run dev` ở CMBE, cổng 3000) và CMFE (`npm run dev`, cổng 3001); dùng `preview_start` hoặc trình duyệt của bạn.
1. Mở thiệp trong editor, thêm khối Xác nhận tham dự và Sổ lưu bút từ bảng Thành phần, đổi vài thuộc tính (tắt "Chưa chắc", đặt hạn, bật "Duyệt trước"), xuất bản.
2. Mở `/thiep/<slug>`, gửi một xác nhận Có kèm số khách và lời nhắn, rồi một lời chúc. Xác nhận: form đổi thành lời cảm ơn; lời chúc hiện ngay (hoặc báo chờ duyệt nếu bật); tải lại trang vẫn thấy lời chúc; gửi nhanh liên tiếp thì bị báo chậm lại; dữ liệu có trong MongoDB (hỏi qua GraphQL `rsvps` / `guestbookEntries` bằng tài khoản chủ thiệp, hoặc `prisma studio`).
3. Đặt hạn là hôm qua, xuất bản lại: form báo đã hết hạn.
4. Màn hình hẹp 375px: không cuộn ngang, nút ≥44px, bàn phím mở không che ô đang gõ.
5. Console không lỗi, không cảnh báo hydration.

## Chưa xong thì đừng báo xong

Cuối cùng liệt kê: các commit đã tạo, kết quả `npm test` (CMFE) và `npx vitest run` (CMBE), `npx tsc --noEmit` hai bên, những gì CHƯA kiểm được và vì sao. Nếu gặp điều plan không nói rõ, dừng và hỏi thay vì đoán.
