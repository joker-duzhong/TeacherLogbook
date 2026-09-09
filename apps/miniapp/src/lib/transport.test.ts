import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@teacher-logbook/api-client';
import { miniappTransport } from './transport';

const request = { url: 'https://api.example.test/api/v1/auth/me', method: 'GET' as const, headers: { Accept: 'application/json' } };

function setup() {
  const send = vi.fn<(options: UniApp.RequestOptions) => void>();
  vi.stubGlobal('uni', { request: send });
  return send;
}

afterEach(() => vi.unstubAllGlobals());

describe('miniapp transport', () => {
  it('forwards supported requests without adding a body or changing the method', async () => {
    const send = setup();
    const response = miniappTransport(request);
    const options = send.mock.calls[0]?.[0];
    expect(options).toMatchObject({ url: request.url, method: 'GET', header: request.headers, timeout: 15000, dataType: 'json' });
    expect(options).not.toHaveProperty('data');
    options?.success?.({ statusCode: 200, data: { code: 200, data: null }, header: {}, cookies: [] });
    await expect(response).resolves.toEqual({ status: 200, body: { code: 200, data: null } });
  });

  it('serializes a POST body and preserves authentication headers', async () => {
    const send = setup();
    const response = miniappTransport({ ...request, method: 'POST', headers: { Authorization: 'Bearer fixture-access', 'Content-Type': 'application/json' }, body: { name: '测试班级' } });
    const options = send.mock.calls[0]?.[0];
    expect(options).toMatchObject({ method: 'POST', header: { Authorization: 'Bearer fixture-access', 'Content-Type': 'application/json' }, data: '{"name":"测试班级"}' });
    options?.success?.({ statusCode: 200, data: { code: 200, data: null }, header: {}, cookies: [] });
    await expect(response).resolves.toMatchObject({ status: 200 });
  });

  it('returns an empty body for 204 deletes', async () => {
    const send = setup();
    const response = miniappTransport({ ...request, method: 'DELETE' });
    send.mock.calls[0]?.[0].success?.({ statusCode: 204, data: '', header: {}, cookies: [] });
    await expect(response).resolves.toEqual({ status: 204, body: undefined });
  });

  it('preserves HTTP failures for shared error handling', async () => {
    const send = setup();
    const response = miniappTransport(request);
    send.mock.calls[0]?.[0].success?.({ statusCode: 401, data: { code: 401 }, header: {}, cookies: [] });
    await expect(response).resolves.toEqual({ status: 401, body: { code: 401 } });
  });

  it('reports network failures without retrying', async () => {
    const send = setup();
    const response = miniappTransport(request);
    send.mock.calls[0]?.[0].fail?.({ errMsg: 'request:fail' });
    await expect(response).rejects.toBeInstanceOf(ApiError);
    expect(send).toHaveBeenCalledOnce();
  });

  it('rejects PATCH without sending a request or inventing a method override', async () => {
    const send = setup();
    await expect(miniappTransport({ ...request, method: 'PATCH', body: { name: '测试学生' } })).rejects.toThrow('学生编辑需后端提供兼容接口');
    expect(send).not.toHaveBeenCalled();
  });
});
