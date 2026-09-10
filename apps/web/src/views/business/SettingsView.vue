<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { themes } from '@teacher-logbook/shared';
import { useAuthStore } from '../../stores/auth';
import { useWorkspaceStore } from '../../stores/workspace';
defineProps<{mode:string}>();
const workspace=useWorkspaceStore();const auth=useAuthStore();
const name=ref('');const busy=ref(false);const error=ref('');
let disposed=false;let confirming=false;
onBeforeUnmount(()=>{disposed=true;if(confirming)ElMessageBox.close();});
function validateName(value:string){return value.trim().length===0?'请输入班级名称':value.trim().length>100?'班级名称不能超过 100 个字符':'';}
async function changeSkin(id:string){if(busy.value||disposed)return;busy.value=true;error.value='';try{await auth.api.saveSkin(id);if(!disposed)workspace.skin=id;}catch(cause){if(!disposed)error.value=workspace.message(cause);}finally{busy.value=false;}}
async function create(){
  if(busy.value||disposed)return;
  error.value=validateName(name.value);if(error.value)return;
  busy.value=true;
  try{
    const created=await auth.api.createClass({name:name.value.trim(),timezone:'Asia/Shanghai'});
    if(disposed)return;
    workspace.classes.push(created);name.value='';ElMessage.success('班级已创建');
    await workspace.selectClass(created.id);
  }catch(cause){if(!disposed)error.value=workspace.message(cause);}finally{busy.value=false;}
}
async function rename(id:string,currentName:string){
  if(busy.value||disposed)return;
  busy.value=true;error.value='';confirming=true;
  try{
    const response=await ElMessageBox.prompt('班级名称','修改班级',{inputValue:currentName,inputValidator:value=>validateName(value??'')||true});
    confirming=false;if(disposed)return;
    const nextName=response.value.trim();await auth.api.renameClass(id,nextName);
    if(disposed)return;
    const item=workspace.classes.find(item=>item.id===id);if(item)item.name=nextName;
    ElMessage.success('班级名称已更新');
  }catch(cause){if(!disposed&&cause!=='cancel'&&cause!=='close')error.value=workspace.message(cause);}finally{confirming=false;busy.value=false;}
}
async function remove(id:string,currentName:string){
  if(busy.value||disposed)return;
  busy.value=true;error.value='';confirming=true;
  try{
    await ElMessageBox.prompt(`输入“${currentName}”确认删除，班级内的数据将无法继续访问。`,'删除班级',{inputValidator:value=>value===currentName||'班级名称不匹配',type:'warning'});
    confirming=false;if(disposed)return;
    await auth.api.removeClass(id);if(disposed)return;
    workspace.classes=workspace.classes.filter(item=>item.id!==id);ElMessage.success('班级已删除');
    if(workspace.classId===id)await workspace.selectClass(workspace.classes[0]?.id??'');
  }catch(cause){if(!disposed&&cause!=='cancel'&&cause!=='close')error.value=workspace.message(cause);}finally{confirming=false;busy.value=false;}
}
</script>
<template>
  <el-alert v-if="error" :title="error" type="error" :closable="false" />
  <el-button v-if="workspace.error" :disabled="busy" @click="workspace.load()">重新加载</el-button>
  <section v-if="mode==='settings'" class="settings-section"><h2>界面皮肤</h2><div class="theme-options"><button v-for="theme in themes" :key="theme.id" :disabled="busy" :aria-pressed="workspace.skin===theme.id" @click="changeSkin(theme.id)"><span class="theme-preview" :style="{background:theme.paper,borderColor:theme.line}"><i :style="{background:theme.sidebar}"></i><span :style="{background:theme.panel,color:theme.ink}"><b :style="{background:theme.brand}"></b><b :style="{background:theme.accent}"></b></span></span><strong>{{ theme.name }}</strong><span>{{ workspace.skin===theme.id?'已使用':'使用此皮肤' }}</span></button></div></section>
  <section v-else class="settings-section"><form class="business-toolbar" @submit.prevent="create"><el-input v-model="name" placeholder="新班级名称" aria-label="新班级名称" maxlength="100" :disabled="busy" @input="error=''" /><el-button type="primary" native-type="submit" :loading="busy">创建班级</el-button></form><el-table :data="workspace.classes" empty-text="暂无班级"><el-table-column prop="name" label="班级名称"/><el-table-column prop="timezone" label="时区"/><el-table-column label="操作" width="240"><template #default="scope"><el-button link :disabled="busy" @click="workspace.selectClass(scope.row.id)">{{ workspace.classId===scope.row.id?'当前班级':'切换' }}</el-button><el-button link :disabled="busy" @click="rename(scope.row.id,scope.row.name)">重命名</el-button><el-button link type="danger" :disabled="busy" @click="remove(scope.row.id,scope.row.name)">删除</el-button></template></el-table-column></el-table></section>
</template>
