import { ApiError } from '@teacher-logbook/api-client';
import type { Transport } from '@teacher-logbook/api-client';

export const miniappTransport: Transport = (request) => new Promise((resolve, reject) => {
  if (request.upload) {
    if (typeof request.upload.file !== 'string') { reject(new ApiError('请选择有效文件。')); return; }
    uni.uploadFile({ url: request.url, filePath: request.upload.file, name: 'file', header: request.headers, formData: request.upload.fields, timeout: 15000,
      success(response) { try { resolve({ status: response.statusCode, body: JSON.parse(response.data) }); } catch { if(response.statusCode>=400)resolve({status:response.statusCode,body:null});else reject(new ApiError('上传响应格式无效。')); } },
      fail() { reject(new ApiError('文件上传失败，请重试。')); },
    });
    return;
  }
  if (request.method === 'PATCH') {
    reject(new ApiError('微信小程序请求层不支持 PATCH，请使用已提供的 POST 更新接口。'));
    return;
  }
  uni.request({
    url: request.url,
    method: request.method,
    header: request.headers,
    timeout: 15000,
    dataType: request.responseType === 'text' ? 'text' : 'json',
    ...(request.body === undefined ? {} : { data: JSON.stringify(request.body) }),
    success(response) {
      let body: unknown = response.statusCode === 204 ? undefined : response.data;
      if (response.statusCode >= 400 && typeof body === 'string') {
        try { body = JSON.parse(body); } catch { body = null; }
      }
      resolve({ status: response.statusCode, body });
    },
    fail() {
      reject(new ApiError('网络请求失败，请检查网络和小程序合法域名配置。'));
    },
  });
});
