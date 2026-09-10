<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { browserPassportLogin } from '../lib/passport-login';
import { resolveScanPageUrl } from '../lib/scan-login';

const auth = useAuthStore();
const router = useRouter();
const error = ref('');
let disposed = false;
const passport = browserPassportLogin(auth.api, resolveScanPageUrl(import.meta.env.VITE_SCAN_PAGE_URL), auth.acceptLogin);
onMounted(async () => {
  const params = new URLSearchParams(window.location.hash.slice(1));
  window.history.replaceState(window.history.state, '', window.location.pathname);
  try {
    const target = await passport.complete(params);
    if (!disposed && target) await router.replace(target);
  } catch (cause) { if (!disposed) error.value = cause instanceof Error ? cause.message : '登录未完成，请重新登录。'; }
});
onUnmounted(() => { disposed = true; passport.stop(); });
function restart() { try { passport.clear(); } catch { /* The login page also checks storage before redirecting. */ } void router.replace({ name: 'login', query: { manual: '1' } }); }
</script>

<template>
  <main class="login-page">
    <section class="workspace-content">
      <img class="brand-logo" src="/brand/logo.png" alt="" width="64" height="64" />
      <h1>{{ error ? '微信登录未完成' : '正在完成登录…' }}</h1>
      <p v-if="error" class="error-message" role="alert">{{ error }}</p>
      <p v-else role="status">正在返回班主任工作台</p>
      <el-button v-if="error" type="primary" @click="restart">返回登录页</el-button>
    </section>
  </main>
</template>
