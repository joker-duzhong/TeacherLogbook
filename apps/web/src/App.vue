<script setup lang="ts">
import { watchEffect } from 'vue';
import { useWorkspaceStore } from './stores/workspace';
import { useRoute } from 'vue-router';
import { webThemeVariables } from './lib/theme';
import { Toaster } from '@/components/ui/sonner';
import ConfirmationHost from '@/components/ConfirmationHost.vue';
import 'vue-sonner/style.css';
const workspace=useWorkspaceStore();const route=useRoute();
watchEffect(()=>{for(const [key,value] of Object.entries(webThemeVariables(route.path.startsWith('/workspace')?workspace.skin:'mint')))document.documentElement.style.setProperty(key,value);});
</script>
<template>
  <RouterView />
  <ConfirmationHost />
  <Toaster position="top-center" :duration="3500" />
</template>
