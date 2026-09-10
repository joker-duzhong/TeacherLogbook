<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import MiniApp from '../../components/MiniApp.vue';
import '../../miniapp.css';
const workspace = ref<InstanceType<typeof MiniApp>>();
onShow(() => workspace.value?.refresh());
</script>
<template><MiniApp ref="workspace" /></template>
