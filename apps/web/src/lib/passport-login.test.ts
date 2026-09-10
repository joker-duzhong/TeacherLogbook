import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { createPassportLogin, logbookAppKey, passportStorageKey, safeWorkspacePath } from './passport-login';

const transactionId = '00000000-0000-4000-8000-000000000001';
const state = 'a'.repeat(48);
const pollToken = 'test-poll-token-000000000000000000000';
const login = { access_token: 'fixture-access', refresh_token: 'fixture-refresh', token_type: 'bearer', app_scope: logbookAppKey, user: { id: 'fixture-user', needs_phone_binding: false } };
function setup(origin = 'https://nesttalk.lxyy.fun', scanPageUrl = 'https://tool.lxyy.fun/passport/scan') {
  const values = new Map<string, string>();
  const storage = { getItem: vi.fn((key: string) => values.get(key) ?? null), setItem: vi.fn((key: string, value: string) => { values.set(key, value); }), removeItem: vi.fn((key: string) => { values.delete(key); }) };
  const api = {
    listScanApps: vi.fn().mockResolvedValue([{ app_key: logbookAppKey, name: '台账' }]),
    createScanSession: vi.fn().mockResolvedValue({ transaction_id: transactionId, status: 'WAITING_SCAN', poll_token: pollToken, expires_at: '2026-09-11T00:05:00Z' }),
    pollScanSession: vi.fn().mockResolvedValue({ transaction_id: transactionId, status: 'CONFIRMED', exchange_code: 'fixture-exchange' }),
    exchangeScanSession: vi.fn().mockResolvedValue(login),
  };
  const navigate = vi.fn(); const accept = vi.fn();
  const flow = createPassportLogin({ api, storage, origin, scanPageUrl, navigate, accept, randomState: () => state });
  const callback = () => new URLSearchParams({ transaction_id: transactionId, state });
  return { flow, api, storage, values, navigate, accept, callback };
}
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-11T00:00:00Z')); });
afterEach(() => { vi.useRealTimers(); });

describe('same-tab Passport login', () => {
  it.each([
    ['https://nesttalk.lxyy.fun', 'https://tool.lxyy.fun/passport/scan'],
    ['http://localhost:5174', 'http://192.168.31.93:5173/passport/scan?env=local'],
    ['http://127.0.0.1:5174', 'http://192.168.31.93:5173/passport/scan?env=local'],
    ['http://192.168.31.93:5174', 'http://192.168.31.93:5173/passport/scan?env=local'],
  ])('preserves the origin and private transaction for %s', async (origin, url) => {
    const { flow, navigate, values, api, callback, accept } = setup(origin, url);
    await flow.start('/workspace/students?new=1');
    const target = new URL(navigate.mock.calls[0]![0]);
    const back = new URL(target.searchParams.get('back')!);
    expect(back.origin + back.pathname).toBe(origin + '/auth/passport/callback');
    expect(new URLSearchParams(back.hash.slice(1))).toEqual(callback());
    expect([...target.searchParams.keys()]).not.toContain('return_env');
    expect(target.href).not.toContain(pollToken);
    expect(target.searchParams.get('transaction_id')).toBe(transactionId);
    expect(await flow.complete(callback())).toBe('/workspace/students?new=1');
    expect(api.pollScanSession).toHaveBeenCalledWith(transactionId, pollToken);
    expect(accept).toHaveBeenCalledExactlyOnceWith(login);
    expect(values.size).toBe(0);
    await expect(flow.complete(callback())).rejects.toThrow('回调无效');
    expect(api.exchangeScanSession).toHaveBeenCalledOnce();
  });
  it.each(['https://new.lxyy.fun:8443', 'http://10.2.3.4:8888', 'http://localhost:9000'])('derives back from the current origin %s without an environment address list', async origin => {
    const { flow, navigate } = setup(origin);
    await flow.start('/workspace/dashboard');
    expect(new URL(new URL(navigate.mock.calls[0]![0]).searchParams.get('back')!).origin).toBe(origin);
  });
  it('prevents automatic bounce loops and supports an explicit retry', async () => {
    const { flow, api } = setup();
    await flow.start('/workspace/classes');
    await expect(flow.start('/workspace/classes')).rejects.toThrow('上次授权');
    await flow.start('/workspace/classes', true);
    expect(api.createScanSession).toHaveBeenCalledTimes(2);
  });
  it('rejects missing, duplicate, forged and expired callback state before polling', async () => {
    const { flow, api, callback } = setup();
    await flow.start('/workspace/classes');
    for (const params of [new URLSearchParams(), new URLSearchParams({ transaction_id: transactionId, state: 'b'.repeat(48) }), new URLSearchParams(callback().toString() + '&state=' + state)]) {
      await expect(flow.complete(params)).rejects.toThrow('回调无效');
    }
    vi.advanceTimersByTime(300001);
    await expect(flow.complete(callback())).rejects.toThrow('已过期');
    expect(api.pollScanSession).not.toHaveBeenCalled();
  });
  it('never retries exchange after an ambiguous transport failure', async () => {
    const { flow, api, callback } = setup();
    await flow.start('/workspace/classes');
    api.exchangeScanSession.mockRejectedValue(new Error('network'));
    await expect(flow.complete(callback())).rejects.toThrow('network');
    await expect(flow.complete(callback())).rejects.toThrow('结果未确定');
    expect(api.exchangeScanSession).toHaveBeenCalledOnce();
  });
  it('does not accept another application token', async () => {
    const { flow, api, callback, accept } = setup();
    await flow.start('/workspace/classes');
    api.exchangeScanSession.mockResolvedValue({ ...login, app_scope: 'passport' });
    await expect(flow.complete(callback())).rejects.toThrow('所属应用不匹配');
    expect(accept).not.toHaveBeenCalled();
  });
  it.each(['PENDING', 'WAITING_SCAN', 'EXPIRED', 'CANCELLED', 'CONSUMED'])('does not exchange %s', async status => {
    const { flow, api, callback } = setup();
    await flow.start('/workspace/classes');
    api.pollScanSession.mockResolvedValue({ transaction_id: transactionId, status });
    await expect(flow.complete(callback())).rejects.toThrow('授权尚未完成或已失效');
    expect(api.exchangeScanSession).not.toHaveBeenCalled();
  });
  it('fails before creating a transaction when storage is unavailable', async () => {
    const { flow, storage, api } = setup();
    storage.setItem.mockImplementation(() => { throw new Error('denied'); });
    await expect(flow.start('/workspace/classes')).rejects.toThrow('无法保存');
    expect(api.createScanSession).not.toHaveBeenCalled();
  });
  it('stops late create results after leaving the login page', async () => {
    const { flow, api, navigate, values } = setup();
    let release!: (value: unknown) => void;
    api.createScanSession.mockImplementation(() => new Promise(resolve => { release = resolve; }));
    const pending = flow.start('/workspace/classes');
    await vi.waitFor(() => expect(api.createScanSession).toHaveBeenCalled());
    flow.stop(); flow.clear(); release({}); await pending;
    expect(navigate).not.toHaveBeenCalled(); expect(values.size).toBe(0);
  });
  it('rejects a context from another configured Passport endpoint', async () => {
    const { flow, values, callback, api } = setup();
    await flow.start('/workspace/classes');
    const saved = JSON.parse(values.get(passportStorageKey)!);
    values.set(passportStorageKey, JSON.stringify({ ...saved, scanPageUrl: 'https://another.lxyy.fun/passport/scan' }));
    await expect(flow.complete(callback())).rejects.toThrow('回调无效');
    expect(api.pollScanSession).not.toHaveBeenCalled();
  });
  it.each(['https://evil.test', '//evil.test/workspace/classes', '/workspace/../login', '/workspace/classes\\evil', '/unknown'])('rejects unsafe destination %s', value => {
    expect(safeWorkspacePath(value)).toBe('/workspace/dashboard');
  });
});
