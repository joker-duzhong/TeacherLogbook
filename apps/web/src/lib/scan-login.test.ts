import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { createApi, LoginResult, ScanPoll, ScanSession } from '@teacher-logbook/api-client';
import { buildScanUrl, createScanLogin } from './scan-login';

type Api = ReturnType<typeof createApi>;
const transactionId = '00000000-0000-4000-8000-000000000001';
const session: ScanSession = { transaction_id: transactionId, status: 'WAITING_SCAN', poll_token: 'fixture-poll-token-000000000000000000', poll_interval_seconds: 2, expires_at: '2026-09-09T00:05:00Z' };
const login = { access_token: 'fixture-access', refresh_token: 'fixture-refresh', user: { id: 'user-id', needs_phone_binding: false } } as LoginResult;

function deferred<Value>() {
  let resolve!: (value: Value) => void;
  const promise = new Promise<Value>((complete) => { resolve = complete; });
  return { promise, resolve };
}

function setup(scanPageUrl = 'http://192.168.31.93:5173/scan') {
  const api = {
    listScanApps: vi.fn<Api['listScanApps']>().mockResolvedValue([{ app_key: 'hope_teacher_logbook', name: '工作台' }]),
    createScanSession: vi.fn<Api['createScanSession']>().mockResolvedValue({ ...session }),
    pollScanSession: vi.fn<Api['pollScanSession']>().mockResolvedValue({ transaction_id: transactionId, status: 'WAITING_SCAN' }),
    exchangeScanSession: vi.fn<Api['exchangeScanSession']>().mockResolvedValue(login),
  };
  const renderQr = vi.fn<(url: string) => Promise<string>>().mockResolvedValue('data:image/png;base64,fixture');
  const onLogin = vi.fn();
  const scan = createScanLogin({ api, appKey: 'hope_teacher_logbook', scanPageUrl, renderQr, onLogin });
  return { api, renderQr, onLogin, scan };
}

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-09T00:00:00Z')); });
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });

describe('scan login lifecycle', () => {
  it('passes the local environment to QR rendering without exposing the poll token', async () => {
    const { scan, renderQr } = setup('http://192.168.31.93:5173/scan?env=local');
    await scan.start();
    expect(renderQr).toHaveBeenCalledExactlyOnceWith(`http://192.168.31.93:5173/scan?transaction_id=${transactionId}&env=local`);
    expect(renderQr.mock.calls[0]?.[0]).not.toContain(session.poll_token);
  });
  it('renders only the transaction ID and observes the server poll interval', async () => {
    const { scan, api, renderQr } = setup();
    await scan.start();
    expect(renderQr).toHaveBeenCalledExactlyOnceWith(`http://192.168.31.93:5173/scan?transaction_id=${transactionId}`);
    expect(JSON.stringify(scan.state.value)).not.toContain(session.poll_token);
    await vi.advanceTimersByTimeAsync(1999);
    expect(api.pollScanSession).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(api.pollScanSession).toHaveBeenCalledExactlyOnceWith(transactionId, session.poll_token);
  });
  it('moves from pending to confirmed, exchanges once and signs in', async () => {
    const { scan, api, onLogin } = setup();
    api.pollScanSession.mockResolvedValueOnce({ transaction_id: transactionId, status: 'PENDING' }).mockResolvedValueOnce({ transaction_id: transactionId, status: 'CONFIRMED', exchange_code: 'fixture-exchange-code-00000000000000' });
    await scan.start();
    await vi.advanceTimersByTimeAsync(2000);
    expect(scan.state.value.phase).toBe('PENDING');
    await vi.advanceTimersByTimeAsync(2000);
    expect(api.exchangeScanSession).toHaveBeenCalledExactlyOnceWith(transactionId, 'fixture-exchange-code-00000000000000', session.poll_token);
    expect(onLogin).toHaveBeenCalledExactlyOnceWith(login);
    expect(scan.state.value.phase).toBe('SUCCESS');
    await vi.advanceTimersByTimeAsync(600000);
    expect(api.pollScanSession).toHaveBeenCalledTimes(2);
    expect(api.exchangeScanSession).toHaveBeenCalledOnce();
  });
  it.each(['EXPIRED', 'CANCELLED', 'CONSUMED'] as const)('stops after %s', async (status) => {
    const { scan, api, onLogin } = setup();
    api.pollScanSession.mockResolvedValue({ transaction_id: transactionId, status });
    await scan.start();
    await vi.advanceTimersByTimeAsync(10000);
    expect(scan.state.value.phase).toBe(status);
    expect(scan.state.value.image).toBe('data:image/png;base64,fixture');
    expect(api.pollScanSession).toHaveBeenCalledOnce();
    expect(onLogin).not.toHaveBeenCalled();
  });
  it('expires locally even while a request is unresolved', async () => {
    const { scan, api } = setup();
    api.pollScanSession.mockReturnValue(new Promise(() => {}));
    await scan.start();
    await vi.advanceTimersByTimeAsync(300000);
    expect(scan.state.value.phase).toBe('EXPIRED');
    expect(scan.state.value.image).toBe('data:image/png;base64,fixture');
    expect(api.pollScanSession).toHaveBeenCalledOnce();
  });
  it('does not overlap polls when the network is slow', async () => {
    const { scan, api } = setup();
    const pending = deferred<ScanPoll>();
    api.pollScanSession.mockReturnValueOnce(pending.promise);
    await scan.start();
    await vi.advanceTimersByTimeAsync(10000);
    expect(api.pollScanSession).toHaveBeenCalledOnce();
    pending.resolve({ transaction_id: transactionId, status: 'PENDING' });
    await vi.advanceTimersByTimeAsync(2000);
    expect(api.pollScanSession).toHaveBeenCalledTimes(2);
  });
  it('ignores a late confirmation after leaving the scan tab', async () => {
    const { scan, api, onLogin } = setup();
    const pending = deferred<ScanPoll>();
    api.pollScanSession.mockReturnValueOnce(pending.promise);
    await scan.start();
    await vi.advanceTimersByTimeAsync(2000);
    scan.stop();
    pending.resolve({ transaction_id: transactionId, status: 'CONFIRMED', exchange_code: 'fixture-exchange-code-00000000000000' });
    await vi.advanceTimersByTimeAsync(5000);
    expect(api.exchangeScanSession).not.toHaveBeenCalled();
    expect(onLogin).not.toHaveBeenCalled();
    expect(scan.state.value.phase).toBe('IDLE');
  });
  it('ignores a late exchange response after leaving', async () => {
    const { scan, api, onLogin } = setup();
    const pending = deferred<LoginResult>();
    api.pollScanSession.mockResolvedValue({ transaction_id: transactionId, status: 'CONFIRMED', exchange_code: 'fixture-exchange-code-00000000000000' });
    api.exchangeScanSession.mockReturnValue(pending.promise);
    await scan.start();
    await vi.advanceTimersByTimeAsync(2000);
    expect(scan.state.value.phase).toBe('EXCHANGING');
    expect(scan.state.value.image).toBe('data:image/png;base64,fixture');
    scan.stop();
    expect(scan.state.value.image).toBe('');
    pending.resolve(login);
    await vi.advanceTimersByTimeAsync(1000);
    expect(onLogin).not.toHaveBeenCalled();
  });
  it('ignores an old creation result after refreshing', async () => {
    const { scan, api, renderQr } = setup();
    const pending = deferred<ScanSession>();
    api.createScanSession.mockReturnValueOnce(pending.promise);
    const first = scan.start();
    await vi.advanceTimersByTimeAsync(0);
    await scan.start();
    pending.resolve({ ...session, transaction_id: '00000000-0000-4000-8000-000000000002' });
    await first;
    expect(renderQr).toHaveBeenCalledOnce();
    expect(renderQr.mock.calls[0]?.[0]).toContain(transactionId);
  });
  it('does not create a session for an unavailable application', async () => {
    const { scan, api } = setup();
    api.listScanApps.mockResolvedValue([]);
    await scan.start();
    expect(scan.state.value.phase).toBe('ERROR');
    expect(api.createScanSession).not.toHaveBeenCalled();
  });
  it('does not retry an exchange after an ambiguous network failure', async () => {
    const { scan, api, onLogin } = setup();
    api.pollScanSession.mockResolvedValue({ transaction_id: transactionId, status: 'CONFIRMED', exchange_code: 'fixture-exchange-code-00000000000000' });
    api.exchangeScanSession.mockRejectedValue(new Error('offline'));
    await scan.start();
    await vi.advanceTimersByTimeAsync(10000);
    expect(scan.state.value.phase).toBe('ERROR');
    expect(scan.state.value.image).toBe('data:image/png;base64,fixture');
    expect(api.exchangeScanSession).toHaveBeenCalledOnce();
    expect(onLogin).not.toHaveBeenCalled();
  });
  it('rejects unsafe QR page configuration', () => {
    for (const url of ['javascript:alert(1)', 'https://user:password@example.test/scan', 'https://example.test/scan?poll_token=secret', 'https://example.test/scan#secret']) {
      expect(() => buildScanUrl(url, transactionId)).toThrow();
    }
  });
  it('keeps the old image beneath the refresh mask until the new QR is ready', async () => {
    const { scan, api, renderQr } = setup();
    await scan.start();
    api.pollScanSession.mockResolvedValue({ transaction_id: transactionId, status: 'EXPIRED' });
    await vi.advanceTimersByTimeAsync(2000);
    const nextImage = deferred<string>();
    renderQr.mockReturnValueOnce(nextImage.promise);
    const refreshing = scan.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(scan.state.value.phase).toBe('LOADING');
    expect(scan.state.value.image).toBe('data:image/png;base64,fixture');
    nextImage.resolve('data:image/png;base64,next');
    await refreshing;
    expect(scan.state.value.phase).toBe('WAITING_SCAN');
    expect(scan.state.value.image).toBe('data:image/png;base64,next');
    scan.stop();
    expect(scan.state.value.image).toBe('');
  });
});

describe('scan URL environment', () => {
  it('leaves production URLs without an environment parameter', () => {
    expect(buildScanUrl('https://example.test/scan', transactionId)).toBe(`https://example.test/scan?transaction_id=${transactionId}`);
  });
  it('preserves the explicit local environment after the real transaction ID', () => {
    expect(buildScanUrl('http://192.168.31.93:5173/scan?env=local', transactionId)).toBe(`http://192.168.31.93:5173/scan?transaction_id=${transactionId}&env=local`);
  });
  it.each([
    'env=',
    'env=production',
    'env=local&env=local',
    'env=local&env=production',
    'env=local&poll_token=fixture-secret',
    'env=local&exchange_code=fixture-code',
    'env=local&transaction_id=old-transaction',
    'env=local&redirect=https://example.test',
  ])('rejects unsupported, duplicated or credential parameters: %s', (query) => {
    expect(() => buildScanUrl(`https://example.test/scan?${query}`, transactionId)).toThrow();
  });
});
