<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import QRCode from 'qrcode';
import type { LoginResult } from '@teacher-logbook/api-client';
import { useAuthStore } from '../stores/auth';
import { createScanLogin, resolveScanPageUrl } from '../lib/scan-login';

const emit = defineEmits<{ login: [result: LoginResult] }>();
const auth = useAuthStore();
const scan = createScanLogin({
  api: auth.api,
  appKey: import.meta.env.VITE_SCAN_APP_KEY || 'hope_teacher_logbook',
  scanPageUrl: resolveScanPageUrl(import.meta.env.VITE_SCAN_PAGE_URL, import.meta.env.DEV),
  renderQr: (url) => QRCode.toDataURL(url, { width: 240, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#000000', light: '#ffffff' } }),
  onLogin: (result) => { emit('login', result); },
});
const state = scan.state;
const busy = computed(() => ['LOADING', 'EXCHANGING', 'SUCCESS'].includes(state.value.phase));
const masked = computed(() => state.value.phase !== 'WAITING_SCAN');
const canRefresh = computed(() => ['PENDING', 'EXPIRED', 'CANCELLED', 'CONSUMED', 'ERROR'].includes(state.value.phase));
const title = computed(() => ({
  IDLE: '微信扫码登录', LOADING: '正在生成二维码', WAITING_SCAN: '微信扫码登录',
  PENDING: '已扫码，请在手机上确认', CONFIRMED: '已确认', EXCHANGING: '正在登录',
  SUCCESS: '登录成功', EXPIRED: '二维码已过期', CANCELLED: '已取消登录',
  CONSUMED: '二维码已使用', ERROR: '扫码登录失败',
})[state.value.phase]);
onMounted(() => {
  void scan.start();
});
onUnmounted(() => {
  scan.stop();
});
</script>

<template>
  <div class="wechat-login" :aria-busy="busy">
    <div class="qr-image-area" :class="{ 'is-masked': masked }">
      <img v-if="state.image" :src="state.image" width="240" height="240" :alt="masked ? '' : '微信登录二维码'" :aria-hidden="masked" />
      <div v-if="masked" class="qr-overlay" role="status" aria-live="polite" aria-atomic="true">
        <p class="qr-overlay-title" :class="{ 'is-pending': state.phase === 'PENDING' }">{{ title }}</p>
        <p v-if="state.error" class="qr-overlay-error">{{ state.error }}</p>
        <el-button v-if="canRefresh" type="primary" native-type="button" @click="scan.start">刷新二维码</el-button>
      </div>
    </div>
    <p class="qr-login-hint">使用微信扫码登录</p>
  </div>
</template>
