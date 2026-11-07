import { describe, expect, it, vi } from 'vitest';
import { createUploadImage, MAX_IMAGE_BYTES, type UploadSignature } from './upload-image';

const signed: UploadSignature = { cloudName: 'demo', apiKey: 'key', timestamp: 1_700_000_000, folder: 'cardmaking/u1', allowedFormats: 'jpg,png', transformation: 'c_limit,h_4000,w_4000', signature: 'abc' };
const picture = () => new File([new Uint8Array(10)], 'a.png', { type: 'image/png' });
const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('uploadImage', () => {
  it('signs, posts the file to the Cloudinary cloud with the signed fields, and returns the https address', async () => {
    const send = vi.fn<typeof fetch>(async () => reply(200, { secure_url: 'https://res.cloudinary.com/demo/image/upload/a.png' }));
    const upload = createUploadImage({ sign: async () => signed, fetch: send as unknown as typeof fetch });

    await expect(upload(picture())).resolves.toBe('https://res.cloudinary.com/demo/image/upload/a.png');
    expect(String(send.mock.calls[0]![0])).toBe('https://api.cloudinary.com/v1_1/demo/image/upload');
    const form = send.mock.calls[0]![1]!.body as FormData;
    expect(Object.fromEntries([...form.entries()].filter(([k]) => k !== 'file'))).toEqual({
      api_key: 'key', timestamp: '1700000000', folder: 'cardmaking/u1', allowed_formats: 'jpg,png', transformation: 'c_limit,h_4000,w_4000', signature: 'abc',
    });
    expect(form.get('file')).toBeInstanceOf(File);
  });

  it('refuses a picture that is too big before asking for a signature', async () => {
    const sign = vi.fn(async () => signed);
    const upload = createUploadImage({ sign, fetch: vi.fn() as unknown as typeof fetch });
    const big = new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], 'big.png', { type: 'image/png' });
    await expect(upload(big)).rejects.toThrow('8 MB');
    expect(sign).not.toHaveBeenCalled();
  });

  it('says why when Cloudinary refuses, and when it answers with something else', async () => {
    const refused = createUploadImage({ sign: async () => signed, fetch: (async () => reply(400, { error: { message: 'Invalid image file' } })) as unknown as typeof fetch });
    await expect(refused(picture())).rejects.toThrow('Invalid image file');
    const odd = createUploadImage({ sign: async () => signed, fetch: (async () => new Response('oops', { status: 502 })) as unknown as typeof fetch });
    await expect(odd(picture())).rejects.toThrow('máy chủ ảnh');
  });

  it('passes on the failure of the signature request', async () => {
    const upload = createUploadImage({ sign: async () => { throw new Error('503'); }, fetch: vi.fn() as unknown as typeof fetch });
    await expect(upload(picture())).rejects.toThrow('503');
  });
});
