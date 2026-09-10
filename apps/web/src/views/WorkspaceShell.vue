<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { groups, pages, themeVariables } from '@teacher-logbook/shared';
import { BookOpen, ClipboardList, HeartHandshake, LayoutDashboard, Link, Menu, Settings, Users, ChevronDown } from '@lucide/vue';
import { useAuthStore } from '../stores/auth';
import { useWorkspaceStore } from '../stores/workspace';
import './workspace.css';

const auth = useAuthStore();
const workspace = useWorkspaceStore();
const route = useRoute();
const router = useRouter();
const menuOpen = ref(false);
const collapsed = ref<string[]>([]);
const groupIcons = [LayoutDashboard, Users, BookOpen, HeartHandshake, ClipboardList, Link, Settings];
function toggleGroup(group: string) { collapsed.value = collapsed.value.includes(group) ? collapsed.value.filter(item => item !== group) : [...collapsed.value, group]; }
const current = computed(() => pages.find(page => page.id === route.params.page) ?? pages[0]!);
onMounted(() => { void workspace.load(); });
onUnmounted(() => workspace.reset());
watch(() => auth.isAuthenticated, (authenticated) => {
  if (!authenticated) { workspace.reset(); void router.replace('/login'); }
}, { flush: 'sync' });
async function logout() { auth.clearSession(); workspace.reset(); await router.replace('/login'); }
</script>

<template>
  <div class="business-app" :data-theme="workspace.skin" :style="themeVariables(workspace.skin)">
    <button v-if="menuOpen" class="nav-backdrop" aria-label="关闭导航" @click="menuOpen = false"></button>
    <aside class="business-nav" :class="{ open: menuOpen }">
      <RouterLink to="/workspace/dashboard" class="workspace-brand">教师台账<span>班主任工作台</span></RouterLink>
      <nav aria-label="工作台导航">
        <section v-for="(group, index) in groups" :key="group">
          <button class="nav-group-toggle" :aria-expanded="!collapsed.includes(group)" @click="toggleGroup(group)"><component :is="groupIcons[index]" :size="15"/><span>{{ group }}</span><ChevronDown :size="14" :class="{rotated:collapsed.includes(group)}"/></button>
          <div v-show="!collapsed.includes(group)"><RouterLink v-for="page in pages.filter(item => item.group === group)" :key="page.id" :to="'/workspace/' + page.id" @click="menuOpen = false">{{ page.name }}</RouterLink></div>
        </section>
      </nav>
    </aside>
    <main class="business-main">
      <header class="business-topbar">
        <button class="mobile-nav-toggle" aria-label="展开导航" title="展开导航" @click="menuOpen = !menuOpen"><Menu :size="20"/></button>
        <div><span class="business-eyebrow">{{ current.group }}</span><h1>{{ current.name }}</h1></div>
        <div class="business-account">
          <el-select :model-value="workspace.classId" aria-label="当前班级" placeholder="选择班级" :disabled="workspace.busy" @change="workspace.selectClass"><el-option v-for="item in workspace.classes" :key="item.id" :label="item.name" :value="item.id" /></el-select>
          <RouterLink to="/workspace/settings" class="text-action">皮肤</RouterLink>
          <el-button @click="logout">退出</el-button>
        </div>
      </header>
      <el-alert v-if="workspace.error" :title="workspace.error" type="error" show-icon :closable="false" />
      <div v-if="workspace.busy" class="business-empty" role="status">正在读取工作台</div>
      <section v-else-if="!workspace.classId && !['classes', 'settings'].includes(current.id)" class="business-empty">
        <h2>{{ workspace.error ? '工作台加载失败' : '还没有班级' }}</h2>
        <el-button v-if="workspace.error" @click="workspace.load">重新加载</el-button>
        <RouterLink v-else to="/workspace/classes" class="primary-link">创建班级</RouterLink>
      </section>
      <RouterView v-else :key="String(route.params.page) + workspace.classId" />
    </main>
  </div>
</template>
