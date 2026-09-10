import { describe, expect, it, vi } from 'vitest';
import { ApiError, createApi } from './index';
import type { HttpResponse, Transport } from './index';

const user = { id: '00000000-0000-4000-8000-000000000001', needs_phone_binding: false };
const login = { access_token: 'fixture-access', refresh_token: 'fixture-refresh', app_scope: 'hope_teacher_logbook', user };
function setup(response: HttpResponse) {
  const transport = vi.fn<Transport>().mockResolvedValue(response);
  const onUnauthorized = vi.fn();
  const api = createApi({ baseUrl: '/api/v1', transport, getAccessToken: () => 'fixture-access', onUnauthorized });
  return { api, transport, onUnauthorized };
}

describe('real API contract boundaries', () => {
  it('sends SMS only through an explicit action and ignores unspecified data', async () => {
    const { api, transport } = setup({ status: 200, body: { code: 200, data: null } });
    expect(transport).not.toHaveBeenCalled();
    await api.sendSms('13800138000');
    expect(transport).toHaveBeenCalledExactlyOnceWith({ url: '/api/v1/auth/sms/send', method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: { phone: '13800138000' } });
  });
  it('parses phone login without sending an existing bearer token', async () => {
    const { api, transport } = setup({ status: 200, body: { code: 200, data: login } });
    expect(await api.loginWithPhone({ phone: '13800138000', code: '0012' })).toEqual(login);
    expect(transport.mock.calls[0]?.[0].headers.Authorization).toBeUndefined();
  });
  it('rejects malformed successful login data', async () => {
    const { api } = setup({ status: 200, body: { code: 200, data: { user } } });
    await expect(api.loginWithPhone({ phone: '13800138000', code: '0012' })).rejects.toBeInstanceOf(ApiError);
  });
  it('accepts 204 deletes and attaches auth only to protected calls', async () => {
    const { api, transport } = setup({ status: 204, body: undefined });
    await expect(api.deleteStudent('class-id', 'student-id')).resolves.toBeUndefined();
    expect(transport.mock.calls[0]?.[0].headers.Authorization).toBe('Bearer fixture-access');
    expect(transport.mock.calls[0]?.[0].url).toBe('/api/v1/teacher-logbook/classes/class-id/students/student-id');
  });
  it('invalidates expired sessions without retrying a write', async () => {
    const { api, transport, onUnauthorized } = setup({ status: 401, body: { code: 401 } });
    await expect(api.deleteStudent('class-id', 'student-id')).rejects.toMatchObject({ status: 401 });
    expect(onUnauthorized).toHaveBeenCalledOnce();
    expect(transport).toHaveBeenCalledOnce();
  });
  it('preserves the real PATCH contract when editing a student', async () => {
    const student = { id: 'student-id', classId: 'class-id', name: '测试学生', gender: '其他', createdAt: '2026-09-08T00:00:00Z', updatedAt: '2026-09-08T00:00:00Z' };
    const { api, transport } = setup({ status: 200, body: { code: 200, data: student } });
    expect(await api.updateStudent('class-id', 'student-id', { name: '测试学生' })).toEqual(student);
    expect(transport.mock.calls[0]?.[0]).toMatchObject({ method: 'PATCH', url: '/api/v1/teacher-logbook/classes/class-id/students/student-id', body: { name: '测试学生' } });
  });
  it('extracts 422 field messages without retaining submitted inputs', async () => {
    const { api } = setup({ status: 422, body: { detail: [{ loc: ['body', 'phone'], msg: '手机号格式错误', input: 'private-input' }] } });
    await expect(api.sendSms('invalid')).rejects.toMatchObject({ fields: { phone: '手机号格式错误' }, status: 422 });
  });
  it('rejects business errors even when HTTP status is 200', async () => {
    const { api } = setup({ status: 200, body: { code: 400, message: '验证码错误', data: null } });
    await expect(api.loginWithPhone({ phone: '13800138000', code: '0012' })).rejects.toThrow('验证码错误');
  });
  it('keeps unknown response failures explicit', async () => {
    const { api } = setup({ status: 200, body: '<html>not JSON</html>' });
    await expect(api.listClasses()).rejects.toBeInstanceOf(ApiError);
  });
  it('uses the real pagination envelope and query field casing', async () => {
    const page = { items: [], total: 0, page: 2, page_size: 20, total_pages: 0 };
    const { api, transport } = setup({ status: 200, body: { code: 200, data: page } });
    expect(await api.listStudents('class-id', { page: 2, keyword: '张 三' })).toEqual(page);
    expect(transport.mock.calls[0]?.[0].url).toBe('/api/v1/teacher-logbook/classes/class-id/students?page=2&pageSize=20&keyword=%E5%BC%A0%20%E4%B8%89');
  });
  it('rejects out-of-contract page sizes before making a request', async () => {
    const { api, transport } = setup({ status: 200, body: null });
    await expect(api.listStudents('class-id', { pageSize: 101 })).rejects.toBeInstanceOf(ApiError);
    expect(transport).not.toHaveBeenCalled();
  });
  it('does not pretend a network failure was saved locally', async () => {
    const transport = vi.fn<Transport>().mockRejectedValue(new Error('offline'));
    const api = createApi({ baseUrl: '/api/v1', transport });
    await expect(api.createStudent('class-id', { name: '测试学生', gender: '其他' })).rejects.toThrow('网络连接失败');
    expect(transport).toHaveBeenCalledOnce();
  });
});
