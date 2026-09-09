import { describe, expect, it, vi } from 'vitest';
import { createWebTransport } from './transport';

const request = { url: '/api/v1/auth/me', method: 'GET' as const, headers: {} };
describe('web transport', () => {
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
