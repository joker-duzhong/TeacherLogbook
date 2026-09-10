import { ApiError, isRecord } from './index';
import type { components } from './schema';
import type { HttpRequest } from './index';

export const resources = ['students', 'leave-requests', 'homework-records', 'violations', 'alerts', 'todos', 'work-records', 'exams', 'committee-roles', 'committee-members', 'hygiene-assignments', 'activities', 'finance-records', 'awards', 'courses', 'talks', 'contacts', 'training-records', 'links'] as const;
export type Resource = typeof resources[number];
export type RecordValues = Record<string, string | number | null>;
export interface BusinessRecord extends RecordValues { id: string; classId: string; createdAt: string; updatedAt: string }
export interface RecordPage { items: BusinessRecord[]; total: number; page: number; page_size: number; total_pages: number }
export type Dashboard = components['schemas']['DashboardRead'];
export type SeatBoard = components['schemas']['SeatBoardResponse'];
export type RecordQuery = Record<string, string | number | undefined>;
type Request = (method: HttpRequest['method'], route: string, body?: unknown, authenticated?: boolean, headers?: Record<string, string>) => Promise<unknown>;
type Transfer = (route: string, upload?: HttpRequest['upload']) => Promise<unknown>;

function root(classId: string) {
  if (!classId) throw new ApiError('请先选择班级。');
  return `/teacher-logbook/classes/${encodeURIComponent(classId)}`;
}
function record(value: unknown): BusinessRecord {
  if (!isRecord(value) || !['id', 'classId', 'createdAt', 'updatedAt'].every(key => typeof value[key] === 'string') ||
      !Object.values(value).every(item => item === null || typeof item === 'string' || (typeof item === 'number' && Number.isFinite(item)))) {
    throw new ApiError('台账记录格式不符合契约。');
  }
  return value as BusinessRecord;
}
function page(value: unknown): RecordPage {
  if (!isRecord(value) || !Array.isArray(value.items) || !['total', 'page', 'page_size', 'total_pages'].every(key => Number.isSafeInteger(value[key]) && Number(value[key]) >= 0)) throw new ApiError('分页响应不完整。');
  return { items: value.items.map(record), total: Number(value.total), page: Number(value.page), page_size: Number(value.page_size), total_pages: Number(value.total_pages) };
}
function queryString(query: RecordQuery) {
  return Object.entries(query).filter(([,value]) => value !== undefined && value !== '').map(([key,value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`).join('&');
}

export function createLogbookApi(request: Request, transfer: Transfer) {
  async function listRecords(classId: string, resource: Resource, query: RecordQuery = {}): Promise<RecordPage> {
    if (!resources.includes(resource)) throw new ApiError('未知台账类型。');
    return page(await request('GET', `${root(classId)}/${resource}?${queryString({ page: 1, pageSize: 20, ...query })}`));
  }
  async function allRecords(classId: string, resource: Resource, query: RecordQuery = {}) {
    const result: BusinessRecord[] = [];
    let current = 1;
    let expected: number | undefined;
    do {
      const response = await listRecords(classId, resource, { ...query, page: current, pageSize: 100 });
      if (expected !== undefined && expected !== response.total) throw new ApiError('数据在导出期间发生变化，请重试。');
      expected = response.total;
      result.push(...response.items);
      if (current >= response.total_pages) break;
      if (!response.items.length || current >= 10000) throw new ApiError('数据量超过本次处理范围。');
      current++;
    } while (true);
    if (result.length !== expected || new Set(result.map(item => item.id)).size !== result.length) throw new ApiError('分页数据不一致，请刷新重试。');
    return result;
  }
  return {
    listRecords, allRecords,
    async saveRecord(classId: string, resource: Resource, values: RecordValues, id?: string) {
      return record(await request('POST', `${root(classId)}/${resource}${id ? '/' + encodeURIComponent(id) : ''}`, values));
    },
    async removeRecord(classId: string, resource: Resource, id: string) {
      await request('DELETE', `${root(classId)}/${resource}/${encodeURIComponent(id)}`);
    },
    async renameClass(classId: string, name: string) { await request('POST', root(classId), { name }); },
    async removeClass(classId: string) { await request('DELETE', root(classId)); },
    async getDashboard(classId: string, date: string): Promise<Dashboard> {
      const data = await request('GET', `${root(classId)}/dashboard?date=${encodeURIComponent(date)}`);
      if (!isRecord(data) || !isRecord(data.studentSummary) || !isRecord(data.alertSummary) ||
          !['leaveToday', 'unsubmittedHomework', 'violationCount', 'workRecordsThisMonth', 'pendingTodoCount'].every(key => typeof data[key] === 'number') ||
          !['highRiskStudents', 'upcomingTodos', 'recentWorkRecords'].every(key => Array.isArray(data[key]))) throw new ApiError('仪表盘数据不完整。');
      return data as unknown as Dashboard;
    },
    async getSkin(): Promise<string> {
      const data = await request('GET', '/teacher-logbook/users/me/preferences/ui');
      if (!isRecord(data) || typeof data.skin !== 'string') throw new ApiError('皮肤偏好格式无效。');
      return data.skin;
    },
    async saveSkin(skin: string) { await request('POST', '/teacher-logbook/users/me/preferences/ui', { skin }); },
    async getSeatBoard(classId: string): Promise<SeatBoard> {
      const data = await request('GET', `${root(classId)}/seat-board`);
      if (!isRecord(data) || !isRecord(data.layout) || !Array.isArray(data.assignments) || !Number.isInteger(data.version)) throw new ApiError('座位数据不完整。');
      return data as unknown as SeatBoard;
    },
    async saveSeatLayout(classId: string, version: number, rows: number, columnGroups: number[]) {
      await request('PUT', `${root(classId)}/seat-board/layout`, { rows, columnGroups }, true, { 'If-Match': `"seat-board-${version}"` });
    },
    async moveSeat(classId: string, version: number, studentId: string, row: number, column: number) {
      await request('PUT', `${root(classId)}/seat-board/assignments/${encodeURIComponent(studentId)}`, { row, column, swap: true }, true, { 'If-Match': `"seat-board-${version}"` });
    },
    async removeSeat(classId: string, version: number, studentId?: string) {
      await request('DELETE', `${root(classId)}/seat-board/assignments${studentId ? '/' + encodeURIComponent(studentId) : ''}`, undefined, true, { 'If-Match': `"seat-board-${version}"` });
    },
    async downloadStudents(classId: string) { return transfer(`${root(classId)}/students/export`); },
    async downloadBackup(classId: string) { return transfer(`${root(classId)}/backup`); },
    async uploadStudents(classId: string, file: unknown, dryRun: boolean, duplicateStrategy: 'skip' | 'create') {
      return transfer(`${root(classId)}/students/import`, { file, fields: { dryRun: String(dryRun), duplicateStrategy } });
    },
    async validateBackup(classId: string, file: unknown) { return transfer(`${root(classId)}/backup/validate`, { file, fields: {} }); },
    async importLegacy(classId: string, file: unknown, dryRun: boolean) { return transfer(`${root(classId)}/legacy-import`, { file, fields: { dryRun: String(dryRun), confirmation: dryRun ? '' : 'IMPORT_LEGACY_DATA' } }); },
    async restoreBackup(classId: string, file: unknown, mode: 'replace' | 'merge') { return transfer(`${root(classId)}/backup/restore`, { file, fields: { mode, confirmation: 'RESTORE_CLASS_DATA' } }); },
    async clearClassData(classId: string) { await request('POST', `${root(classId)}/data/clear`, { confirmation: 'CLEAR_CLASS_DATA' }); },
  };
}
