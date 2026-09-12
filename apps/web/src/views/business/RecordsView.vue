<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { toast as notify } from 'vue-sonner';
import { confirmation } from '@/lib/confirmation';
import AppButton from '@/components/AppButton.vue';
import AppSelect from '@/components/AppSelect.vue';
import AppNotice from '@/components/AppNotice.vue';
import AppModal from '@/components/AppModal.vue';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';
import { ApiError } from '@teacher-logbook/api-client';
import type { BusinessRecord, RecordValues, Resource } from '@teacher-logbook/api-client';
import { csvText, localDate, moduleFor, summarizeRecords, validateRecord } from '@teacher-logbook/shared';
import type { Field, PageDefinition } from '@teacher-logbook/shared';
import { useAuthStore } from '../../stores/auth';
import { useWorkspaceStore } from '../../stores/workspace';
import { downloadText } from '../../lib/files';
import { useCompactViewport } from '../../lib/viewport';
import { Search, SlidersHorizontal, Plus, Download, MoreHorizontal, FileSearch } from '@lucide/vue';
import RecordFilters from './RecordFilters.vue';
const props = defineProps<{ page: PageDefinition }>();
const route = useRoute();
const auth = useAuthStore();
const workspace = useWorkspaceStore();
const compact = useCompactViewport();
const filtersOpen = ref(false);
const initialForm = ref('');
const formElement = ref<HTMLElement>();
const saveError = ref('');
const pageCount=computed(()=>Math.max(1,Math.ceil(total.value/20)));
const pageButtons=computed(()=>Array.from({length:Math.min(5,pageCount.value)},(_,i)=>Math.min(Math.max(1,pageNumber.value-2),Math.max(1,pageCount.value-4))+i));
async function goPage(value:number){if(busy.value||saving.value)return;pageNumber.value=value;await load();}
const drawerClose=()=>closeForm(()=>{editing.value=false;});
async function canLeave() { if(saving.value&&!confirming)return false;if(!editing.value||JSON.stringify(form)===initialForm.value)return true;let allowed=false;await closeForm(()=>{allowed=true;editing.value=false;});return allowed; }
onBeforeRouteLeave(canLeave);
onBeforeRouteUpdate(canLeave);
const selectedClass = workspace.classId;
let disposed = false;
let revision = 0;
let confirming = false;
const active = () => !disposed && selectedClass === workspace.classId;
onBeforeUnmount(() => { disposed = true; revision++; if (confirming) confirmation.close(); });
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
const hasDates = module.fields.some(field => field.key === 'date');
const filterCount = computed(() => [status.value, dateFrom.value, dateTo.value].filter(Boolean).length);
const filtered = computed(() => Boolean(keyword.value || filterCount.value));
const primaryField = module.fields.find(field => ['name', 'title', 'course', 'studentId', 'role'].includes(field.key)) ?? module.fields[0]!;
const summary = computed(() => props.page.mode === 'summary');
const displayRows = computed(() => selectedExam.value ? rows.value.filter(row => row.name === selectedExam.value) : rows.value);
const weekdays = ['周一','周二','周三','周四','周五','周六','周日'];
const summaryMetrics = computed(() => summarizeRecords(resource, displayRows.value));
function query() { return { ...props.page.filters, keyword: keyword.value, dateFrom: dateFrom.value || undefined, dateTo: dateTo.value || undefined, status: status.value }; }
function options(field: Field) { return field.kind === 'student' ? workspace.students.map(item => ({ value: item.id, label: `${item.name} · ${item.id.slice(0,6)}` })) : field.kind === 'role' ? workspace.roles.map(item=>({value:item.id,label:String(item.role)})) : (field.options??[]).map(value=>({value,label:value})); }
function display(row: BusinessRecord, field: Field) {
  if (field.kind === 'student') return workspace.studentName(row[field.key]);
  if (field.kind === 'role') return String(workspace.roles.find(item=>item.id===row[field.key])?.role ?? row[field.key] ?? '');
  return row[field.key] ?? '';
}
async function load() {
  if (!active()) return;
  const current = ++revision;
  busy.value = true; error.value = '';
  try {
    if (summary.value || schedule.value) {
      const items = await auth.api.allRecords(selectedClass, resource, query());
      if (current === revision && active()) { rows.value = items; total.value = items.length; }
    } else {
      const response = await auth.api.listRecords(selectedClass, resource, {...query(),page:pageNumber.value,pageSize:20});
      if (current === revision && active()) { rows.value = response.items; total.value = response.total; }
    }
  } catch (cause) { if (current === revision && active()) error.value=workspace.message(cause); }
  finally { if (current === revision) busy.value=false; }
}
function openForm(row?: BusinessRecord) {
  if (!active() || saving.value) return;
  for (const key of Object.keys(form)) delete form[key];
  for (const field of module.fields) form[field.key] = row?.[field.key] ?? props.page.filters?.[field.key] ?? (field.kind==='date'?localDate():field.kind==='number'?0:field.options?.[0]??'');
  editId.value=row?.id??'';errors.value={};saveError.value='';initialForm.value=JSON.stringify(form);editing.value=true;
}
async function save() {
  if (!active()) return;
  errors.value=validateRecord(module,form);saveError.value='';
  if(Object.keys(errors.value).length){await nextTick();formElement.value?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus();return;}
  if(saving.value)return;
  saving.value=true;
  try {
    const values=Object.fromEntries(module.fields.map(field=>[field.key, form[field.key]===''&&!field.required?null:field.kind==='number'?Number(form[field.key]):form[field.key]??null]));
    await auth.api.saveRecord(selectedClass,resource,values,editId.value||undefined);if(!active())return;editing.value=false;notify.success('已保存');
    if(['students','committee-roles'].includes(resource))await workspace.reloadReferences();await load();
  } catch(cause){if(active()){if(cause instanceof ApiError)errors.value={...cause.fields};saveError.value=workspace.message(cause);}} finally{saving.value=false;}
}
async function remove(row: BusinessRecord) {
  if(!active()||busy.value||saving.value)return;
  saving.value=true;confirming=true;
  try{
    await confirmation.confirm('删除后该记录将不再显示，确认删除？','删除记录',{type:'warning'});
    confirming=false;if(!active())return;
    await auth.api.removeRecord(selectedClass,resource,row.id);if(!active())return;
    if(rows.value.length===1&&pageNumber.value>1)pageNumber.value--;
    notify.success('记录已删除');
    if(['students','committee-roles'].includes(resource))await workspace.reloadReferences();await load();
  }catch(cause){if(active()&&cause!=='cancel'&&cause!=='close')error.value=workspace.message(cause);}finally{confirming=false;saving.value=false;}
}
async function toggleTodo(row: BusinessRecord) { if(!active()||busy.value||saving.value)return;saving.value=true;try{await auth.api.saveRecord(selectedClass,resource,{status:row.status==='已完成'?'待完成':'已完成'},row.id);await load();}catch(cause){if(active())notify.error(workspace.message(cause));}finally{saving.value=false;} }
async function exportRows() {if(!active()||busy.value||saving.value)return;saving.value=true;error.value='';try{const items=await auth.api.allRecords(selectedClass,resource,query());if(!active())return;downloadText(csvText(module.fields.map(field=>field.label),items.map(row=>module.fields.map(field=>display(row,field)))),`${props.page.name}.csv`,'text/csv;charset=utf-8');}catch(cause){if(active())error.value=workspace.message(cause);}finally{saving.value=false;}}
async function search(){if(saving.value)return;if(dateFrom.value&&dateTo.value&&dateFrom.value>dateTo.value){error.value='开始日期不能晚于结束日期';return;}filtersOpen.value=false;pageNumber.value=1;await load();}
async function resetFilters(){keyword.value='';status.value='';dateFrom.value='';dateTo.value='';await search();}
async function closeForm(done: () => void) {
  if (saving.value || confirming) return;
  if (JSON.stringify(form) !== initialForm.value) {
    confirming=true;
    try { await confirmation.confirm('关闭后，本次尚未保存的修改会丢失。', '放弃修改？', { confirmButtonText:'放弃修改', cancelButtonText:'继续编辑', type:'warning' }); }
    catch { return; }
    finally { confirming=false; }
  }
  if(active())done();
}
onMounted(async()=>{await load();if(active()&&route.query.new==='1')openForm();});
</script>
<template>
 <section class="records-page">
  <div class="record-heading"><p><strong>{{ total }}</strong> {{ resource==='students'?'名学生':'条记录' }}<span v-if="filtered" class="muted"> · 当前筛选结果</span></p><div class="toolbar-actions"><AppButton v-if="resource==='students'" @click="$router.push('/workspace/student-files')">导入学生</AppButton><AppButton :disabled="busy||saving" @click="exportRows"><Download/>导出全部结果</AppButton><AppButton variant="default" :disabled="busy||saving" @click="openForm()"><Plus/>新增</AppButton></div></div>
  <div class="data-surface">
   <form class="business-toolbar record-toolbar" role="search" @submit.prevent="search"><div class="search-control"><Search/><Input v-model="keyword" :placeholder="resource==='students'?'搜索姓名或家长联系方式':'搜索记录'" aria-label="搜索记录" :disabled="saving" @keydown.enter.prevent="search"/></div><AppButton type="submit" :loading="busy">查询</AppButton><AppButton v-if="hasDates||statusField" :aria-expanded="filtersOpen" @click="filtersOpen=!filtersOpen"><SlidersHorizontal/>筛选<span v-if="filterCount" class="filter-count">{{ filterCount }}</span></AppButton><AppButton v-if="filtered" variant="ghost" :disabled="saving" @click="resetFilters">重置</AppButton></form>
   <form v-if="!compact&&filtersOpen" class="desktop-filter-panel" @submit.prevent="search"><RecordFilters v-model:status="status" v-model:from="dateFrom" v-model:to="dateTo" :statuses="statusField?.options" :dates="hasDates" :disabled="saving"/><AppButton type="submit" variant="default" :loading="busy">应用筛选</AppButton></form>
   <AppNotice v-if="!compact||!filtersOpen" :message="error"/>
   <div v-if="resource==='courses'||summary" class="record-view-options"><div v-if="resource==='courses'" class="segmented-control" role="group" aria-label="课程展示方式"><AppButton :variant="!schedule?'secondary':'ghost'" :aria-pressed="!schedule" @click="schedule=false;load()">列表</AppButton><AppButton :variant="schedule?'secondary':'ghost'" :aria-pressed="schedule" @click="schedule=true;load()">周课表</AppButton></div><AppSelect v-if="summary&&resource==='exams'" v-model="selectedExam" :options="[...new Set(rows.map(row=>String(row.name)))].map(value=>({value,label:value}))" label="选择考试" placeholder="选择考试" clearable/></div>
   <div v-if="summary" class="summary-strip"><div v-for="metric in summaryMetrics" :key="String(metric[0])"><span>{{ metric[0] }}</span><strong>{{ metric[1] }}</strong></div></div>
   <div v-if="summary&&resource==='exams'" class="exam-bars"><div v-for="row in displayRows" :key="row.id"><span>{{ row.name }} · {{ row.subject }}</span><meter :value="Number(row.average)" :max="Math.max(...displayRows.map(item=>Number(item.average)),1)"/><strong>{{ row.average }}</strong></div></div>
   <div v-if="busy&&!rows.length" class="loading-layout" role="status" aria-label="正在读取记录"><Skeleton v-for="i in 5" :key="i" class="h-12 w-full"/></div>
   <div v-else-if="schedule" class="weekly-schedule"><section v-for="day in weekdays" :key="day"><h2>{{ day }}</h2><p v-if="!rows.some(row=>row.day===day)" class="muted">暂无课程</p><button v-for="row in rows.filter(row=>row.day===day).sort((a,b)=>String(a.startTime).localeCompare(String(b.startTime)))" :key="row.id" class="course-item" @click="openForm(row)"><strong>{{ row.course }}</strong><span>{{ row.teacher }}</span><small>{{ String(row.startTime).slice(0,5) }} – {{ String(row.endTime).slice(0,5) }}</small></button></section></div>
   <div v-else-if="!displayRows.length" class="business-empty"><FileSearch :size="32"/><h2>{{ filtered?'没有符合条件的记录':'暂无记录' }}</h2><p>{{ filtered?'调整关键词或重置筛选后再试。':'点击新增，开始记录班级日常。' }}</p><AppButton v-if="filtered" @click="resetFilters">重置筛选</AppButton></div>
   <div v-else-if="compact" class="record-list" :aria-busy="busy"><article v-for="row in displayRows" :key="row.id" class="record-card"><header><span class="record-avatar">{{ String(display(row,primaryField)).slice(0,1) }}</span><h2>{{ display(row,primaryField)||'未填写' }}</h2><AppButton variant="ghost" :disabled="busy||saving" @click="openForm(row)">编辑</AppButton><DropdownMenu><DropdownMenuTrigger as-child><AppButton variant="ghost" size="icon" :disabled="busy||saving" :aria-label="String(display(row,primaryField))+'的更多操作'"><MoreHorizontal/></AppButton></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem @select="remove(row)">删除记录</DropdownMenuItem></DropdownMenuContent></DropdownMenu></header><dl><div v-for="field in module.fields.filter(item=>item.key!==primaryField.key)" :key="field.key"><dt>{{ field.label }}</dt><dd><a v-if="field.kind==='url'&&/^https?:\/\//.test(String(row[field.key]))" :href="String(row[field.key])" target="_blank" rel="noopener noreferrer">{{ display(row,field) }}</a><span v-else :class="{'status-label':field.key==='status'}">{{ display(row,field)===''?'—':display(row,field) }}</span></dd></div><div v-if="resource==='committee-members'"><dt>职责</dt><dd>{{ workspace.roles.find(role=>role.id===row.roleId)?.duty||'—' }}</dd></div></dl><footer v-if="resource==='todos'"><AppButton :disabled="busy||saving" @click="toggleTodo(row)">{{ row.status==='已完成'?'重开':'完成' }}</AppButton></footer></article></div>
   <Table v-else class="business-table" :aria-busy="busy"><TableHeader><TableRow><TableHead class="row-index">序号</TableHead><TableHead v-for="field in module.fields" :key="field.key">{{ field.label }}</TableHead><TableHead v-if="resource==='committee-members'">职责</TableHead><TableHead class="table-actions">操作</TableHead></TableRow></TableHeader><TableBody><TableRow v-for="(row,index) in displayRows" :key="row.id"><TableCell class="row-index">{{ (pageNumber-1)*20+index+1 }}</TableCell><TableCell v-for="field in module.fields" :key="field.key" :class="{'long-cell':field.kind==='textarea','primary-cell':field.key===primaryField.key}"><a v-if="field.kind==='url'&&/^https?:\/\//.test(String(row[field.key]))" :href="String(row[field.key])" target="_blank" rel="noopener noreferrer">{{ display(row,field) }}</a><span v-else :class="{'status-label':field.key==='status'}">{{ display(row,field)===''?'—':display(row,field) }}</span></TableCell><TableCell v-if="resource==='committee-members'">{{ workspace.roles.find(role=>role.id===row.roleId)?.duty }}</TableCell><TableCell class="table-actions"><AppButton v-if="resource==='todos'" variant="ghost" :disabled="busy||saving" @click="toggleTodo(row)">{{ row.status==='已完成'?'重开':'完成' }}</AppButton><AppButton variant="ghost" :disabled="busy||saving" @click="openForm(row)">编辑</AppButton><DropdownMenu><DropdownMenuTrigger as-child><AppButton variant="ghost" size="icon" :disabled="busy||saving" :aria-label="String(display(row,primaryField))+'的更多操作'"><MoreHorizontal/></AppButton></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem @select="remove(row)">删除记录</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow></TableBody></Table>
   <nav v-if="!summary&&!schedule" class="record-pagination" aria-label="记录分页"><span>共 {{ total }} 条</span><div><AppButton :disabled="pageNumber<=1||busy||saving" @click="goPage(pageNumber-1)">上一页</AppButton><AppButton v-for="number in pageButtons" :key="number" :variant="number===pageNumber?'secondary':'ghost'" :aria-current="number===pageNumber?'page':undefined" :disabled="busy||saving" @click="goPage(number)">{{ number }}</AppButton><AppButton :disabled="pageNumber>=pageCount||busy||saving" @click="goPage(pageNumber+1)">下一页</AppButton></div></nav>
  </div>
  <Sheet :open="compact&&filtersOpen" @update:open="filtersOpen=$event"><SheetContent side="bottom" class="filter-sheet"><SheetHeader><SheetTitle>筛选记录</SheetTitle><SheetDescription>设置范围后查看结果，重置可清除全部条件。</SheetDescription></SheetHeader><RecordFilters v-model:status="status" v-model:from="dateFrom" v-model:to="dateTo" :statuses="statusField?.options" :dates="hasDates" :disabled="saving"/><AppNotice :message="error"/><SheetFooter><AppButton @click="resetFilters">重置</AppButton><AppButton variant="default" :loading="busy" @click="search">查看结果</AppButton></SheetFooter></SheetContent></Sheet>
  <AppModal v-model="editing" :title="(editId?'编辑':'新增')+' · '+module.name" description="带 * 的项目为必填项。" :busy="saving" :before-close="closeForm" panel-class="record-dialog"><div ref="formElement"><AppNotice :message="saveError"/><form class="record-form" @submit.prevent="save"><div v-for="field in module.fields" :key="field.key" class="form-field" :class="{'form-full-width':field.kind==='textarea'}"><label :for="'field-'+field.key">{{ field.label }}<span v-if="field.required" class="required-mark"> *</span></label><AppSelect v-if="['student','role','select'].includes(field.kind)" :id="'field-'+field.key" v-model="form[field.key]" :options="options(field)" :label="field.label" :placeholder="'请选择'+field.label" :disabled="saving" :aria-invalid="!!errors[field.key]"/><Textarea v-else-if="field.kind==='textarea'" :id="'field-'+field.key" :model-value="form[field.key]??''" @update:model-value="form[field.key]=$event" rows="4" :disabled="saving" :aria-invalid="!!errors[field.key]" :aria-describedby="'error-'+field.key"/><Input v-else :id="'field-'+field.key" :model-value="form[field.key]??''" @update:model-value="form[field.key]=$event" :type="field.kind==='date'?'date':field.kind==='time'?'time':field.kind==='number'?'number':'text'" :inputmode="field.kind==='money'?'decimal':undefined" :disabled="saving" :aria-invalid="!!errors[field.key]" :aria-describedby="'error-'+field.key"/><small v-if="errors[field.key]" :id="'error-'+field.key" role="alert" class="field-error">{{ errors[field.key] }}</small></div><div class="form-actions form-full-width"><AppButton :disabled="saving" @click="drawerClose">取消</AppButton><AppButton variant="default" type="submit" :loading="saving">保存</AppButton></div></form></div></AppModal>
 </section>
</template>
