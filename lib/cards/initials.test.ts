import { describe, expect, it } from 'vitest';
import { initials } from './initials';

describe('initials', () => {
  it('takes the first letter of the first two words, upper case, keeping Vietnamese letters', () => {
    expect(initials('Thiệp cưới Lan và Minh')).toBe('TC');
    expect(initials('  đám cưới  ')).toBe('ĐC');
  });
  it('skips punctuation in front of a word, as in a copy title', () => {
    expect(initials('Spike (bản sao)')).toBe('SB');
    expect(initials('"Lễ" cưới')).toBe('LC');
  });
  it('works with one word, and falls back for an empty title', () => {
    expect(initials('Bin')).toBe('B');
    expect(initials('   ')).toBe('T');
  });
});
