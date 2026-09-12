<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { LoaderCircle } from '@lucide/vue';
withDefaults(defineProps<{ variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'; size?: 'default' | 'sm' | 'lg' | 'icon'; loading?: boolean; disabled?: boolean; type?: 'button' | 'submit' | 'reset' }>(), { variant: 'outline', type: 'button' });
</script>
<template><Button :variant="variant" :size="size" :type="type" :disabled="disabled || loading" :aria-busy="loading || undefined" class="app-button"><LoaderCircle v-if="loading" class="animate-spin" :size="16" aria-hidden="true"/><slot /></Button></template>
