<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ApiError } from '@teacher-logbook/api-client';
import type { BusinessRecord, RecordValues, Resource } from '@teacher-logbook/api-client';
import { csvText, localDate, moduleFor, summarizeRecords, validateRecord } from '@teacher-logbook/shared';
import type { Field, PageDefinition } from '@teacher-logbook/shared';
import { useAuthStore } from '../../stores/auth';
import { useWorkspaceStore } from '../../stores/workspace';
import { downloadText } from '../../lib/files';
const props = defineProps<{ page: PageDefinition }>();
const route = useRoute();
const auth = useAuthStore();
const workspace = useWorkspaceStore();
const module = moduleFor(props.page.resource!);
const resource = module.resource as Resource;
const rows = ref<BusinessRecord[]>([]);
const total = ref(0);
const pageNumber = ref(1);
const keyword = ref('');
const dateFrom = ref('');
const dateTo = ref('');
const status = ref('');
const error = ref('');
const busy = ref(false);
const saving = ref(false);
const editing = ref(false);
const editId = ref('');
const form = reactive<RecordValues>({});
const errors = ref<Record<string, string>>({});
const schedule = ref(props.page.mode === 'schedule');
const selectedExam = ref('');
const statusField = module.fields.find(field => field.key === 'status');
const summary = computed(() => props.page.mode === 'summary');
const displayRows = computed(() => selectedExam.value ? rows.value.filter(row => row.name === selectedExam.value) : rows.value);
const weekdays = ['周一','周二','周三','周四','周五','周六','周日'];
const summaryMetrics = computed(() => summarizeRecords(resource, displayRows.value));
function query() { return { ...props.page.filters, keyword: keyword.value, dateFrom: dateFrom.value, dateTo: dateTo.value, status: status.value }; }
function options(field: Field) { return field.kind === 'student' ? workspace.students.map(item => ({ value: item.id, label: `${item.name} · ${item.id.slice(0,6)}` })) : field.kind === 'role' ? workspace.roles.map(item=>({value:item.id,label:String(item.role)})) : (field.options??[]).map(value=>({value,label:value})); }
function display(row: BusinessRecord, field: Field) {
  if (field.kind === 'student') return workspace.studentName(row[field.key]);
  if (field.kind === 'role') return String(workspace.roles.find(item=>item.id===row[field.key])?.role ?? row[field.key] ?? '');
  return row[field.key] ?? '';
}
async function load() {
  busy.value = true; error.value = '';
  try {
    if (summary.value || schedule.value) { rows.value = await auth.api.allRecords(workspace.classId, resource, query()); total.value = rows.value.length; }
    else { const response=await auth.api.listRecords(workspace.classId, resource, {...query(),page:pageNumber.value,pageSize:20}); rows.value=response.items;total.value=response.total; }
  } catch (cause) { error.value=workspace.message(cause); } finally { busy.value=false; }
}
function openForm(row?: BusinessRecord) {
  for (const key of Object.keys(form)) delete form[key];
  for (const field of module.fields) form[field.key] = row?.[field.key] ?? props.page.filters?.[field.key] ?? (field.kind==='date'?localDate():field.kind==='number'?0:field.options?.[0]??'');
  editId.value=row?.id??'';errors.value={};editing.value=true;
}
async function save() {
  errors.value=validateRecord(module,form);if(Object.keys(errors.value).length||saving.value)return;
  saving.value=true;
  try {
    const values=Object.fromEntries(module.fields.map(field=>[field.key, form[field.key]===''&&!field.required?null:field.kind==='number'?Number(form[field.key]):form[field.key]??null]));
    await auth.api.saveRecord(workspace.classId,resource,values,editId.value||undefined);editing.value=false;ElMessage.success('已保存');
    if(['students','committee-roles'].includes(resource))await workspace.reloadReferences();await load();
  } catch(cause){if(cause instanceof ApiError)errors.value={...cause.fields};ElMessage.error(workspace.message(cause));} finally{saving.value=false;}
}
async function remove(row: BusinessRecord) {
  try{await ElMessageBox.confirm('删除后该记录将不再显示，确认删除？','删除记录',{type:'warning'});}catch{return;}
  busy.value=true;try{await auth.api.removeRecord(workspace.classId,resource,row.id);if(rows.value.length===1&&pageNumber.value>1)pageNumber.value--;if(['students','committee-roles'].includes(resource))await workspace.reloadReferences();await load();}catch(cause){error.value=workspace.message(cause);}finally{busy.value=false;}
}
async function toggleTodo(row: BusinessRecord) { try{await auth.api.saveRecord(workspace.classId,resource,{status:row.status==='已完成'?'待完成':'已完成'},row.id);await load();}catch(cause){ElMessage.error(workspace.message(cause));} }
async function exportRows() {busy.value=true;try{const items=await auth.api.allRecords(workspace.classId,resource,query());downloadText(csvText(module.fields.map(field=>field.label),items.map(row=>module.fields.map(field=>display(row,field)))),`${props.page.name}.csv`,'text/csv;charset=utf-8');}catch(cause){error.value=workspace.message(cause);}finally{busy.value=false;}}
async function search(){pageNumber.value=1;await load();}
function closeForm(done: () => void) { if (!saving.value) done(); }
onMounted(async()=>{await load();if(route.query.new==='1')openForm();});
</script>
<template>
  <div class="business-toolbar">
    <el-input v-model="keyword" placeholder="搜索记录" aria-label="搜索记录" clearable @keyup.enter="search" />
    <el-select v-if="statusField" v-model="status" placeholder="全部状态" clearable aria-label="记录状态"><el-option v-for="option in statusField.options" :key="option" :label="option" :value="option" /></el-select>
    <template v-if="module.fields.some(field=>field.key==='date')"><el-date-picker v-model="dateFrom" value-format="YYYY-MM-DD" placeholder="开始日期" /><el-date-picker v-model="dateTo" value-format="YYYY-MM-DD" placeholder="结束日期" /></template>
    <el-button :loading="busy" @click="search">查询</el-button><el-button :disabled="busy" @click="exportRows">导出全部结果</el-button><el-button type="primary" :disabled="busy" @click="openForm()">新增</el-button>
  </div>
  <el-alert v-if="error" :title="error" type="error" :closable="false" />
  <el-radio-group v-if="resource==='courses'" v-model="schedule" @change="load"><el-radio-button :value="false">列表</el-radio-button><el-radio-button :value="true">周课表</el-radio-button></el-radio-group>
  <el-select v-if="summary&&resource==='exams'" v-model="selectedExam" clearable placeholder="选择考试" aria-label="选择考试"><el-option v-for="name in [...new Set(rows.map(row=>String(row.name)))]" :key="name" :value="name" :label="name" /></el-select>
  <div v-if="summary" class="summary-strip"><div v-for="metric in summaryMetrics" :key="String(metric[0])"><span>{{ metric[0] }}</span><strong>{{ metric[1] }}</strong></div></div>
  <div v-if="summary&&resource==='exams'" class="exam-bars"><div v-for="row in displayRows" :key="row.id"><span>{{ row.name }} · {{ row.subject }}</span><meter :value="Number(row.average)" :max="Math.max(...displayRows.map(item=>Number(item.average)),1)" /><strong>{{ row.average }}</strong></div></div>
  <div v-if="schedule" class="weekly-schedule"><section v-for="day in weekdays" :key="day"><h2>{{ day }}</h2><p v-if="!rows.some(row=>row.day===day)" class="muted">暂无课程</p><button v-for="row in rows.filter(row=>row.day===day).sort((left,right)=>String(left.startTime).localeCompare(String(right.startTime)))" :key="row.id" class="course-item" @click="openForm(row)"><strong>{{ row.course }}</strong><span>{{ row.teacher }}</span><small>{{ String(row.startTime).slice(0,5) }} - {{ String(row.endTime).slice(0,5) }}</small></button></section></div>
  <el-table v-else v-loading="busy" :data="displayRows" stripe empty-text="暂无记录" class="business-table">
    <el-table-column v-for="field in module.fields" :key="field.key" :label="field.label" :min-width="field.kind==='textarea'?220:130" show-overflow-tooltip><template #default="scope"><a v-if="field.kind==='url'&&/^https?:\/\//.test(String(scope.row[field.key]))" :href="String(scope.row[field.key])" target="_blank" rel="noopener noreferrer">{{ display(scope.row,field) }}</a><span v-else>{{ display(scope.row,field) }}</span></template></el-table-column>
    <el-table-column v-if="resource==='committee-members'" label="职责" min-width="200"><template #default="scope">{{ workspace.roles.find(role=>role.id===scope.row.roleId)?.duty }}</template></el-table-column>
    <el-table-column label="操作" fixed="right" :width="resource==='todos'?200:140"><template #default="scope"><el-button v-if="resource==='todos'" link @click="toggleTodo(scope.row)">{{ scope.row.status==='已完成'?'重开':'完成' }}</el-button><el-button link type="primary" @click="openForm(scope.row)">编辑</el-button><el-button link type="danger" :disabled="busy" @click="remove(scope.row)">删除</el-button></template></el-table-column>
  </el-table>
  <el-pagination v-if="!summary&&!schedule" v-model:current-page="pageNumber" :page-size="20" :total="total" layout="total, prev, pager, next" @current-change="load" />
  <el-dialog v-model="editing" :title="(editId?'编辑':'新增')+' · '+module.name" width="560px" :close-on-click-modal="false" :before-close="closeForm">
    <el-form label-position="top" @submit.prevent="save"><el-form-item v-for="field in module.fields" :key="field.key" :label="field.label" :error="errors[field.key]" :required="field.required">
      <el-select v-if="['student','role','select'].includes(field.kind)" v-model="form[field.key]" filterable :disabled="saving" style="width:100%"><el-option v-for="option in options(field)" :key="option.value" :label="option.label" :value="option.value" /></el-select>
      <el-input v-else v-model="form[field.key]" :type="field.kind==='textarea'?'textarea':field.kind==='date'?'date':field.kind==='time'?'time':field.kind==='number'?'number':'text'" :inputmode="field.kind==='money'?'decimal':undefined" :rows="4" :disabled="saving" />
    </el-form-item><div class="form-actions"><el-button :disabled="saving" @click="editing=false">取消</el-button><el-button type="primary" native-type="submit" :loading="saving">保存</el-button></div></el-form>
  </el-dialog>
</template>
