import { computed, ref, shallowRef } from 'vue';
import { defineStore } from 'pinia';
import { ApiError, createApi } from '@teacher-logbook/api-client';
import type { LoginResult, UserRecord } from '@teacher-logbook/api-client';
import { createWebTransport } from '../lib/transport';

const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
export const authStorageKey = `teacher-logbook:access-token:${baseUrl}`;

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null);
  const user = shallowRef<UserRecord | null>(null);
  const restoring = ref(false);
  const restoreError = ref('');
  const storageError = ref('');
  let initialized = false;
  let revision = 0;
  let restorePromise: Promise<void> | undefined;
  const isAuthenticated = computed(() => accessToken.value !== null && user.value !== null);
  function clearSession() {
    revision++;
    initialized = true;
    accessToken.value = null;
    user.value = null;
    restoreError.value = '';
    storageError.value = '';
    try {
      localStorage.removeItem(authStorageKey);
    } catch {
      storageError.value = '浏览器未能清除登录缓存，请清除本站点数据后关闭页面。';
    }
  }
  function acceptLogin(result: LoginResult) {
    try {
      localStorage.setItem(authStorageKey, result.access_token);
    } catch {
      throw new ApiError('浏览器无法保存登录状态，请允许本站点使用存储后重试。');
    }
    revision++;
    initialized = true;
    restoreError.value = '';
    storageError.value = '';
    accessToken.value = result.access_token;
    user.value = result.user;
  }
  const transport = createWebTransport();
  const api = createApi({
    baseUrl,
    transport: async (request) => {
      const current = revision;
      const response = await transport(request);
      if (current !== revision) throw new ApiError('登录状态已变化，请重新操作。');
      return response;
    },
    getAccessToken: () => accessToken.value,
    onUnauthorized: clearSession,
  });

  async function restoreSession(retry = false): Promise<void> {
    if (restorePromise) return restorePromise;
    if (initialized && !retry) return;
    if (isAuthenticated.value) return;
    const current = revision;
    restoring.value = true;
    restoreError.value = '';
    storageError.value = '';
    const restore = async () => {
      let token: string | null;
      try {
        token = localStorage.getItem(authStorageKey);
      } catch {
        storageError.value = '浏览器无法读取登录缓存，请检查本站点存储权限。';
        return;
      }
      if (!token) return;
      accessToken.value = token;
      try {
        const profile = await api.getMe();
        if (current === revision) user.value = profile;
      } catch (cause) {
        if (current !== revision) return;
        accessToken.value = null;
        user.value = null;
        restoreError.value = cause instanceof ApiError ? cause.message : '登录验证未完成，请重试。';
      }
    };
    restorePromise = restore();
    try {
      await restorePromise;
    } finally {
      initialized = true;
      restoring.value = false;
      restorePromise = undefined;
    }
  }
  return { user, isAuthenticated, restoring, restoreError, storageError, clearSession, acceptLogin, restoreSession, api };
});
