<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ApiError } from '@teacher-logbook/api-client';
import type { LoginResult } from '@teacher-logbook/api-client';
import { getRemainingSeconds, isValidPhone, isValidSmsCode, normalizePhone, themes, themeVariables } from '@teacher-logbook/shared';
import { Check, Palette } from '@lucide/vue';
import { useAuthStore } from '../stores/auth';
import ScanLogin from './ScanLogin.vue';

const auth = useAuthStore();
const router = useRouter();
const mobileViewport = window.matchMedia('(max-width: 720px)');
const isMobile = ref(mobileViewport.matches);
const loginMethod = ref(isMobile.value ? 'phone' : 'wechat');
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
});
onUnmounted(() => {
  disposed = true;
  mobileViewport.removeEventListener('change', updateViewport);
  if (interval !== undefined) clearInterval(interval);
});

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
  await router.replace({ name: 'workspace' });
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
    const result = await auth.api.loginWithPhone({ phone: normalizePhone(form.phone), code: form.code });
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
  <main class="login-page" :data-theme="loginTheme" :style="themeVariables(loginTheme)">
    <header class="site-header">
      <a class="brand" href="/login" aria-label="教师台账登录首页"><img class="brand-logo" src="/brand/logo.png" alt="" width="48" height="48" />教师台账<span>班主任工作台</span></a>
      <el-popover v-model:visible="themeMenuOpen" trigger="click" placement="bottom-end" :width="208" :teleported="false">
        <template #reference>
          <button class="login-theme-trigger" type="button" aria-label="切换主题" title="切换主题" :aria-expanded="themeMenuOpen" aria-controls="login-theme-options">
            <Palette :size="20" aria-hidden="true" />
          </button>
        </template>
        <div id="login-theme-options" class="login-theme-options" role="group" aria-label="登录页主题">
          <button v-for="theme in themes" :key="theme.id" type="button" :aria-pressed="loginTheme === theme.id" @click="loginTheme = theme.id; themeMenuOpen = false">
            <span class="login-theme-swatch" :style="{ background: theme.paper, borderColor: theme.line }" aria-hidden="true"><i :style="{ background: theme.brand }"></i><i :style="{ background: theme.accent }"></i></span>
            <span>{{ theme.name }}</span><Check v-if="loginTheme === theme.id" :size="16" aria-hidden="true" />
          </button>
        </div>
      </el-popover>
    </header>

    <div class="login-layout">
      <section class="login-intro" aria-labelledby="intro-title">
        <h1 id="intro-title">把班级事务记清楚，<br />把时间留给学生。</h1>
        <p class="intro-copy">学生信息、日常记录与班主任工作，<br class="desktop-break" />从这里开始有序管理。</p>
        <div class="intro-notes" aria-label="工作台功能范围">
          <div><span>班级管理</span><p>花名册、班委与座位安排</p></div>
          <div><span>日常记录</span><p>请假、作业与学生关怀</p></div>
          <div><span>班主任工作</span><p>沟通、培训与待办事项</p></div>
        </div>
      </section>

      <section class="login-panel" aria-labelledby="login-title">
        <h2 id="login-title">登录工作台</h2>
        <p class="panel-description">使用你的账号，继续班级工作。</p>
        <div v-if="auth.restoreError || auth.storageError" class="login-session-error" role="alert">
          <p class="error-message">{{ auth.restoreError || auth.storageError }}</p>
          <el-button v-if="auth.restoreError" native-type="button" :loading="auth.restoring" :disabled="submitting || sending" @click="retrySession">重新验证登录</el-button>
        </div>
        <el-tabs v-model="loginMethod" stretch class="login-tabs" :class="{ 'phone-only': isMobile }">
          <el-tab-pane v-if="!isMobile" label="微信扫码" name="wechat" :disabled="submitting || sending">
            <ScanLogin v-if="loginMethod === 'wechat' && !auth.restoreError && !auth.restoring" @login="completeLogin" />
          </el-tab-pane>
          <el-tab-pane label="手机号验证码" name="phone">
            <el-form label-position="top" class="login-form" @submit.prevent="login">
              <el-form-item label="手机号" prop="phone" :error="fieldErrors.phone" for="phone">
                <el-input id="phone" v-model="form.phone" type="tel" inputmode="tel" autocomplete="tel"
                  placeholder="请输入手机号" :maxlength="20" :disabled="submitting || sending"
                  @input="fieldErrors.phone = ''" />
              </el-form-item>
              <el-form-item label="验证码" prop="code" :error="fieldErrors.code" for="sms-code">
                <div class="code-input-row">
                  <el-input id="sms-code" v-model="form.code" inputmode="numeric" autocomplete="one-time-code"
                    placeholder="4 位数字" :maxlength="4" :disabled="submitting" @input="fieldErrors.code = ''" />
                  <el-button native-type="button" :loading="sending" :disabled="countdown > 0 || submitting" @click="sendSms">
                    {{ countdown > 0 ? countdown + ' 秒后重发' : '获取验证码' }}
                  </el-button>
                </div>
              </el-form-item>
              <div class="form-feedback">
                <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>
                <p v-else-if="successMessage" class="success-message" role="status">{{ successMessage }}</p>
              </div>
              <el-button class="login-submit" type="primary" native-type="submit" :loading="submitting" :disabled="sending">登录工作台</el-button>
              <p class="login-hint">未注册的手机号验证通过后，将自动创建账号。</p>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </section>
    </div>
  </main>
</template>
