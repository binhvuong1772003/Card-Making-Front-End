// Sinh danh sách khối riêng cho CMBE: backend kiểm trang bằng đúng định nghĩa mà editor dùng, không chép tay.
//   npm run blocks:export
// Ghi `components.json` và `retired-props.json` vào `../CMBE/src/modules/cards/`. Chạy sau mỗi lần đổi định nghĩa trong lib/cards/blocks, rồi commit cả hai repo.
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { cardDefinitions, retiredProps } from "../lib/cards/blocks/definitions";
import PHOTO_FRAME_CATALOG from "../lib/cards/blocks/photo-frame-catalog.json";

const folder = resolve(__dirname, "../../CMBE/src/modules/cards");
writeFileSync(resolve(folder, "components.json"), `${JSON.stringify(cardDefinitions, null, 2)}\n`);
writeFileSync(resolve(folder, "retired-props.json"), `${JSON.stringify(retiredProps, null, 2)}\n`);
writeFileSync(resolve(folder, "photo-frame-catalog.json"), `${JSON.stringify(PHOTO_FRAME_CATALOG, null, 2)}\n`);
console.log(`Đã ghi ${Object.keys(cardDefinitions).length} khối và các thuộc tính đã bỏ vào ${folder}`);
