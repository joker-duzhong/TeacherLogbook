import { expect, test } from '@playwright/test';
import type { BrowserContext, Route } from '@playwright/test';
import { existsSync } from 'node:fs';
import { resolve, sep } from 'node:path';

const passportDir = process.env.PASSPORT_TEST_DIR || resolve(process.cwd(), '../HopePassport');
const webDist = resolve(process.cwd(), 'apps/web/dist');
const passportDist = resolve(passportDir, 'dist');
const appKey = 'hope_teacher_logbook';
const transactionId = '00000000-0000-4000-8000-000000000099';
const pollToken = 'fixture-poll-token-000000000000000000';
const profile = { id: 'fixture-user', phone: '13800138000', needs_phone_binding: false, is_active: true };
const passportLogin = { access_token: 'fixture-passport', refresh_token: 'fixture-passport-refresh', token_type: 'bearer', app_scope: 'passport', user: profile };
const webLogin = { access_token: 'fixture-business', refresh_token: 'fixture-business-refresh', token_type: 'bearer', app_scope: appKey, user: profile };
test.use({ viewport: { width: 390, height: 844 }, userAgent: 'Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Mobile MicroMessenger/8.0' });

async function staticApp(route: Route, directory: string, base = '/') {
  const url = new URL(route.request().url());
  const relative = decodeURIComponent(url.pathname.slice(base.length));
  const path = resolve(directory, relative);
  if (!path.startsWith(directory + sep) && path !== directory) return route.abort();
  return route.fulfill({ path: existsSync(path) && relative.includes('.') ? path : resolve(directory, 'index.html') });
}

async function fixture(context: BrowserContext, production: boolean, phoneRequired = false) {
  const state = { status: 'WAITING_SCAN', creates: 0, confirmations: 0, exchanges: 0, identities: 0,
    failOAuth: false, failExchange: false, failCreate: false, wrongApp: false, apiOrigins: new Set<string>(), errors: [] as string[], urls: [] as string[] };
  await context.route('https://before.example.test/**', route => route.fulfill({ contentType: 'text/html', body: '<h1>Before login</h1>' }));
  if (production) {
    expect(existsSync(resolve(webDist, 'index.html')), 'Run npm run build:web first').toBe(true);
    expect(existsSync(resolve(passportDist, 'index.html')), 'Build HopePassport first').toBe(true);
    await context.route('https://nesttalk.lxyy.fun/**', route => staticApp(route, webDist));
    await context.route('https://tool.lxyy.fun/passport/**', route => staticApp(route, passportDist, '/passport/'));
  }
  context.on('page', page => page.on('pageerror', error => state.errors.push(error.message)));
  for (const page of context.pages()) page.on('pageerror', error => state.errors.push(error.message));
  context.on('request', request => {
    expect(request.url()).not.toContain(pollToken);
    expect(request.url()).not.toContain(webLogin.access_token);
    expect(request.url()).not.toContain(passportLogin.access_token);
    state.urls.push(request.url());
  });
  await context.route('https://open.weixin.qq.com/**', route => {
    const url = new URL(route.request().url());
    const callback = new URL(url.searchParams.get('redirect_uri')!);
    callback.searchParams.set('state', url.searchParams.get('state')!);
    callback.searchParams.set('code', 'fixture-wechat-code');
    return route.fulfill({ contentType: 'text/html', body: `<script>location.replace(${JSON.stringify(callback.href)})</script>` });
  });
  await context.route('**/api/v1/**', async route => {
    const request = route.request(); const url = new URL(request.url()); const path = url.pathname;
    const headers = { 'access-control-allow-origin': request.headers().origin || '*', 'access-control-allow-headers': 'authorization,content-type,x-scan-token', 'access-control-allow-methods': 'GET,POST,OPTIONS' };
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    const reply = (data: unknown, status = 200) => route.fulfill({ status, headers, json: { code: status, data } });
    if (path.endsWith('/auth/scan/apps')) return reply([{ app_key: appKey, name: '教师台账' }]);
    if (path.endsWith('/auth/scan/sessions')) {
      state.creates++; expect(request.postDataJSON()).toEqual({ app_key: appKey });
      if (state.failCreate) return reply(null, 503);
      return reply({ transaction_id: transactionId, status: 'WAITING_SCAN', poll_token: pollToken, expires_at: new Date(Date.now() + 300000).toISOString() });
    }
    const scanState = () => ({ transaction_id: transactionId, status: state.status,
      app: { app_key: state.wrongApp ? 'other_app' : appKey, name: '教师台账' }, expires_at: new Date(Date.now() + 300000).toISOString() });
    if (path.endsWith('/info')) return reply(scanState());
    if (path.endsWith('/scanned')) { state.status = 'PENDING'; return reply(scanState()); }
    if (path.endsWith('/confirm')) {
      expect(request.headers().authorization).toBe('Bearer fixture-passport');
      state.confirmations++; state.status = 'CONFIRMED'; return reply(scanState());
    }
    if (path.endsWith(`/sessions/${transactionId}`)) {
      expect(request.headers()['x-scan-token']).toBe(pollToken);
      return reply({ ...scanState(), exchange_code: state.status === 'CONFIRMED' ? 'fixture-exchange-code-0000000000000000' : null });
    }
    if (path.endsWith('/exchange')) {
      state.exchanges++; expect(request.headers()['x-scan-token']).toBe(pollToken);
      if (state.failExchange) return route.abort('failed');
      state.status = 'CONSUMED'; return reply(webLogin);
    }
    if (path.endsWith('/auth/wechat/url')) {
      state.apiOrigins.add(url.origin);
      if (state.failOAuth) return reply(null, 503);
      const target = new URL('https://open.weixin.qq.com/connect/oauth2/authorize');
      for (const key of ['appid', 'state', 'redirect_uri', 'scope']) target.searchParams.set(key, url.searchParams.get(key)!);
      return reply({ auth_url: target.href });
    }
    if (path.endsWith('/auth/identity/h5')) {
      state.identities++; expect(request.postDataJSON().transaction_id).toBe(transactionId);
      return reply(phoneRequired ? { status: 'PHONE_REQUIRED', login_ticket: 'fixture-identity-ticket-0000000000000000', expires_at: new Date(Date.now() + 600000).toISOString() } : { ...passportLogin, status: 'AUTHENTICATED' });
    }
    if (path.endsWith('/auth/identity/complete/sms')) return reply(passportLogin);
    if (path.endsWith('/auth/phone/login')) {
      if (request.postDataJSON().app_key) { expect(request.postDataJSON().app_key).toBe(appKey); return reply(webLogin); }
      return reply(passportLogin);
    }
    if (path.endsWith('/auth/me')) return reply(profile);
    if (path.endsWith('/classes')) return reply([]);
    if (path.endsWith('/preferences/ui')) return reply({ skin: 'mint' });
    return reply(null, 404);
  });
  return state;
}

for (const production of [false, true]) {
  test(`${production ? 'production' : 'local'}: WeChat OAuth returns to the original page after explicit confirmation`, async ({ page, context }) => {
    const state = await fixture(context, production);
    const origin = production ? 'https://nesttalk.lxyy.fun' : 'http://127.0.0.1:5174';
    if (production) await context.addInitScript(() => { if (location.hostname === 'tool.lxyy.fun') localStorage.setItem('hope-passport:environment', 'local'); });
    await page.goto('https://before.example.test/start');
    await page.goto(origin + '/workspace/classes');
    await expect(page.getByRole('heading', { name: '确认登录并返回应用' })).toBeVisible();
    expect(state.confirmations).toBe(0); expect(state.exchanges).toBe(0);
    await page.reload();
    await expect(page.getByRole('heading', { name: '确认登录并返回应用' })).toBeVisible();
    await page.getByRole('checkbox').uncheck();
    await expect(page.getByRole('button', { name: '确认登录', exact: true })).toBeDisabled();
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: '确认登录', exact: true }).click();
    await expect(page).toHaveURL(origin + '/workspace/classes');
    await expect(page.getByRole('button', { name: '创建班级', exact: true })).toBeVisible();
    expect(state.confirmations).toBe(1); expect(state.exchanges).toBe(1);
    expect([...state.apiOrigins]).toEqual([production ? 'https://api.lxyy.fun' : 'http://192.168.31.93:8000']);
    expect(await page.evaluate(() => sessionStorage.getItem('teacher-logbook:passport-login'))).toBeNull();
    expect(await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith('teacher-logbook:access-token:')).map(key => localStorage.getItem(key)))).toEqual([webLogin.access_token]);
    await page.goBack();
    await expect(page).toHaveURL('https://before.example.test/start');
    await page.goForward();
    await expect(page).toHaveURL(origin + '/workspace/classes');
    await page.reload(); expect(state.exchanges).toBe(1);
    await page.getByRole('button', { name: '退出', exact: true }).click();
    await expect(page.getByRole('button', { name: '前往授权中心登录' })).toBeVisible();
    await expect(page.getByLabel('手机号', { exact: true })).toHaveCount(0);
    expect(state.creates).toBe(1);
    expect(state.errors).toEqual([]);
  });
}

test('first-time phone binding preserves the return context through OAuth and reload', async ({ page, context }) => {
  const state = await fixture(context, false, true);
  await page.goto('http://127.0.0.1:5174/workspace/classes');
  await expect(page.getByRole('heading', { name: '绑定手机号', exact: true })).toBeVisible();
  await page.reload();
  await page.getByLabel('手机号', { exact: true }).fill('13800138000');
  await page.getByLabel('短信验证码', { exact: true }).fill('0012');
  await page.getByRole('button', { name: '绑定并继续', exact: true }).click();
  await expect(page.getByRole('heading', { name: '确认登录并返回应用' })).toBeVisible();
  expect(state.confirmations).toBe(0);
  await page.getByRole('button', { name: '确认登录', exact: true }).click();
  await expect(page).toHaveURL('http://127.0.0.1:5174/workspace/classes');
  expect(state.exchanges).toBe(1); expect(state.identities).toBe(1); expect(state.errors).toEqual([]);
});

test('Passport OAuth failure offers SMS and still returns after confirmation', async ({ page, context }) => {
  const state = await fixture(context, false); state.failOAuth = true;
  await page.goto('http://127.0.0.1:5174/login');
  await expect(page.getByRole('heading', { name: '手机号登录', exact: true })).toBeVisible();
  await page.getByLabel('手机号', { exact: true }).fill('13800138000');
  await page.getByLabel('短信验证码', { exact: true }).fill('0012');
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await page.getByRole('button', { name: '确认登录', exact: true }).click();
  await expect(page).toHaveURL('http://127.0.0.1:5174/workspace/dashboard');
  expect(state.exchanges).toBe(1); expect(state.errors).toEqual([]);
});

test('untrusted return URLs and mismatched applications never reach confirmation', async ({ page, context }) => {
  const state = await fixture(context, false);
  const entry = new URL('http://192.168.31.93:5173/passport/scan');
  const params = { transaction_id: transactionId, app_key: appKey, env: 'local', back: 'https://evil.test/auth/passport/callback' };
  entry.search = new URLSearchParams(params).toString();
  await page.goto(entry.href);
  await expect(page.getByText('授权返回地址或环境无效，请重新打开应用登录。')).toBeVisible();
  expect(state.confirmations).toBe(0);
  state.wrongApp = true;
  entry.searchParams.set('back', 'http://127.0.0.1:5174/auth/passport/callback');
  await page.goto(entry.href);
  await expect(page.getByText('授权应用与返回地址不匹配，请重新登录。')).toBeVisible();
  expect(state.confirmations).toBe(0); expect(state.exchanges).toBe(0);
});

test('ambiguous exchange failure does not repeat exchange on callback reload', async ({ page, context }) => {
  const state = await fixture(context, false); state.failExchange = true;
  await page.goto('http://127.0.0.1:5174/login');
  await page.getByRole('button', { name: '确认登录', exact: true }).click();
  await expect(page.getByRole('heading', { name: '微信登录未完成' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: '微信登录未完成' })).toBeVisible();
  expect(state.exchanges).toBe(1);
  await page.getByRole('button', { name: '返回登录页', exact: true }).click();
  await expect(page.getByRole('button', { name: '前往授权中心登录' })).toBeVisible();
  await expect(page.getByLabel('手机号', { exact: true })).toHaveCount(0);
  expect(state.creates).toBe(1);
});

test('ordinary PC scan confirmation keeps the Passport result page', async ({ page, context }) => {
  const state = await fixture(context, false);
  await page.goto(`http://192.168.31.93:5173/passport/scan?env=local&transaction_id=${transactionId}`);
  await expect(page.getByRole('heading', { name: '确认在电脑上登录' })).toBeVisible();
  expect(state.confirmations).toBe(0);
  await page.getByRole('button', { name: '确认登录', exact: true }).click();
  await expect(page.getByRole('heading', { name: '已确认登录' })).toBeVisible();
  await expect(page.getByText('请回到电脑继续')).toBeVisible();
  await expect(page).toHaveURL(/\/passport\/result\?/);
  expect(state.confirmations).toBe(1); expect(state.exchanges).toBe(0);
  expect(state.errors).toEqual([]);
});

test('Wechat failures and legacy phone links only offer Passport login', async ({ page, context }) => {
  const state = await fixture(context, false); state.failCreate = true;
  await page.goto('http://127.0.0.1:5174/login?method=phone');
  await expect(page.getByRole('button', { name: '重新授权', exact: true })).toBeVisible();
  await expect(page.getByLabel('手机号', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '获取验证码' })).toHaveCount(0);
  expect(state.urls.some(url => url.includes('/auth/phone/'))).toBe(false);
  state.failCreate = false;
  await page.getByRole('button', { name: '重新授权', exact: true }).click();
  await page.getByRole('button', { name: '确认登录', exact: true }).click();
  await expect(page).toHaveURL('http://127.0.0.1:5174/workspace/dashboard');
  expect(state.exchanges).toBe(1); expect(state.errors).toEqual([]);
});

test('Passport returns the supplied path, query and fragment on an allowed subdomain', async ({ page, context }) => {
  const state = await fixture(context, false);
  const back = 'https://nested.new.lxyy.fun:8443/custom/finish?next=%2Fhome%3Ftab%3D1#opaque=state';
  await context.route('https://nested.new.lxyy.fun:8443/**', route => route.fulfill({ contentType: 'text/html', body: '<h1>Returned</h1>' }));
  const entry = new URL('http://192.168.31.93:5173/passport/scan');
  entry.search = new URLSearchParams({ transaction_id: transactionId, app_key: appKey, env: 'local', back }).toString();
  await page.goto('https://before.example.test/start');
  await page.goto(entry.href);
  await page.getByRole('button', { name: '确认登录', exact: true }).click();
  await expect(page).toHaveURL(back);
  await expect(page.getByRole('heading', { name: 'Returned' })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL('https://before.example.test/start');
  expect(state.confirmations).toBe(1); expect(state.exchanges).toBe(0);
  expect(state.errors).toEqual([]);
});
