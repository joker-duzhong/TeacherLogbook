<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { groups, pages } from '@teacher-logbook/shared';
import { BookOpen, ClipboardList, HeartHandshake, LayoutDashboard, Link, Menu, Settings, Users, ChevronDown, Search, X, LogOut, Palette, GraduationCap, ChevronRight } from '@lucide/vue';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import AppButton from '@/components/AppButton.vue';
import AppSelect from '@/components/AppSelect.vue';
import AppNotice from '@/components/AppNotice.vue';
import { useCompactViewport } from '@/lib/viewport';
import { useAuthStore } from '../stores/auth';
import { useWorkspaceStore } from '../stores/workspace';
import './workspace.css';
const auth=useAuthStore();const workspace=useWorkspaceStore();const route=useRoute();const router=useRouter();
const compact=useCompactViewport();const menuOpen=ref(false);const navigation=ref<HTMLElement>();const menuTrigger=ref<InstanceType<typeof AppButton>>();const navQuery=ref('');
const navHeight=ref(window.innerHeight);
const current=computed(()=>pages.find(page=>page.id===route.params.page)??pages[0]!);
const collapsed=ref(groups.filter(group=>group!==current.value.group));
const groupIcons=[LayoutDashboard,Users,BookOpen,HeartHandshake,ClipboardList,Link,Settings];
const classOptions=computed(()=>workspace.classes.map(item=>({value:item.id,label:item.name})));
const filteredPages=computed(()=>pages.filter(page=>!navQuery.value||page.name.includes(navQuery.value.trim())||page.group.includes(navQuery.value.trim())));
let restorePageScroll:(()=>void)|undefined;
function updateNavViewport(){navHeight.value=window.visualViewport?.height||window.innerHeight;if(window.innerWidth>760)menuOpen.value=false;}
function unlockPageScroll(){restorePageScroll?.();restorePageScroll=undefined;}
watch(menuOpen,(open)=>{
 unlockPageScroll();
 if(!open)return;
 const {scrollX,scrollY}=window;const body=document.body.style;const root=document.documentElement.style;
 const previous={position:body.position,top:body.top,left:body.left,width:body.width,overflow:body.overflow};const rootOverflow=root.overflow;
 Object.assign(body,{position:'fixed',top:`-${scrollY}px`,left:`-${scrollX}px`,width:'100%',overflow:'hidden'});root.overflow='hidden';
 restorePageScroll=()=>{Object.assign(body,previous);root.overflow=rootOverflow;window.scrollTo(scrollX,scrollY);};

},{flush:'sync'});
watch(menuOpen,(open)=>{
 const target=open?navigation.value?.querySelector<HTMLButtonElement>('.nav-close'):document.querySelector<HTMLButtonElement>('.mobile-nav-toggle');
 target?.focus({preventScroll:true});
},{flush:'post'});
watch(()=>route.fullPath,()=>{menuOpen.value=false;navQuery.value='';collapsed.value=collapsed.value.filter(group=>group!==current.value.group);});
function trapFocus(event:KeyboardEvent){
 if(!compact.value||!menuOpen.value)return;
 if(event.key==='Escape'){menuOpen.value=false;return;}
 if(event.key!=='Tab')return;
 const elements=Array.from(navigation.value?.querySelectorAll<HTMLElement>('a,button,input')??[]).filter(el=>el.getClientRects().length&&!el.hasAttribute('disabled'));
 const first=elements[0],last=elements.at(-1);
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
}
function toggleGroup(group:string){collapsed.value=collapsed.value.includes(group)?collapsed.value.filter(item=>item!==group):[...collapsed.value,group];}
onMounted(()=>{void workspace.load();updateNavViewport();window.addEventListener('resize',updateNavViewport);window.visualViewport?.addEventListener('resize',updateNavViewport);});
onUnmounted(()=>{unlockPageScroll();window.removeEventListener('resize',updateNavViewport);window.visualViewport?.removeEventListener('resize',updateNavViewport);workspace.reset();});
watch(()=>auth.isAuthenticated,authenticated=>{if(!authenticated){workspace.reset();void router.replace('/login');}},{flush:'sync'});
async function logout(){auth.clearSession();workspace.reset();await router.replace({name:'login',query:/MicroMessenger/i.test(navigator.userAgent)?{manual:'1'}:{}});}
</script>
<template>
 <div class="business-app" :data-theme="workspace.skin">
  <button v-if="menuOpen" type="button" class="nav-backdrop" aria-label="关闭导航" @click="menuOpen=false" @touchmove.prevent></button>
  <aside id="workspace-navigation" ref="navigation" class="business-nav" :class="{open:menuOpen}" :inert="compact&&!menuOpen" :style="{'--nav-height':navHeight+'px'}" :role="compact?'dialog':undefined" :aria-modal="compact&&menuOpen?true:undefined" aria-label="工作台导航" @keydown="trapFocus">
   <div class="nav-brand-row"><RouterLink to="/workspace/dashboard" class="workspace-brand"><img src="/brand/logo.png" alt="" width="36" height="36"/><span>教师台账<small>班主任工作台</small></span></RouterLink><AppButton v-if="compact" variant="ghost" size="icon" class="nav-close" aria-label="收起导航" @click="menuOpen=false"><X/></AppButton></div>
   <div class="nav-search"><Search :size="15"/><Input v-model="navQuery" aria-label="查找功能" placeholder="查找功能"/></div>
   <nav aria-label="工作台功能"><section v-for="(group,index) in groups.filter(group=>filteredPages.some(page=>page.group===group))" :key="group">
    <button class="nav-group-toggle" :aria-expanded="!!navQuery||!collapsed.includes(group)" @click="toggleGroup(group)"><component :is="groupIcons[groups.indexOf(group)]" :size="17"/><span>{{ group }}</span><ChevronDown :size="14" :class="{rotated:!navQuery&&collapsed.includes(group)}"/></button>
    <div v-show="navQuery||!collapsed.includes(group)"><RouterLink v-for="page in filteredPages.filter(item=>item.group===group)" :key="page.id" :to="'/workspace/'+page.id" @click="menuOpen=false">{{ page.name }}</RouterLink></div>
   </section><p v-if="!filteredPages.length" class="muted nav-no-results">没有找到功能，试试其他名称。</p></nav>
   <div class="nav-footer"><GraduationCap :size="18"/><span>把时间留给学生</span></div>
  </aside>
  <div class="workspace-stage" :inert="compact&&menuOpen">
   <header class="workspace-topline"><div class="topline-context"><AppButton ref="menuTrigger" class="mobile-nav-toggle" size="icon" variant="ghost" aria-label="展开导航" :aria-expanded="menuOpen" aria-controls="workspace-navigation" @click="menuOpen=true"><Menu/></AppButton><span>工作台</span><ChevronRight :size="14"/><span>{{ current.group }}</span></div>
    <div class="business-account"><AppSelect :model-value="workspace.classId" :options="classOptions" label="当前班级" placeholder="选择班级" :disabled="workspace.busy" @change="workspace.selectClass"/>
     <DropdownMenu><DropdownMenuTrigger as-child><AppButton variant="ghost" size="icon" aria-label="账号与设置"><Settings :size="19"/></AppButton></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>工作台设置</DropdownMenuLabel><DropdownMenuItem @select="router.push('/workspace/classes')"><Users/>班级管理</DropdownMenuItem><DropdownMenuItem @select="router.push('/workspace/settings')"><Palette/>界面皮肤</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem @select="logout"><LogOut/>退出</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
    </div>
   </header>
   <main id="main-content" class="business-main"><header class="business-topbar"><div><h1>{{ current.name }}</h1><p>{{ current.id==='dashboard'?'关注班级近况，安排今天的工作':workspace.currentClass?.name||'管理你的班级工作台' }}</p></div><span v-if="workspace.classId" class="workspace-date">{{ new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',weekday:'long'}).format(new Date()) }}</span></header>
    <AppNotice :message="workspace.error"/>
    <div v-if="workspace.busy" class="loading-layout" role="status" aria-label="正在读取工作台"><Skeleton class="h-20 w-full"/><Skeleton class="h-72 w-full"/></div>
    <section v-else-if="!workspace.classId&&!['classes','settings'].includes(current.id)" class="business-empty"><GraduationCap :size="36"/><h2>{{ workspace.error?'工作台加载失败':'还没有班级' }}</h2><p>创建班级后，即可管理学生和日常记录。</p><AppButton v-if="workspace.error" @click="workspace.load">重新加载</AppButton><RouterLink v-else to="/workspace/classes" class="primary-link">创建班级</RouterLink></section>
    <RouterView v-else :key="String(route.params.page)+workspace.classId"/>
   </main>
   <nav class="mobile-bottom-nav" aria-label="常用功能"><RouterLink to="/workspace/dashboard"><LayoutDashboard :size="20"/>总览</RouterLink><RouterLink to="/workspace/students"><Users :size="20"/>学生</RouterLink><RouterLink to="/workspace/courses"><BookOpen :size="20"/>课表</RouterLink><RouterLink to="/workspace/todos"><ClipboardList :size="20"/>待办</RouterLink></nav>
  </div>
 </div>
</template>
