import { ApiError, isRecord } from '@teacher-logbook/api-client';
import type { createApi, LoginResult } from '@teacher-logbook/api-client';
import { pages } from '@teacher-logbook/shared';
import { buildScanUrl } from './scan-login';

export const logbookAppKey = 'hope_teacher_logbook';
export const passportCallbackPath = '/auth/passport/callback';
export const passportStorageKey = 'teacher-logbook:passport-login';
export const isWechatBrowser = (agent: string) => /MicroMessenger/i.test(agent);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const secret = /^[A-Za-z0-9_-]{32,128}$/;
type Api = Pick<ReturnType<typeof createApi>, 'listScanApps' | 'createScanSession' | 'pollScanSession' | 'exchangeScanSession'>;
interface Context {
  transactionId: string; pollToken: string; state: string; expiresAt: number;
  origin: string; scanPageUrl: string; returnPath: string;
  phase: 'pending' | 'exchanging';
}
interface Options {
  api: Api; storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>; origin: string; scanPageUrl: string;
  navigate: (url: string) => void; accept: (login: LoginResult) => void;
  randomState: () => string;
}

export function safeWorkspacePath(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/workspace/') || /[\\\r\n]/.test(value)) return '/workspace/dashboard';
  const url = new URL(value, 'https://workspace.invalid');
  return url.origin === 'https://workspace.invalid' && pages.some(page => url.pathname === `/workspace/${page.id}`)
    ? url.pathname + url.search + url.hash : '/workspace/dashboard';
}

export function createPassportLogin(options: Options) {
  let revision = 0;
  let working = false;
  function read(): Context | null {
    try {
      const raw = options.storage.getItem(passportStorageKey);
      if (!raw) return null;
      const value: unknown = JSON.parse(raw);
      if (!isRecord(value) || !uuid.test(String(value.transactionId)) || !secret.test(String(value.pollToken)) ||
          !/^[a-f0-9]{48}$/.test(String(value.state)) || !Number.isFinite(value.expiresAt) ||
          Number(value.expiresAt) <= Date.now() || value.origin !== options.origin || value.scanPageUrl !== options.scanPageUrl ||
          !['pending', 'exchanging'].includes(String(value.phase)) || safeWorkspacePath(value.returnPath) !== value.returnPath) return null;
      return value as unknown as Context;
    } catch { throw new ApiError('浏览器无法读取登录状态，请允许站点存储后重新授权。'); }
  }
  function write(value: Context) {
    try { options.storage.setItem(passportStorageKey, JSON.stringify(value)); }
    catch { throw new ApiError('浏览器无法保存授权状态，请允许站点存储后重新授权。'); }
  }
  function clear() {
    try { options.storage.removeItem(passportStorageKey); }
    catch { throw new ApiError('浏览器无法清除授权状态，请允许站点存储后重新授权。'); }
  }
  function stop() { revision++; }
  async function start(returnPath: unknown, retry = false) {
    if (working) return;
    working = true;
    const current = ++revision;
    try {
      if (!retry && read()) throw new ApiError('上次授权尚未完成，请重试微信登录。');
      let state: string;
      try { state = options.randomState(); } catch { throw new ApiError('浏览器无法安全发起授权，请允许站点存储后重新授权。'); }
      if (!/^[a-f0-9]{48}$/.test(state)) throw new ApiError('浏览器无法安全发起授权，请允许站点存储后重新授权。');
      // Verify storage before creating a short-lived server transaction.
      const probe = passportStorageKey + ':check';
      try { options.storage.setItem(probe, state); options.storage.removeItem(probe); }
      catch { throw new ApiError('浏览器无法保存授权状态，请允许站点存储后重新授权。'); }
      buildScanUrl(options.scanPageUrl, 'configuration-check');
      const apps = await options.api.listScanApps();
      if (current !== revision) return;
      if (!apps.some(app => app.app_key === logbookAppKey)) throw new ApiError('当前台账尚未开放微信登录，请联系管理员。');
      const session = await options.api.createScanSession(logbookAppKey);
      if (current !== revision) return;
      const expiresAt = Date.parse(session.expires_at ?? '');
      if (session.status !== 'WAITING_SCAN' || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) throw new ApiError('授权会话已失效，请重试。');
      write({ transactionId: session.transaction_id, pollToken: session.poll_token, state, expiresAt,
        origin: options.origin, scanPageUrl: options.scanPageUrl, returnPath: safeWorkspacePath(returnPath), phase: 'pending' });
      const target = new URL(buildScanUrl(options.scanPageUrl, session.transaction_id));
      target.searchParams.set('app_key', logbookAppKey);
      const back = new URL(passportCallbackPath, options.origin);
      back.hash = new URLSearchParams({ transaction_id: session.transaction_id, state }).toString();
      target.searchParams.set('back', back.href);
      options.navigate(target.href);
    } finally { working = false; }
  }
  async function complete(params: URLSearchParams): Promise<string | undefined> {
    if (working) return;
    working = true;
    const current = ++revision;
    try {
      const context = read();
      if (!context || params.getAll('state').length !== 1 || params.getAll('transaction_id').length !== 1 ||
          params.get('state') !== context.state || params.get('transaction_id') !== context.transactionId) {
        throw new ApiError('授权回调无效或已过期，请重新登录。');
      }
      if (context.phase !== 'pending') throw new ApiError('本次登录已兑换或结果未确定，请重新发起登录。');
      const result = await options.api.pollScanSession(context.transactionId, context.pollToken);
      if (current !== revision) return;
      if (result.transaction_id !== context.transactionId || result.status !== 'CONFIRMED' || !result.exchange_code) {
        if (['EXPIRED', 'CANCELLED', 'CONSUMED'].includes(result.status)) clear();
        throw new ApiError('授权尚未完成或已失效，请重新发起登录。');
      }
      if (context.expiresAt <= Date.now()) { clear(); throw new ApiError('授权已过期，请重新登录。'); }
      write({ ...context, phase: 'exchanging' });
      const login = await options.api.exchangeScanSession(context.transactionId, result.exchange_code, context.pollToken);
      if (current !== revision) return;
      if (login.app_scope !== logbookAppKey) throw new ApiError('登录凭据所属应用不匹配，请重新登录。');
      options.accept(login);
      clear();
      return context.returnPath;
    } finally { working = false; }
  }
  return { start, complete, stop, clear };
}

export function browserPassportLogin(api: Api, scanPageUrl: string, accept: Options['accept']) {
  return createPassportLogin({ api, scanPageUrl, accept,
    // Storage getters can throw in restricted WebViews, so access them inside the operation.
    storage: { getItem: key => window.sessionStorage.getItem(key), setItem: (key, value) => window.sessionStorage.setItem(key, value),
      removeItem: key => window.sessionStorage.removeItem(key) },
    origin: window.location.origin, navigate: url => window.location.replace(url),
    randomState: () => Array.from(crypto.getRandomValues(new Uint8Array(24)), value => value.toString(16).padStart(2, '0')).join(''),
  });
}
