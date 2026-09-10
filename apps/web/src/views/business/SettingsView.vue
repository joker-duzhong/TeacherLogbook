<script setup lang="ts">
import { ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { themes } from '@teacher-logbook/shared';
import { useAuthStore } from '../../stores/auth';
import { useWorkspaceStore } from '../../stores/workspace';
defineProps<{mode:string}>();
const workspace=useWorkspaceStore();const auth=useAuthStore();
const name=ref('');const busy=ref(false);const error=ref('');
async function changeSkin(id:string){busy.value=true;error.value='';try{await auth.api.saveSkin(id);workspace.skin=id;}catch(cause){error.value=workspace.message(cause);}finally{busy.value=false;}}
async function create(){if(!name.value.trim())return;busy.value=true;error.value='';try{const created=await auth.api.createClass({name:name.value.trim(),timezone:'Asia/Shanghai'});name.value='';await workspace.load();await workspace.selectClass(created.id);}catch(cause){error.value=workspace.message(cause);}finally{busy.value=false;}}
async function rename(id:string,currentName:string){try{const response=await ElMessageBox.prompt('班级名称','修改班级',{inputValue:currentName,inputValidator:value=>Boolean(value?.trim())||'请输入班级名称'});busy.value=true;await auth.api.renameClass(id,response.value.trim());await workspace.load();}catch(cause){if(cause!=='cancel'&&cause!=='close')error.value=workspace.message(cause);}finally{busy.value=false;}}
async function remove(id:string,currentName:string){try{await ElMessageBox.prompt(`输入“${currentName}”确认删除，班级内的数据将无法继续访问。`,'删除班级',{inputValidator:value=>value===currentName||'班级名称不匹配',type:'warning'});busy.value=true;await auth.api.removeClass(id);await workspace.load();}catch(cause){if(cause!=='cancel'&&cause!=='close')error.value=workspace.message(cause);}finally{busy.value=false;}}
</script>
<template>
  <el-alert v-if="error" :title="error" type="error" :closable="false" />
  <section v-if="mode==='settings'" class="settings-section"><h2>界面皮肤</h2><div class="theme-options"><button v-for="theme in themes" :key="theme.id" :disabled="busy" :aria-pressed="workspace.skin===theme.id" @click="changeSkin(theme.id)"><span class="theme-preview" :style="{background:theme.paper,borderColor:theme.line}"><i :style="{background:theme.sidebar}"></i><span :style="{background:theme.panel,color:theme.ink}"><b :style="{background:theme.brand}"></b><b :style="{background:theme.accent}"></b></span></span><strong>{{ theme.name }}</strong><span>{{ workspace.skin===theme.id?'已使用':'使用此皮肤' }}</span></button></div></section>
  <section v-else class="settings-section"><form class="business-toolbar" @submit.prevent="create"><el-input v-model="name" placeholder="新班级名称" aria-label="新班级名称" maxlength="100" /><el-button type="primary" native-type="submit" :loading="busy">创建班级</el-button></form><el-table :data="workspace.classes" empty-text="暂无班级"><el-table-column prop="name" label="班级名称"/><el-table-column prop="timezone" label="时区"/><el-table-column label="操作" width="240"><template #default="scope"><el-button link :disabled="busy" @click="workspace.selectClass(scope.row.id)">{{ workspace.classId===scope.row.id?'当前班级':'切换' }}</el-button><el-button link :disabled="busy" @click="rename(scope.row.id,scope.row.name)">重命名</el-button><el-button link type="danger" :disabled="busy" @click="remove(scope.row.id,scope.row.name)">删除</el-button></template></el-table-column></el-table></section>
</template>
