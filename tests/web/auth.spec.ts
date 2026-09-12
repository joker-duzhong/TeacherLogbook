import { expect, test } from '@playwright/test';
import type { BrowserContext, Page } from '@playwright/test';

const storageKey = 'teacher-logbook:access-token:/api/v1';
const transactionId = '00000000-0000-4000-8000-000000000001';
const user = { id: 'fixture-user', needs_phone_binding: false };
const login = { access_token: 'fixture-access', refresh_token: 'fixture-refresh', app_scope: 'hope_teacher_logbook', token_type: 'bearer', user };

async function mockAuth(context: BrowserContext) {
  const state = { profileStatus: 200, profiles: 0, classes: 0, scans: 0, exchanges: 0, unexpected: [] as string[] };
  await context.route('**/api/**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const reply = (data: unknown) => route.fulfill({ json: { code: 200, data } });
    if (path.endsWith('/auth/scan/apps')) return reply([{ app_key: 'hope_teacher_logbook', name: '工作台' }]);
    if (path.endsWith('/auth/scan/sessions')) {
      state.scans++;
      return reply({ transaction_id: transactionId, status: 'WAITING_SCAN', poll_token: 'fixture-poll-token-000000000000000000', poll_interval_seconds: 1, expires_at: new Date(Date.now() + 300000).toISOString() });
    }
    if (path.endsWith(`/auth/scan/sessions/${transactionId}`)) return reply({ transaction_id: transactionId, status: 'CONFIRMED', exchange_code: 'fixture-exchange-code-00000000000000' });
    if (path.endsWith('/auth/scan/exchange')) { state.exchanges++; return reply(login); }
    if (path.endsWith('/auth/phone/login')) return reply(login);
    if (path.endsWith('/auth/me')) {
      state.profiles++;
      expect(request.headers().authorization).toBe('Bearer fixture-access');
      if (state.profileStatus !== 200) return route.fulfill({ status: state.profileStatus, json: { detail: 'fixture failure' } });
      return reply(user);
    }
    if (path.endsWith('/classes')) { state.classes++; return reply([]); }
    if (path.endsWith('/preferences/ui')) return reply({ skin: 'mr' });
    state.unexpected.push(path);
    return route.fulfill({ status: 404, json: { detail: 'Unexpected test route' } });
  });
  return state;
}

async function phoneLogin(page: Page) {
  await page.goto('/login');
  await page.getByRole('tab', { name: '手机号验证码' }).click();
  await page.getByLabel('手机号', { exact: true }).fill('13800138000');
  await page.getByLabel('验证码', { exact: true }).fill('0012');
  await page.getByRole('button', { name: '登录工作台', exact: true }).click();
  await expect(page.getByRole('heading', { name: '还没有班级', exact: true })).toBeVisible();
}

test('scan login survives reload and reopening without storing user or refresh token', async ({ page, context }) => {
  const state = await mockAuth(context);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: '还没有班级', exact: true })).toBeVisible();
  expect(state.exchanges).toBe(1);
  expect(await page.evaluate(() => ({ keys: Object.keys(localStorage), session: sessionStorage.length }))).toEqual({ keys: [storageKey], session: 0 });
  await page.reload();
  await expect(page.getByRole('heading', { name: '还没有班级', exact: true })).toBeVisible();
  expect(state.profiles).toBe(1);
  expect(state.exchanges).toBe(1);
  expect(state.scans).toBe(1);
  await page.close();
  const reopened = await context.newPage();
  await reopened.goto('/login');
  await expect(reopened).toHaveURL(/\/workspace\/dashboard$/);
  await expect(reopened.getByRole('heading', { name: '还没有班级', exact: true })).toBeVisible();
  expect(state.profiles).toBe(2);
  expect(state.scans).toBe(1);
  expect(state.unexpected).toEqual([]);
  expect(errors).toEqual([]);
});

test('phone login restores its current route and logout removes persistent credentials', async ({ page, context }) => {
  const state = await mockAuth(context);
  await phoneLogin(page);
  await page.getByRole('button', { name: '账号与设置', exact: true }).click();
  await page.getByRole('menuitem', { name: '界面皮肤', exact: true }).click();
  await expect(page.locator('.theme-options')).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/\/workspace\/settings$/);
  await expect(page.locator('.theme-options')).toBeVisible();
  expect(state.profiles).toBe(1);
  await page.getByRole('button', { name: '账号与设置', exact: true }).click();
  await page.getByRole('menuitem', { name: '退出', exact: true }).click();
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  expect(await page.evaluate(key => localStorage.getItem(key) === null, storageKey)).toBe(true);
  await page.getByRole('tab', { name: '手机号验证码' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: '登录工作台', exact: true })).toBeVisible();
  expect(state.profiles).toBe(1);
});

test('expired cached tokens return to login without loading business data or renewing', async ({ page, context }) => {
  const state = await mockAuth(context);
  await phoneLogin(page);
  state.profileStatus = 401;
  const loadedClasses = state.classes;
  await page.reload();
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  await expect(page.getByRole('heading', { name: '登录工作台', exact: true })).toBeVisible();
  expect(state.classes).toBe(loadedClasses);
  expect(state.profiles).toBe(1);
  expect(await page.evaluate(key => localStorage.getItem(key) === null, storageKey)).toBe(true);
  expect(state.unexpected).toEqual([]);
});

test('temporary profile failure retains the token and offers verification retry', async ({ page, context }) => {
  const state = await mockAuth(context);
  await phoneLogin(page);
  state.profileStatus = 503;
  const loadedClasses = state.classes;
  const scans = state.scans;
  await page.reload();
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  await expect(page.locator('.login-session-error')).toContainText('服务暂时不可用');
  expect(await page.evaluate(key => Boolean(localStorage.getItem(key)), storageKey)).toBe(true);
  expect(state.classes).toBe(loadedClasses);
  expect(state.scans).toBe(scans);
  state.profileStatus = 200;
  await page.getByRole('button', { name: '重新验证登录', exact: true }).click();
  await expect(page.getByRole('heading', { name: '还没有班级', exact: true })).toBeVisible();
  expect(state.profiles).toBe(2);
  expect(state.unexpected).toEqual([]);
});
