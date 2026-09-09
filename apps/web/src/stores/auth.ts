import { computed, ref, shallowRef } from 'vue';
import { defineStore } from 'pinia';
import { createApi } from '@teacher-logbook/api-client';
import type { LoginResult, UserRecord } from '@teacher-logbook/api-client';
import { createWebTransport } from '../lib/transport';

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null);
  const user = shallowRef<UserRecord | null>(null);
  const isAuthenticated = computed(() => accessToken.value !== null && user.value !== null);
  function clearSession() {
    accessToken.value = null;
    user.value = null;
  }
  function acceptLogin(result: LoginResult) {
    accessToken.value = result.access_token;
    user.value = result.user;
  }
  const api = createApi({
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
    transport: createWebTransport(),
    getAccessToken: () => accessToken.value,
    onUnauthorized: clearSession,
  });
  return { user, isAuthenticated, clearSession, acceptLogin, api };
});
