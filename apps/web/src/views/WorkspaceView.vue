<script setup lang="ts">
import { watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();
watch(() => auth.isAuthenticated, (authenticated) => {
  if (!authenticated) void router.replace({ name: 'login' });
});
function logout() {
  auth.clearSession();
}
</script>

<template>
  <main class="workspace-page">
    <header class="site-header">
      <span class="brand">教师台账<span>班主任工作台</span></span>
      <el-button @click="logout">退出登录</el-button>
    </header>
    <section class="workspace-content">
      <h1>{{ auth.user?.nickname || auth.user?.username || '老师' }}，你好。</h1>
      <p>登录已完成，当前登录信息仅保留在内存中。</p>
      <div class="workspace-notice">
        <h2>双端工作台正在分批接入</h2>
        <p>班级选择、学生管理和日常台账尚未迁移到当前页面。这里不展示模拟班级或统计数据。</p>
        <p v-if="auth.user?.needs_phone_binding">当前账号提示需要绑定手机号；绑定流程将在后续批次接入。</p>
      </div>
    </section>
  </main>
</template>
