import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { modules, pages, validateRecord } from '../../../packages/shared/src/catalog';

const classId = '00000000-0000-4000-8000-000000000010';
const studentId = '00000000-0000-4000-8000-000000000011';
const timestamps = { createdAt: '2026-09-09T00:00:00Z', updatedAt: '2026-09-09T00:00:00Z' };
type Row = Record<string, string | number | null> & { id: string };

export async function fixture(page: Page, empty = false) {
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

export async function navigate(page: Page, id: string) {
  const menu = page.getByRole('button', { name: '展开导航', exact: true });
  if (await menu.isVisible()) await menu.click();
  const group = page.locator('.nav-group-toggle').filter({ hasText: pages.find(item => item.id === id)!.group });
  if (await group.getAttribute('aria-expanded') === 'false') await group.click();
  await page.locator(`.business-nav nav a[href="/workspace/${id}"]`).click();
  await expect(page.locator('.business-topbar h1')).toHaveText(pages.find(item => item.id === id)!.name);
  await expect(page.locator('.loading-layout[role=status]')).toHaveCount(0);
}

