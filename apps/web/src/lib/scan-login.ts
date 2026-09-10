import { readonly, shallowRef } from 'vue';
import { ApiError } from '@teacher-logbook/api-client';
import type { createApi, LoginResult, ScanSession, ScanStatus } from '@teacher-logbook/api-client';

type ScanApi = Pick<ReturnType<typeof createApi>, 'listScanApps' | 'createScanSession' | 'pollScanSession' | 'exchangeScanSession'>;
type Phase = ScanStatus | 'IDLE' | 'LOADING' | 'EXCHANGING' | 'SUCCESS' | 'ERROR';

interface ScanView {
  phase: Phase;
  image: string;
  expiresAt: number | null;
  error: string;
}

interface ScanLoginOptions {
  api: ScanApi;
  appKey: string;
  scanPageUrl: string;
  renderQr: (url: string) => Promise<string>;
  onLogin: (result: LoginResult) => void | Promise<void>;
}

export function resolveScanPageUrl(configuredUrl: string | undefined): string {
  return configuredUrl?.trim() || '';
}

export function buildScanUrl(pageUrl: string, transactionId: string): string {
  if (!pageUrl) throw new ApiError('尚未配置授权中心地址，请联系管理员。');
  const url = new URL(pageUrl);
  const environments = url.searchParams.getAll('env');
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.hash ||
      [...url.searchParams.keys()].some((key) => key !== 'env') ||
      environments.length > 1 || (environments.length === 1 && environments[0] !== 'local')) {
    throw new ApiError('扫码页面地址配置无效，请联系管理员。');
  }
  url.searchParams.delete('env');
  url.searchParams.set('transaction_id', transactionId);
  if (environments[0] === 'local') url.searchParams.set('env', 'local');
  return url.href;
}

export function createScanLogin(options: ScanLoginOptions) {
  const state = shallowRef<ScanView>({ phase: 'IDLE', image: '', expiresAt: null, error: '' });
  let generation = 0;
  let session: ScanSession | undefined;
  let pollTimer: ReturnType<typeof setTimeout> | undefined;
  let expiryTimer: ReturnType<typeof setTimeout> | undefined;

  function clearTimers() {
    clearTimeout(pollTimer);
    clearTimeout(expiryTimer);
    pollTimer = undefined;
    expiryTimer = undefined;
  }

  function stop() {
    generation += 1;
    clearTimers();
    session = undefined;
    state.value = { phase: 'IDLE', image: '', expiresAt: null, error: '' };
  }

  function finish(phase: Phase, error = '') {
    generation += 1;
    clearTimers();
    session = undefined;
    state.value = { phase, image: phase === 'SUCCESS' ? '' : state.value.image, expiresAt: null, error };
  }

  function fail(error: unknown) {
    finish('ERROR', error instanceof ApiError ? error.message : '扫码登录未完成，请刷新二维码重试。');
  }

  function scheduleExpiry(expiresAt: number | null, current: number) {
    clearTimeout(expiryTimer);
    state.value = { ...state.value, expiresAt };
    if (expiresAt === null) return;
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      finish('EXPIRED');
      return;
    }
    expiryTimer = setTimeout(() => {
      if (current === generation) scheduleExpiry(expiresAt, current);
    }, Math.min(remaining, 2147483647));
  }

  function schedulePoll(current: number) {
    if (!session || current !== generation) return;
    pollTimer = setTimeout(() => { void poll(current); }, (session.poll_interval_seconds ?? 2) * 1000);
  }

  async function poll(current: number) {
    const active = session;
    if (!active || current !== generation) return;
    try {
      const result = await options.api.pollScanSession(active.transaction_id, active.poll_token);
      if (current !== generation) return;
      if (result.status === 'CONFIRMED') {
        clearTimers();
        state.value = { phase: 'EXCHANGING', image: state.value.image, expiresAt: null, error: '' };
        if (!result.exchange_code) throw new ApiError('扫码凭据不完整，请刷新二维码。');
        const login = await options.api.exchangeScanSession(active.transaction_id, result.exchange_code, active.poll_token);
        if (current !== generation) return;
        session = undefined;
        await options.onLogin(login);
        if (current === generation) finish('SUCCESS');
        return;
      }
      if (['CANCELLED', 'EXPIRED', 'CONSUMED'].includes(result.status)) {
        finish(result.status);
        return;
      }
      state.value = { ...state.value, phase: result.status };
      if (result.expires_at !== undefined) scheduleExpiry(result.expires_at ? Date.parse(result.expires_at) : null, current);
      schedulePoll(current);
    } catch (error) {
      if (current === generation) fail(error);
    }
  }

  async function start() {
    const previousImage = state.value.image;
    stop();
    const current = generation;
    state.value = { phase: 'LOADING', image: previousImage, expiresAt: null, error: '' };
    try {
      buildScanUrl(options.scanPageUrl, 'configuration-check');
      const apps = await options.api.listScanApps();
      if (current !== generation) return;
      if (!apps.some((app) => app.app_key === options.appKey)) throw new ApiError('当前工作台尚未开放扫码登录，请使用手机号登录。');
      const created = await options.api.createScanSession(options.appKey);
      if (current !== generation) return;
      if (created.status !== 'WAITING_SCAN') throw new ApiError('新二维码状态异常，请刷新后重试。');
      session = created;
      scheduleExpiry(created.expires_at ? Date.parse(created.expires_at) : null, current);
      if (current !== generation) return;
      const image = await options.renderQr(buildScanUrl(options.scanPageUrl, created.transaction_id));
      if (current !== generation) return;
      state.value = { ...state.value, phase: 'WAITING_SCAN', image };
      schedulePoll(current);
    } catch (error) {
      if (current === generation) fail(error);
    }
  }

  return { state: readonly(state), start, stop };
}
