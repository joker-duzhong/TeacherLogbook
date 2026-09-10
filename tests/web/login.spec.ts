import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import QRCode from 'qrcode';
import { themes } from '../../packages/shared/src/themes';

async function mockScan(page: Page) {
  const state = { sessions: 0, polls: 0, appRequests: 0, phase: 'PENDING', errors: [] as string[], unexpected: [] as string[] };
  page.on('pageerror', error => state.errors.push(error.message));
  await page.route('**/api/**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const reply = (data: unknown) => route.fulfill({ json: { code: 200, data } });
    if (path.endsWith('/auth/scan/apps')) {
      state.appRequests++;
      return reply([{ app_key: 'hope_teacher_logbook', name: '教师台账' }]);
    }
    if (path.endsWith('/auth/scan/sessions') && request.method() === 'POST') {
      state.sessions++;
      return reply({ transaction_id: `00000000-0000-4000-8000-${String(state.sessions).padStart(12, '0')}`, status: 'WAITING_SCAN', poll_token: 'fixture-poll-token-000000000000000000', poll_interval_seconds: 1, expires_at: new Date(Date.now() + 300000).toISOString() });
    }
    if (/\/auth\/scan\/sessions\/[^/]+$/.test(path)) {
      state.polls++;
      return reply({ transaction_id: path.split('/').at(-1), status: state.phase });
    }
    state.unexpected.push(path);
    return route.fulfill({ status: 404, json: { detail: 'Unexpected test request' } });
  });
  await page.goto('/login');
  if (page.viewportSize()!.width <= 720) await expect(page.getByLabel('手机号', { exact: true })).toBeVisible();
  else await expect(page.locator('.qr-overlay-title')).toHaveText('已扫码，请在手机上确认');
  return state;
}

test('pending scan uses smaller text and can refresh without changing QR dimensions', async ({ page }) => {
  const state = await mockScan(page);
  const title = page.locator('.qr-overlay-title');
  await expect(title).toHaveCSS('font-size', '14px');
  const refresh = page.getByRole('button', { name: '刷新二维码', exact: true });
  await expect(refresh).toBeVisible();
  const titleBox = await title.boundingBox();
  const refreshBox = await refresh.boundingBox();
  expect(refreshBox!.y).toBeGreaterThan(titleBox!.y + titleBox!.height);
  const originalImage = await page.locator('.qr-image-area img').getAttribute('src');
  const expectedImage = await QRCode.toDataURL('http://192.168.31.93:5173/passport/scan?transaction_id=00000000-0000-4000-8000-000000000001&env=local', {
    width: 240, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#000000', light: '#ffffff' },
  });
  expect(await page.locator('.qr-image-area img').evaluate(async (element, expectedSource) => {
    const actual = element as HTMLImageElement;
    const expected = new Image();
    expected.src = expectedSource;
    await expected.decode();
    if (actual.naturalWidth !== expected.naturalWidth || actual.naturalHeight !== expected.naturalHeight) return false;
    function pixels(image: HTMLImageElement) {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, canvas.width, canvas.height).data;
    }
    const expectedPixels = pixels(expected);
    return pixels(actual).every((value, index) => value === expectedPixels[index]);
  }, expectedImage)).toBe(true);
  const originalSize = await page.locator('.qr-image-area').boundingBox();
  state.phase = 'WAITING_SCAN';
  await refresh.click();
  await expect(page.locator('.qr-overlay')).toHaveCount(0);
  expect(state.sessions).toBe(2);
  expect(await page.locator('.qr-image-area img').getAttribute('src')).not.toBe(originalImage);
  expect(await page.locator('.qr-image-area').boundingBox()).toEqual(originalSize);
  state.phase = 'EXPIRED';
  await expect(title).toHaveText('二维码已过期');
  await expect(title).toHaveCSS('font-size', '16px');
  await expect(refresh).toBeVisible();
  expect(state.errors).toEqual([]);
  expect(state.unexpected).toEqual([]);
});

for (const width of [1440, 320]) {
  test(`login theme menu works at ${width}px without recreating scans or persisting data`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    const state = await mockScan(page);
    const mobile = width <= 720;
    const originalImage = mobile ? null : await page.locator('.qr-image-area img').getAttribute('src');
    for (const theme of themes) {
      const trigger = page.getByRole('button', { name: '切换主题', exact: true });
      await trigger.click();
      const menu = page.getByRole('group', { name: '登录页主题' });
      await expect(menu).toBeVisible();
      const menuBox = await menu.boundingBox();
      expect(menuBox!.x).toBeGreaterThanOrEqual(0);
      expect(menuBox!.x + menuBox!.width).toBeLessThanOrEqual(width);
      await menu.getByRole('button', { name: theme.name, exact: true }).click();
      await expect(page.locator('#login-theme-options')).not.toBeVisible();
      await expect(page.locator('.login-page')).toHaveAttribute('data-theme', theme.id);
      const colors = await page.locator('.login-page').evaluate(element => ({ background: getComputedStyle(element).backgroundColor, brand: getComputedStyle(element).getPropertyValue('--brand').trim() }));
      expect(colors.brand).toBe(theme.brand);
      expect(colors.background).not.toBe('rgba(0, 0, 0, 0)');
      const primaryColor = `rgb(${[1, 3, 5].map(offset => Number.parseInt(theme.brand.slice(offset, offset + 2), 16)).join(', ')})`;
      await expect(page.getByRole('button', { name: mobile ? '登录工作台' : '刷新二维码', exact: true })).toHaveCSS('background-color', primaryColor);
      if (mobile) {
        await expect(page.locator('.qr-image-area')).toHaveCount(0);
        await expect(page.getByRole('tablist')).toHaveCount(0);
      } else expect(await page.locator('.qr-image-area img').getAttribute('src')).toBe(originalImage);
      expect(state.sessions).toBe(mobile ? 0 : 1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`login-${theme.id}.png`), fullPage: true, animations: 'disabled' });
    }
    if (!mobile) await page.getByRole('tab', { name: '手机号验证码' }).click();
    await page.getByLabel('手机号', { exact: true }).fill('13800138000');
    await page.getByLabel('验证码', { exact: true }).fill('0012');
    await page.getByRole('button', { name: '切换主题', exact: true }).click();
    await page.getByRole('group', { name: '登录页主题' }).getByRole('button', { name: 'MR 工作室', exact: true }).click();
    await expect(page.getByLabel('手机号', { exact: true })).toHaveValue('13800138000');
    await expect(page.getByLabel('验证码', { exact: true })).toHaveValue('0012');
    expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
    expect(state.errors).toEqual([]);
    expect(state.unexpected).toEqual([]);
  });
}

test('720px login never creates or polls a scan session', async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 900 });
  const state = await mockScan(page);
  await expect(page.getByRole('tablist')).toHaveCount(0);
  await expect(page.locator('.wechat-login')).toHaveCount(0);
  await page.waitForTimeout(2200);
  expect({ apps: state.appRequests, sessions: state.sessions, polls: state.polls }).toEqual({ apps: 0, sessions: 0, polls: 0 });
  expect(state.unexpected).toEqual([]);
});

test('resizing to mobile stops polling and preserves phone inputs when returning to desktop', async ({ page }) => {
  await page.setViewportSize({ width: 721, height: 900 });
  const state = await mockScan(page);
  await expect(page.getByRole('tab', { name: '微信扫码' })).toBeVisible();
  await page.setViewportSize({ width: 720, height: 900 });
  await expect(page.locator('.wechat-login')).toHaveCount(0);
  await expect(page.getByRole('tablist')).toHaveCount(0);
  const polls = state.polls;
  await page.waitForTimeout(2200);
  expect(state.polls).toBe(polls);
  await page.getByLabel('手机号', { exact: true }).fill('13800138000');
  await page.getByLabel('验证码', { exact: true }).fill('0012');
  await page.setViewportSize({ width: 721, height: 900 });
  await expect(page.getByRole('tab', { name: '微信扫码' })).toBeVisible();
  await expect(page.getByLabel('手机号', { exact: true })).toHaveValue('13800138000');
  await expect(page.getByLabel('验证码', { exact: true })).toHaveValue('0012');
  expect(state.sessions).toBe(1);
  await page.getByRole('tab', { name: '微信扫码' }).click();
  await expect(page.locator('.qr-overlay-title')).toHaveText('已扫码，请在手机上确认');
  expect(state.sessions).toBe(2);
  expect(state.errors).toEqual([]);
  expect(state.unexpected).toEqual([]);
});
