<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { pages } from '@teacher-logbook/shared';
import DashboardView from './business/DashboardView.vue';
import RecordsView from './business/RecordsView.vue';
import SeatBoardView from './business/SeatBoardView.vue';
import SettingsView from './business/SettingsView.vue';
import DataView from './business/DataView.vue';
const route = useRoute();
const page = computed(() => pages.find(item => item.id === route.params.page) ?? pages[0]!);
</script>
<template>
  <DashboardView v-if="page.id === 'dashboard'" />
  <SeatBoardView v-else-if="page.id === 'seats'" />
  <SettingsView v-else-if="['settings', 'classes'].includes(page.id)" :mode="page.id" />
  <DataView v-else-if="page.id === 'data' || page.mode === 'import'" :students-only="page.mode === 'import'" />
  <RecordsView v-else :page="page" />
</template>
