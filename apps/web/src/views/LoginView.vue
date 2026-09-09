<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ApiError } from '@teacher-logbook/api-client';
import type { LoginResult } from '@teacher-logbook/api-client';
import { getRemainingSeconds, isValidPhone, isValidSmsCode, normalizePhone } from '@teacher-logbook/shared';
import { useAuthStore } from '../stores/auth';
import ScanLogin from './ScanLogin.vue';

const auth = useAuthStore();
const router = useRouter();
const loginMethod = ref('wechat');
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

onMounted(() => {
  interval = setInterval(() => { countdown.value = getRemainingSeconds(deadline, Date.now()); }, 1000);
});
onUnmounted(() => {
  disposed = true;
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
  <main class="login-page">
    <header class="site-header">
      <a class="brand" href="/login" aria-label="教师台账登录首页">教师台账<span>班主任工作台</span></a>
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
        <el-tabs v-model="loginMethod" stretch class="login-tabs">
          <el-tab-pane label="微信扫码" name="wechat" :disabled="submitting || sending">
            <ScanLogin v-if="loginMethod === 'wechat'" @login="completeLogin" />
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
