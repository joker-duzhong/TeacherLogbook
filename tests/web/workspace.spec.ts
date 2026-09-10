import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { modules, pages, validateRecord } from '../../packages/shared/src/catalog';

const classId = '00000000-0000-4000-8000-000000000010';
const studentId = '00000000-0000-4000-8000-000000000011';
const timestamps = { createdAt: '2026-09-09T00:00:00Z', updatedAt: '2026-09-09T00:00:00Z' };
type Row = Record<string, string | number | null> & { id: string };

async function fixture(page: Page, empty = false) {
  const state = {
    rows: {} as Record<string, Row[]>, skin: 'mr', expired: false, errors: [] as string[],
    writes: [] as Array<{ method: string; path: string; body: unknown; version?: string }>,
    classes: [{ id: classId, name: '高一（1）班', timezone: 'Asia/Shanghai', ...timestamps }],
    seat: { layout: { rows: 4, columnGroups: [2, 2, 2], columns: 6 }, assignments: [] as Array<{ studentId: string; row: number; column: number }>, version: 1, updatedAt: timestamps.updatedAt },
  };
  if (empty) state.classes = [];
  for (const module of modules) {
    const row: Row = { id: module.resource === 'students' ? studentId : module.resource + '-id', classId, ...timestamps };
    for (const field of module.fields) row[field.key] = field.kind === 'student' ? studentId : field.kind === 'role' ? 'committee-roles-id' : field.options?.[0] ?? (field.kind === 'date' ? '2026-09-09' : field.kind === 'time' ? field.key === 'startTime' ? '08:00' : '08:45' : field.kind === 'number' ? 2 : field.kind === 'money' ? '12.50' : field.kind === 'url' ? 'https://example.test/' : field.label + '示例');
    state.rows[module.resource] = [row];
  }
  page.on('pageerror', error => state.errors.push(error.message));
  await page.route('**/api/**', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();
    const reply = (data: unknown, status = 200) => route.fulfill({ status, json: { code: 200, data } });
    if (path.endsWith('/auth/scan/apps')) return reply([]);
    if (path.endsWith('/auth/phone/login')) return reply({ access_token: 'fixture-access', refresh_token: 'fixture-refresh', app_scope: 'hope_teacher_logbook', token_type: 'bearer', user: { id: studentId, needs_phone_binding: false } });
    if (state.expired) return route.fulfill({ status: 401, json: { detail: 'expired' } });
    if (path.endsWith('/auth/me')) return reply({ id: studentId, needs_phone_binding: false });
    if (path.endsWith('/preferences/ui')) {
      if (method === 'POST') state.skin = request.postDataJSON().skin;
      return reply({ skin: state.skin });
    }
    if (path.endsWith('/classes')) {
      if (method === 'POST') {
        state.writes.push({ method, path, body: request.postDataJSON() });
        state.classes.push({ id: `new-class-${state.classes.length}`, ...request.postDataJSON(), ...timestamps });
      }
      return reply(method === 'GET' ? state.classes : state.classes.at(-1));
    }
    if (/\/classes\/[^/]+$/.test(path)) {
      const identifier = path.split('/').at(-1);
      const item = state.classes.find(item => item.id === identifier);
      state.writes.push({ method, path, body: method === 'POST' ? request.postDataJSON() : null });
      if (method === 'DELETE') { state.classes = state.classes.filter(item => item.id !== identifier); return route.fulfill({ status: 204 }); }
      if (item && method === 'POST') { Object.assign(item, request.postDataJSON()); return reply(item); }
      return route.fulfill({ status: 404, json: { detail: 'Unknown class' } });
    }
    if (path.endsWith('/dashboard')) return reply({ studentSummary: { total: state.rows.students.length, male: 1, female: 0 }, leaveToday: 1, unsubmittedHomework: 2, violationCount: 1, workRecordsThisMonth: 1, pendingTodoCount: 1, alertSummary: { emotion: 1, specialHealth: 0, dropoutRisk: 0, notReturned: 0, pending: 1 }, highRiskStudents: state.rows.alerts, upcomingTodos: state.rows.todos, latestExam: state.rows.exams[0], recentWorkRecords: state.rows['work-records'] });
    if (path.includes('/seat-board')) {
      if (method === 'GET') return reply(state.seat);
      const version = request.headers()['if-match'];
      expect(version).toBe(`"seat-board-${state.seat.version}"`);
      const body = method === 'PUT' ? request.postDataJSON() : null;
      state.writes.push({ path, method, body, version });
      if (path.endsWith('/layout')) state.seat.layout = { rows: body.rows, columnGroups: body.columnGroups, columns: body.columnGroups.reduce((total: number, value: number) => total + value, 0) };
      else if (method === 'PUT') {
        const identifier = path.split('/').at(-1)!;
        state.seat.assignments = state.seat.assignments.filter(item => item.studentId !== identifier);
        state.seat.assignments.push({ studentId: identifier, row: body.row, column: body.column });
      } else state.seat.assignments = path.endsWith('/assignments') ? [] : state.seat.assignments.filter(item => item.studentId !== path.split('/').at(-1));
      state.seat.version++;
      return reply({ version: state.seat.version });
    }
    if (path.endsWith('/students/export')) return route.fulfill({ contentType: 'text/csv', body: 'name,gender,contact\r\n学生,男,\r\n' });
    if (method === 'GET' && path.endsWith('/backup')) return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ schemaVersion: 1, resources: {} }) });
    if (/\/(students\/import|backup\/(validate|restore)|legacy-import)$/.test(path)) {
      const form = await new Request(request.url(), { method: 'POST', headers: request.headers(), body: request.postDataBuffer()! }).formData();
      expect(form.get('file')).toBeInstanceOf(File);
      const fields = Object.fromEntries([...form.entries()].filter(([key]) => key !== 'file'));
      state.writes.push({ method, path, body: fields });
      return reply(path.endsWith('/students/import') ? { totalRows: 1, created: 1, skipped: 0, failed: 0, errors: [] } : { valid: true, resourceCounts: { students: 1 } });
    }
    if (path.endsWith('/data/clear')) { state.writes.push({ method, path, body: request.postDataJSON() }); return reply(true); }
    const match = /\/classes\/[^/]+\/([^/]+)(?:\/([^/]+))?$/.exec(path);
    const resource = match?.[1];
    if (!resource || !state.rows[resource]) return route.fulfill({ status: 404, json: { detail: 'Unknown fixture route' } });
    const identifier = match?.[2];
    if (method === 'GET') {
      const keyword = url.searchParams.get('keyword');
      const rows = state.rows[resource].filter(row => (!keyword || Object.values(row).some(value => String(value).includes(keyword))) &&
        ['type', 'method', 'category', 'status'].every(key => !url.searchParams.get(key) || row[key] === url.searchParams.get(key)) &&
        (!url.searchParams.get('dateFrom') || String(row.date) >= url.searchParams.get('dateFrom')!) &&
        (!url.searchParams.get('dateTo') || String(row.date) <= url.searchParams.get('dateTo')!));
      const current = Number(url.searchParams.get('page') || 1);
      const size = Number(url.searchParams.get('pageSize') || 20);
      return reply({ items: rows.slice((current - 1) * size, current * size), total: rows.length, page: current, page_size: size, total_pages: Math.ceil(rows.length / size) });
    }
    const body = method === 'POST' ? request.postDataJSON() : null;
    state.writes.push({ method, path, body });
    if (method === 'DELETE') { state.rows[resource] = state.rows[resource].filter(row => row.id !== identifier); return route.fulfill({ status: 204 }); }
    const existing = state.rows[resource].find(row => row.id === identifier);
    const values = { ...existing, ...body };
    const errors = validateRecord(modules.find(module => module.resource === resource)!, values);
    if (Object.keys(errors).length) return route.fulfill({ status: 422, json: { detail: JSON.stringify(errors) } });
    if (existing) Object.assign(existing, body);
    else state.rows[resource].push({ id: `new-${state.rows[resource].length}`, classId, ...timestamps, ...body });
    return reply(existing ?? state.rows[resource].at(-1));
  });
  await page.goto('/login');
  if (page.viewportSize()!.width > 720) await page.getByRole('tab', { name: '手机号验证码' }).click();
  await page.getByLabel('手机号', { exact: true }).fill('13800138000');
  await page.getByLabel('验证码', { exact: true }).fill('0012');
  await page.getByRole('button', { name: '登录工作台', exact: true }).click();
  await expect(page.locator('.business-topbar h1')).toHaveText('班级总览');
  return state;
}

async function navigate(page: Page, id: string) {
  const menu = page.getByRole('button', { name: '展开导航', exact: true });
  if (await menu.isVisible()) await menu.click();
  await page.locator(`.business-nav nav a[href="/workspace/${id}"]`).click();
  await expect(page.locator('.business-topbar h1')).toHaveText(pages.find(item => item.id === id)!.name);
  await expect(page.locator('.business-empty[role=status]')).toHaveCount(0);
}

test.describe('mobile navigation drawer', () => {
  test.use({ hasTouch: true });

  async function swipeUp(page: Page, x: number, height: number) {
    const session = await page.context().newCDPSession(page);
    const start = Math.floor(height * .8);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: start }] });
    for (let step = 1; step <= 8; step++) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: start - Math.floor(height * .55 * step / 8) }] });
      await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await session.detach();
  }

  for (const variant of [
    { width: 390, height: 844, legacy: false },
    { width: 320, height: 568, legacy: false },
    { width: 640, height: 360, legacy: true },
  ]) {
    test(`outside tap and touch scrolling at ${variant.width}x${variant.height}, legacy CSS=${variant.legacy}`, async ({ page }, testInfo) => {
      await page.setViewportSize(variant);
      if (variant.legacy) {
        await page.route('**/src/views/workspace.css*', async route => {
          const response = await route.fetch();
          const body = (await response.text()).replace(/(?:min-|max-)?height\s*:\s*100dvh\s*;?/g, '').replace(/inset\s*:\s*0\s*;?/g, '');
          await route.fulfill({ response, body });
        });
      }
      const state = await fixture(page);
      const toggle = page.getByRole('button', { name: '展开导航', exact: true });
      const drawer = page.locator('.business-nav');
      await toggle.tap();
      const right = variant.width - 20;
      expect(await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.classList.contains('nav-backdrop'), { x: right, y: variant.height / 2 })).toBe(true);
      expect(await drawer.evaluate(element => element.scrollHeight > element.clientHeight && element.clientHeight <= innerHeight)).toBe(true);
      await swipeUp(page, 120, variant.height);
      await expect.poll(() => drawer.evaluate(element => element.scrollTop)).toBeGreaterThan(50);
      await swipeUp(page, right, variant.height);
      expect(await page.evaluate(() => scrollY)).toBe(0);
      await page.screenshot({ path: testInfo.outputPath('drawer.png') });
      await page.touchscreen.tap(right, Math.floor(variant.height / 2));
      await expect(drawer).not.toHaveClass(/open/);
      await expect(page.locator('.nav-backdrop')).toHaveCount(0);
      expect(await page.evaluate(() => document.body.style.position)).not.toBe('fixed');

      await toggle.tap();
      const lastLink = drawer.locator('nav a').last();
      for (let attempt = 0; attempt < 12; attempt++) {
        const bounds = await lastLink.boundingBox();
        if (bounds && bounds.y >= 0 && bounds.y + bounds.height < variant.height) break;
        await swipeUp(page, 120, variant.height);
      }
      await expect(lastLink).toBeInViewport();
      await lastLink.tap();
      await expect(drawer).not.toHaveClass(/open/);
      expect(await page.evaluate(() => document.body.style.position)).not.toBe('fixed');
      expect(state.errors).toEqual([]);
    });
  }

  test('restores page scroll on close and releases the lock on desktop resize and logout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 568 });
    await fixture(page);
    await page.evaluate(() => scrollTo(0, 100));
    const before = await page.evaluate(() => scrollY);
    // Keep the original scroll position: tapping a scrolled-out toggle would scroll it into view.
    await page.getByRole('button', { name: '展开导航', exact: true }).dispatchEvent('click');
    await expect.poll(() => page.evaluate(() => document.body.style.position)).toBe('fixed');
    await page.touchscreen.tap(370, 300);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(before);
    await page.getByRole('button', { name: '展开导航', exact: true }).dispatchEvent('click');
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator('.nav-backdrop')).toHaveCount(0);
    expect(await page.evaluate(() => document.body.style.position)).not.toBe('fixed');
    await page.setViewportSize({ width: 390, height: 568 });
    await page.getByRole('button', { name: '展开导航', exact: true }).tap();
    await page.getByRole('button', { name: '退出', exact: true }).dispatchEvent('click');
    await expect(page).toHaveURL(/\/login/);
    expect(await page.evaluate(() => document.body.style.position)).not.toBe('fixed');
  });
});

test('desktop: every migrated page and all four skins render', async ({ page }, testInfo) => {
  const state = await fixture(page);
  for (const entry of pages) {
    await navigate(page, entry.id);
    await expect(page.locator('.el-alert--error')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  for (const theme of [{ id: 'mr', name: 'MR 工作室' }, { id: 'mint', name: '浅薄荷绿' }, { id: 'ngrok', name: 'ngrok' }, { id: 'apple', name: 'Apple' }]) {
    await page.locator('.theme-options button').filter({ hasText: theme.name }).click();
    await expect(page.locator('.business-app')).toHaveAttribute('data-theme', theme.id);
    expect(state.skin).toBe(theme.id);
    await page.screenshot({ path: testInfo.outputPath(`${theme.id}.png`) });
  }
  expect(state.errors).toEqual([]);
});

test('mobile: all pages fit at 390px and core screens fit at 320px', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const state = await fixture(page);
  for (const entry of pages) {
    await navigate(page, entry.id);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), entry.id).toBe(true);
    await expect(page.locator('.el-alert--error')).toHaveCount(0);
  }
  await page.setViewportSize({ width: 320, height: 740 });
  for (const id of ['dashboard', 'students', 'seats', 'settings', 'classes', 'data']) {
    await navigate(page, id);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), id).toBe(true);
  }
  await navigate(page, 'dashboard');
  await page.screenshot({ path: testInfo.outputPath('mobile.png'), fullPage: true });
  expect(state.errors).toEqual([]);
});

test('all 19 resource forms create, edit and delete', async ({ page }) => {
  const state = await fixture(page);
  for (const module of modules) {
    const entry = pages.find(item => item.resource === module.resource && item.mode !== 'import')!;
    await navigate(page, entry.id);
    await page.getByRole('button', { name: '新增', exact: true }).click();
    for (const [index, field] of module.fields.entries()) {
      const item = page.locator('.el-dialog .el-form-item').nth(index);
      if (['student', 'role'].includes(field.kind)) {
        const control = item.getByRole('combobox');
        await control.click();
        await control.press('ArrowDown');
        await control.press('Enter');
      } else if (field.kind !== 'select') {
        await item.locator('input,textarea').fill(field.kind === 'date' ? '2026-09-09' : field.kind === 'time' ? field.key === 'startTime' ? '08:00' : '08:45' : field.kind === 'money' ? '2.50' : field.kind === 'number' ? '2' : field.kind === 'url' ? 'https://example.test/' : '回归' + field.label);
      }
    }
    await page.getByRole('button', { name: '保存', exact: true }).click();
    await expect(page.locator('.el-dialog')).not.toBeVisible();
    expect(state.rows[module.resource]).toHaveLength(2);
    if (module.resource === 'courses') await page.locator('.el-radio-button').filter({ hasText: '列表' }).click();
    await page.locator('.el-table__body tr').last().getByRole('button', { name: '编辑', exact: true }).click();
    const editableIndex = module.fields.findIndex(field => field.kind === 'text' || field.kind === 'date');
    if (editableIndex >= 0) {
      const field = module.fields[editableIndex];
      await page.locator('.el-dialog .el-form-item').nth(editableIndex).locator('input').fill(field.kind === 'date' ? '2026-09-10' : '已修改记录');
    }
    await page.getByRole('button', { name: '保存', exact: true }).click();
    await expect(page.locator('.el-dialog')).not.toBeVisible();
    await page.locator('.el-table__body tr').last().getByRole('button', { name: '删除', exact: true }).click();
    await page.locator('.el-message-box').getByRole('button', { name: '确定', exact: true }).click();
    await expect(page.locator('.el-table__body tr')).toHaveCount(1);
    expect(state.rows[module.resource]).toHaveLength(1);
  }
  expect(state.errors).toEqual([]);
});

test('seat placement, move and removal preserve version headers', async ({ page }) => {
  const state = await fixture(page);
  await navigate(page, 'seats');
  await page.locator('.seat-students button').first().click();
  await page.getByRole('gridcell', { name: '1行1列 空座位', exact: true }).click();
  await page.getByRole('gridcell', { name: '1行1列 姓名示例', exact: true }).click();
  await page.getByRole('gridcell', { name: '2行2列 空座位', exact: true }).click();
  await page.getByRole('gridcell', { name: '2行2列 姓名示例', exact: true }).click();
  await page.getByRole('button', { name: '移回未安排', exact: true }).click();
  await expect(page.locator('.seat-students button')).toHaveCount(1);
  expect(state.writes.map(write => write.version)).toEqual(['"seat-board-1"', '"seat-board-2"', '"seat-board-3"']);
});

test('file import, migration, backup and confirmed restore use multipart', async ({ page }) => {
  const state = await fixture(page);
  await navigate(page, 'data');
  const csv = { name: 'students.csv', mimeType: 'text/csv', buffer: Buffer.from('name,gender,contact\r\n学生,男,\r\n', 'utf8') };
  await page.locator('input[type=file]').nth(0).setInputFiles(csv);
  await page.getByRole('button', { name: '预检查', exact: true }).click();
  await expect(page.locator('.operation-result')).toContainText('totalRows');
  await page.getByRole('button', { name: '导入学生', exact: true }).click();
  await expect(page.locator('.operation-result')).toContainText('created');
  await page.locator('input[type=file]').nth(1).setInputFiles({ name: 'legacy.json', mimeType: 'application/json', buffer: Buffer.from('{"students":[]}', 'utf8') });
  await page.getByRole('button', { name: '检查旧数据', exact: true }).click();
  await page.getByRole('button', { name: '迁入当前空班级', exact: true }).click();
  await page.locator('.el-message-box').getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.locator('.operation-result')).toContainText('valid');
  await page.locator('input[type=file]').nth(2).setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from('{"schemaVersion":1,"resources":{}}', 'utf8') });
  await page.getByRole('button', { name: '校验备份', exact: true }).click();
  await page.getByRole('button', { name: '确认恢复', exact: true }).click();
  await page.locator('.el-message-box input').fill('高一（1）班');
  await page.locator('.el-message-box').getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.getByRole('button', { name: '确认恢复', exact: true })).toBeDisabled();
  expect(state.writes.some(write => write.path.endsWith('/backup/restore') && (write.body as Record<string, string>).confirmation === 'RESTORE_CLASS_DATA')).toBe(true);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载完整备份', exact: true }).click();
  expect((await download).suggestedFilename()).toBe('teacher-logbook-backup.json');
  expect(state.errors).toEqual([]);
});

test('expired sessions leave the workspace and no business data is persisted', async ({ page }) => {
  const state = await fixture(page);
  expect(await page.evaluate(() => ({ keys: Object.keys(localStorage), session: sessionStorage.length }))).toEqual({ keys: ['teacher-logbook:access-token:/api/v1'], session: 0 });
  state.expired = true;
  await page.getByRole('button', { name: '刷新', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator('.business-app')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});

test('classes: empty validation, create, rename, switch and delete the last class', async ({ page }) => {
  const state = await fixture(page, true);
  await page.getByRole('link', { name: '创建班级', exact: true }).click();
  const create = page.getByRole('button', { name: '创建班级', exact: true });
  await create.click();
  await expect(page.getByRole('alert')).toContainText('请输入班级名称');
  await page.getByLabel('新班级名称').fill('   ');
  await create.click();
  expect(state.writes).toHaveLength(0);
  await page.getByLabel('新班级名称').fill(' 测试一班 ');
  await create.click();
  await expect(page.locator('.business-account .el-select')).toContainText('测试一班');
  await expect(page.locator('.el-table__body tr')).toHaveCount(1);
  expect(state.classes[0].name).toBe('测试一班');
  await page.getByLabel('新班级名称').fill('测试二班');
  await create.click();
  await expect(page.locator('.business-account .el-select')).toContainText('测试二班');
  const first = page.locator('.el-table__body tr').filter({ hasText: '测试一班' });
  await first.getByRole('button', { name: '重命名', exact: true }).click();
  await page.locator('.el-message-box input').fill(' ');
  await page.locator('.el-message-box').getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.locator('.el-message-box')).toContainText('请输入班级名称');
  await page.locator('.el-message-box input').fill('新一班');
  await page.locator('.el-message-box').getByRole('button', { name: '确定', exact: true }).click();
  const renamed = page.locator('.el-table__body tr').filter({ hasText: '新一班' });
  await renamed.getByRole('button', { name: '切换', exact: true }).click();
  await expect(page.locator('.business-account .el-select')).toContainText('新一班');
  await renamed.getByRole('button', { name: '删除', exact: true }).click();
  await page.locator('.el-message-box').getByRole('button', { name: '取消', exact: true }).click();
  expect(state.classes).toHaveLength(2);
  for (const name of ['新一班', '测试二班']) {
    await page.locator('.el-table__body tr').filter({ hasText: name }).getByRole('button', { name: '删除', exact: true }).click();
    await page.locator('.el-message-box input').fill(name);
    await page.locator('.el-message-box').getByRole('button', { name: '确定', exact: true }).click();
    await expect(page.locator('.el-table__body tr').filter({ hasText: name })).toHaveCount(0);
  }
  expect(state.classes).toHaveLength(0);
  await navigate(page, 'dashboard');
  await expect(page.getByRole('heading', { name: '还没有班级' })).toBeVisible();
  expect(state.errors).toEqual([]);
});

test('classes: failed create keeps the name and pending submission cannot duplicate it', async ({ page }) => {
  const state = await fixture(page);
  let attempts = 0;
  let release: () => void = () => {};
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/teacher-logbook/classes', async route => {
    if (route.request().method() !== 'POST') return route.fallback();
    attempts++;
    if (attempts === 1) return route.fulfill({ status: 500, json: { detail: 'unavailable' } });
    await gate;
    return route.fallback();
  });
  await navigate(page, 'classes');
  await page.getByLabel('新班级名称').fill('重试班级');
  await page.getByRole('button', { name: '创建班级', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('服务暂时不可用');
  await expect(page.getByLabel('新班级名称')).toHaveValue('重试班级');
  await page.getByRole('button', { name: '创建班级', exact: true }).click();
  await expect(page.getByLabel('新班级名称')).toBeDisabled();
  await page.locator('form.business-toolbar').evaluate(form => {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  release();
  await expect(page.locator('.business-account .el-select')).toContainText('重试班级');
  expect(attempts).toBe(2);
  expect(state.classes.filter(item => item.name === '重试班级')).toHaveLength(1);
  expect(state.errors).toEqual([]);
});

test('files: invalid validation and failed rechecks never enable migration or restore', async ({ page }) => {
  const state = await fixture(page);
  let valid = false;
  let fail = false;
  await page.route(/\/(backup\/validate|legacy-import)$/, route => route.fulfill(fail
    ? { status: 500, json: { detail: 'unavailable' } }
    : { json: { code: 200, data: { valid, resourceCounts: {} } } }));
  await navigate(page, 'data');
  const file = { name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from('{}', 'utf8') };
  for (const [index, check, submit] of [[1, '检查旧数据', '迁入当前空班级'], [2, '校验备份', '确认恢复']] as const) {
    valid = false; fail = false;
    await page.locator('input[type=file]').nth(index).setInputFiles(file);
    await page.getByRole('button', { name: check, exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('文件未通过校验');
    await expect(page.getByRole('button', { name: submit, exact: true })).toBeDisabled();
    valid = true;
    await page.getByRole('button', { name: check, exact: true }).click();
    await expect(page.getByRole('button', { name: submit, exact: true })).toBeEnabled();
    fail = true;
    await page.getByRole('button', { name: check, exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('服务暂时不可用');
    await expect(page.getByRole('button', { name: submit, exact: true })).toBeDisabled();
  }
  expect(state.writes).toHaveLength(0);
  expect(state.errors).toEqual([]);
});

test('confirmation dialogs are discarded when browser back leaves their page', async ({ page }) => {
  const state = await fixture(page);
  for (const [id, action] of [['students', '删除'], ['seats', '清空座位'], ['data', '清空当前班级'], ['classes', '删除']]) {
    await navigate(page, id);
    await page.getByRole('button', { name: action, exact: true }).first().click();
    await expect(page.locator('.el-message-box')).toBeVisible();
    await page.goBack();
    await expect(page.locator('.el-message-box')).not.toBeVisible();
    await expect(page.locator('.business-topbar h1')).toHaveText('班级总览');
  }
  expect(state.writes).toHaveLength(0);
  expect(state.errors).toEqual([]);
});

test('seat layout reports validation and version conflicts inside its dialog', async ({ page }) => {
  const state = await fixture(page);
  let conflict = true;
  await page.route('**/seat-board/layout', route => conflict
    ? route.fulfill({ status: 412, json: {} }) : route.fallback());
  await navigate(page, 'seats');
  await page.getByRole('button', { name: '布局设置', exact: true }).click();
  await page.getByPlaceholder('2,2,2').fill('0');
  await page.getByRole('button', { name: '保存布局', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('每组 1–10 列');
  expect(state.writes).toHaveLength(0);
  await page.getByPlaceholder('2,2,2').fill('2,3');
  await page.getByRole('button', { name: '保存布局', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('座位已被其他设备修改');
  conflict = false;
  await page.getByRole('button', { name: '保存布局', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  expect(state.seat.layout.columnGroups).toEqual([2, 3]);
  expect(state.errors).toEqual([]);
});

test('records: pagination, search, category filters, validation and failed saves can recover', async ({ page }) => {
  const state = await fixture(page);
  state.rows.students = Array.from({ length: 25 }, (_, index) => ({ ...state.rows.students[0], id: `student-${index}`, name: `学生${index + 1}` }));
  await navigate(page, 'students');
  await expect(page.locator('.el-table__body tr')).toHaveCount(20);
  await page.locator('.el-pager').getByText('2', { exact: true }).click();
  await expect(page.locator('.el-table__body tr')).toHaveCount(5);
  await page.getByLabel('搜索记录').fill('学生25');
  await page.getByLabel('搜索记录').press('Enter');
  await expect(page.locator('.el-table__body tr')).toHaveCount(1);
  await expect(page.locator('.el-table__body tr')).toContainText('学生25');
  await page.getByRole('button', { name: '新增', exact: true }).click();
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('请填写姓名');
  await page.locator('.el-dialog input').first().fill('新学生');
  let fail = true;
  await page.route('**/students', route => route.request().method() === 'POST' && fail
    ? route.fulfill({ status: 422, json: { detail: [{ loc: ['body', 'name'], msg: '姓名不符合要求' }] } }) : route.fallback());
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('姓名不符合要求');
  fail = false;
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  expect(state.rows.students).toHaveLength(26);
  state.rows['finance-records'].push({ ...state.rows['finance-records'][0], id: 'expense', type: '支出', note: '支出测试' });
  await navigate(page, 'expenses');
  await expect(page.locator('.el-table__body tr')).toHaveCount(1);
  await expect(page.locator('.el-table__body tr')).toContainText('支出测试');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: '导出全部结果', exact: true }).click();
  expect((await download).suggestedFilename()).toBe('支出记录.csv');
  expect(state.errors).toEqual([]);
});

test('newer search results survive an older request completing last', async ({ page }) => {
  const state = await fixture(page);
  await navigate(page, 'students');
  let release: () => void = () => {};
  const gate = new Promise<void>(resolve => { release = resolve; });
  let started = false;
  await page.route('**/students?**', async route => {
    const keyword = new URL(route.request().url()).searchParams.get('keyword');
    if (keyword === '旧查询') { started = true; await gate; }
    if (!keyword) return route.fallback();
    return route.fulfill({ json: { code: 200, data: { items: [{ ...state.rows.students[0], name: keyword }], total: 1, page: 1, page_size: 20, total_pages: 1 } } });
  });
  await page.getByLabel('搜索记录').fill('旧查询');
  await page.getByLabel('搜索记录').press('Enter');
  await expect.poll(() => started).toBe(true);
  await page.getByLabel('搜索记录').fill('新查询');
  await page.getByLabel('搜索记录').press('Enter');
  await expect(page.locator('.el-table__body tr')).toContainText('新查询');
  const finished = page.waitForResponse(response => response.url().includes(encodeURIComponent('旧查询')));
  release();
  await finished;
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.el-table__body tr')).toContainText('新查询');
  expect(state.errors).toEqual([]);
});

test('dashboard: date changes ignore old responses and shortcuts open the correct forms', async ({ page }) => {
  const state = await fixture(page);
  let release: () => void = () => {};
  const gate = new Promise<void>(resolve => { release = resolve; });
  let started = false;
  await page.route('**/dashboard?**', async route => {
    const date = new URL(route.request().url()).searchParams.get('date');
    if (date === '2026-09-01') { started = true; await gate; }
    const total = date === '2026-09-01' ? 11 : 22;
    return route.fulfill({ json: { code: 200, data: {
      studentSummary: { total, male: total, female: 0 }, leaveToday: 0, unsubmittedHomework: 0,
      violationCount: 0, workRecordsThisMonth: 0, pendingTodoCount: 0,
      alertSummary: { emotion: 0, specialHealth: 0, dropoutRisk: 0, notReturned: 0, pending: 0 },
      highRiskStudents: [], upcomingTodos: [], latestExam: null, recentWorkRecords: [],
    } } });
  });
  const date = page.locator('.business-toolbar input');
  await date.fill('2026-09-01'); await date.press('Enter');
  await expect.poll(() => started).toBe(true);
  await date.fill('2026-09-02'); await date.press('Enter');
  await expect(page.locator('.metric-strip a').first()).toContainText('22');
  const finished = page.waitForResponse(response => response.url().includes('date=2026-09-01'));
  release(); await finished; await page.waitForLoadState('networkidle');
  await expect(page.locator('.metric-strip a').first()).toContainText('22');
  for (const [label, resource] of [['记请假', '请假管理'], ['记作业', '作业列表'], ['记违纪', '违纪记录'], ['记工作', '工作简报'], ['学生管理', '学生花名册']]) {
    await page.getByRole('link', { name: label, exact: true }).click();
    await expect(page.getByRole('dialog')).toContainText(resource);
    await page.getByRole('dialog').getByRole('button', { name: '取消', exact: true }).click();
    await navigate(page, 'dashboard');
  }
  expect(state.errors).toEqual([]);
});

test('record date filters can be cleared and reversed ranges report an error', async ({ page }) => {
  const state = await fixture(page);
  await navigate(page, 'leave');
  const from = page.getByPlaceholder('开始日期');
  const to = page.getByPlaceholder('结束日期');
  await from.fill('2026-09-10'); await from.press('Enter');
  await to.fill('2026-09-01'); await to.press('Enter');
  await page.getByRole('button', { name: '查询', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('开始日期不能晚于结束日期');
  await from.fill(''); await from.press('Enter');
  await to.fill(''); await to.press('Enter');
  const request = page.waitForRequest(request => request.url().includes('/leave-requests?'));
  await page.getByRole('button', { name: '查询', exact: true }).click();
  const url = new URL((await request).url());
  expect(url.searchParams.has('dateFrom')).toBe(false);
  expect(url.searchParams.has('dateTo')).toBe(false);
  await expect(page.locator('.el-table__body tr')).toHaveCount(1);
  await expect(page.getByRole('alert')).toHaveCount(0);
  expect(state.errors).toEqual([]);
});

test('todo completion and reopen lock pending writes and recover after failure', async ({ page }) => {
  const state = await fixture(page);
  await navigate(page, 'todos');
  let release: () => void = () => {};
  const gate = new Promise<void>(resolve => { release = resolve; });
  let fail = false;
  await page.route('**/todos/todos-id', async route => {
    if (fail) return route.fulfill({ status: 500, json: {} });
    await gate; return route.fallback();
  });
  const complete = page.getByRole('button', { name: '完成', exact: true });
  await complete.click();
  await expect(complete).toBeDisabled();
  await expect(page.getByRole('button', { name: '编辑', exact: true })).toBeDisabled();
  release();
  await expect(page.getByRole('button', { name: '重开', exact: true })).toBeEnabled();
  fail = true;
  await page.getByRole('button', { name: '重开', exact: true }).click();
  await expect(page.locator('.el-message--error')).toContainText('服务暂时不可用');
  expect(state.rows.todos[0].status).toBe('已完成');
  fail = false;
  await page.getByRole('button', { name: '重开', exact: true }).click();
  await expect(complete).toBeEnabled();
  expect(state.rows.todos[0].status).toBe('待完成');
  expect(state.writes).toHaveLength(2);
  expect(state.errors).toEqual([]);
});

test('class references can retry after creation without creating the class again', async ({ page }) => {
  const state = await fixture(page, true);
  let fail = true;
  await page.route('**/new-class-0/students?**', route => fail
    ? route.fulfill({ status: 500, json: {} }) : route.fallback());
  await page.getByRole('link', { name: '创建班级', exact: true }).click();
  await page.getByLabel('新班级名称').fill('新班级');
  await page.getByRole('button', { name: '创建班级', exact: true }).click();
  await expect(page.locator('.el-alert--error')).toContainText('服务暂时不可用');
  await expect(page.locator('.el-table__body tr')).toHaveCount(1);
  fail = false;
  await page.getByRole('button', { name: '重新加载', exact: true }).click();
  await expect(page.locator('.el-alert--error')).toHaveCount(0);
  await expect(page.locator('.business-account .el-select')).toContainText('新班级');
  expect(state.writes.filter(write => write.path.endsWith('/classes'))).toHaveLength(1);
  expect(state.errors).toEqual([]);
});
