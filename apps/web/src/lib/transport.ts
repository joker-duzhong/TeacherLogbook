import { ApiError } from '@teacher-logbook/api-client';
import type { Transport } from '@teacher-logbook/api-client';

export function createWebTransport(fetcher: typeof fetch = fetch): Transport {
  return async (request) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      let body: BodyInit | undefined;
      if (request.upload) {
        if (!(request.upload.file instanceof Blob)) throw new ApiError('请选择有效文件。');
        const form = new FormData();
        form.append('file', request.upload.file);
        for (const [key, value] of Object.entries(request.upload.fields)) form.append(key, value);
        body = form;
      } else if (request.body !== undefined) body = JSON.stringify(request.body);
      const response = await fetcher(request.url, {
        method: request.method,
        headers: request.headers,
        credentials: 'omit',
        cache: 'no-store',
        signal: controller.signal,
        ...(body === undefined ? {} : { body }),
      });
      if (response.status === 204) return { status: response.status, body: undefined };
      const text = await response.text();
      if (response.ok && request.responseType === 'text') return { status: response.status, body: text };
      let parsed: unknown;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        if (response.ok) throw new ApiError('接口未返回有效 JSON，请联系管理员。');
        parsed = null;
      }
      return { status: response.status, body: parsed };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(controller.signal.aborted ? '请求超时，请稍后重试。' : '网络连接失败，请检查网络后重试。');
    } finally {
      clearTimeout(timeout);
    }
  };
}
