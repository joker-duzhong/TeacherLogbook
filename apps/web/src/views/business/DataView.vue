<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { confirmation } from '@/lib/confirmation';
import AppButton from '@/components/AppButton.vue';
import AppNotice from '@/components/AppNotice.vue';
import AppSelect from '@/components/AppSelect.vue';
import { Upload, Download, FolderArchive, FileSpreadsheet } from '@lucide/vue';
import { isRecord } from '@teacher-logbook/api-client';
import { useAuthStore } from '../../stores/auth';
import { useWorkspaceStore } from '../../stores/workspace';
import { downloadText } from '../../lib/files';

defineProps<{studentsOnly:boolean}>();
const auth=useAuthStore();const workspace=useWorkspaceStore();
const selectedClass=workspace.classId;
let disposed=false;let confirming=false;
const active=()=>!disposed&&workspace.classId===selectedClass;
onBeforeUnmount(()=>{disposed=true;if(confirming)confirmation.close();});
const studentChecked=ref(false);const operationLabel=ref('');
const legacyFile=ref<File>();const legacyChecked=ref(false);
const busy=ref(false);const error=ref('');const result=ref('');const studentFile=ref<File>();const backupFile=ref<File>();const validated=ref(false);const strategy=ref<'skip'|'create'>('skip');const mode=ref<'merge'|'replace'>('merge');
function chooseLegacy(event:Event){legacyFile.value=(event.target as HTMLInputElement).files?.[0];legacyChecked.value=false;result.value='';error.value='';}
function selectFile(event:Event,kind:'student'|'backup'){const file=(event.target as HTMLInputElement).files?.[0];if(kind==='student'){studentFile.value=file;studentChecked.value=false;}else{backupFile.value=file;validated.value=false;}result.value='';error.value='';}
function checkValidation(value:unknown){if(!isRecord(value)||value.valid!==true)throw new Error('文件未通过校验，请检查文件后重试。');}
async function run(action:()=>Promise<unknown>){
  if(busy.value||!active())return;
  busy.value=true;error.value='';result.value='';
  try{const value=await action();if(active()&&value!==undefined)result.value=JSON.stringify(value,null,2);}
  catch(cause){if(active()&&cause!=='cancel'&&cause!=='close')error.value=workspace.message(cause);}
  finally{confirming=false;busy.value=false;}
}
async function migrate(dryRun:boolean){
  operationLabel.value=dryRun?'旧版文件检查结果':'旧版数据迁移结果';
  const file=legacyFile.value;if(!file||busy.value||(!dryRun&&!legacyChecked.value))return;
  if(dryRun)legacyChecked.value=false;
  await run(async()=>{
    if(!dryRun){confirming=true;await confirmation.confirm('仅迁移到空班级，确认导入旧版数据？','迁移旧数据');confirming=false;if(!active())return;}
    const value=await auth.api.importLegacy(selectedClass,file,dryRun);if(!active())return;
    checkValidation(value);legacyChecked.value=dryRun;
    if(!dryRun)await workspace.reloadReferences();return value;
  });
}
async function importStudents(dryRun:boolean){
  const file=studentFile.value;if(!file||(!dryRun&&!studentChecked.value))return;
  if(dryRun)studentChecked.value=false;
  operationLabel.value=dryRun?'学生文件检查结果':'学生导入结果';
  await run(async()=>{const value=await auth.api.uploadStudents(selectedClass,file,dryRun,strategy.value);if(active()){studentChecked.value=dryRun;if(!dryRun)await workspace.reloadReferences();}return value;});
}
async function validate(){
  operationLabel.value='备份校验结果';
  const file=backupFile.value;if(!file||busy.value)return;
  validated.value=false;
  await run(async()=>{const value=await auth.api.validateBackup(selectedClass,file);if(!active())return;checkValidation(value);validated.value=true;return value;});
}
async function restore(){
  operationLabel.value='备份恢复结果';
  const file=backupFile.value;const selectedMode=mode.value;const className=workspace.currentClass?.name;
  if(!file||!validated.value||!className)return;
  await run(async()=>{
    confirming=true;
    await confirmation.prompt(`输入“${className}”确认${selectedMode==='replace'?'替换当前班级数据':'合并备份数据'}。`,'恢复备份',{inputValidator:value=>value===className||'班级名称不匹配',type:'warning'});
    confirming=false;if(!active())return;
    validated.value=false;
    const value=await auth.api.restoreBackup(selectedClass,file,selectedMode);
    if(active())await workspace.reloadReferences();return value;
  });
}
async function clear(){
  operationLabel.value='清空结果';
  const className=workspace.currentClass?.name;if(!className)return;
  await run(async()=>{
    confirming=true;
    await confirmation.prompt(`输入“${className}”确认清空全部台账及学生数据。建议先下载备份。`,'清空班级数据',{type:'warning',inputValidator:value=>value===className||'班级名称不匹配'});
    confirming=false;if(!active())return;
    await auth.api.clearClassData(selectedClass);if(!active())return;
    validated.value=false;legacyChecked.value=false;await workspace.reloadReferences();return {message:'班级数据已清空'};
  });
}
const resultRows=computed(()=>{
 if(!result.value)return [];
 try {
  const data=JSON.parse(result.value) as Record<string,unknown>;
  const labels:Record<string,string>={totalRows:'文件总行数',created:'新增学生',skipped:'跳过重复',failed:'失败行数',valid:'校验结果',message:'处理结果',errors:'检查提示',resourceCounts:'数据条目'};
  return Object.entries(data).map(([key,value])=>({label:labels[key]??key,value:typeof value==='boolean'?(value?'通过':'未通过'):Array.isArray(value)?(value.length?value.map(item=>typeof item==='string'?item:JSON.stringify(item)).join('；'):'无'):typeof value==='object'?Object.entries(value??{}).map(([name,count])=>name+': '+count).join('，'):String(value)}));
 } catch {return [{label:'处理结果',value:result.value}];}
});
</script>
<template>
 <div class="data-intro"><FolderArchive :size="22"/><p>当前操作班级：<strong>{{ workspace.currentClass?.name }}</strong>。导入前先检查文件，恢复前建议下载备份。</p></div>
 <AppNotice :message="error"/><div v-if="busy" class="processing-state" role="status">正在处理文件，请稍候…</div>
 <section v-if="result" class="operation-result" role="status"><h2>{{ operationLabel||'处理结果' }}</h2><dl><div v-for="row in resultRows" :key="row.label"><dt>{{ row.label }}</dt><dd>{{ row.value }}</dd></div></dl></section>
 <section class="data-section"><header><div><h2><FileSpreadsheet :size="21"/>学生名册</h2><p>下载模板填写学生资料，检查后导入当前班级。</p></div><div class="toolbar-actions"><AppButton :disabled="busy" @click="run(async()=>downloadText(await auth.api.downloadStudents(workspace.classId),'students.csv','text/csv;charset=utf-8'))"><Download/>导出学生 CSV</AppButton><AppButton @click="downloadText('\ufeffname,gender,contact\r\n','students-template.csv','text/csv;charset=utf-8')">下载导入模板</AppButton></div></header>
  <ol class="import-steps" aria-label="导入步骤"><li :class="{done:studentFile}">1. 选择文件</li><li :class="{done:studentChecked}">2. 预检查</li><li>3. 导入学生</li></ol>
  <label class="file-label"><Upload :size="24"/><span>选择学生 CSV 文件</span><small>使用上方模板，保留 name、gender、contact 列。</small><input type="file" accept=".csv,text/csv" :disabled="busy" @change="selectFile($event,'student')"/></label>
  <div class="business-toolbar"><AppSelect v-model="strategy" :options="[{value:'skip',label:'跳过重复学生'},{value:'create',label:'仍然创建'}]" label="重复学生处理" :disabled="busy" @change="studentChecked=false"/><AppButton :disabled="!studentFile||busy" @click="importStudents(true)">预检查</AppButton><AppButton variant="default" :disabled="!studentChecked||busy" @click="importStudents(false)">导入学生</AppButton></div>
 </section>
 <template v-if="!studentsOnly"><section class="data-section"><header><div><h2><FolderArchive :size="21"/>班级备份</h2><p>保存班级完整数据，或从已有备份中恢复。</p></div><AppButton :disabled="busy" @click="run(async()=>downloadText(await auth.api.downloadBackup(workspace.classId),'teacher-logbook-backup.json'))"><Download/>下载完整备份</AppButton></header><label class="file-label"><Upload :size="24"/><span>选择备份 JSON</span><input type="file" accept=".json,application/json" :disabled="busy" @change="selectFile($event,'backup')"/></label><div class="business-toolbar"><AppSelect v-model="mode" :options="[{value:'merge',label:'合并恢复'},{value:'replace',label:'替换恢复'}]" label="恢复模式" :disabled="busy"/><AppButton :disabled="!backupFile||busy" @click="validate">校验备份</AppButton><AppButton variant="default" :disabled="!validated||busy" @click="restore">确认恢复</AppButton></div><p class="muted">{{ mode==='merge'?'合并：将备份内容合入当前班级。':'替换：使用备份替换当前班级数据，建议先下载完整备份。' }}</p></section>
 <details class="data-section legacy-section"><summary>旧版数据迁移<span>从旧版教师台账迁入空班级</span></summary><label class="file-label"><span>选择旧版导出文件</span><input type="file" accept=".json" :disabled="busy" @change="chooseLegacy"/></label><div class="business-toolbar"><AppButton :disabled="busy||!legacyFile" @click="migrate(true)">检查旧数据</AppButton><AppButton variant="default" :disabled="busy||!legacyChecked" @click="migrate(false)">迁入当前空班级</AppButton></div></details>
 <section class="data-section danger-zone"><div><h2>清空班级数据</h2><p>清空全部台账与学生数据。操作前请保存完整备份。</p></div><AppButton variant="destructive" :disabled="busy" @click="clear">清空当前班级</AppButton></section></template>
</template>
