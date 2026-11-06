import { cardsApi } from './api';
import { createSaver, type SaverStatus } from './saver';

// Bộ lưu của một thiệp: nhớ `revision` hiện tại, mỗi lần ghi gửi kèm nó và nhận về `revision` mới.
export function createCardSaver<T>(cardId: string, initialRevision: number, onStatus: (status: SaverStatus, error?: unknown) => void) {
  let revision = initialRevision;
  return createSaver<T>({
    write: async (document) => {
      revision = await cardsApi.save(cardId, revision, document);
    },
    onStatus,
  });
}
