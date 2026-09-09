import { ApiError } from '@teacher-logbook/api-client';
import type { Transport } from '@teacher-logbook/api-client';

export function createWebTransport(fetcher: typeof fetch = fetch): Transport {
  return async (request) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetcher(request.url, {
        method: request.method,
        headers: request.headers,
        credentials: 'omit',
        cache: 'no-store',
        signal: controller.signal,
        ...(request.body === undefined ? {} : { body: JSON.stringify(request.body) }),
      });
      if (response.status === 204) return { status: response.status, body: undefined };
      const text = await response.text();
      let body: unknown;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        if (response.ok) throw new ApiError('接口未返回有效 JSON，请联系管理员。');
        body = null;
      }
      return { status: response.status, body };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(controller.signal.aborted ? '请求超时，请稍后重试。' : '网络连接失败，请检查网络后重试。');
    } finally {
      clearTimeout(timeout);
    }
  };
}
