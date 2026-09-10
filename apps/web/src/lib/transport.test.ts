import { describe, expect, it, vi } from 'vitest';
import { createWebTransport } from './transport';

const request = { url: '/api/v1/auth/me', method: 'GET' as const, headers: {} };
describe('web transport', () => {
  it('uploads multipart fields without a JSON content type', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('{"code":200,"data":{"valid":true}}'));
    await createWebTransport(fetcher)({ ...request, method: 'POST', headers: { Authorization: 'Bearer fixture-access' }, upload: { file: new Blob(['{}'], { type: 'application/json' }), fields: { dryRun: 'true' } } });
    const options = fetcher.mock.calls[0]?.[1];
    expect(options?.headers).toEqual({ Authorization: 'Bearer fixture-access' });
    expect(options?.body).toBeInstanceOf(FormData);
    expect((options?.body as FormData).get('dryRun')).toBe('true');
    expect((options?.body as FormData).get('file')).toBeInstanceOf(Blob);
  });
  it('downloads text without JSON parsing but preserves authentication errors', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('name,gender\r\n'))
      .mockResolvedValueOnce(new Response('{"detail":"expired"}', { status: 401 }));
    expect(await createWebTransport(fetcher)({ ...request, responseType: 'text' })).toEqual({ status: 200, body: 'name,gender\r\n' });
    expect(await createWebTransport(fetcher)({ ...request, responseType: 'text' })).toEqual({ status: 401, body: { detail: 'expired' } });
  });
  it('does not use browser HTTP cache or cookies', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('{"code":200,"data":null}', { status: 200 }));
    const response = await createWebTransport(fetcher)(request);
    expect(response.status).toBe(200);
    expect(fetcher.mock.calls[0]?.[1]).toMatchObject({ cache: 'no-store', credentials: 'omit' });
  });
  it('handles no-content responses without attempting JSON parsing', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 }));
    expect(await createWebTransport(fetcher)(request)).toEqual({ status: 204, body: undefined });
  });
  it('preserves failed HTTP status even if an upstream proxy returns HTML', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('<html>error</html>', { status: 502 }));
    expect(await createWebTransport(fetcher)(request)).toEqual({ status: 502, body: null });
  });
  it('rejects malformed successful JSON rather than treating it as data', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('<html>unexpected</html>', { status: 200 }));
    await expect(createWebTransport(fetcher)(request)).rejects.toThrow('有效 JSON');
  });
});
