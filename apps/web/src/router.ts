import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { pages } from '@teacher-logbook/shared';
import { passportCallbackPath, safeWorkspacePath } from './lib/passport-login';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: () => import('./views/LoginView.vue') },
    { path: passportCallbackPath, name: 'passport-callback', component: () => import('./views/PassportCallbackView.vue') },
    { path: '/workspace', component: () => import('./views/WorkspaceShell.vue'), meta: { requiresAuth: true }, children: [
      { path: '', name: 'workspace', redirect: '/workspace/dashboard' },
      { path: ':page', name: 'business', component: () => import('./views/BusinessPage.vue') },
    ] },
    { path: '/:pathMatch(.*)*', redirect: '/login' },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  await auth.restoreSession();
  if (to.meta.requiresAuth && !auth.isAuthenticated) return { name: 'login', query: { redirect: safeWorkspacePath(to.fullPath) } };
  if (to.name === 'business' && !pages.some(page => page.id === to.params.page)) return '/workspace/dashboard';
  if (to.name === 'login' && auth.isAuthenticated) return { name: 'workspace' };
});
