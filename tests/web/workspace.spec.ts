import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { modules, pages, validateRecord } from '../../packages/shared/src/catalog';

const classId = '00000000-0000-4000-8000-000000000010';
const studentId = '00000000-0000-4000-8000-000000000011';
const timestamps = { createdAt: '2026-09-09T00:00:00Z', updatedAt: '2026-09-09T00:00:00Z' };
type Row = Record<string, string | number | null> & { id: string };

async function fixture(page: Page) {
  const state = {
    rows: {} as Record<string, Row[]>, skin: 'mr', expired: false, errors: [] as string[],
    writes: [] as Array<{ method: string; path: string; body: unknown; version?: string }>,
    classes: [{ id: classId, name: '高一（1）班', timezone: 'Asia/Shanghai', ...timestamps }],
    seat: { layout: { rows: 4, columnGroups: [2, 2, 2], columns: 6 }, assignments: [] as Array<{ studentId: string; row: number; column: number }>, version: 1, updatedAt: timestamps.updatedAt },
  };
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
    if (path.endsWith('/auth/phone/login')) return reply({ access_token: 'fixture-access', refresh_token: 'fixture-refresh', token_type: 'bearer', user: { id: studentId, needs_phone_binding: false } });
    if (state.expired) return route.fulfill({ status: 401, json: { detail: 'expired' } });
    if (path.endsWith('/auth/me')) return reply({ id: studentId, needs_phone_binding: false });
    if (path.endsWith('/preferences/ui')) {
      if (method === 'POST') state.skin = request.postDataJSON().skin;
      return reply({ skin: state.skin });
    }
    if (path.endsWith('/classes')) {
      if (method === 'POST') state.classes.push({ id: 'new-class', ...request.postDataJSON(), ...timestamps });
      return reply(method === 'GET' ? state.classes : state.classes.at(-1));
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
      const rows = state.rows[resource].filter(row => !keyword || Object.values(row).some(value => String(value).includes(keyword)));
      return reply({ items: rows, total: rows.length, page: 1, page_size: 100, total_pages: rows.length ? 1 : 0 });
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

test('all resource forms submit, students edit and delete', async ({ page }) => {
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
  }
  await navigate(page, 'students');
  await page.locator('.el-table__body tr').filter({ hasText: '回归姓名' }).getByRole('button', { name: '编辑', exact: true }).click();
  await page.locator('.el-dialog input').first().fill('已修改学生');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.locator('.el-dialog')).not.toBeVisible();
  await page.locator('.el-table__body tr').filter({ hasText: '已修改学生' }).getByRole('button', { name: '删除', exact: true }).click();
  await page.locator('.el-message-box').getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.locator('.el-table__body tr').filter({ hasText: '已修改学生' })).toHaveCount(0);
  expect(state.rows.students).toHaveLength(1);
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
