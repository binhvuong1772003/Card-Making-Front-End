// Gom các lần lưu của editor: mỗi lúc chỉ một lần ghi đang chạy (mỗi lần ghi đổi `revision`, ghi chồng sẽ tự gây CONFLICT),
// và trong lúc đang ghi chỉ giữ bản MỚI NHẤT chờ ghi tiếp. Lỗi thì dừng, bản chờ bị bỏ; lần sửa kế tiếp thử lại.
export type SaverStatus = 'saved' | 'saving' | 'error';

export function createSaver<T>({ write, onStatus }: { write: (value: T) => Promise<void>; onStatus: (status: SaverStatus, error?: unknown) => void }) {
  let pending: { value: T } | null = null;
  let running: Promise<void> | null = null;

  async function drain(): Promise<void> {
    try {
      while (pending) {
        const { value } = pending;
        pending = null;
        onStatus('saving');
        await write(value);
      }
      onStatus('saved');
    } catch (error) {
      pending = null;
      onStatus('error', error);
    }
  }

  return {
    save(value: T): void {
      pending = { value };
      running ??= drain().finally(() => {
        running = null;
        // Có bản mới đến đúng lúc vòng cuối vừa kết thúc: chạy tiếp.
        if (pending) this.save(pending.value);
      });
    },
    // Chờ tới khi không còn gì đang ghi hay chờ ghi.
    async idle(): Promise<void> {
      while (running) await running;
    },
  };
}
