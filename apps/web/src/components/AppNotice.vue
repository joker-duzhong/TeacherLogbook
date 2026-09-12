<script setup lang="ts">
import { CircleAlert, CircleCheck } from '@lucide/vue';
withDefaults(defineProps<{ message?: string; tone?: 'error' | 'success' | 'info' }>(), { tone: 'error' });
</script>
<template><div v-if="message" class="app-notice" :class="tone" :role="tone === 'error' ? 'alert' : 'status'"><CircleCheck v-if="tone==='success'" :size="18"/><CircleAlert v-else :size="18"/><span>{{ message }}</span><slot/></div></template>
