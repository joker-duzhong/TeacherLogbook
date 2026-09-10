<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { Dashboard } from '@teacher-logbook/api-client';
import { localDate } from '@teacher-logbook/shared';
import { useAuthStore } from '../../stores/auth';
import { useWorkspaceStore } from '../../stores/workspace';
const auth = useAuthStore();
const workspace = useWorkspaceStore();
const data = ref<Dashboard>();
const date = ref(localDate());
const error = ref('');
const busy = ref(false);
let revision = 0;
onBeforeUnmount(() => { revision++; });
const metrics = computed(() => data.value ? [
  ['学生人数', data.value.studentSummary.total, 'students'], ['今日请假', data.value.leaveToday, 'leave'], ['未交作业人次', data.value.unsubmittedHomework, 'homework'],
  ['违纪记录', data.value.violationCount, 'violations'], ['本月工作', data.value.workRecordsThisMonth, 'work'], ['待办事项', data.value.pendingTodoCount, 'todos'],
] : []);
const risks = computed(() => data.value ? [['情绪预警', data.value.alertSummary.emotion, 'emotion'], ['特殊体质', data.value.alertSummary.specialHealth, 'health'], ['辍学风险', data.value.alertSummary.dropoutRisk, 'dropout'], ['未返校', data.value.alertSummary.notReturned, 'not-returned'], ['待处理', data.value.alertSummary.pending, 'alerts']] : []);
async function load() {
  const current = ++revision;
  busy.value = true; error.value = '';
  try { const value = await auth.api.getDashboard(workspace.classId, date.value); if (current === revision) data.value = value; }
  catch (cause) { if (current === revision) error.value = workspace.message(cause); }
  finally { if (current === revision) busy.value = false; }
}
onMounted(load);
</script>
<template>
  <div class="business-toolbar"><el-date-picker v-model="date" type="date" value-format="YYYY-MM-DD" :clearable="false" aria-label="统计日期" @change="load" /><el-button :loading="busy" @click="load">刷新</el-button></div>
  <el-alert v-if="error" :title="error" type="error" :closable="false" />
  <div class="quick-actions"><RouterLink v-for="action in [['leave','记请假'],['homework','记作业'],['violations','记违纪'],['work','记工作'],['students','学生管理']]" :key="action[0]" :to="'/workspace/' + action[0] + '?new=1'">{{ action[1] }}</RouterLink></div>
  <template v-if="data">
    <div class="metric-strip"><RouterLink v-for="metric in metrics" :key="String(metric[0])" :to="'/workspace/' + metric[2]"><span>{{ metric[0] }}</span><strong>{{ metric[1] }}</strong></RouterLink></div>
    <h2 class="section-title">风险预警</h2><div class="risk-strip"><RouterLink v-for="risk in risks" :key="String(risk[0])" :to="'/workspace/' + risk[2]"><span>{{ risk[0] }}</span><strong>{{ risk[1] }}</strong></RouterLink></div>
    <div class="dashboard-columns">
      <section><h2>高风险学生</h2><p v-if="!data.highRiskStudents.length" class="muted">暂无高风险提醒</p><RouterLink v-for="item in data.highRiskStudents" :key="item.id" to="/workspace/alerts" class="dashboard-row"><strong>{{ workspace.studentName(item.studentId) }}</strong><span>{{ item.type }} · {{ item.status }}</span></RouterLink></section>
      <section><h2>近期需跟进</h2><p v-if="!data.upcomingTodos.length" class="muted">暂无待办事项</p><RouterLink v-for="item in data.upcomingTodos" :key="item.id" to="/workspace/todos" class="dashboard-row"><strong>{{ item.title }}</strong><span>{{ item.due || '未设日期' }}</span></RouterLink></section>
      <section><h2>最近考试</h2><p v-if="!data.latestExam" class="muted">暂无考试数据</p><RouterLink v-else to="/workspace/exam-analysis" class="dashboard-row"><strong>{{ data.latestExam.name }} · {{ data.latestExam.subject }}</strong><span>平均分 {{ data.latestExam.average }}</span></RouterLink></section>
      <section><h2>近期工作</h2><p v-if="!data.recentWorkRecords.length" class="muted">暂无工作记录</p><RouterLink v-for="item in data.recentWorkRecords" :key="item.id" to="/workspace/work" class="dashboard-row"><strong>{{ item.title }}</strong><span>{{ item.date }}</span></RouterLink></section>
    </div>
  </template>
  <div v-else-if="busy" class="business-empty" role="status">正在读取统计</div>
</template>
