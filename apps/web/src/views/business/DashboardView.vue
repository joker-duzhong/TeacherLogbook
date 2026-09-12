<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { Dashboard } from '@teacher-logbook/api-client';
import { localDate } from '@teacher-logbook/shared';
import { useAuthStore } from '../../stores/auth';
import { useWorkspaceStore } from '../../stores/workspace';
import AppButton from '@/components/AppButton.vue';
import AppNotice from '@/components/AppNotice.vue';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpRight, Plus, CalendarDays, RefreshCw, ClipboardCheck, HeartHandshake, BookOpen, NotebookPen } from '@lucide/vue';
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
watch(date,value=>{if(value)void load();});
</script>
<template>
 <div class="dashboard-datebar business-toolbar"><span><CalendarDays :size="16"/>统计日期</span><Input v-model="date" type="date" aria-label="统计日期"/><AppButton :loading="busy" @click="load"><RefreshCw/>刷新</AppButton></div>
 <AppNotice :message="error"/>
 <section class="quick-section"><div><h2>快速记录</h2><p>从一件小事开始，记下今天的班级日常。</p></div><div class="quick-actions"><RouterLink v-for="action in [['leave','记请假'],['homework','记作业'],['violations','记违纪'],['work','记工作'],['students','学生管理']]" :key="action[0]" :to="'/workspace/'+action[0]+'?new=1'"><Plus :size="16"/>{{ action[1] }}</RouterLink></div></section>
 <template v-if="data">
  <div class="section-heading"><h2>班级概况</h2><span>点击查看明细</span></div>
  <div class="metric-strip"><RouterLink v-for="metric in metrics" :key="String(metric[0])" :to="'/workspace/'+metric[2]"><span>{{ metric[0] }}<ArrowUpRight :size="15"/></span><strong>{{ metric[1] }}</strong></RouterLink></div>
  <div class="dashboard-columns">
   <section class="dashboard-section"><header><h2><ClipboardCheck :size="19"/>近期需跟进</h2><RouterLink to="/workspace/todos">全部待办<ArrowUpRight :size="15"/></RouterLink></header><div v-if="!data.upcomingTodos.length" class="dashboard-empty"><ClipboardCheck :size="26"/><p>暂无待办事项</p><RouterLink to="/workspace/todos?new=1">添加一项待办</RouterLink></div><RouterLink v-for="item in data.upcomingTodos" :key="item.id" to="/workspace/todos" class="dashboard-row"><span class="todo-dot"></span><strong>{{ item.title }}</strong><span>{{ item.due||'未设日期' }}</span></RouterLink></section>
   <section class="dashboard-section"><header><h2><HeartHandshake :size="19"/>学生关怀</h2><RouterLink to="/workspace/alerts">全部预警<ArrowUpRight :size="15"/></RouterLink></header><div class="risk-strip"><RouterLink v-for="risk in risks" :key="String(risk[0])" :to="'/workspace/'+risk[2]"><span>{{ risk[0] }}</span><strong :class="{ 'has-risk':Number(risk[1])>0 }">{{ risk[1] }}</strong></RouterLink></div><div v-if="!data.highRiskStudents.length" class="dashboard-empty compact-empty"><p>暂无高风险提醒</p></div><RouterLink v-for="item in data.highRiskStudents" :key="item.id" to="/workspace/alerts" class="dashboard-row"><strong>{{ workspace.studentName(item.studentId) }}</strong><span>{{ item.type }} · {{ item.status }}</span></RouterLink></section>
   <section class="dashboard-section"><header><h2><BookOpen :size="19"/>最近考试</h2><RouterLink to="/workspace/exams">考试列表<ArrowUpRight :size="15"/></RouterLink></header><div v-if="!data.latestExam" class="dashboard-empty"><BookOpen :size="26"/><p>暂无考试数据</p><RouterLink to="/workspace/exams?new=1">录入考试成绩</RouterLink></div><RouterLink v-else to="/workspace/exam-analysis" class="exam-overview"><span>{{ data.latestExam.subject }}</span><strong>{{ data.latestExam.name }}</strong><p>平均分 <b>{{ data.latestExam.average }}</b></p></RouterLink></section>
   <section class="dashboard-section"><header><h2><NotebookPen :size="19"/>近期工作</h2><RouterLink to="/workspace/work">全部记录<ArrowUpRight :size="15"/></RouterLink></header><div v-if="!data.recentWorkRecords.length" class="dashboard-empty"><NotebookPen :size="26"/><p>暂无工作记录</p><RouterLink to="/workspace/work?new=1">记录今天的工作</RouterLink></div><RouterLink v-for="item in data.recentWorkRecords" :key="item.id" to="/workspace/work" class="dashboard-row"><strong>{{ item.title }}</strong><span>{{ item.date }}</span></RouterLink></section>
  </div>
 </template>
 <div v-else-if="busy" class="loading-layout" role="status" aria-label="正在读取统计"><Skeleton class="h-28 w-full"/><Skeleton class="h-64 w-full"/></div>
</template>
