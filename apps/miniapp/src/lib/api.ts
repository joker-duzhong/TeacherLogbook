import { createApi } from '@teacher-logbook/api-client';
import { miniappTransport } from './transport';

export function createMiniappApi(getAccessToken: () => string | null, onUnauthorized: () => void) {
  return createApi({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://192.168.31.93:8000/api/v1',
    transport: miniappTransport,
    getAccessToken,
    onUnauthorized,
  });
}
