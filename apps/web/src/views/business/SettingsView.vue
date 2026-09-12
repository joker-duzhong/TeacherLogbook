<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { toast as notify } from 'vue-sonner';
import { confirmation } from '@/lib/confirmation';
import AppButton from '@/components/AppButton.vue';
import AppNotice from '@/components/AppNotice.vue';
import { Input } from '@/components/ui/input';
import { Check, Users, Plus } from '@lucide/vue';
import { webThemeVariables } from '@/lib/theme';
import { themes } from '@teacher-logbook/shared';
import { useAuthStore } from '../../stores/auth';
import { useWorkspaceStore } from '../../stores/workspace';
defineProps<{mode:string}>();
const workspace=useWorkspaceStore();const auth=useAuthStore();
const name=ref('');const busy=ref(false);const error=ref('');
let disposed=false;let confirming=false;
onBeforeUnmount(()=>{disposed=true;if(confirming)confirmation.close();});
function validateName(value:string){return value.trim().length===0?'请输入班级名称':value.trim().length>100?'班级名称不能超过 100 个字符':'';}
async function changeSkin(id:string){if(busy.value||disposed)return;busy.value=true;error.value='';try{await auth.api.saveSkin(id);if(!disposed)workspace.skin=id;}catch(cause){if(!disposed)error.value=workspace.message(cause);}finally{busy.value=false;}}
async function create(){
  if(busy.value||disposed)return;
  error.value=validateName(name.value);if(error.value)return;
  busy.value=true;
  try{
    const created=await auth.api.createClass({name:name.value.trim(),timezone:'Asia/Shanghai'});
    if(disposed)return;
    workspace.classes.push(created);name.value='';notify.success('班级已创建');
    await workspace.selectClass(created.id);
  }catch(cause){if(!disposed)error.value=workspace.message(cause);}finally{busy.value=false;}
}
async function rename(id:string,currentName:string){
  if(busy.value||disposed)return;
  busy.value=true;error.value='';confirming=true;
  try{
    const response=await confirmation.prompt('班级名称','修改班级',{inputValue:currentName,inputValidator:value=>validateName(value??'')||true});
    confirming=false;if(disposed)return;
    const nextName=response.value.trim();await auth.api.renameClass(id,nextName);
    if(disposed)return;
    const item=workspace.classes.find(item=>item.id===id);if(item)item.name=nextName;
    notify.success('班级名称已更新');
  }catch(cause){if(!disposed&&cause!=='cancel'&&cause!=='close')error.value=workspace.message(cause);}finally{confirming=false;busy.value=false;}
}
async function remove(id:string,currentName:string){
  if(busy.value||disposed)return;
  busy.value=true;error.value='';confirming=true;
  try{
    await confirmation.prompt(`输入“${currentName}”确认删除，班级内的数据将无法继续访问。`,'删除班级',{inputValidator:value=>value===currentName||'班级名称不匹配',type:'warning'});
    confirming=false;if(disposed)return;
    await auth.api.removeClass(id);if(disposed)return;
    workspace.classes=workspace.classes.filter(item=>item.id!==id);notify.success('班级已删除');
    if(workspace.classId===id)await workspace.selectClass(workspace.classes[0]?.id??'');
  }catch(cause){if(!disposed&&cause!=='cancel'&&cause!=='close')error.value=workspace.message(cause);}finally{confirming=false;busy.value=false;}
}
</script>
<template>
 <AppNotice :message="error"/><AppButton v-if="workspace.error" :disabled="busy" @click="workspace.load()">重新加载</AppButton>
 <section v-if="mode==='settings'" class="settings-section"><div class="section-heading"><div><h2>界面皮肤</h2><p>选择适合你的工作环境，布局与操作保持一致。</p></div></div><div class="theme-options"><button v-for="theme in themes" :key="theme.id" :disabled="busy" :aria-pressed="workspace.skin===theme.id" @click="changeSkin(theme.id)"><span class="theme-preview" :style="webThemeVariables(theme.id)"><i></i><span><b></b><b></b><b></b></span></span><strong>{{ theme.name }}<Check v-if="workspace.skin===theme.id" :size="17"/></strong><small>{{ workspace.skin===theme.id?'正在使用':'使用此皮肤' }}</small></button></div></section>
 <section v-else class="settings-section"><form class="business-toolbar class-create" @submit.prevent="create"><label class="form-field"><span>新建班级</span><Input v-model="name" placeholder="例如：高一（1）班" aria-label="新班级名称" maxlength="100" :disabled="busy" @input="error=''"/></label><AppButton variant="default" type="submit" :loading="busy"><Plus/>创建班级</AppButton></form><div class="section-heading"><h2>我的班级</h2><span>{{ workspace.classes.length }} 个班级</span></div><div class="class-list"><article v-for="item in workspace.classes" :key="item.id" class="class-card" :class="{selected:workspace.classId===item.id}"><div class="class-icon"><Users :size="24"/></div><div class="class-info"><h3>{{ item.name }}</h3><p>{{ workspace.classId===item.id?'正在查看此班级':'独立管理学生和日常记录' }}</p></div><div class="class-actions"><AppButton :disabled="busy||workspace.classId===item.id" :variant="workspace.classId===item.id?'secondary':'outline'" @click="workspace.selectClass(item.id)">{{ workspace.classId===item.id?'当前班级':'切换' }}</AppButton><AppButton variant="ghost" :disabled="busy" @click="rename(item.id,item.name)">重命名</AppButton><AppButton variant="ghost" class="danger-text" :disabled="busy" @click="remove(item.id,item.name)">删除</AppButton></div></article><div v-if="!workspace.classes.length" class="business-empty"><Users :size="32"/><h2>暂无班级</h2><p>在上方输入班级名称，开始创建第一个班级。</p></div></div></section>
</template>
