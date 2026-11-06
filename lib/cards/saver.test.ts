import { describe, expect, it } from 'vitest';
import { createSaver, type SaverStatus } from './saver';

const deferred = () => {
  let resolve!: () => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<void>((res, rej) => ((resolve = res), (reject = rej)));
  return { promise, resolve, reject };
};

describe('createSaver', () => {
  it('writes one value and reports saving then saved', async () => {
    const statuses: SaverStatus[] = [];
    const written: number[] = [];
    const saver = createSaver<number>({ write: async (v) => void written.push(v), onStatus: (s) => statuses.push(s) });
    saver.save(1);
    await saver.idle();
    expect(written).toEqual([1]);
    expect(statuses).toEqual(['saving', 'saved']);
  });

  it('never runs two writes at once and keeps only the newest value that waited', async () => {
    const gates = [deferred(), deferred()];
    const started: number[] = [];
    let active = 0;
    let maxActive = 0;
    const saver = createSaver<number>({
      write: async (v) => {
        started.push(v);
        active++;
        maxActive = Math.max(maxActive, active);
        await gates[started.length - 1]!.promise;
        active--;
      },
      onStatus: () => {},
    });
    saver.save(1);
    saver.save(2);
    saver.save(3);
    await Promise.resolve();
    expect(started).toEqual([1]);
    gates[0]!.resolve();
    await new Promise((r) => setTimeout(r, 0));
    expect(started).toEqual([1, 3]); // 2 bị 3 thay thế
    gates[1]!.resolve();
    await saver.idle();
    expect(maxActive).toBe(1);
  });

  it('stops on an error, drops what waited, and tries again on the next save', async () => {
    const statuses: SaverStatus[] = [];
    const errors: unknown[] = [];
    let fail = true;
    const written: number[] = [];
    const saver = createSaver<number>({
      write: async (v) => {
        if (fail) throw new Error('conflict');
        written.push(v);
      },
      onStatus: (s, e) => {
        statuses.push(s);
        if (e) errors.push(e);
      },
    });
    saver.save(1);
    await saver.idle();
    expect(statuses).toEqual(['saving', 'error']);
    expect(errors).toHaveLength(1);
    fail = false;
    saver.save(2);
    await saver.idle();
    expect(written).toEqual([2]);
    expect(statuses.at(-1)).toBe('saved');
  });
});
