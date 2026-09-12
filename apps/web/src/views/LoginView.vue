<script setup lang="ts">
import AppButton from '@/components/AppButton.vue';
import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { webThemeVariables } from '@/lib/theme';
import { Users, NotebookPen, MessagesSquare, ArrowRight } from '@lucide/vue';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ApiError } from '@teacher-logbook/api-client';
import type { LoginResult } from '@teacher-logbook/api-client';
import { getRemainingSeconds, isValidPhone, isValidSmsCode, normalizePhone, themes } from '@teacher-logbook/shared';
import { Check, Palette } from '@lucide/vue';
import { useAuthStore } from '../stores/auth';
import ScanLogin from './ScanLogin.vue';
import { resolveScanPageUrl } from '../lib/scan-login';
import { browserPassportLogin, isWechatBrowser, logbookAppKey, safeWorkspacePath } from '../lib/passport-login';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const inWechat = isWechatBrowser(navigator.userAgent);
const passportBusy = ref(false);
const passportError = ref('');
const passport = browserPassportLogin(auth.api, resolveScanPageUrl(import.meta.env.VITE_SCAN_PAGE_URL), auth.acceptLogin);
const mobileViewport = window.matchMedia('(max-width: 720px)');
const isMobile = ref(mobileViewport.matches);
const loginMethod = ref(isMobile.value || inWechat ? 'phone' : 'wechat');
const loginTheme = ref('mint');
const themeMenuOpen = ref(false);
const form = reactive({ phone: '', code: '' });
const fieldErrors = reactive({ phone: '', code: '' });
const errorMessage = ref('');
const successMessage = ref('');
const sending = ref(false);
const submitting = ref(false);
const countdown = ref(0);
let deadline = 0;
let interval: ReturnType<typeof setInterval> | undefined;
let disposed = false;

function updateViewport(event: MediaQueryListEvent) {
  isMobile.value = event.matches;
  if (event.matches) loginMethod.value = 'phone';
}

mobileViewport.addEventListener('change', updateViewport);
onMounted(() => {
  interval = setInterval(() => { countdown.value = getRemainingSeconds(deadline, Date.now()); }, 1000);
  if (inWechat && route.query.manual !== '1' && !auth.restoreError && !auth.storageError) void startPassport();
});
onUnmounted(() => {
  disposed = true;
  passport.stop();
  mobileViewport.removeEventListener('change', updateViewport);
  if (interval !== undefined) clearInterval(interval);
});

async function startPassport(retry = false) {
  if (passportBusy.value || disposed) return;
  passportBusy.value = true; passportError.value = '';
  try { await passport.start(route.query.redirect, retry); }
  catch (error) { if (!disposed) passportError.value = error instanceof Error ? error.message : '微信登录未完成，请重试。'; }
  finally { if (!disposed) passportBusy.value = false; }
}

function validatePhone() {
  fieldErrors.phone = isValidPhone(form.phone) ? '' : '请输入有效的中国大陆手机号。';
  return !fieldErrors.phone;
}

function showError(error: unknown) {
  errorMessage.value = error instanceof ApiError ? error.message : '操作未完成，请稍后重试。';
  if (error instanceof ApiError) {
    fieldErrors.phone = error.fields.phone ?? '';
    fieldErrors.code = error.fields.code ?? '';
  }
}

async function completeLogin(result: LoginResult) {
  if (disposed) return;
  auth.acceptLogin(result);
  form.code = '';
  await router.replace(safeWorkspacePath(route.query.redirect));
}

async function retrySession() {
  await auth.restoreSession(true);
  if (!disposed && auth.isAuthenticated) await router.replace({ name: 'workspace' });
}

async function sendSms() {
  if (sending.value || submitting.value || countdown.value > 0 || !validatePhone()) return;
  errorMessage.value = '';
  successMessage.value = '';
  sending.value = true;
  try {
    await auth.api.sendSms(normalizePhone(form.phone));
    if (disposed) return;
    deadline = Date.now() + 60000;
    countdown.value = 60;
    successMessage.value = '验证码已发送，请查看手机短信。';
  } catch (error) {
    if (!disposed) showError(error);
  } finally {
    sending.value = false;
  }
}

async function login() {
  if (submitting.value || sending.value) return;
  const phoneValid = validatePhone();
  fieldErrors.code = isValidSmsCode(form.code) ? '' : '请输入短信中的 4 位数字验证码。';
  if (!phoneValid || fieldErrors.code) return;
  errorMessage.value = '';
  successMessage.value = '';
  submitting.value = true;
  try {
    const result = await auth.api.loginWithPhone({ phone: normalizePhone(form.phone), code: form.code, app_key: logbookAppKey });
    if (disposed) return;
    await completeLogin(result);
  } catch (error) {
    if (!disposed) showError(error);
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <main class="login-page" :data-theme="loginTheme" :style="webThemeVariables(loginTheme)">
    <header class="site-header"><a class="brand" href="/login"><img class="brand-logo" src="/brand/logo.png" alt="" width="40" height="40"/><span>教师台账<small>班主任工作台</small></span></a>
      <Popover v-model:open="themeMenuOpen"><PopoverTrigger as-child><AppButton size="icon" variant="ghost" aria-label="切换主题"><Palette :size="20"/></AppButton></PopoverTrigger><PopoverContent align="end" class="w-56"><div id="login-theme-options" class="login-theme-options" role="group" aria-label="登录页主题"><button v-for="theme in themes" :key="theme.id" :aria-pressed="loginTheme===theme.id" @click="loginTheme=theme.id;themeMenuOpen=false"><i :style="{background:theme.brand}"></i>{{ theme.name }}<Check v-if="loginTheme===theme.id" :size="16"/></button></div></PopoverContent></Popover>
    </header>
    <div class="login-layout">
      <section class="login-intro"><div class="intro-mark"><NotebookPen :size="24"/><span>每一天，都值得认真记录</span></div><h1>把班级事务记清楚，<br/>把时间留给学生。</h1><p class="intro-copy">学生信息、日常记录与班主任工作，<br/>从这里开始有序管理。</p>
        <div class="intro-notes"><div><Users/><span><strong>班级管理</strong><small>花名册、班委与座位安排</small></span></div><div><NotebookPen/><span><strong>日常记录</strong><small>请假、作业与学生关怀</small></span></div><div><MessagesSquare/><span><strong>班主任工作</strong><small>沟通、培训与待办事项</small></span></div></div>
      </section>
      <section class="login-panel"><h2>登录工作台</h2><p class="panel-description">使用你的账号，继续班级工作。</p>
        <div v-if="auth.restoreError||auth.storageError" class="login-session-error" role="alert"><p class="error-message">{{ auth.restoreError||auth.storageError }}</p><AppButton v-if="auth.restoreError" :loading="auth.restoring" :disabled="submitting||sending" @click="retrySession">重新验证登录</AppButton></div>
        <div v-if="inWechat" class="wechat-login" :aria-busy="passportBusy"><p v-if="passportBusy" role="status">正在前往授权中心…</p><p v-if="passportError" class="error-message" role="alert">{{ passportError }}</p><AppButton v-if="!passportBusy" variant="default" :disabled="!!auth.restoreError" @click="startPassport(true)">{{ passportError?'重新授权':'前往授权中心登录' }}<ArrowRight :size="16"/></AppButton></div>
        <Tabs v-else v-model="loginMethod" class="login-tabs">
          <TabsList v-if="!isMobile" class="login-tab-list"><TabsTrigger value="wechat" :disabled="submitting||sending">微信扫码</TabsTrigger><TabsTrigger value="phone">手机号验证码</TabsTrigger></TabsList>
          <TabsContent v-if="!isMobile" value="wechat"><ScanLogin v-if="loginMethod==='wechat'&&!auth.restoreError&&!auth.restoring" @login="completeLogin"/></TabsContent>
          <TabsContent value="phone" force-mount v-show="loginMethod==='phone'"><form class="login-form" @submit.prevent="login">
            <label class="form-field" for="phone"><span>手机号</span><Input id="phone" v-model="form.phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="请输入手机号" :maxlength="20" :disabled="submitting||sending" :aria-invalid="!!fieldErrors.phone" aria-describedby="phone-error" @input="fieldErrors.phone=''"/><small id="phone-error" class="field-error">{{ fieldErrors.phone }}</small></label>
            <div class="form-field"><label for="sms-code">验证码</label><div class="code-input-row"><Input id="sms-code" v-model="form.code" inputmode="numeric" autocomplete="one-time-code" placeholder="4 位数字" :maxlength="4" :disabled="submitting" :aria-invalid="!!fieldErrors.code" aria-describedby="code-error" @input="fieldErrors.code=''"/><AppButton :loading="sending" :disabled="countdown>0||submitting" @click="sendSms">{{ countdown>0?countdown+' 秒后重发':'获取验证码' }}</AppButton></div><small id="code-error" class="field-error">{{ fieldErrors.code }}</small></div>
            <div class="form-feedback"><p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p><p v-else-if="successMessage" class="success-message" role="status">{{ successMessage }}</p></div>
            <AppButton class="login-submit" variant="default" type="submit" :loading="submitting" :disabled="sending">登录工作台<ArrowRight :size="16"/></AppButton><p class="login-hint">未注册的手机号验证通过后，将自动创建账号。</p>
          </form></TabsContent>
        </Tabs>
      </section>
    </div><footer class="login-footer">教师台账 · 让班级工作井然有序</footer>
  </main>
</template>
