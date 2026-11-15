# Quy trình clone thiệp trong CardMaking

Đúc kết từ quá trình dựng **Minimalism Đỏ Đậm** và **Song Hỷ Xanh**, tổng hợp ngày 14/11/2026. Đây là hướng dẫn chung cho các mẫu sau; XPath, markup và số đo riêng nằm trong hồ sơ từng mẫu:

- [Minimalism Đỏ Đậm: kinh nghiệm và nguồn đối chiếu](minimalism-do-dam-elements.md).
- [Song Hỷ Xanh: XPath và element đã ghi nhận](song-hy-xanh-elements.md).

Tài liệu mô tả cách làm và tiêu chí hoàn thành. Các đoạn code hiện có chỉ là bằng chứng về bản dựng hiện tại, không tự chứng minh rằng mọi chi tiết đã giống nguồn hoặc đã có thao tác tương ứng trong editor.

## 1. Chốt cấu trúc trang và trạng thái trước khi dựng

Lập sơ đồ từ trang nguồn: bìa ban đầu → thao tác mở → nội dung thiệp; RSVP và quà mừng có thể mở trang popup. Ghi lại từng trạng thái đứng yên, hover, đang mở và sau khi mở.

- Bìa mở đầu là một trang riêng trong cùng tài liệu thiệp và cùng route. Phong bì hoặc ảnh lớn đầu trang nội dung không mặc nhiên là bìa mở đầu.
- Ghi đúng phần được bấm, trang đích, hiệu ứng và thời lượng. Kiểm tra thao tác trong popup xem mẫu có làm cuộn trang chủ hoặc đổi URL ngoài ý muốn hay không.
- Liệt kê đầy đủ section trước khi dựng: hero, gia đình, lễ cưới, album, tiệc, lịch, địa điểm, dress code, lịch trình, lời chúc và quà mừng.

Sai cấu trúc trang phải sửa trước; chỉnh hoa, màu và font không giải quyết được việc đặt bìa chung với trang nội dung.

## 2. Đọc element làm thông số gốc

Ưu tiên DOM và computed styles; dùng ảnh để đối chiếu kết quả. Không đoán asset, màu hoặc hiệu ứng khi trang đang cung cấp trực tiếp những thông tin đó.

Mỗi section cần một bản ghi gồm:

| Nhóm | Thông tin phải ghi |
| --- | --- |
| Nhận diện | URL, trang/section, XPath người dùng chỉ, selector theo thuộc tính hoặc asset để tìm lại, parent chứa element |
| Hình học | Bounding box, hệ tọa độ của parent, chiều rộng cột, padding, gap, anchor, transform-origin |
| Hiển thị | Màu nền, gradient, opacity từng lớp và parent, border, radius, shadow/filter, clip-path, overflow, z-index |
| Ảnh | `src`/`currentSrc`, background-image hoặc mask-image, kích thước tự nhiên, vùng trong suốt, fit và position |
| Chữ | Font thực sự render, file font được tải, size, weight, line-height, letter-spacing, màu và xuống dòng |
| Chuyển động | Animation name, keyframes, duration, delay, easing, repeat, transform và trạng thái bắt đầu/kết thúc |
| Responsive | Số đo desktop/mobile, breakpoint của CSS nguồn, thay đổi crop, vị trí và kích thước |

Absolute XPath là điểm bắt đầu, có thể lệch khi website thêm wrapper. Xác nhận element đang trỏ vào đúng vai trò rồi lưu thêm markup và URL asset. Phân biệt rõ số đo **đọc từ nguồn**, số đo **đang dùng local**, và phần **chưa đo**; không biến một giá trị gần đúng thành thông số nguồn.

Trước khi đo, thống nhất viewport, zoom và vị trí cuộn; đợi ảnh/font tải xong. Khi so desktop/mobile, ghi riêng từng bộ số đo. Không thu nhỏ toàn trang rồi kết luận chữ hoặc hoa có cùng kích thước.

## 3. Lấy đúng asset, giữ đúng chất liệu

- Dùng ảnh hoa, texture giấy, biểu tượng và phong bì từ element đã xác định. Chữ Hỷ trong font và asset chữ Hỷ là hai hình khác nhau; không thay thế lẫn nhau chỉ vì cùng nghĩa.
- Giữ PNG/WebP có alpha cho artwork; giữ SVG nếu nguồn thật sự là vector. Bọc WebP trong SVG chỉ tạo vỏ chứa ảnh: không tăng chi tiết, không biến thành vector và không tự tạo khả năng đổi màu.
- Với hình đơn sắc, ưu tiên asset hỗ trợ mask/tint qua giao diện. Ghi riêng màu gốc của file với màu đang được CSS mask tô lên.
- Nếu nền nguồn đã là một ảnh giấy có sẵn hoa/bóng, có thể dùng nguyên nền đó và giữ chữ/form ở lớp riêng. Không tự ghép texture khác khi người dùng muốn giữ nguyên nền. Ghi rõ hoa/bóng đã nằm trong ảnh nên không thể chỉnh riêng chúng.
- Kiểm tra kích thước ảnh tự nhiên và vùng trong suốt: cùng kích thước khung không đảm bảo phần hoa nhìn thấy lớn bằng nhau. So cả vùng artwork thực tế, rotation, flip, crop và opacity.
- Nếu tải trực tiếp bị 403, lấy từ asset trình duyệt đã tải hoặc ảnh gốc người dùng cung cấp nếu có. Ghi nguồn thay thế và phần chưa xác minh; không vẽ lại rồi gọi là asset gốc.

Kho dùng chung: **Cloudinary lưu file**, **MongoDB lưu bản ghi catalog** gồm định danh, URL/publicId, tên, nhóm, tags, kích thước, trạng thái và khả năng đổi màu nếu hệ thống hỗ trợ. Có file trong `public/demo/...` hoặc trong script seed chưa chứng minh asset đã nằm trong catalog đang chạy.

## 4. Dựng bằng các phần người dùng có thể thao tác

Trước khi ghép, map từng element nguồn sang loại khối và ghi đường thao tác trong editor:

| Element nguồn | Cách thể hiện trong CardMaking | Người dùng cần làm được |
| --- | --- | --- |
| Tên, ngày, tiêu đề, chữ cong | Text hoặc công cụ hiệu ứng chữ hiện có | Sửa chữ, chọn font, cỡ, màu và hiệu ứng |
| Panel, nền màu, đường kẻ, chấm màu | Shape/panel hoặc preset có thuộc tính chỉnh được | Đổi màu, kích thước, bo góc, bóng và thứ tự lớp |
| Ảnh của người dùng, ảnh trong album/khung | Image, PhotoFrame, Album | Thay từng ảnh, crop và chỉnh khung |
| Hoa, biểu tượng, texture, phong bì trang trí | Decoration từ catalog | Thêm, di chuyển, xoay, opacity; bật/tắt chuyển động; đổi màu với asset hỗ trợ |
| Lịch, bản đồ, biểu mẫu | Thành phần tương tác sẵn có | Sửa ngày, địa chỉ, câu hỏi và nội dung; dùng được khi xuất bản. Form cần điều khiển riêng cho màu nút, màu chữ input và màu viền input khi nguồn dùng màu khác nhau |
| Nút mở thiệp/quà mừng | Phần hiển thị + hành động chuyển trang/mở popup | Chọn trang đích và hiệu ứng bằng giao diện |

Artwork trang trí có thể là một entity cố định. Nhưng chữ, hình tròn nền, artwork và bóng cần tách thành các khối hoặc preset có thuộc tính tương ứng nếu người dùng phải chỉnh riêng chúng. Không gộp cả form, chữ, nền và hoa thành một ảnh.

Nếu người dùng yêu cầu dựng bằng thao tác trong CardMaking, thực hiện việc ghép thiệp qua editor. Script có thể hỗ trợ chuẩn bị tài nguyên hoặc bản nháp khi được cho phép; JSON sinh bằng code không phải bằng chứng người dùng có thể làm lại.

Muốn tuyên bố “tự làm lại được”, phải thử từ trang trắng bằng thao tác người dùng: tìm asset trong catalog, thêm các khối, chỉnh thuộc tính, gắn hiệu ứng và hành động, lưu rồi mở lại. “Dùng mẫu này” chỉ chứng minh khả năng sao chép mẫu sẵn có.

Nếu thiếu một điều khiển, ghi cụ thể phần thiếu. CSS theo slug/node ID, animation nhúng cứng trong SVG, hoặc nội dung chỉ tồn tại ở route demo đều phải được ghi nhận là giới hạn, không coi là tính năng người dùng đã có. Giữ Miditor trung lập; dữ liệu thiệp, trang, popup, lưu trữ và điều phối chuyển cảnh thuộc CardMaking.

## 5. Khớp bố cục, màu, font và lớp cắt

Làm từ ngoài vào trong: nền trang → cột nội dung → panel → chữ/ảnh → trang trí → chuyển động.

- Kiểm tra màu ở chính lớp vẽ, opacity trên mọi parent và ảnh/texture phủ phía trên. Nếu panel đỏ bị nhạt hoặc các chấm dress code bị che ngang, tìm lớp phủ và thứ tự lớp trước khi đổi mã màu.
- Bo góc phải áp vào đúng phần đang vẽ/cắt. `border-radius` trên wrapper không sửa được bitmap hình chữ nhật hoặc lớp khác đang phủ kín góc. Kiểm tra shadow không tạo ô vuông quanh hình tròn.
- Flower cần đúng file, kích thước, offset, góc xoay, lật, opacity và phần bị cắt ở mép panel; thay một trong các giá trị đó có thể đổi hẳn cảm giác của cụm hoa.
- Kiểm tra font đang render thay vì chỉ đọc tên font trong CSS. Thêm font vào kho font và bảo đảm nó tải trong editor, preview và public page. Font hệ thống và font fallback có thể khác nét/cỡ; ghi lại nếu chưa khớp.
- Giữ thống nhất tọa độ trang/cột; không trộn vị trí tuyệt đối theo viewport với offset theo tâm canvas. Điều chỉnh theo số đo, không thêm hàng loạt CSS `!important` theo ID để bù sai tài liệu.
- Đo cả hộp node và vùng chữ thực tế. Hộp Text quá hẹp làm câu tự xuống dòng; hộp quá thấp hoặc line-height sai làm chữ tràn và chồng node cạnh bên. Số trong JSON có vẻ hợp lý không thay screenshot ở kích thước render thật.
- Với bố cục ngày/giờ hai cột, đặt số ngày về một phía divider, tháng/năm phía kia; kiểm tra cùng lúc thứ, ngày, tháng, năm và giờ. Không suy ra vị trí chỉ từ tâm của panel.
- Form cần tách màu nhấn của nút khỏi màu chữ và viền input. Nếu mẫu không có khung ngoài, bỏ viền mặc định của node Form; không tô input theo màu nút chỉ vì cả hai cùng nằm trong một component.

## 6. Dựng hiệu ứng theo đúng phần tử và thời gian

Tách ba loại: hiệu ứng lặp khi đứng yên, hover, và hiệu ứng khi bấm mở. Đọc keyframes trước khi chọn hiệu ứng tương ứng trong hệ thống; cùng tên “đập” chưa chắc cùng nhịp.

- Dấu tim: xác định phần icon, vòng tròn hay cả huy hiệu đang scale. Kiểm tra clipping, nền alpha và bóng để không xuất hiện khung vuông khi đập. Tránh hai animation cùng scale chồng lên nhau.
- Vệt sáng: đặt trên lớp riêng được cắt theo hình pill; lấy đúng bề rộng, hướng, thời gian quét và khoảng nghỉ. Không cho hiệu ứng khác vô tình render chung lớp shine.
- Hoa trôi: giữ transform xoay/lật của bố cục trong khi phần motion dịch lên xuống. Cho người dùng tắt motion để dùng bản tĩnh với cùng hình và vị trí.
- Nền rơi: lưu cả số lượng, hướng, tốc độ, kích thước và độ mờ; ảnh chụp một thời điểm không cho biết nhịp rơi.
- Hộp quà/bao lì xì: dùng đúng artwork và các vật thể phụ; hover, bóng, sparkle, gợi ý bấm và hành động mở popup cần được kiểm tra riêng.

### Cách sao chép một hiệu ứng lặp (đã làm cho nút "Mở thiệp" và con dấu)

1. **Tìm phần tử đang chạy animation**, không đoán từ ảnh chụp: trên trang nguồn, duyệt mọi phần tử và lọc theo `getComputedStyle(el).animationName` (hoặc tìm phần tử con có `animation` khác `none`). Vệt sáng của nút không nằm trên nút mà trên một `div` con tuyệt đối (`absolute top-0 h-full w-8`) bên trong nút có `overflow: hidden`.
2. **Đọc ba thứ**: `animation` đầy đủ (tên, thời lượng, easing, lặp), nội dung `@keyframes` (quét `document.styleSheets` và các thẻ `<style>`, lọc `CSSKeyframesRule` theo tên), và kích thước/gradient/bóng của phần tử. Khi in kết quả, bỏ `url(...)` khỏi chuỗi, nếu không công cụ chặn vì lẫn dữ liệu cookie/query.
3. **Chép số, không chép cảm giác**: giữ nguyên easing, mốc phần trăm, độ rộng vệt theo tỉ lệ nút, độ trong suốt. Sai thường gặp: đổi `ease-in-out` thành `linear`, thêm bước mờ dần nguồn không có, tăng độ sáng cho "đẹp hơn".
4. **Đặt vào thuộc tính chỉnh được** của khối Decoration (`idleEffect`, `shineRadius`), để người dùng bật cho nút hoặc hình khác; không nhúng CSS theo ID của mẫu.
5. **Đo lại trên bản local** bằng cách lấy vị trí vệt sáng theo thời gian và so với chu kỳ nguồn (quét hết bề ngang trong nửa đầu, nghỉ nửa sau).
6. **Ghi số vào hồ sơ mẫu** và ghi rõ phần chưa khớp.

Số đo đã dùng:

| Hiệu ứng | Nguồn (Song Hỷ Xanh, Minimalism) | Bản local |
| --- | --- | --- |
| Vệt sáng nút | `shine` 3s ease-in-out infinite; `left` từ -100% đến 100% ở 0-50%, nghỉ 50-100%; vệt rộng 32px trên nút 140×48 (23%); gradient trong suốt → trắng 40% → trong suốt; nút bo tròn, `overflow: hidden` | Decoration `idleEffect: "Ánh sáng quét"`, cùng keyframes `left` |
| Con dấu thở | `seal-pulse` 2s ease-in-out infinite; scale 1 → 1.06 → 1; bóng `0 4px 20px` → `0 6px 35px`, màu `#e8f0e4` 50% | Decoration `idleEffect: "Thở nhẹ"`, scale 1 → 1.06 |
| Con dấu tim | Dựng riêng, nhịp hai lần phình rồi nghỉ (không có trên nguồn) | `idleEffect: "Đập"`, 1.3s |

### Hiệu ứng khi rê chuột (hộp quà Song Hỷ Xanh)

Trên nguồn, cả hộp quà là một `button.group`; mọi hiệu ứng nằm trong luật `.group:hover .igb-*`. Cách đo: lọc `styleSheets` theo selector chứa `hover` và `igb`, đọc `x.style.animation` của từng luật và `@keyframes` tương ứng (đọc từng nhóm nhỏ, kết quả dài bị cắt). Bản local: các khối Decoration cùng `hoverGroup` phản ứng cùng lúc khi rê vào bất kỳ khối nào (CSS `body:has([data-cm-hg="nhóm"]:hover)`), nên người dùng tự ghép được ở bất kỳ mẫu nào.

| Phần | Nguồn | Khối local |
| --- | --- | --- |
| Hộp chính | `igbBoxPop` 0,7s `cubic-bezier(.34,1.56,.64,1)` 1 lần, giữ trạng thái cuối, gốc xoay ở đáy: 0% → 45% (lên 14px, phóng 1,08, nghiêng -3°) → 100% (lên 8px, phóng 1,05) | `hoverEffect: "Nảy lên"`, `hoverTime: 0.7` |
| 7 vật nhỏ | `igbDecorFlyUp1-7`: 55% bay nửa đường, 80% bay hết và mờ, 81% về chỗ cũ, 100% hiện lại; lặp; mỗi vật có độ cao 55-80px, lệch ngang -14..14px, 1,3-1,9s, trễ 0-0,45s | `hoverEffect: "Bay lên rồi hiện lại"` kèm `hoverRise`, `hoverSway`, `hoverTime`, `hoverDelay` |
| 8 mảnh giấy | `igbConfettiFly1-8` 0,9-1,2s ease-out lặp, trễ 0,05-0,55s; mỗi mảnh bay 88-170px lên, lệch ngang -55..58px, xoay 240-620°, mờ 0 → 1 (15%) → 0 | `hoverEffect: "Pháo giấy"`, một khối đặt ở mép trên hộp |

Chưa khớp: trên nguồn các vật nhỏ dịch theo `translate` ngoài phép xoay, bản local dịch bên trong khối đã xoay nên hướng lệch đi vài độ; mảnh giấy thứ 6 có màu không đọc được trên nguồn nên dùng vàng `#facc15`. Hộp "Hộp quà" cũ (`motion: true`, Hoa Mộc Xanh) vẫn dùng hiệu ứng riêng, khác nguồn này.

Ghi cả hành vi khi giảm chuyển động của hệ thống. Nếu chưa đo được keyframes nguồn, đánh dấu hiệu ứng đang gần đúng; không tuyên bố giống hoàn toàn.

## 7. Nội dung thay đổi phải tự co giãn

Sổ lưu bút hiển thị tối đa 10 lời chúc trong phần danh sách đang hiển thị. Không có lời chúc thì không giữ một vùng trống dành sẵn cho 10 mục; ít hơn thì chiều cao theo số mục thực. Nội dung phía sau dịch theo chiều cao thực, không dùng cắt overflow để giấu lỗi.

Đối chiếu các trạng thái 0, 1, 10 và hơn 10 lời chúc; nếu có phân trang, giữ tối đa 10 mục mỗi lần. Kiểm tra cả nội dung dài và chữ tiếng Việt. Biểu mẫu cần tương tác thật, không chỉ là thumbnail đẹp: tên, lời chúc, placeholder, trạng thái gửi và danh sách hiển thị phải khớp cấu trúc đã chọn.

## 8. Xác nhận trên đúng bản dữ liệu người dùng đang mở

Các nơi sau có thể lấy dữ liệu khác nhau:

| Nơi xem | Điều phải xác nhận |
| --- | --- |
| `/demo/<slug>` | Route đang đọc file cover/pages nào và có thay props trước khi render không |
| Homepage/category popup | Đúng template ID và snapshot MongoDB hiện tại |
| “Dùng mẫu này” | Tài liệu thực sự tạo vào thiệp mới, asset và hành động còn đầy đủ |
| Editor → xem trước → xuất bản | Cùng dữ liệu sau khi lưu; cùng font, nền, độ rộng, trang bắt đầu và tương tác |

Lần sửa “không thấy khác” phải kiểm tra URL, template ID, snapshot, revision và đường tải asset trước khi tiếp tục chỉnh CSS. Khi sửa generator, cập nhật file được sinh; khi cập nhật template, cập nhật đúng snapshot được gallery sử dụng. Không ghi đè bản thiệp người dùng đã chỉnh chỉ để cập nhật mẫu thư viện.

Sau mỗi lần đổi vị trí hoặc kiểu chữ, render lại route demo và đọc computed style/rect của node vừa sửa cùng các node sát cạnh. Đối chiếu `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, màu, bounding box và số dòng thực tế. Sau khi cập nhật MongoDB, xác nhận đúng homepage popup, preview hoặc route đang xem; lệnh sinh JSON, typecheck và lưu snapshot đều chưa chứng minh hình thức đã đúng.

Thực hiện một lượt đối chiếu desktop/mobile theo cùng viewport/zoom/trạng thái với nguồn, ghi sai khác và sửa cùng đợt; sau đó xác nhận phần đã sửa. Kiểm tra bìa, mở thiệp, hover, popup, form và phần cuối trang. Không dùng phần trăm “giống” khi chưa có đối chiếu; nói rõ phần đã kiểm tra và phần còn thiếu.

## 9. Hành vi toàn trang và cách đo thứ không nằm trong một element

Không phải hiệu ứng nào cũng gắn vào một khối nhìn thấy. Khi người dùng nói "chỗ nào cũng có bàn tay" hay "bấm là tự lướt", đó là hành vi của cả trang:

- **Con trỏ:** lấy mẫu bằng `getComputedStyle(document.elementFromPoint(x, y)).cursor` ở vài điểm trên trang (chữ, ảnh, chỗ trống), không chỉ trên nút. Nguồn Song Hỷ Xanh trả `pointer` ở mọi điểm sau bìa.
- **Tự lướt:** thử bằng sự kiện thật: bấm một chỗ trống, đọc `scrollY` mỗi 0,5 giây (nguồn chạy khoảng 50px/giây), bấm lại để biết có dừng không, rồi gửi `wheel` để biết cuộn tay có dừng không. Chú ý trạng thái trước đó: một lần bấm của lượt đo trước có thể còn đang chạy, nên đo "đứng yên" trước rồi mới bấm.
- **Tìm mã nguồn không thấy gì cũng là một kết luận:** quét các tệp JS đã tải (`performance.getEntriesByType('resource')`) theo từ khoá; nếu không có, tính năng có thể chỉ hiện ở khổ điện thoại hoặc ở trang khác. Hỏi người dùng nó nằm ở đâu thay vì đoán, vì công cụ trình duyệt ở đây không thu được cửa sổ về cỡ điện thoại.
- **Khổ máy tính của nguồn:** cột nội dung cố định (Song Hỷ Xanh: 900px, giấy kem, hai bên nền trắng phẳng), không phải khung bo góc có bóng. Trang xem trước phải trông như vậy; kiểm tra bằng `getBoundingClientRect` của cột trên viewport rộng.

## 10. Lấy ảnh và các bẫy kỹ thuật hay gặp

**Lấy ảnh bị chặn tải trực tiếp (403).** `curl` bị Cloudflare chặn dù có Referer. Cách đã chạy: trong chính trang nguồn, `fetch` ảnh thành `Blob`, tạo thẻ `<a download>` bằng `URL.createObjectURL` rồi bấm, tệp rơi vào thư mục Tải xuống, sau đó chuyển vào dự án. Báo trước tên tệp, nguồn và dung lượng. Không đẩy dữ liệu từ trang nguồn sang máy chủ cục bộ (bị chặn, đúng chủ ý); không dán base64 qua kết quả công cụ (bị cắt ở khoảng 2000 ký tự). Sau khi lưu, mở ảnh ra xem kích thước thật và vùng trong suốt trước khi dựng.

**Đọc CSS của nguồn.** Chọn luật theo `selectorText` chứa `:hover`, đọc `x.style.animation`; keyframes lấy từ `CSSKeyframesRule`. Kết quả dài bị cắt nên đọc từng nhóm nhỏ. In ra có `url(...)` hay chuỗi giống cookie sẽ bị chặn: thay bằng `url()` trước khi in. Với mỗi hiệu ứng ghi cả thuộc tính nó dùng (`transform`, `translate`, `rotate`, `scale` là bốn thuộc tính riêng, chúng cộng dồn lên nhau) vì dựng sai thuộc tính sẽ lệch hướng hoặc chồng nhau.

**Dựng hai lớp từ một ảnh.** Nhiều mẫu vẽ cùng một ảnh hai lần (bao lì xì: lớp sau lật ngang, thu nhỏ, nghiêng khác). Tìm ảnh đơn trước; ảnh cặp đã phẳng không tách lại được. Trong editor dùng một khối có hai lớp bên trong thay vì hai khối, để người dùng kéo một lần và hiệu ứng rê chuột chạy đồng bộ.

**Hiệu ứng rê chuột chung cho nhiều khối.** Nguồn đặt `:hover` trên cả nút nhóm. Bản dựng: các khối cùng "Nhóm rê chuột" dùng bộ chọn `body:has([data-cm-hg="nhóm"]:hover)`. Tên nhóm chỉ giữ chữ thường, số, gạch nối.

**Bẫy khi dựng trong CardMaking:**

- Mỗi khối được Miditor bọc trong một phần tử có `all: revert`, nên `cursor: pointer` thường bị đè: dùng `!important`.
- `<style>` có nhiều phần tử con (`{A}{B}`) hiển thị rỗng khi render ở máy chủ (React 19): gộp thành một chuỗi template.
- CSS khai báo theo ID khối phải được dựng từ danh sách ID đã lọc bằng `/^[\w-]+$/`.
- Bìa toàn màn hình nằm ở tầng `z-index: 100`: thanh điều hướng và hộp thoại của trang xem trước phải cao hơn (đã đặt 120 và 200).
- Lỗi đỏ trong console của trình duyệt có thể là lỗi cũ lúc máy chủ dev đang nạp lại; tải lại trang rồi đọc console với `pattern` trước khi kết luận trang đang hỏng, và kiểm bằng `curl` mã trả về của vài đường dẫn.
- Đổi định nghĩa khối thì chạy `npm run blocks:export` và commit cả hai repo; thêm thuộc tính mới mà quên bước này làm `definitions.test.ts` đỏ.

## 11. Thành phần và Trang trí: quy tắc tổ chức để người dùng tìm được

Rút từ lần dọn ngày 14/11/2026 (tham khảo tab Thành phần của Canva): một tab, một ô tìm chung, kệ theo **loại**, chủ đề là chip lọc.

- Chia kệ theo loại (Hoa lá, Viền & nền, Biểu tượng, Phong bì & quà...), không theo mẫu. Tên mẫu (Song Hỷ, Minimalism) là từ khoá hoặc chip, không phải kệ.
- Mỗi tab tối đa khoảng 5 kệ. Hai nơi chứa cùng một thứ (Hạt trôi ở hai tab) là lỗi bố cục; một món chỉ nằm một chỗ.
- Tên kệ ngắn, một hai chữ. Hình do phát hành sẵn nên đổi tên nhóm ở cả mã lẫn danh mục trên cơ sở dữ liệu cùng lúc, và sửa script nạp để lần nạp sau không trả lại tên cũ.
- Khi clone một mẫu mới có vật trang trí động (hộp quà, bao lì xì, con dấu), thêm nó thành mẫu động trong tab Trang trí để người dùng kéo một lần là đủ hiệu ứng.

## Mẫu ghi nhận cho một section mới

```text
Mẫu / URL / ngày ghi nhận:
Trang / section / trạng thái / viewport / zoom:
XPath người dùng chỉ / selector tìm lại / parent:
Thông số đọc từ nguồn (kèm markup/CSS/keyframes):
Asset gốc / kích thước / alpha / crop / font:
Khối hoặc preset local / ID catalog / URL file:
Thao tác người dùng để tạo và chỉnh phần này:
Hiệu ứng đứng yên / hover / bấm / cách tắt motion:
Đường demo / template ID / snapshot đã cập nhật:
Đã kiểm tra: hình thức / thao tác từ trang trắng / lưu và mở lại:
Sai khác, phần gần đúng và điều khiển còn thiếu:
```

Một section chỉ được ghi “hoàn thành” khi có bằng chứng về cả hình thức, thao tác dựng lại, và bản dữ liệu thực tế đến tay người dùng.

## 12. Cửa sổ popup: dựng đúng khung và số đo (quà mừng, 14/11/2026)

Popup của nguồn là một hộp riêng (`modal-box`), không phải một trang thiệp: đo bằng `dialog[open] .modal-box`, đọc từng phần tử con (vị trí tương đối so với hộp, nền, bo góc, cỡ chữ) rồi dựng lại theo từng số.

- **Mở popup mà không cần cuộn tới nút:** gọi `.click()` trên nút trong trang nguồn (trang cuộn chậm và có tự lướt đè lên thao tác cuộn); cửa sổ là `position: fixed` nên chụp được ngay.
- **Số đo đã dùng (Minimalism / Song Hỷ Xanh):** hộp 576×404 / 576×410, bo 16, thanh đầu cao 70 / 76 (đỏ `#511419` / xanh `#1f3a25`, tiêu đề chữ hoa trắng đậm 20px Times / 24px Baskerville), nền thân `#fff7eb` / `#dcebde`, lề 24, hai cột 256 cách 16; nhãn 12px; thẻ QR trắng 160×160 bo 12, ảnh QR 140×140 cách mép 10; ba dòng ngân hàng 10px (thường, số tài khoản đơn cách, tên đậm); nút "Lưu QR" 68×23, nền màu thương hiệu 8%.
- **Mã QR của nguồn** sinh ở `/api/qr-png?d=<chuỗi VietQR>` (PNG 1024px). Lấy bằng cách tải trong trình duyệt như mục 10 và dùng làm mã minh hoạ; mã này chứa tài khoản mẫu của nguồn, không dùng khi phát hành.
- **Quy tắc khung popup của CardMaking (dễ sai):** popup rộng từ 640px trở xuống dùng canvas 375, trên 640px dùng canvas 960 thu theo `zoom = rộng / 960`. Muốn một popup có thanh đầu tràn mép, thiết kế trên canvas 960, nhân số đo gốc với 960/rộng gốc, và đặt `popup.width` từ 641.
- **Chưa làm:** nút "Lưu QR" mới là hình, chưa tải ảnh; nút đóng của khung đổi sang trắng bằng CSS theo mã trang `gift-details` (hạn chế đã biết).
