<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { groups, pages, themeVariables, isValidPhone, isValidSmsCode, normalizePhone } from '@teacher-logbook/shared';
import manifest from '../manifest.json';
import { api, state, acceptLogin, loadWorkspace, selectClass, logout, errorMessage } from '../lib/workspace';
import MiniDashboard from './MiniDashboard.vue';
import MiniRecords from './MiniRecords.vue';
import MiniSeats from './MiniSeats.vue';
import MiniSettings from './MiniSettings.vue';
import MiniData from './MiniData.vue';
const phone=ref('');const code=ref('');const error=ref('');const busy=ref(false);const menu=ref(false);const countdown=ref(0);let timer:ReturnType<typeof setInterval>|undefined;
const current=computed(()=>pages.find(page=>page.id===state.page)??pages[0]!);
const theme=computed(()=>Object.entries(themeVariables(state.skin)).map(([key,value])=>`${key}:${value}`).join(';'));
async function run(action:()=>Promise<void>){if(busy.value)return;busy.value=true;error.value='';try{await action();}catch(cause){error.value=errorMessage(cause);}finally{busy.value=false;}}
async function sms(){if(!isValidPhone(phone.value)){error.value='请输入有效手机号';return;}await run(async()=>{await api.sendSms(normalizePhone(phone.value));countdown.value=60;clearInterval(timer);timer=setInterval(()=>{countdown.value--;if(countdown.value<=0)clearInterval(timer);},1000);});}
async function phoneLogin(){if(!isValidPhone(phone.value)||!isValidSmsCode(code.value)){error.value='请输入手机号和四位验证码';return;}await run(async()=>{if(state.user?.needs_phone_binding)state.user=await api.bindPhone(normalizePhone(phone.value),code.value);else acceptLogin(await api.loginWithPhone({phone:normalizePhone(phone.value),code:code.value}));code.value='';await loadWorkspace();});}
async function wechat(){await run(async()=>{const appid=manifest['mp-weixin'].appid;if(!appid)throw new Error('请先在小程序 manifest 中配置 AppID');const result=await new Promise<UniApp.LoginRes>((resolve,reject)=>uni.login({provider:'weixin',success:resolve,fail:reject}));if(!result.code)throw new Error('微信登录未返回凭据');acceptLogin(await api.loginWithMiniapp({appid,code:result.code}));if(!state.user?.needs_phone_binding)await loadWorkspace();});}
function openPage(id:string){state.page=id;menu.value=false;}
function refresh(){if(state.user&&!state.user.needs_phone_binding)void run(loadWorkspace);}
defineExpose({refresh});
onUnmounted(()=>clearInterval(timer));
</script>
<template>
  <view class="mini-app" :data-theme="state.skin" :style="theme">
    <view v-if="!state.user||state.user.needs_phone_binding" class="mini-login">
      <text class="mini-brand">教师台账</text><text class="mini-title">{{ state.user?'绑定手机号':'登录工作台' }}</text>
      <button v-if="!state.user" class="primary" :loading="busy" @click="wechat">微信登录</button>
      <input v-model="phone" type="number" maxlength="20" placeholder="手机号"/><view class="mini-row"><input v-model="code" type="number" maxlength="4" placeholder="四位验证码"/><button :disabled="busy||countdown>0" @click="sms">{{ countdown>0?countdown+'秒':'获取验证码' }}</button></view><button class="primary" :loading="busy" @click="phoneLogin">{{ state.user?'绑定并进入':'手机号登录' }}</button><button v-if="state.user" @click="logout">返回登录</button>
    </view>
    <template v-else>
      <view class="mini-header"><button size="mini" @click="menu=!menu">目录</button><text class="mini-title">{{ current.name }}</text><button size="mini" @click="logout">退出</button></view>
      <picker :range="state.classes" range-key="name" @change="run(()=>selectClass(state.classes[Number($event.detail.value)]?.id??''))"><view class="mini-class">{{ state.classes.find(item=>item.id===state.classId)?.name??'选择班级' }} ▾</view></picker>
      <view v-if="menu" class="mini-menu"><view v-for="group in groups" :key="group"><text class="mini-label">{{ group }}</text><button v-for="page in pages.filter(item=>item.group===group)" :key="page.id" :class="{active:state.page===page.id}" @click="openPage(page.id)">{{ page.name }}</button></view></view>
      <view v-else-if="!state.classId&&!['classes','settings'].includes(current.id)" class="mini-empty"><text>还没有班级</text><button class="primary" @click="openPage('classes')">创建班级</button></view>
      <template v-else>
        <MiniDashboard v-if="current.id==='dashboard'" :key="state.classId" @open="openPage"/>
        <MiniSettings v-else-if="['classes','settings'].includes(current.id)" :key="current.id" :mode="current.id"/>
        <MiniSeats v-else-if="current.id==='seats'" :key="state.classId"/>
        <MiniData v-else-if="current.id==='data'||current.mode==='import'" :key="state.classId+current.id" :students-only="current.mode==='import'"/>
        <MiniRecords v-else :key="state.classId+current.id" :page="current"/>
      </template>
    </template>
    <text v-if="error" class="mini-error">{{ error }}</text><button v-if="error&&state.user" :loading="busy" @click="run(loadWorkspace)">重新加载</button>
  </view>
</template>
