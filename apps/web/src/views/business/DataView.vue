<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { isRecord } from '@teacher-logbook/api-client';
import { useAuthStore } from '../../stores/auth';
import { useWorkspaceStore } from '../../stores/workspace';
import { downloadText } from '../../lib/files';

defineProps<{studentsOnly:boolean}>();
const auth=useAuthStore();const workspace=useWorkspaceStore();
const selectedClass=workspace.classId;
let disposed=false;let confirming=false;
const active=()=>!disposed&&workspace.classId===selectedClass;
onBeforeUnmount(()=>{disposed=true;if(confirming)ElMessageBox.close();});
const legacyFile=ref<File>();const legacyChecked=ref(false);
const busy=ref(false);const error=ref('');const result=ref('');const studentFile=ref<File>();const backupFile=ref<File>();const validated=ref(false);const strategy=ref<'skip'|'create'>('skip');const mode=ref<'merge'|'replace'>('merge');
function chooseLegacy(event:Event){legacyFile.value=(event.target as HTMLInputElement).files?.[0];legacyChecked.value=false;result.value='';error.value='';}
function selectFile(event:Event,kind:'student'|'backup'){const file=(event.target as HTMLInputElement).files?.[0];if(kind==='student')studentFile.value=file;else{backupFile.value=file;validated.value=false;}result.value='';error.value='';}
function checkValidation(value:unknown){if(!isRecord(value)||value.valid!==true)throw new Error('文件未通过校验，请检查文件后重试。');}
async function run(action:()=>Promise<unknown>){
  if(busy.value||!active())return;
  busy.value=true;error.value='';result.value='';
  try{const value=await action();if(active()&&value!==undefined)result.value=JSON.stringify(value,null,2);}
  catch(cause){if(active()&&cause!=='cancel'&&cause!=='close')error.value=workspace.message(cause);}
  finally{confirming=false;busy.value=false;}
}
async function migrate(dryRun:boolean){
  const file=legacyFile.value;if(!file||busy.value||(!dryRun&&!legacyChecked.value))return;
  if(dryRun)legacyChecked.value=false;
  await run(async()=>{
    if(!dryRun){confirming=true;await ElMessageBox.confirm('仅迁移到空班级，确认导入旧版数据？','迁移旧数据');confirming=false;if(!active())return;}
    const value=await auth.api.importLegacy(selectedClass,file,dryRun);if(!active())return;
    checkValidation(value);legacyChecked.value=dryRun;
    if(!dryRun)await workspace.reloadReferences();return value;
  });
}
async function importStudents(dryRun:boolean){
  const file=studentFile.value;if(!file)return;
  await run(async()=>{const value=await auth.api.uploadStudents(selectedClass,file,dryRun,strategy.value);if(active()&&!dryRun)await workspace.reloadReferences();return value;});
}
async function validate(){
  const file=backupFile.value;if(!file||busy.value)return;
  validated.value=false;
  await run(async()=>{const value=await auth.api.validateBackup(selectedClass,file);if(!active())return;checkValidation(value);validated.value=true;return value;});
}
async function restore(){
  const file=backupFile.value;const selectedMode=mode.value;const className=workspace.currentClass?.name;
  if(!file||!validated.value||!className)return;
  await run(async()=>{
    confirming=true;
    await ElMessageBox.prompt(`输入“${className}”确认${selectedMode==='replace'?'替换当前班级数据':'合并备份数据'}。`,'恢复备份',{inputValidator:value=>value===className||'班级名称不匹配',type:'warning'});
    confirming=false;if(!active())return;
    validated.value=false;
    const value=await auth.api.restoreBackup(selectedClass,file,selectedMode);
    if(active())await workspace.reloadReferences();return value;
  });
}
async function clear(){
  const className=workspace.currentClass?.name;if(!className)return;
  await run(async()=>{
    confirming=true;
    await ElMessageBox.prompt(`输入“${className}”确认清空全部台账及学生数据。建议先下载备份。`,'清空班级数据',{type:'warning',inputValidator:value=>value===className||'班级名称不匹配'});
    confirming=false;if(!active())return;
    await auth.api.clearClassData(selectedClass);if(!active())return;
    validated.value=false;legacyChecked.value=false;await workspace.reloadReferences();return {message:'班级数据已清空'};
  });
}
</script>
<template>
  <el-alert v-if="error" :title="error" type="error" :closable="false" />
  <section class="data-section"><h2>学生名册</h2><div class="business-toolbar"><el-button :disabled="busy" @click="run(async()=>downloadText(await auth.api.downloadStudents(workspace.classId),'students.csv','text/csv;charset=utf-8'))">导出学生 CSV</el-button><el-button @click="downloadText('\ufeffname,gender,contact\r\n','students-template.csv','text/csv;charset=utf-8')">下载导入模板</el-button></div><label class="file-label">CSV 文件<input type="file" accept=".csv,text/csv" :disabled="busy" @change="selectFile($event,'student')" /></label><div class="business-toolbar"><el-select v-model="strategy" :disabled="busy" aria-label="重复学生处理"><el-option value="skip" label="跳过重复学生"/><el-option value="create" label="仍然创建"/></el-select><el-button :disabled="!studentFile||busy" @click="importStudents(true)">预检查</el-button><el-button type="primary" :disabled="!studentFile||busy" @click="importStudents(false)">导入学生</el-button></div></section>
  <template v-if="!studentsOnly"><section class="data-section"><h2>旧版数据迁移</h2><label class="file-label">原生 JS 导出文件<input type="file" accept=".json" :disabled="busy" @change="chooseLegacy"/></label><div class="business-toolbar"><el-button :disabled="busy||!legacyFile" @click="migrate(true)">检查旧数据</el-button><el-button type="primary" :disabled="busy||!legacyChecked" @click="migrate(false)">迁入当前空班级</el-button></div></section><section class="data-section"><h2>班级备份</h2><el-button :disabled="busy" @click="run(async()=>downloadText(await auth.api.downloadBackup(workspace.classId),'teacher-logbook-backup.json'))">下载完整备份</el-button><label class="file-label">备份 JSON<input type="file" accept=".json,application/json" :disabled="busy" @change="selectFile($event,'backup')" /></label><div class="business-toolbar"><el-select v-model="mode" :disabled="busy" aria-label="恢复模式"><el-option value="merge" label="合并恢复"/><el-option value="replace" label="替换恢复"/></el-select><el-button :disabled="!backupFile||busy" @click="validate">校验备份</el-button><el-button type="primary" :disabled="!validated||busy" @click="restore">确认恢复</el-button></div></section><section class="data-section danger-zone"><h2>清空班级数据</h2><el-button type="danger" :disabled="busy" @click="clear">清空当前班级</el-button></section></template>
  <pre v-if="result" class="operation-result" role="status">{{ result }}</pre><p v-if="busy" role="status">正在处理文件</p>
</template>
