import { ApiError } from '@teacher-logbook/api-client';
import type { Transport } from '@teacher-logbook/api-client';

export const miniappTransport: Transport = (request) => new Promise((resolve, reject) => {
  if (request.method === 'PATCH') {
    reject(new ApiError('微信小程序请求层不支持 PATCH，学生编辑需后端提供兼容接口。'));
    return;
  }
  uni.request({
    url: request.url,
    method: request.method,
    header: request.headers,
    timeout: 15000,
    dataType: 'json',
    ...(request.body === undefined ? {} : { data: JSON.stringify(request.body) }),
    success(response) {
      resolve({ status: response.statusCode, body: response.statusCode === 204 ? undefined : response.data });
    },
    fail() {
      reject(new ApiError('网络请求失败，请检查网络和小程序合法域名配置。'));
    },
  });
});
