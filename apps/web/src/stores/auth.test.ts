import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { LoginResult } from '@teacher-logbook/api-client';
import { authStorageKey, useAuthStore } from './auth';

const profile = { id: 'fixture-user', needs_phone_binding: false };
const login = { access_token: 'fixture-access', refresh_token: 'fixture-refresh', token_type: 'bearer', user: profile } as LoginResult;
let values: Map<string, string>;
let storage: { getItem: ReturnType<typeof vi.fn>; setItem: ReturnType<typeof vi.fn>; removeItem: ReturnType<typeof vi.fn> };
let fetcher: ReturnType<typeof vi.fn<typeof fetch>>;
function response(data: unknown, status = 200, code = status) {
  return new Response(JSON.stringify({ code, data }), { status });
}
function newStore() {
  setActivePinia(createPinia());
  return useAuthStore();
}
beforeEach(() => {
  values = new Map();
  storage = {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { values.set(key, value); }),
    removeItem: vi.fn((key: string) => { values.delete(key); }),
  };
  fetcher = vi.fn<typeof fetch>();
  vi.stubGlobal('localStorage', storage);
  vi.stubGlobal('fetch', fetcher);
});
afterEach(() => vi.unstubAllGlobals());

describe('persistent web authentication', () => {
  it('stores only the access token when either login flow is accepted', () => {
    const auth = newStore();
    auth.acceptLogin(login);
    expect([...values.entries()]).toEqual([[authStorageKey, login.access_token]]);
    expect(auth.isAuthenticated).toBe(true);
    expect(auth.user).toEqual(profile);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('restores once and validates cached credentials before granting access', async () => {
    values.set(authStorageKey, login.access_token);
    let finish: (value: Response) => void = () => {};
    fetcher.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const auth = newStore();
    const pending = auth.restoreSession();
    const another = auth.restoreSession();
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.restoring).toBe(true);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher.mock.calls[0]?.[0]).toBe('/api/v1/auth/me');
    expect(fetcher.mock.calls[0]?.[1]?.headers).toMatchObject({ Authorization: 'Bearer fixture-access' });
    finish(response(profile));
    await pending;
    await another;
    await auth.restoreSession();
    expect(auth.isAuthenticated).toBe(true);
    expect(auth.restoring).toBe(false);
    expect(fetcher).toHaveBeenCalledOnce();
  });
  it('does not request a profile when no token is stored', async () => {
    const auth = newStore();
    await auth.restoreSession();
    expect(auth.isAuthenticated).toBe(false);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it.each([401, 200])('clears expired credentials for HTTP/envelope 401 (%s)', async status => {
    values.set(authStorageKey, login.access_token);
    fetcher.mockResolvedValue(response(null, status, 401));
    const auth = newStore();
    await auth.restoreSession();
    expect(auth.isAuthenticated).toBe(false);
    expect(values.has(authStorageKey)).toBe(false);
    expect(fetcher).toHaveBeenCalledOnce();
    await auth.restoreSession();
    expect(fetcher).toHaveBeenCalledOnce();
  });
  it('preserves cached credentials on a network failure and allows explicit retry', async () => {
    values.set(authStorageKey, login.access_token);
    fetcher.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(response(profile));
    const auth = newStore();
    await auth.restoreSession();
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.restoreError).not.toBe('');
    expect(values.get(authStorageKey)).toBe(login.access_token);
    await auth.restoreSession(true);
    expect(auth.isAuthenticated).toBe(true);
    expect(auth.restoreError).toBe('');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('does not trust malformed user responses or delete the cached token', async () => {
    values.set(authStorageKey, login.access_token);
    fetcher.mockResolvedValue(response({}));
    const auth = newStore();
    await auth.restoreSession();
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.restoreError).toContain('用户信息');
    expect(values.get(authStorageKey)).toBe(login.access_token);
  });
  it('logout clears its token without removing unrelated site storage', () => {
    const auth = newStore();
    auth.acceptLogin(login);
    values.set('unrelated', 'keep');
    auth.clearSession();
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.user).toBeNull();
    expect([...values.entries()]).toEqual([['unrelated', 'keep']]);
  });
  it('a late profile response cannot restore a session after logout', async () => {
    values.set(authStorageKey, login.access_token);
    let finish: (value: Response) => void = () => {};
    fetcher.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const auth = newStore();
    const pending = auth.restoreSession();
    auth.clearSession();
    finish(response(profile));
    await pending;
    expect(auth.isAuthenticated).toBe(false);
    expect(values.has(authStorageKey)).toBe(false);
  });
  it('an old unauthorized request cannot clear a newer login', async () => {
    const auth = newStore();
    auth.acceptLogin(login);
    let finish: (value: Response) => void = () => {};
    fetcher.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const pending = auth.api.listClasses();
    auth.clearSession();
    auth.acceptLogin({ ...login, access_token: 'fixture-new-access' });
    finish(response(null, 401));
    await expect(pending).rejects.toThrow('登录状态已变化');
    expect(auth.isAuthenticated).toBe(true);
    expect(values.get(authStorageKey)).toBe('fixture-new-access');
  });
  it('reports storage errors without claiming that login was saved', async () => {
    storage.setItem.mockImplementation(() => { throw new Error('blocked'); });
    const auth = newStore();
    expect(() => auth.acceptLogin(login)).toThrow('无法保存登录状态');
    expect(auth.isAuthenticated).toBe(false);
    storage.getItem.mockImplementation(() => { throw new Error('blocked'); });
    await auth.restoreSession();
    expect(auth.storageError).toContain('无法读取');
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('still clears in-memory credentials if removing browser storage fails', () => {
    const auth = newStore();
    auth.acceptLogin(login);
    storage.removeItem.mockImplementation(() => { throw new Error('blocked'); });
    auth.clearSession();
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.storageError).toContain('未能清除');
  });
});
