import type { components } from './schema';
import { createLogbookApi } from './logbook';
export * from './logbook';

export type ClassRecord = components['schemas']['ClassRead'];
export type StudentRecord = components['schemas']['StudentRead'];
export type StudentPage = components['schemas']['PaginatedData_StudentRead_'];
export type LoginResult = components['schemas']['LoginResponse'];
export type UserRecord = components['schemas']['UserResponse'];
export type TokenResult = components['schemas']['Token'];
export type ScanApp = components['schemas']['ScanAppResponse'];
export type ScanSession = components['schemas']['ScanCreateResponse'];
export type ScanPoll = components['schemas']['ScanPollResponse'];
export type ScanStatus = components['schemas']['ScanStatus'];

const scanStatuses: readonly ScanStatus[] = ['WAITING_SCAN', 'PENDING', 'CONFIRMED', 'CONSUMED', 'CANCELLED', 'EXPIRED'];
const transactionPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const scanSecretPattern = /^[A-Za-z0-9_-]{32,128}$/;

export interface HttpRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers: Record<string, string>;
  body?: unknown;
  responseType?: 'text';
  upload?: { file: unknown; fields: Record<string, string> };
}

export interface HttpResponse {
  status: number;
  body: unknown;
}

export type Transport = (request: HttpRequest) => Promise<HttpResponse>;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status = 0,
    public readonly fields: Readonly<Record<string, string>> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function responseError(status: number, body: unknown): ApiError {
  const fields: Record<string, string> = {};
  if (isRecord(body) && Array.isArray(body.detail)) {
    for (const item of body.detail) {
      if (isRecord(item) && Array.isArray(item.loc) && typeof item.msg === 'string') {
        const field = item.loc.filter((part) => typeof part === 'string').slice(1).join('.');
        if (field) fields[field] = item.msg;
      }
    }
  }
  const message = status === 401 ? '登录已失效，请重新登录。'
    : status === 403 ? '当前账号没有访问权限。'
    : status === 429 ? '操作过于频繁，请稍后再试。'
    : status >= 500 ? '服务暂时不可用，请稍后重试。'
    : isRecord(body) && typeof body.message === 'string' ? body.message
    : isRecord(body) && typeof body.detail === 'string' ? body.detail
    : status === 412 ? '座位已被其他设备修改，请刷新后重新操作。'
    : status === 422 ? '请检查填写的信息。'
    : '请求失败，请稍后重试。';
  return new ApiError(message, status, fields);
}

function assertRecord(value: unknown): asserts value is Record<string, unknown> {
  if (!isRecord(value)) throw new ApiError('接口返回的数据格式不符合契约。');
}

function requireUser(value: unknown): UserRecord {
  assertRecord(value);
  if (typeof value.id !== 'string' || typeof value.needs_phone_binding !== 'boolean') {
    throw new ApiError('用户信息不完整，请联系管理员。');
  }
  return value as unknown as UserRecord;
}

function requireTokens(value: unknown): TokenResult {
  assertRecord(value);
  if (typeof value.access_token !== 'string' || !value.access_token ||
      typeof value.refresh_token !== 'string' || !value.refresh_token ||
      (value.token_type !== undefined && value.token_type !== 'bearer')) {
    throw new ApiError('登录响应不符合契约，请联系管理员。');
  }
  return value as unknown as TokenResult;
}

function requireLogin(value: unknown): LoginResult {
  const tokens = requireTokens(value);
  assertRecord(value);
  if (typeof value.app_scope !== 'string' || !value.app_scope) throw new ApiError('登录响应缺少应用范围，请重新登录。');
  return { ...tokens, user: requireUser(value.user), app_scope: value.app_scope };
}

function requireClass(value: unknown): ClassRecord {
  assertRecord(value);
  if (!['id', 'name', 'createdAt', 'updatedAt'].every((field) => typeof value[field] === 'string')) {
    throw new ApiError('班级数据不符合契约。');
  }
  return value as unknown as ClassRecord;
}

function requireScanState(value: unknown): ScanPoll {
  assertRecord(value);
  if (typeof value.transaction_id !== 'string' || !transactionPattern.test(value.transaction_id) ||
      !scanStatuses.includes(value.status as ScanStatus) ||
      (value.expires_at != null && (typeof value.expires_at !== 'string' || !Number.isFinite(Date.parse(value.expires_at))))) {
    throw new ApiError('扫码状态不符合接口契约，请刷新二维码。');
  }
  return value as unknown as ScanPoll;
}

function requireScanSecret(value: unknown): asserts value is string {
  if (typeof value !== 'string' || !scanSecretPattern.test(value)) {
    throw new ApiError('扫码凭据不完整，请刷新二维码。');
  }
}

function scanPath(transactionId: string) {
  if (!transactionPattern.test(transactionId)) throw new ApiError('扫码事务无效，请刷新二维码。');
  return `/auth/scan/sessions/${encodeURIComponent(transactionId)}`;
}

function requireStudent(value: unknown): StudentRecord {
  assertRecord(value);
  if (!['id', 'classId', 'name', 'createdAt', 'updatedAt'].every((field) => typeof value[field] === 'string') ||
      !['男', '女', '其他'].includes(String(value.gender))) {
    throw new ApiError('学生数据不符合契约。');
  }
  return value as unknown as StudentRecord;
}

export interface ApiOptions {
  baseUrl: string;
  transport: Transport;
  getAccessToken?: () => string | null;
  onUnauthorized?: () => void;
}

export function createApi(options: ApiOptions) {
  const baseUrl = options.baseUrl.replace(/\/$/, '');

  async function request(method: HttpRequest['method'], route: string, body?: unknown, authenticated = true, extraHeaders: Record<string, string> = {}): Promise<unknown> {
    const headers: Record<string, string> = { Accept: 'application/json', ...extraHeaders };
    const token = authenticated ? options.getAccessToken?.() : null;
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    let response: HttpResponse;
    try {
      response = await options.transport({ url: `${baseUrl}${route}`, method, headers, ...(body === undefined ? {} : { body }) });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('网络连接失败，请检查网络后重试。');
    }
    if (response.status < 200 || response.status >= 300) {
      if (response.status === 401 && authenticated) options.onUnauthorized?.();
      throw responseError(response.status, response.body);
    }
    if (response.status === 204) return undefined;
    assertRecord(response.body);
    if (response.body.code !== 200) {
      if (response.body.code === 401 && authenticated) options.onUnauthorized?.();
      throw responseError(typeof response.body.code === 'number' ? response.body.code : response.status, response.body);
    }
    return response.body.data;
  }

  function classPath(classId: string) {
    if (!classId) throw new ApiError('请先选择班级。');
    return `/teacher-logbook/classes/${encodeURIComponent(classId)}`;
  }

  return {
    ...createLogbookApi(request, async (route, upload) => {
      const token = options.getAccessToken?.();
      const response = await options.transport({ url: `${baseUrl}${route}`, method: upload ? 'POST' : 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        ...(upload ? { upload } : { responseType: 'text' as const }) });
      if (response.status < 200 || response.status >= 300) {
        if (response.status === 401) options.onUnauthorized?.();
        throw responseError(response.status, response.body);
      }
      if (!upload) return response.body;
      assertRecord(response.body);
      if (response.body.code !== 200) throw responseError(Number(response.body.code), response.body);
      return response.body.data;
    }),
    async listScanApps(): Promise<ScanApp[]> {
      const data = await request('GET', '/auth/scan/apps', undefined, false);
      if (!Array.isArray(data) || !data.every((app) => isRecord(app) && typeof app.app_key === 'string' && typeof app.name === 'string')) {
        throw new ApiError('扫码应用列表不符合接口契约。');
      }
      return data as ScanApp[];
    },
    async createScanSession(appKey: string): Promise<ScanSession> {
      if (!appKey || appKey.length > 64) throw new ApiError('请配置有效的扫码应用标识。');
      const data = await request('POST', '/auth/scan/sessions', { app_key: appKey }, false);
      requireScanState(data);
      assertRecord(data);
      requireScanSecret(data.poll_token);
      if (data.poll_interval_seconds !== undefined && (!Number.isSafeInteger(data.poll_interval_seconds) || Number(data.poll_interval_seconds) < 1 || Number(data.poll_interval_seconds) > 2147483)) {
        throw new ApiError('扫码轮询间隔无效，请稍后重试。');
      }
      return data as unknown as ScanSession;
    },
    async pollScanSession(transactionId: string, pollToken: string): Promise<ScanPoll> {
      requireScanSecret(pollToken);
      const data = requireScanState(await request('GET', scanPath(transactionId), undefined, false, { 'X-Scan-Token': pollToken }));
      if (data.transaction_id !== transactionId) throw new ApiError('扫码事务不匹配，请刷新二维码。');
      if (data.status === 'CONFIRMED') requireScanSecret(data.exchange_code);
      return data;
    },
    async exchangeScanSession(transactionId: string, exchangeCode: string, pollToken: string): Promise<LoginResult> {
      scanPath(transactionId);
      requireScanSecret(exchangeCode);
      requireScanSecret(pollToken);
      return requireLogin(await request('POST', '/auth/scan/exchange', { transaction_id: transactionId, exchange_code: exchangeCode }, false, { 'X-Scan-Token': pollToken }));
    },
    async sendSms(phone: string): Promise<void> {
      await request('POST', '/auth/sms/send', { phone }, false);
    },
    async loginWithPhone(body: components['schemas']['PhoneLoginRequest']): Promise<LoginResult> {
      return requireLogin(await request('POST', '/auth/phone/login', body, false));
    },
    async loginWithMiniapp(body: components['schemas']['MiniappLoginRequest']): Promise<LoginResult> {
      return requireLogin(await request('POST', '/auth/miniapp/login', body, false));
    },
    async refresh(refreshToken: string): Promise<TokenResult> {
      return requireTokens(await request('POST', '/auth/refresh', { refresh_token: refreshToken }, false));
    },
    async getMe(): Promise<UserRecord> {
      return requireUser(await request('GET', '/auth/me'));
    },
    async bindPhone(phone: string, code: string): Promise<UserRecord> {
      return requireUser(await request('POST', '/auth/phone/bind', { phone, code }));
    },
    async listClasses(): Promise<ClassRecord[]> {
      const data = await request('GET', '/teacher-logbook/classes');
      if (!Array.isArray(data)) throw new ApiError('班级列表不符合契约。');
      return data.map(requireClass);
    },
    async createClass(body: components['schemas']['ClassCreate']): Promise<ClassRecord> {
      return requireClass(await request('POST', '/teacher-logbook/classes', body));
    },
    async listStudents(classId: string, query: { page?: number; pageSize?: number; keyword?: string } = {}): Promise<StudentPage> {
      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? 20;
      if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
        throw new ApiError('分页参数超出允许范围。');
      }
      const search = `page=${page}&pageSize=${pageSize}${query.keyword ? `&keyword=${encodeURIComponent(query.keyword)}` : ''}`;
      const data = await request('GET', `${classPath(classId)}/students?${search}`);
      assertRecord(data);
      if (!Array.isArray(data.items) || !['total', 'page', 'page_size', 'total_pages'].every((field) => Number.isInteger(data[field]) && Number(data[field]) >= 0)) {
        throw new ApiError('学生分页数据不符合契约。');
      }
      data.items.forEach(requireStudent);
      return data as unknown as StudentPage;
    },
    async createStudent(classId: string, body: components['schemas']['StudentCreate']): Promise<StudentRecord> {
      return requireStudent(await request('POST', `${classPath(classId)}/students`, body));
    },
    async updateStudent(classId: string, studentId: string, body: components['schemas']['StudentUpdate']): Promise<StudentRecord> {
      return requireStudent(await request('PATCH', `${classPath(classId)}/students/${encodeURIComponent(studentId)}`, body));
    },
    async deleteStudent(classId: string, studentId: string): Promise<void> {
      await request('DELETE', `${classPath(classId)}/students/${encodeURIComponent(studentId)}`);
    },
  };
}
