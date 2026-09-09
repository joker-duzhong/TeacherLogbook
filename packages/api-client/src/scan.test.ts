import { describe, expect, it, vi } from 'vitest';
import { ApiError, createApi } from './index';
import type { Transport } from './index';

const transactionId = '00000000-0000-4000-8000-000000000001';
const pollToken = 'fixture-poll-token-000000000000000000';
const exchangeCode = 'fixture-exchange-code-00000000000000';
const session = { transaction_id: transactionId, status: 'WAITING_SCAN', poll_token: pollToken, poll_interval_seconds: 2 };
function setup(data: unknown, status = 200) {
  const transport = vi.fn<Transport>().mockResolvedValue({ status, body: { code: status, data } });
  const onUnauthorized = vi.fn();
  const api = createApi({ baseUrl: '/api/v1', transport, getAccessToken: () => 'fixture-existing-access', onUnauthorized });
  return { api, transport, onUnauthorized };
}

describe('scan API contract', () => {
  it('lists public apps without bearer authentication', async () => {
    const apps = [{ app_key: 'hope_teacher_logbook', name: '工作台' }];
    const { api, transport } = setup(apps);
    expect(await api.listScanApps()).toEqual(apps);
    expect(transport).toHaveBeenCalledExactlyOnceWith({ url: '/api/v1/auth/scan/apps', method: 'GET', headers: { Accept: 'application/json' } });
  });
  it('creates a session using the business app key', async () => {
    const { api, transport } = setup(session);
    expect(await api.createScanSession('hope_teacher_logbook')).toEqual(session);
    expect(transport.mock.calls[0]?.[0]).toEqual({ url: '/api/v1/auth/scan/sessions', method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: { app_key: 'hope_teacher_logbook' } });
  });
  it.each([
    { ...session, transaction_id: 'invalid' },
    { ...session, status: 'UNKNOWN' },
    { ...session, poll_token: '' },
    { ...session, expires_at: 'invalid' },
    { ...session, poll_interval_seconds: 0 },
    { ...session, poll_interval_seconds: 0.5 },
  ])('rejects malformed created sessions', async (data) => {
    await expect(setup(data).api.createScanSession('hope_teacher_logbook')).rejects.toBeInstanceOf(ApiError);
  });
  it('sends the polling secret only in X-Scan-Token', async () => {
    const { api, transport } = setup({ transaction_id: transactionId, status: 'PENDING' });
    await api.pollScanSession(transactionId, pollToken);
    expect(transport.mock.calls[0]?.[0]).toEqual({ url: `/api/v1/auth/scan/sessions/${transactionId}`, method: 'GET', headers: { Accept: 'application/json', 'X-Scan-Token': pollToken } });
  });
  it('rejects mismatched transactions and missing confirmed exchange codes', async () => {
    await expect(setup({ transaction_id: '00000000-0000-4000-8000-000000000002', status: 'PENDING' }).api.pollScanSession(transactionId, pollToken)).rejects.toThrow('不匹配');
    await expect(setup({ transaction_id: transactionId, status: 'CONFIRMED' }).api.pollScanSession(transactionId, pollToken)).rejects.toThrow('不完整');
  });
  it('exchanges once without adding bearer authentication', async () => {
    const login = { access_token: 'fixture-access', refresh_token: 'fixture-refresh', user: { id: 'user-id', needs_phone_binding: false } };
    const { api, transport } = setup(login);
    expect(await api.exchangeScanSession(transactionId, exchangeCode, pollToken)).toEqual(login);
    expect(transport.mock.calls[0]?.[0]).toEqual({ url: '/api/v1/auth/scan/exchange', method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Scan-Token': pollToken }, body: { transaction_id: transactionId, exchange_code: exchangeCode } });
  });
  it('does not invalidate an existing login for a failed scan credential', async () => {
    const { api, onUnauthorized, transport } = setup(null, 401);
    await expect(api.pollScanSession(transactionId, pollToken)).rejects.toMatchObject({ status: 401 });
    expect(onUnauthorized).not.toHaveBeenCalled();
    expect(transport).toHaveBeenCalledOnce();
  });
  it('rejects invalid outbound credentials before a request', async () => {
    const { api, transport } = setup(null);
    await expect(api.pollScanSession(transactionId, 'short')).rejects.toBeInstanceOf(ApiError);
    await expect(api.exchangeScanSession(transactionId, 'short', pollToken)).rejects.toBeInstanceOf(ApiError);
    expect(transport).not.toHaveBeenCalled();
  });
});
